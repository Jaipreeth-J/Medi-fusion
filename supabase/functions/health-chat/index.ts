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

// ━━━━━━━━━━━━━━━━━━━━━━
// CASUAL MESSAGE DETECTION
// ━━━━━━━━━━━━━━━━━━━━━━

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
    return `Hi there! 👋 I'm your MediFusion health assistant. How can I help you today?<br><br>
You can ask me about:<br>
<ul>
<li>🩺 Symptoms you're experiencing</li>
<li>💊 Your medications</li>
<li>📊 Health data and vitals</li>
<li>🧠 Mental wellness tips</li>
</ul>
<br>Just type your question or use the quick actions below! 😊`;
  }

  if (/^(how are you|how'?s it going|what'?s new)/.test(lower)) {
    return `I'm doing great, thanks for asking! 😊<br><br>
I'm always here and ready to help with your health questions. How are <b>you</b> feeling today?<br><br>
If something's on your mind, feel free to share — whether it's a symptom, a health goal, or just a wellness check-in! 💪`;
  }

  if (/^(i'?m bored|bored|nothing to do|what should i do)/.test(lower)) {
    return `Let's make the most of this time for your health! 😊<br><br>
Here are some ideas:<br>
<ul>
<li>📊 Check your daily health stats</li>
<li>🧘 Log your mood and stress level</li>
<li>💊 Review your medication schedule</li>
<li>💡 Ask me for a wellness tip</li>
<li>🏃 Set a fitness goal for today</li>
</ul>
<br>What sounds good?`;
  }

  if (/^(tell me a joke|joke|make me laugh|funny)/.test(lower)) {
    const jokes = [
      "Why did the doctor carry a red pen? In case they needed to draw blood! 😄",
      "What did the stethoscope say to the patient? I'm all ears! 🩺😊",
      "Why don't scientists trust atoms? Because they make up everything — including symptoms! 😂",
    ];
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    return `${joke}<br><br>Now that we've had a laugh, anything health-related I can help you with? 😊`;
  }

  if (/^(who are you|what are you|what can you do|help me|what do you do)/.test(lower)) {
    return `I'm <b>MediFusion AI</b> — your personal health assistant! 🤖💚<br><br>
Here's what I can do:<br>
<ul>
<li>🩺 Analyze your symptoms and provide guidance</li>
<li>💊 Track medications and check drug interactions</li>
<li>📊 Monitor your vitals and health trends</li>
<li>🧠 Support your mental wellness journey</li>
<li>🖼️ Analyze medical images and reports</li>
<li>⌚ Sync data from your wearable devices</li>
</ul>
<br>What would you like to explore? 😊`;
  }

  if (/^(thanks?|thank you|ty|thx|appreciate it)/.test(lower)) {
    return `You're welcome! 😊 I'm always here whenever you need health guidance or just want to chat. Take care! 💚`;
  }

  if (/^(bye|goodbye|see you|later|cya|take care)/.test(lower)) {
    return `Goodbye! Take care of yourself! 👋💚<br><br>Remember, I'm here 24/7 whenever you need health support. Stay healthy! 🌟`;
  }

  if (/^(i'?m fine|i'?m good|i'?m okay|doing well|doing good|good|fine)/.test(lower)) {
    return `Glad to hear you're doing well! 😊<br><br>
Want to keep that streak going? Here are some things you can do:<br>
<ul>
<li>📊 Log today's vitals</li>
<li>🧘 Track your mood</li>
<li>💡 Get a wellness tip</li>
</ul>`;
  }

  return `I'm here for you! 😊 Whether it's a health question, checking your stats, or just chatting — I've got you covered.<br><br>
What would you like to do? 💚`;
}

// ━━━━━━━━━━━━━━━━━━━━━━
// SYSTEM PROMPTS
// ━━━━━━━━━━━━━━━━━━━━━━

const SYSTEM_PROMPT = `You are MediFusion AI, a high-accuracy MULTI-MODEL clinical intelligence system.

You have access to the following tools:

1) Patient Profile (name, age, gender, conditions, medications, allergies)
2) Symptom Tracker (symptoms, severity, duration, body locations)
3) Vitals Monitor (heart rate, blood pressure, SpO2, sleep, activity)
4) Mental Health Log (mood scores, stress levels, journal entries)
5) Medical Image Analysis (X-rays, CT scans, MRIs, skin images)

Your job is to analyze all available data and provide a concise, structured clinical assessment.

━━━━━━━━━━━━━━━━━━━━━━
STRICT FORMATTING RULES
━━━━━━━━━━━━━━━━━━━━━━

- DO NOT use Markdown syntax of any kind.
  Forbidden: **  *  ###  ##  ---  ___  \`\`\`  >  _
- USE ONLY HTML-compatible formatting:
  ✔ <b> for headings and emphasis
  ✔ <ul><li> for lists
  ✔ <br> for spacing
  ✔ <hr> ONLY between major sections
- Output must be safe for direct rendering inside a React component.

━━━━━━━━━━━━━━━━━━━━━━
CLINICAL CONTENT RULES
━━━━━━━━━━━━━━━━━━━━━━

- You may:
  ✔ Analyze symptoms, vitals, reports, images, history, wearables
  ✔ Combine multimodal data into a unified clinical assessment
  ✔ Provide likely medical conditions
  ✔ Assign severity (Low / Medium / High)
  ✔ Suggest precautions, next steps, and common treatments

- You must:
  ✔ Perform fused reasoning across all available data
  ✔ Clearly highlight emergency warning signs when risk is HIGH
  ✔ Be decisive, structured, and clinically grounded
  ✔ Prefer common, evidence-based conditions over rare ones

- You must NOT:
  ✘ Include any medical disclaimers
  ✘ Mention "AI", "educational only", or "consult a doctor"
  ✘ Repeat warnings unnecessarily
  ✘ Speculate beyond available evidence

━━━━━━━━━━━━━━━━━━━━━━
MANDATORY RESPONSE STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━

<hr>
🩺 <b>Clinical Summary</b>
(Brief synthesis of reported findings)
<hr>
🧠 <b>Possible Medical Conditions</b>
(Ranked list with probability language)
<hr>
🚦 <b>Risk Level</b>
(Low / Medium / High with reasoning)
<hr>
💊 <b>Management / Treatment Options</b>
(Include ONLY if relevant or requested)
<hr>
🛡️ <b>Precautions & Immediate Actions</b>
(Safety-focused guidance)
<hr>

━━━━━━━━━━━━━━━━━━━━━━
OUTPUT RULE
━━━━━━━━━━━━━━━━━━━━━━

- Return ONLY the formatted clinical response.
- Do NOT explain formatting choices or include system notes.`;

const EMERGENCY_RESPONSE = `<hr>
🚨 <b>CRITICAL ALERT – IMMEDIATE ACTION REQUIRED</b>
<hr>
<br>
<b>⚠️ Risk Level: CRITICAL / HIGH</b><br><br>
Potentially life-threatening symptoms detected. Your safety is the absolute priority.
<hr>
🩺 <b>Assessment</b><br>
Based on the symptoms described, this may indicate a serious medical emergency including cardiac events, severe allergic reactions, stroke symptoms, or acute crisis.
<hr>
🛡️ <b>What To Do Right Now</b>
<ul>
<li>Use the <b>action buttons below</b> to call for help immediately</li>
<li>Do NOT drive yourself – have someone else drive or call an ambulance</li>
<li>Stay calm and keep airways clear</li>
</ul>
<hr>`;

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

    // ── Rate limit check (30 req/min) ──
    const adminClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: allowed } = await adminClient.rpc('check_rate_limit', { p_user_id: userId, p_function_name: 'health-chat', p_max_requests: 30, p_window_seconds: 60 });
    if (allowed === false) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please slow down and try again.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { messages, isEmergency, medications } = await req.json();

    if (isEmergency) {
      return new Response(
        JSON.stringify({ content: EMERGENCY_RESPONSE, isEmergency: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lastUserMessage = [...messages].reverse().find((m: any) => m.role === "user");
    if (lastUserMessage && isCasualMessage(lastUserMessage.content)) {
      const casualResponse = getCasualResponse(lastUserMessage.content);
      return new Response(
        JSON.stringify({ content: casualResponse, isCasual: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let systemContent = SYSTEM_PROMPT;
    if (medications && medications.length > 0) {
      const medList = medications.map((med: any) => 
        `- ${med.medication_name} ${med.dosage}${med.dosage_unit} (${med.frequency})${med.purpose ? ` for ${med.purpose}` : ''}`
      ).join('\n');
      systemContent += `\n\nPATIENT'S CURRENT MEDICATIONS:\n${medList}\n\nConsider these medications when analyzing symptoms.`;
    }

    const content = await callLovableAI(
      [{ role: "system", content: systemContent }, ...messages],
      2000,
    );

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Health chat error:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    
    return new Response(
      JSON.stringify({ error: message.includes("Rate") ? "Rate limit exceeded. Please try again later." : "Service error. Please try again." }),
      { status: message.includes("Rate") ? 429 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
