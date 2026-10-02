import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function callLovableAI(
  messages: Array<{ role: string; content: string }>,
  maxTokens = 2000,
): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

  const response = await fetch(LOVABLE_AI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Lovable AI failed (${response.status}):`, errorText.substring(0, 300));
    throw new Error(`AI request failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty AI response");
  return content;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RED FLAG & EMERGENCY DETECTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const EMERGENCY_PATTERNS = [
  // Cardiac
  /\b(chest pain|heart attack|myocardial infarction|crushing chest|chest pressure|radiating (to (the )?)?(left )?arm)\b/i,
  // Respiratory
  /\b(can'?t breathe|cannot breathe|difficulty breathing|short of breath|shortness of breath|choking|stridor|lips turning blue|gasping for air)\b/i,
  // Neurological / Stroke
  /\b(stroke|facial droop|face drooping|slurred speech|sudden numbness|sudden paralysis|loss of speech|worst headache of my life|thunderclap headache)\b/i,
  // Severe bleeding / Trauma
  /\b(severe bleeding|uncontrolled bleeding|hemorrhaging|coughing blood|vomiting blood)\b/i,
  // Anaphylaxis
  /\b(anaphylaxis|throat (is )?(closing|swelling)|tongue (is )?swelling|swollen tongue)\b/i,
  // Consciousness
  /\b(unconscious|passed out|blacked out|unresponsive|convulsing|seizure)\b/i,
  // Crisis / Self-harm
  /\b(suicidal|want to die|kill myself|end my life|self harm|self-harm|cutting myself|hurting myself|overdose|took too many pills|swallowed poison)\b/i,
];

function detectRedFlagEmergency(text: string): boolean {
  if (!text) return false;
  return EMERGENCY_PATTERNS.some(pattern => pattern.test(text));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CASUAL MESSAGE DETECTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CASUAL_PATTERNS = [
  /^(hi|hello|hey|hola|namaste|yo|sup|what'?s up|howdy|good\s*(morning|afternoon|evening|night))[\s!?.]*$/i,
  /^(how are you|how'?s it going|what'?s new|how do you do)[\s!?.]*$/i,
  /^(thanks?|thank you|ty|thx|appreciate it)[\s!?.]*$/i,
  /^(bye|goodbye|see you|later|good ?bye|cya|take care)[\s!?.]*$/i,
  /^(i'?m bored|bored|nothing to do|what should i do)[\s!?.]*$/i,
  /^(tell me a joke|joke|make me laugh|funny)[\s!?.]*$/i,
  /^(who are you|what are you|what can you do|help me|what do you do)[\s!?.]*$/i,
  /^(ok|okay|sure|alright|cool|nice|great|awesome|got it|understood)[\s!?.]*$/i,
  /^(good|fine|i'?m fine|i'?m good|i'?m okay|doing well|doing good)[\s!?.]*$/i,
  /^(lol|haha|hehe|lmao|rofl|😂|😄|😊)[\s!?.]*$/i,
];

function isCasualMessage(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length > 80) return false;
  return CASUAL_PATTERNS.some(pattern => pattern.test(trimmed));
}

function getCasualResponse(text: string): string {
  const lower = text.trim().toLowerCase();

  if (/^(hi|hello|hey|hola|namaste|yo|sup|howdy|good\s*(morning|afternoon|evening|night))/.test(lower)) {
    return `Hi there! 👋 I'm your MediFusion clinical health assistant. How can I help you today?<br><br>
You can ask me about:<br>
<ul>
<li>🩺 Symptoms you're experiencing</li>
<li>💊 Your medications and interactions</li>
<li>📊 Vitals and wearable trends</li>
<li>🧠 Mental wellness and stress</li>
</ul>
<br>Feel free to describe what you're feeling, or ask any health question! 😊`;
  }

  if (/^(how are you|how'?s it going|what'?s new)/.test(lower)) {
    return `I'm operating normally and ready to assist you! 😊<br><br>
How are <b>you</b> feeling today? Whether it's tracking a symptom, checking in on vitals, or reviewing medications, I'm here to support your health journey.`;
  }

  if (/^(i'?m bored|bored|nothing to do|what should i do)/.test(lower)) {
    return `Let's use this time productively for your health! 😊<br><br>
Here are a few quick ideas:<br>
<ul>
<li>📊 Log today's vitals (blood pressure, heart rate, sleep)</li>
<li>🧘 Record a quick mood and stress check-in</li>
<li>💊 Verify your medication schedule</li>
<li>💡 Ask me for an evidence-based wellness tip</li>
</ul>`;
  }

  if (/^(tell me a joke|joke|make me laugh|funny)/.test(lower)) {
    const jokes = [
      "Why did the doctor carry a red pen? In case they needed to draw blood! 😄",
      "What did the stethoscope say to the patient? I'm all ears! 🩺😊",
      "Why don't scientists trust atoms? Because they make up everything! 😂",
    ];
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    return `${joke}<br><br>Now that we've had a smile, is there any health question or symptom I can help you with today? 😊`;
  }

  if (/^(who are you|what are you|what can you do|help me|what do you do)/.test(lower)) {
    return `I am <b>MediFusion AI</b>, an evidence-based clinical intelligence assistant! 🤖💚<br><br>
Here is how I can support you:<br>
<ul>
<li>🩺 Conservative symptom analysis and differential guidance</li>
<li>💊 Medication reviews and contraindication checks</li>
<li>📊 Vitals analysis and health trend tracking</li>
<li>🧠 Mental wellness and mood tracking support</li>
<li>🖼️ Medical image report context</li>
</ul>
<br><i>Please note: I provide clinical guidance and educational support, not formal medical diagnosis. Always consult a physician for diagnostic or treatment decisions.</i>`;
  }

  if (/^(thanks?|thank you|ty|thx|appreciate it)/.test(lower)) {
    return `You're very welcome! 😊 Always here to help support your health. Take good care of yourself! 💚`;
  }

  if (/^(bye|goodbye|see you|later|cya|take care)/.test(lower)) {
    return `Goodbye! Take care and stay well! 👋💚<br><br>I'm available whenever you need health assistance or tracking support.`;
  }

  if (/^(i'?m fine|i'?m good|i'?m okay|doing well|doing good|good|fine)/.test(lower)) {
    return `Glad to hear you are doing well! 😊<br><br>
Keeping regular records helps stay ahead of health trends. Would you like to log your vitals, check your medication log, or log today's wellness check?`;
  }

  return `I'm here for you! 😊 Whether you have questions about symptoms, medications, or vitals trends, feel free to ask anytime. 💚`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONSERVATIVE CLINICAL SYSTEM PROMPT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SYSTEM_PROMPT = `You are MediFusion AI, a conservative, safety-first clinical intelligence health assistant.

━━━━━━━━━━━━━━━━━━━━━━
CORE CLINICAL SAFETY PRINCIPLES
━━━━━━━━━━━━━━━━━━━━━━
1. SAFETY & CONSERVATIVE REASONING:
   - Prioritize patient safety above all else. Use cautious, evidence-based medical reasoning.
   - Use probabilistic and differential language ("may indicate", "potential differential considerations to discuss with a physician", "requires in-person clinical assessment").
   - NEVER make a definitive diagnosis. Instead, offer potential differential diagnoses ranked from most likely to important rule-outs.
   - If red-flag symptoms or warning signs are present, immediately recommend urgent care or emergency evaluation.

2. MEDICATION & TREATMENT SAFETY:
   - NEVER advise patients to alter dosages, discontinue prescribed medications, or take prescription drugs without their doctor's explicit approval.
   - Check reported symptoms against the patient's retrieved active medications for known adverse effects, drug interactions, or contraindications.

3. ROLE BOUNDARIES & MANDATORY DISCLAIMER:
   - You are an AI health assistant providing evidence-based educational guidance, NOT a human physician.
   - Always recommend consulting a primary care provider or specialist for personalized evaluation and definitive diagnosis.
   - Conclude every clinical assessment with the structured clinical disclaimer.

━━━━━━━━━━━━━━━━━━━━━━
STRICT FORMATTING RULES
━━━━━━━━━━━━━━━━━━━━━━
- DO NOT use Markdown syntax of any kind.
  Forbidden characters: **  *  ###  ##  ---  ___  \`\`\`  >  _
- USE ONLY HTML-compatible formatting:
  ✔ <b> for headings and emphasis
  ✔ <ul><li> for lists
  ✔ <br> for spacing
  ✔ <hr> ONLY between major sections
- Output must be safe for direct rendering inside a React component.

━━━━━━━━━━━━━━━━━━━━━━
MANDATORY RESPONSE STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━
<hr>
🩺 <b>Clinical Summary & Assessment</b><br>
(Synthesize reported symptoms, cross-referenced with the retrieved patient profile, medications, and vitals)
<hr>
🧠 <b>Potential Differential Considerations</b>
(Ranked list of possibilities to discuss with a healthcare professional, with clinical reasoning)
<hr>
🚦 <b>Risk & Triage Level</b><br>
(Low / Moderate / High with clinical justification)
<hr>
🛡️ <b>Recommended Precautions & Safe Next Steps</b>
<ul>
<li>Supportive measures and symptom monitoring</li>
<li>Specific questions to discuss with a doctor</li>
<li>Medication safety reminder (do not alter prescribed medications without doctor consultation)</li>
</ul>
<hr>
⚠️ <b>Red Flags Requiring Immediate Medical Attention</b>
<ul>
<li>Key warning symptoms that warrant urgent or emergency care</li>
</ul>
<hr>
⚕️ <b>Clinical Safety Disclaimer</b><br>
MediFusion AI is an AI-powered educational decision-support tool. It does not provide medical diagnosis or replace consultation with a licensed physician. Always seek the advice of a qualified healthcare professional regarding any medical condition or treatment. If you believe you are experiencing a medical emergency, call 911 or your local emergency services immediately.
<hr>`;

const EMERGENCY_RESPONSE = `<hr>
🚨 <b>CRITICAL ALERT – IMMEDIATE EMERGENCY ACTION REQUIRED</b>
<hr>
<br>
<b>⚠️ Triage Level: CRITICAL / HIGH PRIORITY</b><br><br>
Potentially life-threatening symptoms or acute medical/psychiatric crisis detected. Your immediate safety is the priority.
<hr>
🩺 <b>Emergency Assessment</b><br>
The symptoms or statements you described may indicate a serious medical emergency (such as an acute coronary event, respiratory failure, stroke, anaphylaxis, severe hemorrhage) or acute psychiatric distress requiring urgent in-person intervention.
<hr>
🛡️ <b>Immediate Action Steps</b>
<ul>
<li><b>Call 911 (or your local emergency services) immediately.</b></li>
<li>If you or someone you know is in suicidal crisis or emotional distress, call or text <b>988</b> for the Suicide & Crisis Lifeline (available 24/7).</li>
<li>For suspected poisoning or toxic ingestion, contact Poison Control at <b>1-800-222-1222</b>.</li>
<li><b>Do NOT drive yourself</b> to the emergency department — call an ambulance or have someone drive you.</li>
<li>Stay calm, remain seated or reclining in a safe position, and ensure airways remain open and unrestricted.</li>
<li>Notify an emergency contact, trusted friend, or family member right away.</li>
</ul>
<hr>
⚕️ <i>This is an automated safety alert from MediFusion AI. Do not delay emergency care.</i>
<hr>`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PATIENT CONTEXT RETRIEVAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface PatientContextResult {
  formattedContext: string;
  hasData: boolean;
}

async function fetchPatientContext(
  supabase: any,
  userId: string,
  requestMedications?: any[]
): Promise<PatientContextResult> {
  try {
    const [profileRes, medsRes, vitalsRes, symptomsRes, moodRes] = await Promise.allSettled([
      supabase
        .from("profiles")
        .select("full_name, gender, date_of_birth, blood_type, height_cm, weight_kg, medical_conditions, allergies")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("medications")
        .select("medication_name, dosage, dosage_unit, frequency, instructions, purpose")
        .eq("user_id", userId)
        .eq("is_active", true),
      supabase
        .from("vitals")
        .select("heart_rate, blood_pressure_systolic, blood_pressure_diastolic, blood_sugar, spo2, temperature_celsius, sleep_hours, activity_minutes, recorded_at")
        .eq("user_id", userId)
        .order("recorded_at", { ascending: false })
        .limit(5),
      supabase
        .from("symptoms")
        .select("symptom_name, severity, frequency, body_location, description, started_at")
        .eq("user_id", userId)
        .is("resolved_at", null)
        .order("started_at", { ascending: false })
        .limit(5),
      supabase
        .from("mood_entries")
        .select("mood_score, stress_level, anxiety_level, energy_level, sleep_quality, recorded_at")
        .eq("user_id", userId)
        .order("recorded_at", { ascending: false })
        .limit(3),
    ]);

    const lines: string[] = [];

    // 1. Profile & Demographics
    const profile = profileRes.status === "fulfilled" ? profileRes.value.data : null;
    lines.push("1. PATIENT DEMOGRAPHICS & BACKGROUND:");
    if (profile) {
      let ageStr = "Not specified";
      if (profile.date_of_birth) {
        const dob = new Date(profile.date_of_birth);
        const ageYears = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        if (!isNaN(ageYears) && ageYears >= 0 && ageYears < 130) {
          ageStr = `${ageYears} years old`;
        }
      }
      lines.push(`- Age: ${ageStr}`);
      lines.push(`- Gender: ${profile.gender || "Not specified"}`);
      lines.push(`- Blood Type: ${profile.blood_type || "Not specified"}`);
      if (profile.height_cm || profile.weight_kg) {
        const height = profile.height_cm ? `${profile.height_cm} cm` : "N/A";
        const weight = profile.weight_kg ? `${profile.weight_kg} kg` : "N/A";
        let bmiStr = "";
        if (profile.height_cm && profile.weight_kg) {
          const hM = profile.height_cm / 100;
          const bmi = (profile.weight_kg / (hM * hM)).toFixed(1);
          bmiStr = ` (BMI: ${bmi})`;
        }
        lines.push(`- Height: ${height}, Weight: ${weight}${bmiStr}`);
      }
      const conditions = Array.isArray(profile.medical_conditions) && profile.medical_conditions.length > 0
        ? profile.medical_conditions.join(", ")
        : "None recorded";
      lines.push(`- Known Medical Conditions: ${conditions}`);

      const allergies = Array.isArray(profile.allergies) && profile.allergies.length > 0
        ? profile.allergies.join(", ")
        : "No known drug/food allergies recorded (NKDA)";
      lines.push(`- Known Allergies: ${allergies}`);
    } else {
      lines.push("- Demographics: Not recorded");
      lines.push("- Known Medical Conditions: None recorded");
      lines.push("- Known Allergies: None recorded");
    }

    // 2. Active Medications
    lines.push("\n2. ACTIVE MEDICATIONS:");
    const dbMeds = (medsRes.status === "fulfilled" ? medsRes.value.data : null) || [];
    const mergedMedsMap = new Map<string, any>();
    dbMeds.forEach((m: any) => {
      if (m?.medication_name) mergedMedsMap.set(m.medication_name.toLowerCase().trim(), m);
    });
    if (Array.isArray(requestMedications)) {
      requestMedications.forEach((m: any) => {
        if (m?.medication_name) {
          const key = m.medication_name.toLowerCase().trim();
          if (!mergedMedsMap.has(key)) mergedMedsMap.set(key, m);
        }
      });
    }

    const activeMeds = Array.from(mergedMedsMap.values());
    if (activeMeds.length > 0) {
      activeMeds.forEach((m: any) => {
        const details = [
          m.dosage && m.dosage_unit ? `${m.dosage}${m.dosage_unit}` : m.dosage || '',
          m.frequency ? `(${m.frequency})` : '',
          m.purpose ? `for ${m.purpose}` : '',
          m.instructions ? `[instructions: ${m.instructions}]` : '',
        ].filter(Boolean).join(' ');
        lines.push(`- ${m.medication_name}: ${details}`);
      });
    } else {
      lines.push("- None recorded");
    }

    // 3. Recent Vitals
    lines.push("\n3. RECENT RECORDED VITALS (Latest):");
    const vitals = vitalsRes.status === "fulfilled" ? vitalsRes.value.data : null;
    if (Array.isArray(vitals) && vitals.length > 0) {
      vitals.forEach((v: any) => {
        const parts: string[] = [];
        if (v.heart_rate) parts.push(`HR: ${v.heart_rate} bpm`);
        if (v.blood_pressure_systolic && v.blood_pressure_diastolic) {
          parts.push(`BP: ${v.blood_pressure_systolic}/${v.blood_pressure_diastolic} mmHg`);
        }
        if (v.spo2) parts.push(`SpO2: ${v.spo2}%`);
        if (v.blood_sugar) parts.push(`Blood Sugar: ${v.blood_sugar} mg/dL`);
        if (v.temperature_celsius) parts.push(`Temp: ${v.temperature_celsius}°C`);
        if (v.sleep_hours) parts.push(`Sleep: ${v.sleep_hours}h`);
        const dateStr = v.recorded_at ? new Date(v.recorded_at).toLocaleDateString() : 'recent';
        lines.push(`- [${dateStr}]: ${parts.join(', ') || 'Partial record'}`);
      });
    } else {
      lines.push("- None recorded");
    }

    // 4. Active Logged Symptoms
    lines.push("\n4. ACTIVE LOGGED SYMPTOMS:");
    const symptoms = symptomsRes.status === "fulfilled" ? symptomsRes.value.data : null;
    if (Array.isArray(symptoms) && symptoms.length > 0) {
      symptoms.forEach((s: any) => {
        const loc = s.body_location ? ` at ${s.body_location}` : '';
        const desc = s.description ? ` (${s.description})` : '';
        const started = s.started_at ? ` [started ${new Date(s.started_at).toLocaleDateString()}]` : '';
        lines.push(`- ${s.symptom_name}${loc}: Severity ${s.severity}/10${desc}${started}`);
      });
    } else {
      lines.push("- None currently logged in symptom tracker");
    }

    // 5. Recent Mental Wellness & Mood
    lines.push("\n5. RECENT MENTAL WELLNESS & MOOD LOGS:");
    const moods = moodRes.status === "fulfilled" ? moodRes.value.data : null;
    if (Array.isArray(moods) && moods.length > 0) {
      moods.forEach((m: any) => {
        const parts: string[] = [];
        if (m.mood_score != null) parts.push(`Mood: ${m.mood_score}/10`);
        if (m.stress_level != null) parts.push(`Stress: ${m.stress_level}/10`);
        if (m.anxiety_level != null) parts.push(`Anxiety: ${m.anxiety_level}/10`);
        if (m.sleep_quality != null) parts.push(`Sleep Quality: ${m.sleep_quality}/10`);
        const dateStr = m.recorded_at ? new Date(m.recorded_at).toLocaleDateString() : 'recent';
        lines.push(`- [${dateStr}]: ${parts.join(', ')}`);
      });
    } else {
      lines.push("- None recorded");
    }

    return {
      formattedContext: lines.join("\n"),
      hasData: true,
    };
  } catch (err) {
    console.error("Error retrieving patient context:", err);
    return {
      formattedContext: "Note: Patient profile and clinical context could not be retrieved from the database.",
      hasData: false,
    };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN SERVER HANDLER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Auth verification ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    // ── Rate limit check (30 req/min) ──
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: allowed } = await adminClient.rpc("check_rate_limit", {
      p_user_id: userId,
      p_function_name: "health-chat",
      p_max_requests: 30,
      p_window_seconds: 60,
    });
    if (allowed === false) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please slow down and try again." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages = [], isEmergency: clientEmergency, medications: clientMeds } = await req.json();

    const lastUserMessage = [...messages].reverse().find((m: any) => m.role === "user");
    const userText = lastUserMessage?.content || "";

    // ── Conservative Server-Side Red Flag Emergency Detection ──
    const serverEmergency = detectRedFlagEmergency(userText);
    const isEmergency = Boolean(clientEmergency || serverEmergency);

    if (isEmergency) {
      return new Response(
        JSON.stringify({ content: EMERGENCY_RESPONSE, isEmergency: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Casual message shortcut ──
    if (userText && isCasualMessage(userText)) {
      const casualResponse = getCasualResponse(userText);
      return new Response(
        JSON.stringify({ content: casualResponse, isCasual: true, isEmergency: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Retrieve Authentic Patient Clinical Context from Database ──
    const patientContext = await fetchPatientContext(supabase, userId, clientMeds);

    let systemContent = SYSTEM_PROMPT;
    systemContent += `\n\n━━━━━━━━━━━━━━━━━━━━━━\nVERIFIED PATIENT CLINICAL CONTEXT:\n━━━━━━━━━━━━━━━━━━━━━━\n${patientContext.formattedContext}\n\n`;
    systemContent += `CLINICAL REASONING DIRECTIVES:\n`;
    systemContent += `- Base your response on the patient's verified demographics, active medications, allergies, and vitals shown above.\n`;
    systemContent += `- If allergies are present, explicitly respect them and note any relevant drug/ingredient contraindications.\n`;
    systemContent += `- If the patient has active medications, consider whether the described symptoms could be adverse effects or interactions.\n`;
    systemContent += `- If relevant vital readings are abnormal (e.g. hypertension, hypoxia, tachycardia), factor them into the clinical assessment.\n`;
    systemContent += `- If data is missing or "None recorded", do not speculate or fabricate clinical history.`;

    const content = await callLovableAI(
      [{ role: "system", content: systemContent }, ...messages],
      2000,
    );

    return new Response(
      JSON.stringify({ content, isEmergency: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Health chat error:", error);
    const message = error instanceof Error ? error.message : "An error occurred";

    return new Response(
      JSON.stringify({
        error: message.includes("Rate")
          ? "Rate limit exceeded. Please try again later."
          : "Service error. Please try again.",
      }),
      {
        status: message.includes("Rate") ? 429 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
