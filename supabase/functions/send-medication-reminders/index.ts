import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.1";
import { buildPushHTTPRequest } from "npm:@pushforge/builder";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

    if (!vapidPrivateKey) {
      return new Response(
        JSON.stringify({ error: "Push notification keys not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get current time components
    const now = new Date();
    const currentHour = String(now.getHours()).padStart(2, "0");
    const currentMinute = String(now.getMinutes()).padStart(2, "0");
    const currentTime = `${currentHour}:${currentMinute}`;
    const todayKey = now.toISOString().slice(0, 10);

    // Fetch all active medications that have schedule_times
    const { data: medications, error: medError } = await supabase
      .from("medications")
      .select("id, user_id, medication_name, dosage, dosage_unit, schedule_times, last_notified_times")
      .eq("is_active", true)
      .not("schedule_times", "is", null);

    if (medError) {
      console.error("Error fetching medications:", medError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch medications" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!medications || medications.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active medications", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter medications that are due now (within a 2-minute window)
    const dueMedications: typeof medications = [];

    for (const med of medications) {
      if (!med.schedule_times || med.schedule_times.length === 0) continue;

      for (const schedTime of med.schedule_times) {
        // Check if the scheduled time matches current time (within ±1 minute)
        const [schedH, schedM] = schedTime.split(":").map(Number);
        const schedDate = new Date(now);
        schedDate.setHours(schedH, schedM, 0, 0);

        const diffMs = Math.abs(now.getTime() - schedDate.getTime());
        if (diffMs > 2 * 60 * 1000) continue; // Not within 2 min window

        // Check if we already notified for this schedule today
        const notifiedTimes = (med.last_notified_times as Record<string, string>) || {};
        const lastNotifiedDate = notifiedTimes[schedTime];
        if (lastNotifiedDate === todayKey) continue; // Already notified today

        dueMedications.push({ ...med, _scheduleTime: schedTime } as any);
      }
    }

    if (dueMedications.length === 0) {
      return new Response(
        JSON.stringify({ message: "No medications due right now", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Group by user_id
    const userMeds = new Map<string, typeof dueMedications>();
    for (const med of dueMedications) {
      const existing = userMeds.get(med.user_id) || [];
      existing.push(med);
      userMeds.set(med.user_id, existing);
    }

    let totalSent = 0;
    let totalFailed = 0;
    const privateJWK = JSON.parse(vapidPrivateKey);

    for (const [userId, meds] of userMeds) {
      // Get push subscriptions for this user
      const { data: subscriptions } = await supabase
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth")
        .eq("user_id", userId);

      if (!subscriptions || subscriptions.length === 0) continue;

      for (const med of meds) {
        const medAny = med as any;
        const schedTime = medAny._scheduleTime || "";

        const payload = JSON.stringify({
          title: `💊 Time for ${med.medication_name}`,
          body: `Take ${med.dosage} ${med.dosage_unit} of ${med.medication_name}`,
          icon: "/pwa-192x192.png",
          badge: "/pwa-192x192.png",
          tag: `medication_${med.id}_${schedTime}`,
          data: {
            type: "medication_reminder",
            medicationId: med.id,
            scheduledTime: schedTime,
            url: "/medications",
          },
          requireInteraction: true,
        });

        for (const sub of subscriptions) {
          try {
            const { endpoint, headers, body } = await buildPushHTTPRequest({
              privateJWK,
              subscription: {
                endpoint: sub.endpoint,
                keys: { p256dh: sub.p256dh, auth: sub.auth },
              },
              message: {
                payload,
                adminContact: "mailto:admin@medifusion.app",
                ttl: 300, // 5 minutes
              },
            });

            const response = await fetch(endpoint, {
              method: "POST",
              headers,
              body,
            });

            if (response.ok) {
              totalSent++;
            } else {
              const status = response.status;
              console.error(`Push failed for ${sub.endpoint}: ${status}`);
              totalFailed++;

              // Remove invalid subscriptions (410 Gone or 404)
              if (status === 404 || status === 410) {
                await supabase
                  .from("push_subscriptions")
                  .delete()
                  .eq("endpoint", sub.endpoint)
                  .eq("user_id", userId);
              }
            }
          } catch (err) {
            console.error("Push send error:", err);
            totalFailed++;
          }
        }

        // Update last_notified_times for this medication/schedule
        const currentNotified = (med.last_notified_times as Record<string, string>) || {};
        currentNotified[schedTime] = todayKey;

        await supabase
          .from("medications")
          .update({ last_notified_times: currentNotified })
          .eq("id", med.id);
      }
    }

    return new Response(
      JSON.stringify({ message: "Reminders processed", sent: totalSent, failed: totalFailed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
