/**
 * InternTrack Resume Enhancer (offline-first)
 * - ATS checks
 * - Bullet rewrites (impact + metric prompts)
 * - Keyword coverage vs a pasted job description
 *
 * Optional ChatGPT mode:
 * If OPENAI_API_KEY exists, you can implement an OpenAI call in enhanceWithChatGPT().
 * This repo keeps it offline by default so it works out of the box.
 */

const ACTION_VERBS = [
  "Built","Designed","Implemented","Optimized","Automated","Developed","Integrated",
  "Refactored","Deployed","Tested","Analyzed","Improved","Accelerated","Reduced","Led"
];

function splitBullets(text) {
  return text
    .split(/\n+/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => s.replace(/^[-•]\s*/, ""));
}

function keywordSet(text) {
  return new Set(
    (text || "")
      .toLowerCase()
      .replace(/[^a-z0-9+.#\s]/g, " ")
      .split(/\s+/)
      .filter(w => w.length >= 3)
  );
}

function scoreKeywords(resumeText, jdText) {
  const r = keywordSet(resumeText);
  const j = keywordSet(jdText);
  if (j.size === 0) return { score: 0, missing: [] };

  const missing = [];
  let hit = 0;
  for (const kw of j) {
    if (r.has(kw)) hit++;
    else missing.push(kw);
  }
  return { score: Math.round((hit / j.size) * 100), missing: missing.slice(0, 25) };
}

function suggestRewrite(bullet) {
  const hasVerb = ACTION_VERBS.some(v => new RegExp("^" + v + "\\b", "i").test(bullet));
  const hasNumber = /\b\d+%?|\b\d+\.\d+%?|\b\d+\s*(ms|s|sec|x|users|req|rps|gb|mb)\b/i.test(bullet);

  let out = bullet;
  if (!hasVerb) out = `${ACTION_VERBS[Math.floor(Math.random()*ACTION_VERBS.length)]} ${out[0]?.toLowerCase?.() || ""}${out.slice(1)}`;
  if (!hasNumber) out += " (add an impact metric: % faster, X users, Y ms, etc.)";
  if (!/\b(using|with)\b/i.test(out)) out += " (add tools/tech: React, Node, SQL, Docker, etc.).";
  return out;
}

export function enhanceOffline({ resumeText, jobDescription }) {
  const bullets = splitBullets(resumeText);
  const rewrites = bullets.slice(0, 12).map(b => ({ original: b, improved: suggestRewrite(b) }));
  const kw = scoreKeywords(resumeText, jobDescription || "");

  const checks = [];
  if (resumeText.length < 800) checks.push("Resume text seems short — add more specifics (scope, metrics, tools).");
  if (resumeText.length > 6500) checks.push("Resume text seems long — consider trimming toward a 1-page target.");
  if (!/\b(git|github)\b/i.test(resumeText)) checks.push("Consider mentioning version control (Git/GitHub) if you used it.");
  if (!/\b(test|jest|unit|integration|e2e)\b/i.test(resumeText)) checks.push("Consider adding testing evidence (unit/integration/e2e) if applicable.");

  return {
    mode: "offline",
    keywordScore: kw.score,
    missingKeywords: kw.missing,
    rewrites,
    atsChecks: checks
  };
}

export async function enhanceWithChatGPT({ resumeText, jobDescription }) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      mode: "offline-fallback",
      note: "OPENAI_API_KEY not set; using offline enhancer.",
      ...enhanceOffline({ resumeText, jobDescription })
    };
  }

  // Intentionally left as a hook:
  // Implement an OpenAI API call here with your key.
  return {
    mode: "chatgpt-hook",
    note: "OPENAI_API_KEY detected. Add your OpenAI call in server/src/resumeEnhancer.js (enhanceWithChatGPT)."
  };
}
