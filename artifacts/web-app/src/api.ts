const API_BASE = import.meta.env.VITE_API_URL || "/api-server/api";

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

  createChild: (displayName: string, ageGroup: string) =>
    request("/children", { method: "POST", body: JSON.stringify({ displayName, ageGroup }) }),

  deleteChild: (id: number) =>
    request(`/children/${id}`, { method: "DELETE" }),
};
