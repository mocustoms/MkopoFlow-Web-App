import type { AuthResponse } from "@mkopoflow/shared";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

type ApiError = { error: string; details?: unknown };

export async function apiPost<T>(
  path: string,
  body: unknown,
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as T & ApiError;
  if (!res.ok) {
    throw new Error(data.error ?? "Request failed");
  }
  return data as T;
}

export function authPost(path: string, body: unknown): Promise<AuthResponse> {
  return apiPost<AuthResponse>(path, body);
}

export function authPostWithToken(
  path: string,
  body: unknown,
  token: string,
): Promise<AuthResponse> {
  return apiPost<AuthResponse>(path, body, token);
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiRequest<T>(
  method: HttpMethod,
  path: string,
  token: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = (await res.json().catch(() => ({}))) as T & ApiError;
  if (!res.ok) {
    throw new Error(data.error ?? "Request failed");
  }
  return data as T;
}

export function apiGet<T>(path: string, token: string): Promise<T> {
  return apiRequest<T>("GET", path, token);
}

export function apiPut<T>(path: string, token: string, body: unknown): Promise<T> {
  return apiRequest<T>("PUT", path, token, body);
}

export function apiPostAuth<T>(path: string, token: string, body: unknown): Promise<T> {
  return apiRequest<T>("POST", path, token, body);
}

export function apiDelete(path: string, token: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>("DELETE", path, token);
}
