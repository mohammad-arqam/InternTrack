import React, { useMemo, useState } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import Logo from "../components/Logo";
import { api, setToken } from "../lib/api";
import { setUser } from "../lib/auth";
import { useNavigate } from "react-router-dom";

type Mode = "login" | "signup";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const title = useMemo(() => (mode === "login" ? "Welcome back" : "Create your account"), [mode]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const data =
        mode === "login"
          ? await api.login({ email, password })
          : await api.signup({ name, email, password });

      setToken(data.token);
      setUser(data.user);
      nav("/app");
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="text-xs text-slate-500">Creator: <span className="font-semibold text-slate-700">Mohammad Arqam</span></div>
        </div>

        <div className="mt-8 grid lg:grid-cols-2 gap-6 items-stretch">
          <div className="card p-6">
            <h1 className="text-2xl font-extrabold text-slate-900">{title}</h1>
            <p className="text-slate-600 mt-1 text-sm">
              Track applications, spot patterns, and sharpen your resume.
            </p>

            <form className="mt-6 space-y-3" onSubmit={submit}>
              {mode === "signup" && (
                <div>
                  <label className="text-xs font-semibold text-slate-600">Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mohammad Arqam" />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-600">Email</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.ca" />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Password</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
              </div>

              {err && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-2xl p-3">
                  {err}
                </div>
              )}

              <Button disabled={loading} className="w-full">
                {loading ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
              </Button>

              <button
                type="button"
                className="w-full text-sm text-slate-700 hover:text-slate-900"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
              >
                {mode === "login" ? "New here? Create an account" : "Already have an account? Log in"}
              </button>
            </form>
          </div>

          <div className="rounded-3xl bg-slate-900 text-white shadow-soft p-6 overflow-hidden relative">
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                background:
                  "radial-gradient(40rem 30rem at 20% 20%, rgba(59,130,246,0.70), transparent 50%)," +
                  "radial-gradient(35rem 35rem at 80% 30%, rgba(168,85,247,0.65), transparent 55%)," +
                  "radial-gradient(30rem 30rem at 50% 90%, rgba(16,185,129,0.60), transparent 55%)"
              }}
            />
            <div className="relative">
              <h2 className="text-xl font-extrabold">What you get</h2>
              <p className="text-white/80 text-sm mt-2">
                A clean tracker + analytics + “ChatGPT-style” resume enhancement suggestions.
              </p>

              <div className="mt-6 grid gap-3">
                <Feature title="Pipeline view" desc="Keep every application in one place. Update status fast." />
                <Feature title="Analytics dashboard" desc="See status distribution and your recent activity." />
                <Feature title="Resume Enhancer" desc="Bullet rewrites + ATS checks + missing keyword hints." />
              </div>

              <div className="mt-8 text-xs text-white/70">
                Tip: Paste a job description in Resume Enhancer to see missing keywords.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-xs text-slate-500">
          © {new Date().getFullYear()} InternTrack — built by Mohammad Arqam
        </div>
      </div>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-white/75 mt-1">{desc}</div>
    </div>
  );
}
