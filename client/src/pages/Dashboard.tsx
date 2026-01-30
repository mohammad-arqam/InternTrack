import React, { useEffect, useMemo, useState } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import { api } from "../lib/api";
import { getUser } from "../lib/auth";

type AppRow = {
  id: number;
  company: string;
  role: string;
  location: string;
  status: "Applied"|"Interview"|"Offer"|"Rejected"|"Ghosted"|"Accepted";
  url: string;
  notes: string;
  applied_date: string;
  updated_at: string;
};

const STATUS: AppRow["status"][] = ["Applied","Interview","Offer","Rejected","Ghosted","Accepted"];

export default function Dashboard() {
  const user = getUser();
  const [rows, setRows] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<AppRow["status"]>("Applied");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [applied_date, setAppliedDate] = useState("");

  async function refresh() {
    setErr("");
    setLoading(true);
    try {
      const data = await api.listApps();
      setRows(data);
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const stats = useMemo(() => {
    const counts = Object.fromEntries(STATUS.map(s => [s, 0])) as Record<string, number>;
    rows.forEach(r => counts[r.status] = (counts[r.status] || 0) + 1);
    return counts;
  }, [rows]);

  async function add() {
    setErr("");
    try {
      const newRow = await api.createApp({ company, role, location, status, url, notes, applied_date });
      setRows([newRow, ...rows]);
      setCompany(""); setRole(""); setLocation(""); setStatus("Applied"); setUrl(""); setNotes(""); setAppliedDate("");
    } catch (e: any) {
      setErr(e?.message || "Failed to create");
    }
  }

  async function update(id: number, patch: Partial<AppRow>) {
    setErr("");
    try {
      const updated = await api.updateApp(id, patch);
      setRows(rows.map(r => r.id === id ? updated : r));
    } catch (e: any) {
      setErr(e?.message || "Failed to update");
    }
  }

  async function del(id: number) {
    setErr("");
    try {
      await api.deleteApp(id);
      setRows(rows.filter(r => r.id !== id));
    } catch (e: any) {
      setErr(e?.message || "Failed to delete");
    }
  }

  return (
    <div className="grid gap-6">
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Applications</h1>
            <p className="text-sm text-slate-600 mt-1">
              Logged in as <span className="font-semibold">{user?.name}</span> · Creator: <span className="font-semibold">Mohammad Arqam</span>
            </p>
          </div>
          <Button variant="ghost" onClick={refresh}>Refresh</Button>
        </div>

        <div className="mt-5 grid sm:grid-cols-3 gap-3">
          {Object.entries(stats).map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-white border border-slate-100 p-4">
              <div className="text-xs text-slate-500">{k}</div>
              <div className="text-2xl font-extrabold text-slate-900">{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-extrabold text-slate-900">Add application</h2>
        <div className="mt-4 grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">Company</label>
            <Input value={company} onChange={(e)=>setCompany(e.target.value)} placeholder="e.g., Shopify" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Role</label>
            <Input value={role} onChange={(e)=>setRole(e.target.value)} placeholder="e.g., Software Engineer Intern" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Location</label>
            <Input value={location} onChange={(e)=>setLocation(e.target.value)} placeholder="Winnipeg / Remote" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Status</label>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
              value={status}
              onChange={(e)=>setStatus(e.target.value as any)}
            >
              {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-600">Job posting URL</label>
            <Input value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-600">Notes</label>
            <Input value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Follow-up date, recruiter name, etc." />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Applied date</label>
            <Input value={applied_date} onChange={(e)=>setAppliedDate(e.target.value)} placeholder="YYYY-MM-DD" />
          </div>
          <div className="flex items-end">
            <Button onClick={add} className="w-full" disabled={!company.trim() || !role.trim()}>
              Add
            </Button>
          </div>
        </div>

        {err && <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-2xl p-3">{err}</div>}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-extrabold text-slate-900">Your applications</h2>
        {loading ? (
          <div className="mt-4 text-slate-600 text-sm">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="mt-4 text-slate-600 text-sm">No applications yet. Add your first one above.</div>
        ) : (
          <div className="mt-4 grid gap-3">
            {rows.map(r => (
              <div key={r.id} className="rounded-2xl bg-white border border-slate-100 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-extrabold text-slate-900">{r.company}</div>
                    <div className="text-sm text-slate-600">{r.role} · {r.location || "—"}</div>
                    <div className="text-xs text-slate-500 mt-1">Updated {new Date(r.updated_at).toLocaleString()}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
                      value={r.status}
                      onChange={(e)=>update(r.id, { status: e.target.value as any })}
                    >
                      {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <Button variant="danger" onClick={()=>del(r.id)}>Delete</Button>
                  </div>
                </div>

                <div className="mt-3 grid md:grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs font-semibold text-slate-600">URL</div>
                    <Input value={r.url || ""} onChange={(e)=>update(r.id, { url: e.target.value })} placeholder="https://..." />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-600">Applied date</div>
                    <Input value={r.applied_date || ""} onChange={(e)=>update(r.id, { applied_date: e.target.value })} placeholder="YYYY-MM-DD" />
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-xs font-semibold text-slate-600">Notes</div>
                    <Input value={r.notes || ""} onChange={(e)=>update(r.id, { notes: e.target.value })} placeholder="Add notes…" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
