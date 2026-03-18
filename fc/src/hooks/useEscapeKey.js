import { useEffect } from 'react';

export function useEscapeKey(callback, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e) => { if (e.key === 'Escape') callback(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [callback, enabled]);
}
