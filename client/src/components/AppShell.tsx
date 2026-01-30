import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import Button from "./Button";
import { Icon } from "./Icon";
import { clearToken } from "../lib/api";
import { clearUser, getUser } from "../lib/auth";

const navItems = [
  { to: "/app", label: "Applications", icon: "list" as const },
  { to: "/analytics", label: "Analytics", icon: "chart" as const },
  { to: "/resume", label: "Resume Enhancer", icon: "sparkles" as const },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const user = getUser();
  const loc = useLocation();
  const nav = useNavigate();

  const active = useMemo(() => (to: string) => (loc.pathname === to ? "bg-slate-900 text-white" : "hover:bg-slate-100 text-slate-700"), [loc.pathname]);

  function logout() {
    clearToken();
    clearUser();
    nav("/auth");
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/60 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden rounded-2xl p-2 bg-white border border-slate-200 shadow-soft"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Icon name="menu" className="text-slate-800" />
            </button>
            <Link to="/app" className="hidden sm:block">
              <Logo />
            </Link>
            <Link to="/app" className="sm:hidden">
              <Logo compact />
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            {navItems.map(i => (
              <Link key={i.to} to={i.to} className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${active(i.to)}`}>
                <span className="inline-flex items-center gap-2">
                  <Icon name={i.icon} className={loc.pathname === i.to ? "text-white" : "text-slate-800"} />
                  {i.label}
                </span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{user?.name}</span>
            </div>
            <Button variant="ghost" onClick={logout} className="hidden sm:inline-flex">
              Log out
            </Button>
            <button
              className="sm:hidden rounded-2xl p-2 bg-white border border-slate-200 shadow-soft"
              onClick={logout}
              aria-label="Log out"
            >
              <Icon name="logout" className="text-slate-800" />
            </button>
          </div>
        </div>
      </header>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[86%] max-w-sm bg-white shadow-soft border-r border-slate-100 p-4">
            <div className="flex items-center justify-between">
              <Logo />
              <button className="rounded-2xl p-2 bg-white border border-slate-200" onClick={() => setOpen(false)} aria-label="Close menu">
                <Icon name="x" className="text-slate-800" />
              </button>
            </div>

            <div className="mt-4 grid gap-2">
              {navItems.map(i => (
                <Link
                  key={i.to}
                  to={i.to}
                  onClick={() => setOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold border border-slate-200 ${loc.pathname === i.to ? "bg-slate-900 text-white" : "bg-white text-slate-800"}`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon name={i.icon} className={loc.pathname === i.to ? "text-white" : "text-slate-800"} />
                    {i.label}
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs text-slate-500">Creator</div>
              <div className="text-sm font-semibold text-slate-900">Mohammad Arqam</div>
              <div className="text-xs text-slate-500 mt-1">InternTrack is a portfolio project.</div>
            </div>

            <div className="mt-4">
              <Button variant="ghost" className="w-full" onClick={logout}>Log out</Button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-6 pb-10">
        {children}
      </main>

      <footer className="max-w-6xl mx-auto px-4 pb-10 text-xs text-slate-500">
        <div className="flex items-center justify-between">
          <span>© {new Date().getFullYear()} InternTrack</span>
          <span>Creator: Mohammad Arqam</span>
        </div>
      </footer>
    </div>
  );
}
