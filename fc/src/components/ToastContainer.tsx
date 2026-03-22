import { useState, useEffect, useCallback } from 'react';
import type { ToastType } from '../utils/toast';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastEventDetail {
  type: ToastType;
  message: string;
  duration?: number;
}

let nextId = 0;

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    function onToast(e: Event) {
      const { type, message, duration = 4000 } = (e as CustomEvent<ToastEventDetail>).detail;
      const id = ++nextId;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => remove(id), duration);
    }
    window.addEventListener('app:toast', onToast);
    return () => window.removeEventListener('app:toast', onToast);
  }, [remove]);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`}>
          <span className="toast__icon">
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
          </span>
          <span className="toast__message">{t.message}</span>
          <button className="toast__close" onClick={() => remove(t.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
