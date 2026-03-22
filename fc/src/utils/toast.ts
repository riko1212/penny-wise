export type ToastType = 'success' | 'error' | 'info';

/**
 * Show a toast notification anywhere in the app.
 */
export function showToast(type: ToastType, message: string, duration = 4000): void {
  window.dispatchEvent(
    new CustomEvent('app:toast', { detail: { type, message, duration } })
  );
}
