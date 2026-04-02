import { getApiBaseUrl } from '../config/env';

export async function apiFetch(
  path: string,
  init: RequestInit & { accessToken?: string } = {},
): Promise<Response> {
  const base = getApiBaseUrl();
  const url  = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (init.accessToken) h.Authorization = `Bearer ${init.accessToken}`;
  const { accessToken: _a, ...rest } = init;
  return fetch(url, { ...rest, headers: h });
}

export async function readJson<T>(res: Response): Promise<T | null> {
  const t = await res.text();
  if (!t) return null;
  try { return JSON.parse(t) as T; }
  catch { return null; }
}
