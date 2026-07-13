import { getGradeOption } from "./gradeMap";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  register: (email: string, password: string) =>
    request("/auth/register", { method: "POST", body: JSON.stringify({ email, password }) }),

  login: (email: string, password: string) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  childLogin: (username: string, pin: string) =>
    request("/auth/child-login", { method: "POST", body: JSON.stringify({ username, pin }) }),

  getMe: () => request("/auth/me"),

  logout: () => request("/auth/logout", { method: "POST" }),

  getChildren: () => request("/children"),

  createChild: (displayName: string, ageGroup: string, grade?: string, skillLevel?: string) =>
    request("/children", { method: "POST", body: JSON.stringify({ displayName, ageGroup, grade, skillLevel }) }),

  addChild: ({ displayName, grade, skillLevel, pin }: { displayName: string; grade: string; skillLevel?: string; pin?: string }) =>
    request("/children", {
      method: "POST",
      body: JSON.stringify({ displayName, ageGroup: getGradeOption(grade).apiBucket, grade, skillLevel, pin }),
    }),

  updateChildGrade: (id: number, grade: string, skillLevel?: string) =>
    request(`/children/${id}/grade`, { method: "PUT", body: JSON.stringify({ grade, skillLevel }) }),

  deleteChild: (id: number) =>
    request(`/children/${id}`, { method: "DELETE" }),

  syncChildProgress: (progress: { xp?: number; level?: number; streak?: number; bossWins?: number; moolies?: number; lessonsCompleted?: number }) =>
    request("/children/me/progress", { method: "PUT", body: JSON.stringify(progress) }),

  sendContact: (name: string, email: string, message: string, lang: "en" | "es") =>
    request("/contact", { method: "POST", body: JSON.stringify({ name, email, message, lang }) }),

  adminGetParents: () => request("/admin/parents"),

  adminGetChildren: () => request("/admin/children"),

  adminGetMessages: () => request("/admin/messages"),
};
