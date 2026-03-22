const BASE = import.meta.env.VITE_API_URL || '';

export default function apiFetch(url, options) {
  return fetch(`${BASE}${url}`, options);
}
