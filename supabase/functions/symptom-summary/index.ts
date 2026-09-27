/**
 * SYMPTOM SUMMARY EDGE FUNCTION
 * MediFusion Independent AI - Symptom Analysis Engine
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

const SYSTEM_PROMPT = `You are MediFusion's Symptom Analysis Engine, part of a multi-model clinical intelligence system.

━━━━━━━━━━━━━━━━━━━━━━
MODEL ROLE (THIS ENGINE)
━━━━━━━━━━━━━━━━━━━━━━
- Symptom NLP: Extracts symptoms, severity, negations
- Clinical Reasoning: Synthesizes assessment
- Maps symptoms to evidence-based conditions

━━━━━━━━━━━━━━━━━━━━━━
ANALYSIS PIPELINE
━━━━━━━━━━━━━━━━━━━━━━

STEP 1: DATA INGESTION
- Symptom names, severity levels, duration
- Body locations and anatomical systems
- Frequency patterns and temporal relationships

STEP 2: CROSS-MODAL CORRELATION
- Identify symptom clusters
- Detect patterns indicating specific body system involvement
- State uncertainty levels explicitly

STEP 3: CLINICAL ASSESSMENT
- Identify affected body systems
- Provide ranked list of POSSIBLE CONDITIONS
- Use probability language

STEP 4: RISK STRATIFICATION
• LOW – self-monitoring appropriate
• MODERATE – medical consultation advised
• HIGH – urgent evaluation needed

━━━━━━━━━━━━━━━━━━━━━━
STRICT OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━

### 🔍 Clinical Summary
### 🧠 Possible Medical Conditions
### ⚠️ Risk Level
### 🛡️ Precautions & Recommendations
### 📋 Questions for Your Doctor

━━━━━━━━━━━━━━━━━━━━━━
ACCURACY RULES
━━━━━━━━━━━━━━━━━━━━━━
- Never hallucinate beyond available evidence
- Prefer common, evidence-based conditions
- Avoid over-diagnosis when evidence is limited
- Be empathetic, clear, and supportive`;

const MEDICAL_DISCLAIMER = `\n\n---\n*⚕️ This analysis is for informational purposes only and does not constitute medical advice. Always consult a healthcare professional for diagnosis and treatment.*`;

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
    const { data: allowed } = await adminClient.rpc('check_rate_limit', { p_user_id: userId, p_function_name: 'symptom-summary', p_max_requests: 10, p_window_seconds: 60 });
    if (allowed === false) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { symptoms } = await req.json();
    const HF_API_KEY = Deno.env.get("HUGGINGFACE_API_KEY");
    
    if (!HF_API_KEY) throw new Error("Service configuration error");

    if (!symptoms || symptoms.length === 0) {
      return new Response(
        JSON.stringify({ summary: "No symptoms to analyze. Start tracking your symptoms to receive AI-powered clinical assessments." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const symptomsText = symptoms.map((s: any) => {
      const parts = [
        `- ${s.symptom_name}`,
        `Severity: ${s.severity}/10`,
        s.duration_hours ? `Duration: ${s.duration_hours} hours` : null,
        s.frequency ? `Frequency: ${s.frequency}` : null,
        s.body_location ? `Location: ${s.body_location}` : null,
        s.description ? `Notes: ${s.description}` : null,
        `Onset: ${new Date(s.started_at).toLocaleDateString()}`,
      ].filter(Boolean);
      return parts.join(' | ');
    }).join('\n');

    const userPrompt = `Perform a comprehensive clinical assessment of the following symptom data:\n\n${symptomsText}\n\nProvide: Clinical Summary, Possible Conditions, Risk Level, Precautions, Questions for Doctor.`;

    const { content } = await callWithFallback(HF_API_KEY, [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ]);

    return new Response(
      JSON.stringify({ summary: content + MEDICAL_DISCLAIMER }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Symptom analysis error:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    if (message === "RATE_LIMIT") {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ error: "Service error. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
