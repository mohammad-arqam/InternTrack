import React, { useMemo, useRef, useState } from "react";
import Button from "../components/Button";
import Textarea from "../components/Textarea";
import { api } from "../lib/api";

type Result = {
  mode: string;
  keywordScore?: number;
  missingKeywords?: string[];
  atsChecks?: string[];
  rewrites?: { original: string; improved: string }[];
  note?: string;
  extractedChars?: number;
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export default function ResumeEnhancer() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [useAIAgent, setUseAIAgent] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  const [result, setResult] = useState<Result | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInput = useRef<HTMLInputElement | null>(null);

  const score = clamp(result?.keywordScore ?? 0, 0, 100);
  const scoreStyle = useMemo(() => {
    // conic gradient ring
    return {
      background: `conic-gradient(rgba(15,23,42,0.90) ${score * 3.6}deg, rgba(148,163,184,0.35) 0deg)`,
    } as React.CSSProperties;
  }, [score]);

  async function run() {
    setErr("");
    setLoading(true);
    setResult(null);

    try {
      // If a PDF is provided, use the PDF endpoint; otherwise use text endpoint.
      const data = file
        ? await api.enhanceResumePdf(file, jobDescription)
        : await api.enhanceResume({ resumeText, jobDescription });

      setResult(data);
    } catch (e: any) {
      setErr(e?.message || "Failed to enhance");
    } finally {
      setLoading(false);
    }
  }

  const canRun = (file && file.type === "application/pdf") || !!resumeText.trim();

  return (
    <div className="grid gap-6">
      <div className="card p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Resume Enhancer</h1>
            <p className="text-sm text-slate-600 mt-1">
              Upload a PDF or paste text. Get ATS checks, bullet rewrites, and keyword matching.
            </p>
          </div>
          <div className="text-xs text-slate-500">
            Creator: <span className="font-semibold text-slate-700">Mohammad Arqam</span>
          </div>
        </div>

        {/* Upload card */}
        <div className="mt-6 grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div
              className="rounded-3xl border border-slate-200 bg-white/70 p-4 transition hover:bg-white"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) setFile(f);
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900">Upload your resume (PDF)</div>
                  <div className="text-sm text-slate-600 mt-1">
                    Drag & drop or choose a file. (Tip: text-based PDFs work best.)
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => fileInput.current?.click()}
                >
                  Choose PDF
                </Button>
              </div>

              <input
                ref={fileInput}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setFile(f);
                }}
              />

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {file ? (
                  <>
                    <span className="pill">Selected: {file.name}</span>
                    <span className="pill">{Math.round(file.size / 1024)} KB</span>
                    <button
                      className="text-xs text-slate-700 underline hover:text-slate-900"
                      onClick={() => setFile(null)}
                      type="button"
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-slate-500">No PDF selected (paste text below instead).</span>
                )}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs font-semibold text-slate-600 mb-2">Or paste your resume text</div>
              <Textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder={
                  "Paste bullets/sections here…\n\nExample:\n- Built a P2P file-sharing system using TCP sockets..."
                }
              />
              <div className="mt-2 text-xs text-slate-500">
                If you upload a PDF, InternTrack uses the PDF and ignores the pasted text.
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-3xl border border-slate-200 bg-white/70 p-4">
              <div className="text-xs font-semibold text-slate-600 mb-2">Optional: Job description</div>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder={"Paste the job description here to enable ATS keyword matching."}
              />

              <div className="mt-3 flex items-center gap-2">
                <Button onClick={run} disabled={loading || !canRun} className="w-full">
                  {loading ? "Analyzing…" : "Enhance"}
                </Button>
              </div>

              <div className="mt-3 text-xs text-slate-500">
                You’ll get an <span className="font-semibold">ATS keyword score</span>, missing keywords, and rewrite ideas.
              </div>
            </div>

            {result && (
              <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500">ATS keyword score</div>
                    <div className="text-2xl font-extrabold text-slate-900">{score}%</div>
                    {typeof result.extractedChars === "number" && (
                      <div className="text-xs text-slate-500 mt-1">PDF extracted: {result.extractedChars} chars</div>
                    )}
                  </div>

                  <div className="relative h-16 w-16 rounded-full p-[6px]" style={scoreStyle}>
                    <div className="h-full w-full rounded-full bg-white flex items-center justify-center">
                      <span className="text-sm font-extrabold text-slate-900">{score}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-500">
                  Mode: <span className="font-semibold text-slate-700">{result.mode}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {err && (
          <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-2xl p-3">
            {err}
          </div>
        )}
      </div>

      {result && (
        <div className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold text-slate-900">Results</h2>
            {result.note && <div className="text-xs text-slate-500">{result.note}</div>}
          </div>

          <div className="mt-5 grid md:grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white border border-slate-100 p-4">
              <div className="text-xs text-slate-500">Missing keywords (top)</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(result.missingKeywords || []).slice(0, 22).map((k) => (
                  <span key={k} className="pill">{k}</span>
                ))}
                {(result.missingKeywords || []).length === 0 && (
                  <span className="text-sm text-slate-600">No job description provided.</span>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-100 p-4 md:col-span-2">
              <div className="font-semibold text-slate-900">ATS checks</div>
              <ul className="mt-2 text-sm text-slate-700 list-disc pl-5 space-y-1">
                {(result.atsChecks || []).map((x, i) => <li key={i}>{x}</li>)}
                {(result.atsChecks || []).length === 0 && <li>No major issues detected.</li>}
              </ul>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-white border border-slate-100 p-4">
            <div className="font-semibold text-slate-900">Bullet rewrites</div>
            <div className="mt-3 grid lg:grid-cols-2 gap-3">
              {(result.rewrites || []).slice(0, 10).map((r, i) => (
                <div key={i} className="rounded-2xl bg-slate-50 border border-slate-100 p-3 hover:bg-white transition">
                  <div className="text-xs text-slate-500">Original</div>
                  <div className="text-sm text-slate-800">{r.original}</div>
                  <div className="text-xs text-slate-500 mt-2">Improved</div>
                  <div className="text-sm text-slate-900 font-semibold">{r.improved}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 text-xs text-slate-500">
            To use the real AI agent, add your key in <code className="px-1 py-0.5 bg-slate-100 rounded">server/.env</code> (see <code className="px-1 py-0.5 bg-slate-100 rounded">server/.env.example</code>).
          </div>
        </div>
      )}
    </div>
  );
}
