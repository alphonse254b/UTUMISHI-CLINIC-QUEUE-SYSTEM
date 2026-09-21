import { getAuthToken } from './authToken';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5250/api';

async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      if (typeof data === 'string') message = data;
      else if (data?.title) message = data.title;
      else if (data?.errors) {
        message = Object.values(data.errors as Record<string, string[]>).flat().join(' ');
      }
    } catch {
      // response body wasn't JSON — keep the generic message
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export interface BootstrapAdminRequest {
  staffName: string;
  departmentId?: number;
  username: string;
  password: string;
}
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthSession {
  token: string;
  staffId: number;
  staffName: string;
  role: string;
  Role?: string;
  departmentId: number;
  departmentName: string;
}

// 💡 NEW: Formally map the explicit object response layout returned by ASP.NET Core
export interface NeedsBootstrapResponse {
  needsBootstrap?: boolean;
  NeedsBootstrap?: boolean;
}

export const authApi = {
  // 💡 FIX: Cast as the explicit payload object to prevent JavaScript evaluation bugs
  needsBootstrap: () => authFetch<NeedsBootstrapResponse>('/Auth/needs-bootstrap'),
  
  bootstrapAdmin: (body: BootstrapAdminRequest) =>
    authFetch<AuthSession>('/Auth/bootstrap-admin', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: LoginRequest) =>
    authFetch<AuthSession>('/Auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => authFetch<AuthSession>('/Auth/me'),
  setCredentials: (staffId: number, username: string, newPassword: string, token?: string) =>
  fetch(`${BASE_URL}/Auth/set-credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ staffId, username, password: newPassword }),
  }).then(async (response) => {
    if (!response.ok) {
      let message = `Request failed (${response.status})`;
      try {
        const data = await response.json();
        if (typeof data === 'string') message = data;
        else if (data?.title) message = data.title;
        else if (data?.errors) {
          message = Object.values(data.errors as Record<string, string[]>).flat().join(' ');
        }
      } catch {
        // not JSON
      }
      throw new Error(message);
    }
    if (response.status === 204) return undefined;
    return response.json();
  }),

  requestPasswordReset: (body: { emailOrUsername: string }) =>
    authFetch<any>('/Auth/request-password-reset', { method: 'POST', body: JSON.stringify(body) }),

  resetPassword: (body: { token: string; newPassword: string }) =>
    authFetch<any>('/Auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),

    }