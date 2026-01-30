import React, { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

type AppRow = {
  id: number;
  company: string;
  role: string;
  location: string;
  status: "Applied"|"Interview"|"Offer"|"Rejected"|"Ghosted"|"Accepted";
  url: string;
  notes: string;
  applied_date: string;
  created_at: string;
  updated_at: string;
};

const STATUS: AppRow["status"][] = ["Applied","Interview","Offer","Rejected","Ghosted","Accepted"];

function daysBetween(aIso: string, bIso: string) {
  const a = new Date(aIso).getTime();
  const b = new Date(bIso).getTime();
  return Math.max(0, Math.round((b - a) / (1000*60*60*24)));
}

export default function Analytics() {
  const [rows, setRows] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  const stats = useMemo(() => {
    const counts = Object.fromEntries(STATUS.map(s => [s, 0])) as Record<string, number>;
    rows.forEach(r => counts[r.status] = (counts[r.status] || 0) + 1);

    const total = rows.length || 1;
    const percent = Object.fromEntries(STATUS.map(s => [s, Math.round((counts[s] / total) * 100)])) as Record<string, number>;

    const now = new Date().toISOString();
    const last7 = rows.filter(r => daysBetween(r.updated_at, now) <= 7).length;
    const last30 = rows.filter(r => daysBetween(r.updated_at, now) <= 30).length;

    const newest = rows.slice(0, 6);

    return { counts, percent, last7, last30, newest };
  }, [rows]);

  return (
    <div className="grid gap-6">
      <div className="card p-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-600 mt-1">
          Quick insights into your pipeline health and activity.
        </p>

        {err && <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-2xl p-3">{err}</div>}
        {loading ? (
          <div className="mt-4 text-slate-600 text-sm">Loading…</div>
        ) : (
          <>
            <div className="mt-5 grid sm:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white border border-slate-100 p-4">
                <div className="text-xs text-slate-500">Total applications</div>
                <div className="text-2xl font-extrabold text-slate-900">{rows.length}</div>
              </div>
              <div className="rounded-2xl bg-white border border-slate-100 p-4">
                <div className="text-xs text-slate-500">Updated (last 7 days)</div>
                <div className="text-2xl font-extrabold text-slate-900">{stats.last7}</div>
              </div>
              <div className="rounded-2xl bg-white border border-slate-100 p-4">
                <div className="text-xs text-slate-500">Updated (last 30 days)</div>
                <div className="text-2xl font-extrabold text-slate-900">{stats.last30}</div>
              </div>
            </div>

            <div className="mt-6 grid lg:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white border border-slate-100 p-4">
                <div className="font-semibold text-slate-900">Status distribution</div>
                <div className="mt-3 space-y-3">
                  {STATUS.map(s => (
                    <div key={s}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-700">{s}</span>
                        <span className="text-slate-600">{stats.counts[s]} ({stats.percent[s]}%)</span>
                      </div>
                      <div className="mt-1 h-3 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                        <div className="h-full bg-slate-900/80" style={{ width: `${stats.percent[s]}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-slate-100 p-4">
                <div className="font-semibold text-slate-900">Most recent</div>
                <div className="mt-3 grid gap-2">
                  {stats.newest.length === 0 ? (
                    <div className="text-sm text-slate-600">No applications yet.</div>
                  ) : (
                    stats.newest.map(r => (
                      <div key={r.id} className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold text-slate-900">{r.company}</div>
                          <span className="pill">{r.status}</span>
                        </div>
                        <div className="text-sm text-slate-700">{r.role}</div>
                        <div className="text-xs text-slate-500 mt-1">Updated {new Date(r.updated_at).toLocaleString()}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Next improvements</div>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Add “follow-up date” and reminders.</li>
                <li>Import/export CSV to sync with your spreadsheet.</li>
                <li>Auto-detect “ghosted” after X days (configurable).</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
