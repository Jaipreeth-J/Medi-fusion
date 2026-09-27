/**
 * One-time utility to generate VAPID keys for Web Push.
 * Call this once, then store the keys as secrets.
 */

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
    // Generate ECDSA P-256 key pair
    const keyPair = await crypto.subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["sign", "verify"]
    );

    // Export as JWK
    const privateJWK = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
    const publicJWK = await crypto.subtle.exportKey("jwk", keyPair.publicKey);

    // Convert public key to the URL-safe base64 format used by Web Push
    const publicKeyRaw = await crypto.subtle.exportKey("raw", keyPair.publicKey);
    const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKeyRaw)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    return new Response(
      JSON.stringify({
        message: "VAPID keys generated. Store these as secrets.",
        instructions: {
          step1: "Copy VAPID_PRIVATE_KEY value and add it as a secret named VAPID_PRIVATE_KEY",
          step2: "Copy VAPID_PUBLIC_KEY value and update it in your frontend code (usePushNotifications.tsx)",
        },
        VAPID_PRIVATE_KEY: JSON.stringify(privateJWK),
        VAPID_PUBLIC_KEY: publicKeyBase64,
      }, null, 2),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Key generation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate keys" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
