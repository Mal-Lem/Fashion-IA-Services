"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) localStorage.setItem("access_token", token);
    else localStorage.removeItem("access_token");
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window !== "undefined") return localStorage.getItem("access_token");
  return null;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 401) {
  if (endpoint === '/auth/login') {
    const errorData = await res.json().catch(() => null);
    const message = errorData?.message || "Email ou mot de passe incorrect";
    throw new Error(typeof message === 'object' ? message.message : message);
  }
  
  try {
    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, { method: "POST", credentials: "include" });
    if (refreshRes.ok) {
      const data = await refreshRes.json();
      setAccessToken(data.access_token);
      return request<T>(endpoint, options);
    }
  } catch { setAccessToken(null); }
  throw new Error("UNAUTHORIZED");
}
  if (!res.ok) {
  const error = await res.json().catch(() => ({ message: "Une erreur est survenue" }));
  const message = typeof error.message === 'object' 
    ? error.message.message 
    : error.message;
  throw new Error(message || "Une erreur est survenue");
}
  if (res.status === 204) return {} as T;
  return res.json();
}

export const authApi = {
  register: (data: { firstName: string; lastName: string; email: string; password: string; role?: string }) =>
    request<{ access_token: string; user: any }>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (email: string, password: string, rememberMe = false) =>
    request<{ access_token: string; user: any }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password, rememberMe }) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request<any>("/auth/me"),
  forgotPassword: (email: string) => request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
};

export const designsApi = {
  generate: (data: any) => request<{ designId: string; images: string[]; prompt: string }>("/designs/generate", { method: "POST", body: JSON.stringify(data) }),
  getAll: (page = 1, limit = 20) => request<{ data: any[]; total: number; page: number; totalPages: number }>(`/designs?page=${page}&limit=${limit}`),
  getOne: (id: string) => request<any>(`/designs/${id}`),
  update: (id: string, data: any) => request<any>(`/designs/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  select: (id: string, selectedImageUrl: string) => request<any>(`/designs/${id}/select`, { method: "POST", body: JSON.stringify({ selectedImageUrl }) }),
  remove: (id: string) => request(`/designs/${id}`, { method: "DELETE" }),
};

export const couturieresApi = {
  search: (params?: any) => { const qs = new URLSearchParams(params || {}).toString(); return request<{ data: any[]; total: number }>(`/couturieres${qs ? `?${qs}` : ""}`); },
  getOne: (id: string) => request<any>(`/couturieres/${id}`),
  getMyProfile: () => request<any>("/couturieres/me"),
  createProfile: (data: any) => request<any>("/couturieres", { method: "POST", body: JSON.stringify(data) }),
  updateProfile: (data: any) => request<any>("/couturieres/me", { method: "PUT", body: JSON.stringify(data) }),
};

export const ordersApi = {
  create: (data: any) => request<any>("/orders", { method: "POST", body: JSON.stringify(data) }),
  getAll: (page = 1) => request<{ data: any[]; total: number }>(`/orders?page=${page}`),
  getOne: (id: string) => request<any>(`/orders/${id}`),
  updateStatus: (id: string, data: any) => request<any>(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify(data) }),
};

export const messagesApi = {
  getConversations: () => request<any[]>("/messages"),
  getMessages: (orderId: string, limit = 50) => request<any[]>(`/messages/${orderId}?limit=${limit}`),
  sendMessage: (orderId: string, content: string) => request<any>(`/messages/${orderId}`, { method: "POST", body: JSON.stringify({ content }) }),
};

export const usersApi = {
  getMe: () => request<any>("/users/me"),
  updateMorphology: (gender: string, morphology: any) => request<any>("/users/me/morphology", { method: "PATCH", body: JSON.stringify({ gender, morphology }) }),
  updatePreferences: (preferences: any) => request<any>("/users/me/preferences", { method: "PATCH", body: JSON.stringify(preferences) }),
};
