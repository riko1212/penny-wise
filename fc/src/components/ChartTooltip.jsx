import { formatUAH } from '../utils/format';

/**
 * Custom Recharts tooltip that uses CSS theme variables.
 * Pass as: <Tooltip content={<ChartTooltip />} />
 * or:      <Tooltip content={<ChartTooltip label="Income" />} />
 */
export default function ChartTooltip({ active, payload, label, valueLabel }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="chart-tooltip">
      {label && <p className="chart-tooltip__label">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="chart-tooltip__row">
          <span
            className="chart-tooltip__dot"
            style={{ background: entry.color ?? entry.fill }}
          />
          <span className="chart-tooltip__name">
            {valueLabel ?? entry.name}:
          </span>
          <span className="chart-tooltip__value">
            {formatUAH(Number(entry.value))}
          </span>
        </p>
      ))}
    </div>
  );
}
