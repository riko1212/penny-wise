const BASE: string = import.meta.env.VITE_API_URL || '';
const TIMEOUT_MS = 30_000;

export default function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  return fetch(`${BASE}${url}`, { signal: controller.signal, ...options })
    .finally(() => clearTimeout(timer));
}
