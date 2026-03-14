/**
 * Formats a number as UAH currency with space thousands separator.
 * Example: 1234567.5 → "1 234 567.50 UAH"
 */
export function formatUAH(amount) {
  return (
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(amount)
      .replace(/,/g, '\u00a0') + // non-breaking space as thousands separator
    ' UAH'
  );
}
