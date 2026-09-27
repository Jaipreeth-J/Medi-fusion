/**
 * MEDICAL IMAGE ANALYSIS EDGE FUNCTION
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const VISION_MODEL = "google/gemini-2.5-flash";

const SYSTEM_PROMPT = `You are MediFusion's Medical Vision Engine — a clinical image analysis system.

━━━━━━━━━━━━━━━━━━━━━━
ACCURACY RULES
━━━━━━━━━━━━━━━━━━━━━━
- Assign internal confidence to findings (high / moderate / low)
- Do NOT speculate beyond visible evidence
- If findings are normal, state clearly: "No significant abnormality detected"
- Prefer common conditions over rare ones when evidence is ambiguous
- For lab reports, extract and interpret key values
- For skin conditions, describe morphology (color, shape, distribution, texture)
- For injuries, describe wound type, depth signs, surrounding tissue, and possible severity

━━━━━━━━━━━━━━━━━━━━━━
SUPPORTED IMAGE TYPES
━━━━━━━━━━━━━━━━━━━━━━
- X-ray (chest, limb, dental, abdominal)
- CT scan slices
- MRI scans
- Ultrasound images
- Skin / dermatology images (rashes, lesions, moles, infections)
- Injuries and wounds (cuts, burns, bruises, swelling)
- Dental images
- Eye / ophthalmology images
- Lab reports and blood work
- Pathology slides
- Prescriptions

━━━━━━━━━━━━━━━━━━━━━━
STRICT FORMATTING RULES
━━━━━━━━━━━━━━━━━━━━━━
- DO NOT use Markdown syntax.
- USE ONLY HTML-compatible formatting: <b>, <ul><li>, <br>, <hr>
- Do NOT wrap content in <div>, <html>, or <body>.

━━━━━━━━━━━━━━━━━━━━━━
MANDATORY RESPONSE STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━
<hr>
🖼️ <b>Key Findings</b>
<ul><li>Finding 1 (confidence: high/moderate/low)</li></ul>
<hr>
🧠 <b>Clinical Interpretation</b>
<ul><li>Possible condition and reasoning</li></ul>
<hr>
📌 <b>Important Observations</b>
<ul><li>Notable observations</li></ul>
<hr>

Return ONLY the formatted content. Keep the response brief and precise.`;

async function imageToBase64DataUrl(imageUrl: string): Promise<string> {
  console.log('Fetching image for base64 conversion:', imageUrl.substring(0, 100));
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
  }
  const contentType = response.headers.get('content-type') || 'image/jpeg';
  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  const base64 = btoa(binary);
  const mimeType = contentType.split(';')[0].trim();
  return `data:${mimeType};base64,${base64}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
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
    const { data: allowed } = await adminClient.rpc('check_rate_limit', { p_user_id: userId, p_function_name: 'analyze-medical-image', p_max_requests: 10, p_window_seconds: 60 });
    if (allowed === false) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { imageUrl, imageType, bodyPart, fileName, symptomNotes } = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate imageUrl is from our Supabase storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    if (!imageUrl.startsWith(supabaseUrl) && !imageUrl.startsWith('data:')) {
      return new Response(
        JSON.stringify({ error: 'Invalid image source' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('Service configuration error');
    }

    let base64DataUrl: string;
    try {
      base64DataUrl = await imageToBase64DataUrl(imageUrl);
      console.log('Image converted to base64 successfully, length:', base64DataUrl.length);
    } catch (fetchErr) {
      console.error('Failed to fetch/convert image:', fetchErr);
      return new Response(
        JSON.stringify({
          error: 'Could not access the image. Please ensure the image is accessible.',
          summary: `<hr>🖼️ <b>Image Access Error</b><br><br>Unable to retrieve the medical image for analysis. Please re-upload the image and try again.<hr>`,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userPrompt = `Analyze this medical image.
File: ${fileName || 'Unknown'}
Type: ${imageType || 'Medical Image'}
Body Part: ${bodyPart || 'Not specified'}
${symptomNotes ? `Patient Notes: ${symptomNotes}` : ''}

Provide a concise clinical analysis following the mandatory response structure.`;

    console.log(`Calling vision model: ${VISION_MODEL}`);
    const response = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: VISION_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              { type: 'image_url', image_url: { url: base64DataUrl } },
            ],
          },
        ],
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Vision model error (${response.status}):`, errorText.substring(0, 500));

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: 'AI credits exhausted. Please add credits in Lovable workspace settings.',
            summary: `<hr>🖼️ <b>Analysis Unavailable</b><br><br>AI service credits are exhausted. Please contact the administrator to add credits.<hr>`,
          }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          error: 'Image analysis model returned an error. Please try again.',
          summary: `<hr>🖼️ <b>Analysis Unavailable</b><br><br>The medical image analysis service encountered an error. Please try again later or consult your healthcare provider for image interpretation.<hr>`,
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content;

    if (!summary) {
      return new Response(
        JSON.stringify({
          error: 'Empty response from analysis model.',
          summary: `<hr>🖼️ <b>Analysis Incomplete</b><br><br>The model did not return a response. Please try again.<hr>`,
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analysis completed successfully');
    return new Response(
      JSON.stringify({ summary, model: VISION_MODEL }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Medical image analysis error:', error);
    return new Response(
      JSON.stringify({
        error: 'Analysis failed. Please try again.',
        summary: `<hr>🖼️ <b>Analysis Error</b><br><br>An unexpected error occurred during image analysis. Please try again.<hr>`,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
