/**
 * Show a toast notification anywhere in the app.
 * @param {'success'|'error'|'info'} type
 * @param {string} message
 * @param {number} [duration=4000]
 */
export function showToast(type, message, duration = 4000) {
  window.dispatchEvent(
    new CustomEvent('app:toast', { detail: { type, message, duration } })
  );
}
