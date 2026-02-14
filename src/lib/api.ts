// Laravel API client (Sanctum compatible)
// - Public:    POST /api/login, GET /api/videos, GET /api/videos/{video}
// - Protected: POST /api/logout, GET /api/user, POST /api/videos, DELETE /api/videos/{video},
//              POST /api/videos/{video}/view, POST /api/videos/{video}/like, POST /api/videos/{video}/unlike

export type PaginationLink = {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
};

export type PaginatedResponse<T> = {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
};

export type ApiVideo = {
  id: number;
  user_id: number;
  video_url: string; // e.g. "/video/asmongold.mp4"
  caption: string | null;
  duration: number | null;
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
};

export type ApiUser = {
  id: number;
  name?: string;
  email?: string;
  // allow extra keys from backend without breaking
  [key: string]: unknown;
};

type ApiErrorPayload =
  | { message?: string; errors?: Record<string, string[] | string> }
  | { error?: string; message?: string }
  | unknown;

export class ApiError extends Error {
  status: number;
  payload?: ApiErrorPayload;
  constructor(message: string, status: number, payload?: ApiErrorPayload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

const AUTH_TOKEN_KEY = 'camcut.auth_token';

export function getApiBaseUrl(): string {
  const envBase = ((import.meta as unknown as { env?: { VITE_API_BASE_URL?: string } })?.env?.VITE_API_BASE_URL as
    | string
    | undefined)?.trim();

  // If set, use it (e.g. "https://api.camcut.fun" or "https://api.example.com")
  if (envBase) return envBase.replace(/\/+$/, '');

  // Default to same-origin. In dev, Vite proxy will forward /api and /video to Laravel,
  // which avoids browser CORS entirely.
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;

  // Non-browser fallback
  return 'https://api.camcut.fun';
}

export function getMediaBaseUrl(): string {
  const envMedia = ((import.meta as unknown as { env?: { VITE_MEDIA_BASE_URL?: string } })?.env?.VITE_MEDIA_BASE_URL as
    | string
    | undefined)?.trim();
  if (envMedia) return envMedia.replace(/\/+$/, '');

  // If the API base was explicitly set, default media to the same host
  const envApi = ((import.meta as unknown as { env?: { VITE_API_BASE_URL?: string } })?.env?.VITE_API_BASE_URL as
    | string
    | undefined)?.trim();
  if (envApi) return envApi.replace(/\/+$/, '');

  // Otherwise default media to the Laravel host (matches your example)
  return 'https://api.camcut.fun';
}

export function resolveMediaUrl(pathOrUrl: string): string {
  // Accept full URLs or "/video/foo.mp4" style paths
  try {
    return new URL(pathOrUrl).toString();
  } catch {
    return new URL(pathOrUrl.replace(/^\.\//, '/'), `${getMediaBaseUrl()}/`).toString();
  }
}

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  try {
    if (!token) localStorage.removeItem(AUTH_TOKEN_KEY);
    else localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {
    // ignore (private mode, etc.)
  }
}

async function readJsonSafe(res: Response): Promise<unknown> {
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) return await res.json();
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

type ApiFetchOptions = Omit<RequestInit, 'headers' | 'body'> & {
  headers?: Record<string, string>;
  body?: unknown;
};

async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const base = getApiBaseUrl();
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;

  const token = getAuthToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(options.headers ?? {}),
  };

  // If you're using Sanctum with bearer tokens, this enables auth immediately.
  if (token && !headers.Authorization) headers.Authorization = `Bearer ${token}`;

  const init: Omit<RequestInit, 'body'> & { body?: BodyInit | null | undefined | unknown } = {
    ...options,
    headers,
    credentials: 'include', // supports Sanctum cookie-based auth too
  };

  // JSON by default (unless caller passes FormData)
  if (options.body !== undefined) {
    if (options.body instanceof FormData) {
      init.body = options.body;
    } else if (typeof options.body === 'string') {
      init.body = options.body;
      if (!headers['Content-Type']) headers['Content-Type'] = 'text/plain;charset=UTF-8';
    } else {
      init.body = JSON.stringify(options.body);
      if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
    }
  }

  const res = await fetch(url, init as RequestInit);
  if (!res.ok) {
    const payload = await readJsonSafe(res);
    const message =
      (payload && typeof payload === 'object' && 'message' in payload && typeof (payload as unknown as { message: string }).message === 'string'
        ? (payload as unknown as { message: string }).message
        : `Request failed (${res.status})`) as string;
    throw new ApiError(message, res.status, payload);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return (await readJsonSafe(res)) as T;
}

// ---------- Auth ----------

export type LoginInput = { email: string; password: string };
export type LoginResponse = { token?: string; user?: ApiUser; [key: string]: unknown };

export async function login(input: LoginInput): Promise<LoginResponse> {
  // If your backend sets cookies + CSRF, you might also need:
  // await apiFetch('/sanctum/csrf-cookie', { method: 'GET' });
  const resp = await apiFetch<LoginResponse>('/api/login', { method: 'POST', body: input });
  if (resp?.token && typeof resp.token === 'string') setAuthToken(resp.token);
  return resp;
}

export async function logout(): Promise<void> {
  await apiFetch('/api/logout', { method: 'POST' });
  setAuthToken(null);
}

export async function me(): Promise<ApiUser> {
  return await apiFetch<ApiUser>('/api/user', { method: 'GET' });
}

// ---------- Videos ----------

export async function listVideos(page?: number): Promise<PaginatedResponse<ApiVideo>> {
  const qs = page ? `?page=${encodeURIComponent(String(page))}` : '';
  return await apiFetch<PaginatedResponse<ApiVideo>>(`/api/videos${qs}`, { method: 'GET' });
}

export async function getVideo(videoId: number | string): Promise<ApiVideo> {
  return await apiFetch<ApiVideo>(`/api/videos/${encodeURIComponent(String(videoId))}`, { method: 'GET' });
}

export type CreateVideoInput =
  | FormData
  | {
      video_url: string;
      caption?: string | null;
      duration?: number | null;
    };

export async function createVideo(input: CreateVideoInput): Promise<ApiVideo> {
  return await apiFetch<ApiVideo>('/api/videos', { method: 'POST', body: input });
}

export async function deleteVideo(videoId: number | string): Promise<void> {
  await apiFetch(`/api/videos/${encodeURIComponent(String(videoId))}`, { method: 'DELETE' });
}

export async function incrementViews(videoId: number | string): Promise<void> {
  await apiFetch(`/api/videos/${encodeURIComponent(String(videoId))}/view`, { method: 'POST' });
}

export async function likeVideo(videoId: number | string): Promise<void> {
  await apiFetch(`/api/videos/${encodeURIComponent(String(videoId))}/like`, { method: 'POST' });
}

export async function unlikeVideo(videoId: number | string): Promise<void> {
  await apiFetch(`/api/videos/${encodeURIComponent(String(videoId))}/unlike`, { method: 'POST' });
}