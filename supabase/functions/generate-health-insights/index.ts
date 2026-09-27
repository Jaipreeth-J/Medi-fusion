/**
 * HEALTH INSIGHTS GENERATION EDGE FUNCTION
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";

const MODEL_CHAIN = [
  "Qwen/Qwen2.5-72B-Instruct",
  "mistralai/Mistral-Small-24B-Instruct-2501",
  "meta-llama/Llama-3.3-70B-Instruct",
];

async function callWithFallback(
  apiKey: string,
  messages: Array<{ role: string; content: string }>,
  max_tokens = 2000,
): Promise<{ content: string; model: string }> {
  let lastError = "";
  for (const model of MODEL_CHAIN) {
    try {
      console.log(`Trying model: ${model}`);
      const response = await fetch(HF_API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages, max_tokens }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Model ${model} failed (${response.status}):`, errorText.substring(0, 300));
        if (response.status === 429) throw new Error("RATE_LIMIT");
        if (response.status === 401 || response.status === 402) throw new Error("AUTH_FAILED");
        lastError = `${model}: ${response.status}`;
        continue;
      }
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) { lastError = `${model}: empty response`; continue; }
      console.log(`Success with model: ${model}`);
      return { content, model };
    } catch (err) {
      if (err instanceof Error && (err.message === "RATE_LIMIT" || err.message === "AUTH_FAILED")) throw err;
      lastError = `${model}: ${err instanceof Error ? err.message : "Unknown"}`;
    }
  }
  throw new Error(`All models failed. Last: ${lastError}`);
}

const SYSTEM_PROMPT = `You are MediFusion's Health Insights Engine, part of a multi-model clinical intelligence system.

━━━━━━━━━━━━━━━━━━━━━━
MODEL ROLES
━━━━━━━━━━━━━━━━━━━━━━
1) Vitals & Time-Series Analysis (Rule-based, WHO/AHA/CDC ranges)
2) Symptom Pattern Recognition
3) Mental Health Assessment
4) Reasoning Synthesis (THIS MODEL)

━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━
### 📊 Weekly Health Overview
### 🔍 Clinical Observations
### ⚠️ Areas Requiring Attention
### 💡 Personalized Recommendations
### 🌟 Positive Progress

━━━━━━━━━━━━━━━━━━━━━━
RULES
━━━━━━━━━━━━━━━━━━━━━━
- Never hallucinate beyond available evidence
- Prefer common, evidence-based conditions
- Be encouraging, personalized, and safety-focused`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Auth check ──
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const userId = claimsData.claims.sub as string;

    // ── Rate limit check (10 req/min) ──
    const adminClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: allowed } = await adminClient.rpc('check_rate_limit', { p_user_id: userId, p_function_name: 'generate-health-insights', p_max_requests: 10, p_window_seconds: 60 });
    if (allowed === false) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { vitals, symptoms, moodEntries, profile } = await req.json();

    const HF_API_KEY = Deno.env.get("HUGGINGFACE_API_KEY");
    if (!HF_API_KEY) throw new Error("Service configuration error");

    const healthDataSummary = formatHealthData(vitals, symptoms, moodEntries, profile);

    const { content } = await callWithFallback(HF_API_KEY, [
      { role: "system", content: SYSTEM_PROMPT },
      { 
        role: "user", 
        content: `Perform a comprehensive multimodal health analysis on the following weekly data:\n\n${healthDataSummary}\n\nProvide Weekly Health Overview, Clinical Observations, Areas Requiring Attention, Personalized Recommendations, and Positive Progress.`
      },
    ]);

    return new Response(
      JSON.stringify({ content, generatedAt: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Health insights error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "RATE_LIMIT") {
      return new Response(
        JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ error: "Service error. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function formatHealthData(vitals: any[], symptoms: any[], moodEntries: any[], profile: any): string {
  let summary = "";

  if (profile) {
    summary += "## Patient Profile Context\n";
    if (profile.full_name) summary += `- Name: ${profile.full_name}\n`;
    if (profile.gender) summary += `- Gender: ${profile.gender}\n`;
    if (profile.date_of_birth) summary += `- DOB: ${profile.date_of_birth}\n`;
    if (profile.height_cm) summary += `- Height: ${profile.height_cm} cm\n`;
    if (profile.weight_kg) summary += `- Weight: ${profile.weight_kg} kg\n`;
    if (profile.blood_type) summary += `- Blood Type: ${profile.blood_type}\n`;
    if (profile.medical_conditions?.length > 0) summary += `- Known Conditions: ${profile.medical_conditions.join(", ")}\n`;
    if (profile.allergies?.length > 0) summary += `- Allergies: ${profile.allergies.join(", ")}\n`;
    if (profile.medications?.length > 0) summary += `- Current Medications: ${profile.medications.join(", ")}\n`;
    summary += "\n";
  }

  if (vitals && vitals.length > 0) {
    summary += "## Vitals Time-Series Data (Past 7 Days)\n";
    const heartRates = vitals.filter(v => v.heart_rate).map(v => v.heart_rate);
    if (heartRates.length > 0) {
      const avg = Math.round(heartRates.reduce((a: number, b: number) => a + b, 0) / heartRates.length);
      summary += `- Heart Rate: Avg ${avg} bpm | Range: ${Math.min(...heartRates)}-${Math.max(...heartRates)} bpm\n`;
    }
    const systolicBPs = vitals.filter(v => v.blood_pressure_systolic).map(v => v.blood_pressure_systolic);
    const diastolicBPs = vitals.filter(v => v.blood_pressure_diastolic).map(v => v.blood_pressure_diastolic);
    if (systolicBPs.length > 0) {
      const avgSys = Math.round(systolicBPs.reduce((a: number, b: number) => a + b, 0) / systolicBPs.length);
      const avgDia = Math.round(diastolicBPs.reduce((a: number, b: number) => a + b, 0) / diastolicBPs.length);
      summary += `- Blood Pressure: Avg ${avgSys}/${avgDia} mmHg\n`;
    }
    const spo2s = vitals.filter(v => v.spo2).map(v => v.spo2);
    if (spo2s.length > 0) {
      const avg = Math.round(spo2s.reduce((a: number, b: number) => a + b, 0) / spo2s.length);
      summary += `- SpO2: Avg ${avg}% | Min: ${Math.min(...spo2s)}%\n`;
    }
    const sleepHours = vitals.filter(v => v.sleep_hours).map(v => v.sleep_hours);
    if (sleepHours.length > 0) {
      const avg = (sleepHours.reduce((a: number, b: number) => a + b, 0) / sleepHours.length).toFixed(1);
      summary += `- Sleep: Avg ${avg} hours/night\n`;
    }
    const activityMins = vitals.filter(v => v.activity_minutes).map(v => v.activity_minutes);
    if (activityMins.length > 0) {
      const total = activityMins.reduce((a: number, b: number) => a + b, 0);
      summary += `- Activity: ${total} total min | ~${Math.round(total / 7)} min/day\n`;
    }
    summary += "\n";
  } else {
    summary += "## Vitals Data: No vitals recorded this week\n\n";
  }

  if (symptoms && symptoms.length > 0) {
    summary += "## Symptom Log\n";
    const active = symptoms.filter((s: any) => !s.resolved_at);
    if (active.length > 0) {
      summary += `Active Symptoms (${active.length}):\n`;
      active.forEach((s: any) => {
        summary += `- ${s.symptom_name} | Severity: ${s.severity}/10 | Location: ${s.body_location || 'Unspecified'}\n`;
      });
    }
    summary += "\n";
  } else {
    summary += "## Symptom Log: No symptoms this week\n\n";
  }

  if (moodEntries && moodEntries.length > 0) {
    summary += "## Mental Health\n";
    const avgMood = (moodEntries.reduce((sum: number, e: any) => sum + e.mood_score, 0) / moodEntries.length).toFixed(1);
    summary += `- Mood Score: Avg ${avgMood}/10 (${moodEntries.length} entries)\n`;
    const stressEntries = moodEntries.filter((e: any) => e.stress_level !== null);
    if (stressEntries.length > 0) {
      const avg = (stressEntries.reduce((sum: number, e: any) => sum + (e.stress_level || 0), 0) / stressEntries.length).toFixed(1);
      summary += `- Stress Level: Avg ${avg}/10\n`;
    }
    summary += "\n";
  } else {
    summary += "## Mental Health: No mood entries this week\n\n";
  }

  return summary;
}
