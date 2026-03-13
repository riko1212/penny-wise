import PropTypes from 'prop-types';

TotalCard.propTypes = {
  total: PropTypes.number.isRequired,
  type: PropTypes.oneOf(['income', 'expense']).isRequired,
};

export default function TotalCard({ total, type }) {
  const label = type === 'income' ? 'Total Income' : 'Total Expenses';
  const amountClass = `total-card__amount total-card__amount--${type}`;

  return (
    <div className="total-card">
      <span className="total-card__label">{label}</span>
      <span className={amountClass}>{total.toFixed(2)} UAH</span>
    </div>
  );
}
