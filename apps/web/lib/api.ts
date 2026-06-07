"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";

let accessToken: string | null = null;
let onAuthError: (() => void) | null = null;

export function setOnAuthError(cb: (() => void) | null) {
  onAuthError = cb;
}

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

function translateError(message: string): string {
  const translations: Record<string, string> = {
    "Email already exists": "Cet email est déjà utilisé",
    "Invalid credentials": "Email ou mot de passe incorrect",
    "EMAIL_ALREADY_EXISTS": "Cet email est déjà associé à un compte",
    "INVALID_CREDENTIALS": "Email ou mot de passe incorrect",
    "QUOTA_EXCEEDED": "Quota mensuel atteint",
    "UNAUTHORIZED": "Session expirée, veuillez vous reconnecter",
    "Forbidden": "Accès refusé",
    "Not Found": "Ressource introuvable",
    "Bad Request": "Requête invalide",
    "email must be an email": "Format d'email invalide",
    "password must be longer than or equal to 8 characters": "Le mot de passe doit contenir au moins 8 caractères",
    "passwords must match": "Les mots de passe ne correspondent pas",
  };
  return translations[message] || message;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      credentials: "include",
      headers,
    });
  } catch {
    throw new Error("Impossible de contacter le serveur. Vérifiez votre connexion.");
  }

  if (res.status === 401) {
    const isAuthEndpoint = endpoint.startsWith("/auth/");

    if (isAuthEndpoint) {
      let message = "Email ou mot de passe incorrect";
      try { const error = await res.json(); message = error.message?.error || error.message || message; } catch {}
      throw new Error(translateError(message));
    }

    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setAccessToken(data.access_token);
        return request<T>(endpoint, options);
      }
    } catch {}

    setAccessToken(null);
    if (onAuthError) onAuthError();
    throw new Error("Session expirée, veuillez vous reconnecter");
  }

  // Erreur serveur (500)
  if (res.status >= 500) {
    throw new Error("Erreur serveur. Réessayez plus tard.");
  }

  // Autres erreurs (4xx)
  if (!res.ok) {
    let message = "Une erreur est survenue";
    try {
      const error = await res.json();
      message = typeof error.message === "object"
        ? error.message.message || error.message.error
        : error.message || error.error || message;
    } catch {}
    throw new Error(translateError(message));
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

// ── Auth ──────────────────────────────────────
export const authApi = {
  register: (data: { firstName: string; lastName: string; email: string; password: string; role?: string }) =>
    request<{ access_token: string; user: any }>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (email: string, password: string, rememberMe = false) =>
    request<{ access_token: string; user: any }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password, rememberMe }) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request<any>("/auth/me"),
  forgotPassword: (email: string) => request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
};

// ── Designs ───────────────────────────────────
export const designsApi = {
  generate: (data: any) => request<{ designId: string; images: string[]; prompt: string }>("/designs/generate", { method: "POST", body: JSON.stringify(data) }),
  getAll: (page = 1, limit = 20) => request<{ data: any[]; total: number; page: number; totalPages: number }>(`/designs?page=${page}&limit=${limit}`),
  getOne: (id: string) => request<any>(`/designs/${id}`),
  update: (id: string, data: any) => request<any>(`/designs/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  select: (id: string, selectedImageUrl: string) => request<any>(`/designs/${id}/select`, { method: "POST", body: JSON.stringify({ selectedImageUrl }) }),
  remove: (id: string) => request(`/designs/${id}`, { method: "DELETE" }),
};

// ── Couturières ───────────────────────────────
export const couturieresApi = {
  search: (params?: any) => {
    const qs = new URLSearchParams(params || {}).toString();
    return request<{ data: any[]; total: number }>(`/couturieres${qs ? `?${qs}` : ""}`);
  },
  getOne: (id: string) => request<any>(`/couturieres/${id}`),
  getMyProfile: () => request<any>("/couturieres/me"),
  createProfile: (data: any) => request<any>("/couturieres", { method: "POST", body: JSON.stringify(data) }),
  updateProfile: (data: any) => request<any>("/couturieres/me", { method: "PUT", body: JSON.stringify(data) }),
};

// ── Orders ────────────────────────────────────
export const ordersApi = {
  create: (data: any) => request<any>("/orders", { method: "POST", body: JSON.stringify(data) }),
  getAll: (page = 1) => request<{ data: any[]; total: number }>(`/orders?page=${page}`),
  getOne: (id: string) => request<any>(`/orders/${id}`),
  updateStatus: (id: string, data: any) => request<any>(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify(data) }),
};

// ── Messages ──────────────────────────────────
export const messagesApi = {
  getConversations: () => request<any[]>("/messages"),
  getMessages: (orderId: string, limit = 50) => request<any[]>(`/messages/${orderId}?limit=${limit}`),
  sendMessage: (orderId: string, content: string) => request<any>(`/messages/${orderId}`, { method: "POST", body: JSON.stringify({ content }) }),
};

// ── Users ─────────────────────────────────────
export const usersApi = {
  getMe: () => request<any>("/users/me"),
  updateMorphology: (gender: string, morphology: any) => request<any>("/users/me/morphology", { method: "PATCH", body: JSON.stringify({ gender, morphology }) }),
  updatePreferences: (preferences: any) => request<any>("/users/me/preferences", { method: "PATCH", body: JSON.stringify(preferences) }),
};
