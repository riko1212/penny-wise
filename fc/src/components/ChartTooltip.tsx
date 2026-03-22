import { useCurrency } from '../context/CurrencyContext';

interface PayloadEntry {
  name?: string;
  value?: number | string;
  color?: string;
  fill?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: PayloadEntry[];
  label?: string;
  valueLabel?: string;
}

/**
 * Custom Recharts tooltip that uses CSS theme variables.
 * Pass as: <Tooltip content={<ChartTooltip />} />
 * or:      <Tooltip content={<ChartTooltip label="Income" />} />
 */
export default function ChartTooltip({ active, payload, label, valueLabel }: ChartTooltipProps) {
  const { fmt } = useCurrency();
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
            {fmt(Number(entry.value))}
          </span>
        </p>
      ))}
    </div>
  );
}
