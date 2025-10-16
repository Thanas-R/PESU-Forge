import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, type = "all", count = 5 } = await req.json();
    if (!content || typeof content !== "string" || content.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: "Content missing or too short (min 50 chars)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const system =
      "You generate study materials from ONLY the provided user content. Output concise, accurate results. Do not invent facts.";

    const user = `You MUST use ONLY the user content between the markers. Do NOT add external facts.
Return STRICT JSON with this structure (omit fields that are not requested by 'type'):
{
  "questions": [
    {"question": string, "options": string[], "correctIndex": number, "explanation": string}
  ],
  "concepts": string[]  // 8-12 short key terms from the content
}

Rules:
- Create at least ${count} multiple-choice questions with 4 plausible options each.
- Explanations must cite phrases from the content where possible.
- concepts should be single words or very short phrases from the content.

===BEGIN USER CONTENT===
${content}
===END USER CONTENT===`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "";

    // Try to parse JSON; if model wrapped in prose, extract JSON block
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      const m = text.match(/\{[\s\S]*\}/);
      if (m) json = JSON.parse(m[0]);
    }

    if (!json) {
      return new Response(JSON.stringify({ error: "AI returned invalid JSON" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Basic validation / trimming
    if (Array.isArray(json.questions)) {
      json.questions = json.questions.slice(0, Math.max(count, 5));
    }
    if (Array.isArray(json.concepts)) {
      json.concepts = json.concepts.slice(0, 12).filter((s: unknown) => typeof s === "string" && s.trim().length > 0);
    }

    return new Response(JSON.stringify(json), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-learning error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});