const API_BASE = "http://localhost:4000";

export type User = { id: number; name: string; email: string };

export function getToken() {
  return localStorage.getItem("interntrack_token") || "";
}
export function setToken(token: string) {
  localStorage.setItem("interntrack_token", token);
}
export function clearToken() {
  localStorage.removeItem("interntrack_token");
}

async function request(path: string, opts: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ? JSON.stringify(data.error) : "Request failed");
  return data;
}

export const api = {
  signup: (payload: { name: string; email: string; password: string }) =>
    request("/api/auth/signup", { method: "POST", body: JSON.stringify(payload) }),

  login: (payload: { email: string; password: string }) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),

  listApps: () => request("/api/apps"),
  createApp: (payload: any) => request("/api/apps", { method: "POST", body: JSON.stringify(payload) }),
  updateApp: (id: number, payload: any) => request(`/api/apps/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteApp: (id: number) => request(`/api/apps/${id}`, { method: "DELETE" }),

  enhanceResume: (payload: { resumeText: string; jobDescription?: string }) =>
    request("/api/resume/enhance", { method: "POST", body: JSON.stringify(payload) }),

  enhanceResumeAI: (payload: { resumeText: string; jobDescription: string }) =>
    request("/api/resume/agent", { method: "POST", body: JSON.stringify(payload) }),

  enhanceResumePdf: async (file: File, jobDescription?: string) => {
    const token = getToken();
    const form = new FormData();
    form.append("file", file);
    if (jobDescription) form.append("jobDescription", jobDescription);

    const res = await fetch(`${API_BASE}/api/resume/enhance-pdf`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error ? JSON.stringify(data.error) : "Request failed");
    return data;
  },
};
