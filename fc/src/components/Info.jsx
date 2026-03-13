import PropTypes from 'prop-types';

Info.propTypes = {
  sum: PropTypes.number,
  children: PropTypes.node,
  type: PropTypes.oneOf(['income', 'expense']),
};

export default function Info({ sum, children, type = 'expense' }) {
  const label = type === 'income' ? 'Income' : 'Expenses';
  const amountClass = `info-amount info-amount--${type}`;

  return (
    <div className="info">
      <p className="info-text">
        {label}: <span className={amountClass}>{sum} UAH</span>
      </p>
      {children}
    </div>
  );
}
