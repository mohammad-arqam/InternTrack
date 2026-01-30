import type { User } from "./api";

export function getUser(): User | null {
  const raw = localStorage.getItem("interntrack_user");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function setUser(user: User) {
  localStorage.setItem("interntrack_user", JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem("interntrack_user");
}
