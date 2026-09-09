import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

export const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      onUnauthorized?.();
    }

    const data = error?.response?.data;
    let message = error.message || "Request failed";

    if (typeof data === "string" && data.trim()) {
      message = data;
    } else if (data?.title) {
      message = data.title;
    } else if (data?.errors) {
      message = Object.values(data.errors as Record<string, string[]>)
        .flat()
        .join(" ");
    }

    return Promise.reject(new Error(message));
  }
);

export const crud = {
  list: <T>(path: string) => apiClient.get<T[]>(path).then((r) => r.data),
  get: <T>(path: string, id: number | string) =>
    apiClient.get<T>(`${path}/${id}`).then((r) => r.data),
  create: <T>(path: string, body: unknown) =>
    apiClient.post<T>(path, body).then((r) => r.data),
  update: (path: string, id: number | string, body: unknown) =>
    apiClient.put(`${path}/${id}`, body).then((r) => r.data),
  remove: (path: string, id: number | string) =>
    apiClient.delete(`${path}/${id}`).then((r) => r.data),
};

export const authApi = {
  login: <T>(body: { username: string; password: string }) =>
    apiClient.post<T>("/Auth/login", body).then((r) => r.data),
  me: <T>() => apiClient.get<T>("/Auth/me").then((r) => r.data),
  setCredentials: (body: { staffId: number; username: string; newPassword: string }) =>
    apiClient
      .post(`/Auth/staff/${body.staffId}/credentials`, {
        username: body.username,
        newPassword: body.newPassword,
      })
      .then((r) => r.data),
};