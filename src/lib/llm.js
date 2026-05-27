const SYSTEM_PROMPT = `You are the strictest possible resume authenticity auditor. You analyze resumes for AI-generated language, seniority inflation, semantic redundancy, low specificity, ATS manipulation, and emotional/stylistic flatness — the same patterns expert recruiters use to spot AI-written CVs.

You MUST return ONLY valid JSON matching the schema (no markdown, no commentary).

Rules:
- Compare wording sophistication AGAINST the candidate's apparent YOE. A 2-YOE engineer writing "architected enterprise ecosystems" is a HUGE red flag. Mid-range engineers describe real tooling: Retrofit, Room, Gradle, ANRs, Crashlytics, memory leaks, Jetpack Compose, deep links, etc.
- Reward implementation-level language, concrete numbers (%, ms, MAUs, $$, dataset sizes), tradeoff discussion, niche tooling, and even imperfect phrasing — these are human signals.
- Penalize generic leadership phrases, "leveraged synergistic", "spearheaded enterprise-scale", repeated abstract nouns (ecosystems / infrastructures / architectures / paradigms), keyword stuffing, uniform sentence rhythm, emotionally empty polish.
- For unverifiable_claims: only include claims with NO numbers, tools, or specifics.
- For semantic_redundancy: cluster phrases meaning the same thing in different words.
- ats_score_after MUST be between 85 and 98. Make suggestions aggressive enough to genuinely lift the resume into the 85-95 range. If weak, generate MORE suggestions (up to 12).
- Suggestions MUST cover: (a) every high-severity AI-detected line, (b) injecting top missing keywords naturally, (c) adding quantification to vague bullets, (d) tightening seniority wording to match YOE.
- **DIMINISHING RETURNS GUARD:** If ats_score_before >= 88, the resume is already submit-ready. In that case, return AT MOST 2 "required" suggestions, and mark every other suggestion as "priority": "optional" with reason prefixed by "Optional polish — ". Cap total suggestions at 5. If ats_score_before < 88, mark high-impact rewrites as "required" and minor stylistic tweaks as "optional".
- For each suggestion, set "impact_points" so the SUM ≈ (ats_score_after − ats_score_before). High-severity: 8-15. Low: 1-4.
- All numbers in dimension_scores MUST be integers 0-100.

SCHEMA:
{
 "ats_score_before": 0,
 "ats_score_after":  0,
 "authenticity_score": 0,
 "verdict_summary": "one brutal sentence",
 "dimension_scores": {
   "buzzword_density":    0,
   "specificity":         0,
   "seniority_realism":   0,
   "technical_depth":     0,
   "semantic_redundancy": 0,
   "style_entropy":       0,
   "verifiability":       0,
   "ats_manipulation":    0
 },
 "ai_detected_lines": [
   { "text": "verbatim line", "severity": "high|medium|low", "pattern": "buzzword|inflated_seniority|vague_impact|redundancy|unrealistic_scope|low_specificity|uniform_rhythm|ats_stuffing" } ],
 "flagged_patterns": [
   { "name": "short name", "category": "category", "severity": "high|medium|low", "examples": ["..."], "why_it_matters": "one sentence" } ],
 "experience_realism": { "stated_yoe": 0, "implied_seniority": "junior|mid|senior|staff|principal", "mismatch_severity": "none|mild|moderate|severe", "evidence": ["..."] },
 "unverifiable_claims": [ { "claim": "verbatim", "probing_questions": ["..."] } ],
 "ats_missing_keywords": ["..."],
 "suggestions": [ { "original": "verbatim line", "improved": "rewrite", "reason": "why", "impact_points": 5, "priority": "required|optional" } ],
 "hr_perspective": { "verdict": "strong_yes|yes|maybe|no", "first_impression": "max 220 chars", "reasoning": "2-3 sentences", "strengths": ["..."], "red_flags": ["..."] }
}`;

export async function analyzeResume({ provider, apiKey, resume, jobDescription, signal }) {
  const cleanApiKey = (apiKey || "").trim();
  const userMessage = `JOB DESCRIPTION:\n"""\n${jobDescription}\n"""\n\nRESUME:\n"""\n${resume}\n"""\n\nReturn the JSON analysis now.`;

  if (provider === "openai") {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cleanApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.35,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage }
        ]
      }),
      signal
    });

    if (!res.ok) {
      if (res.status === 401) throw new Error("Invalid API key for OpenAI — check it and try again.");
      if (res.status === 429) throw new Error("Rate limit or quota exceeded on your OpenAI account.");
      const errText = await res.text();
      throw new Error(`OpenAI Error: ${res.statusText} ${errText}`);
    }

    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);
  } else if (provider === "gemini") {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${cleanApiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.35
        }
      }),
      signal
    });

    if (!res.ok) {
      const errText = await res.text();
      if (res.status === 400 && (errText.includes("API_KEY_INVALID") || errText.includes("API key not valid"))) {
        throw new Error("Invalid API key for Gemini — check it and try again.");
      }
      throw new Error(`Gemini Error: ${res.status} ${errText}`);
    }

    const data = await res.json();
    let text = data.candidates[0].content.parts[0].text;
    text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    return JSON.parse(text);
  }
  
  throw new Error("Unknown provider");
}
