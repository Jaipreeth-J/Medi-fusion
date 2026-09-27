/**
 * DRUG INTERACTION CHECKER EDGE FUNCTION
 * Uses HuggingFace models with fallback chain
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
  options: { max_tokens?: number; response_format?: any } = {}
): Promise<{ content: string; model: string }> {
  const { max_tokens = 2000, response_format } = options;
  let lastError = "";
  for (const model of MODEL_CHAIN) {
    try {
      console.log(`Trying model: ${model}`);
      const body: any = { model, messages, max_tokens };
      if (response_format) body.response_format = response_format;
      const response = await fetch(HF_API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

const SYSTEM_PROMPT = `You are MediFusion's Pharmacology Engine.

Analyze medications for drug-drug interactions. For each pair check:
- Pharmacodynamic interactions
- Pharmacokinetic interactions  
- Contraindications
- Additive side effect risks

Severity levels: NONE, MINOR, MODERATE, MAJOR, CONTRAINDICATED

You MUST always return valid JSON even if medication names seem unclear. Make your best assessment.

OUTPUT FORMAT (JSON only, no markdown, no explanation):
{
  "overallSeverity": "none|minor|moderate|major|contraindicated",
  "summary": "Brief 1-2 sentence summary",
  "interactions": [
    {
      "medications": ["Drug A", "Drug B"],
      "severity": "none|minor|moderate|major|contraindicated",
      "mechanism": "Brief explanation",
      "effects": "Potential clinical effects",
      "recommendation": "What to discuss with healthcare provider"
    }
  ],
  "generalWarnings": [],
  "monitoringAdvice": []
}`;

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
    const { data: allowed } = await adminClient.rpc('check_rate_limit', { p_user_id: userId, p_function_name: 'check-drug-interactions', p_max_requests: 10, p_window_seconds: 60 });
    if (allowed === false) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { medications } = await req.json();

    if (!medications || !Array.isArray(medications) || medications.length === 0) {
      return new Response(
        JSON.stringify({ error: "No medications provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const HF_API_KEY = Deno.env.get("HUGGINGFACE_API_KEY");
    if (!HF_API_KEY) throw new Error("Service configuration error");

    const medicationList = medications.map((med: any) => 
      `- ${med.medication_name} ${med.dosage}${med.dosage_unit} (${med.frequency})${med.purpose ? ` for ${med.purpose}` : ''}`
    ).join('\n');

    const userPrompt = `Analyze the following medications for potential drug-drug interactions:\n\n${medicationList}\n\nProvide a comprehensive interaction analysis in the specified JSON format. Return ONLY valid JSON, no other text.`;

    const { content } = await callWithFallback(
      HF_API_KEY,
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      { response_format: { type: "json_object" } }
    );

    let interactionData;
    try {
      interactionData = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        try { interactionData = JSON.parse(jsonMatch[1].trim()); } catch { /* continue */ }
      }
      if (!interactionData) {
        const objectMatch = content.match(/\{[\s\S]*\}/);
        if (objectMatch) {
          try { interactionData = JSON.parse(objectMatch[0]); } catch { /* continue */ }
        }
      }
      if (!interactionData) {
        console.error("Raw AI content:", content.substring(0, 500));
        interactionData = {
          overallSeverity: "unknown",
          summary: "Unable to parse interaction analysis. Please consult a pharmacist.",
          interactions: [],
          generalWarnings: ["Analysis could not be completed. Please verify medication names and try again."],
          monitoringAdvice: [],
        };
      }
    }

    return new Response(
      JSON.stringify({
        ...interactionData,
        analyzedAt: new Date().toISOString(),
        disclaimer: "This information is for educational purposes only. Always consult your pharmacist or healthcare provider before making changes to your medication regimen.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Drug interaction check error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "RATE_LIMIT") {
      return new Response(
        JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ error: "Failed to analyze drug interactions. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
