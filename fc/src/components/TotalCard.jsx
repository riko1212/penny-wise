import PropTypes from 'prop-types';
import { formatUAH } from '../utils/format';

TotalCard.propTypes = {
  total: PropTypes.number.isRequired,
  type: PropTypes.oneOf(['income', 'expense']).isRequired,
  monthLabel: PropTypes.string,
};

export default function TotalCard({ total, type, monthLabel }) {
  const label = type === 'income' ? 'Total Income' : 'Total Expenses';
  const amountClass = `total-card__amount total-card__amount--${type}`;

  return (
    <div className="total-card">
      <span className="total-card__label">{label}</span>
      <span className={amountClass}>{formatUAH(total)}</span>
      {monthLabel && <span className="total-card__month">{monthLabel}</span>}
    </div>
  );
}
