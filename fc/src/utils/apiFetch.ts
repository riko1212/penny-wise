const BASE: string = import.meta.env.VITE_API_URL || '';

export default function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  return fetch(`${BASE}${url}`, options);
}
