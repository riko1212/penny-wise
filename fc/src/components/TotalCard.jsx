import PropTypes from 'prop-types';
import { formatUAH } from '../utils/format';
import { useLanguage } from '../context/LanguageContext';

TotalCard.propTypes = {
  total: PropTypes.number.isRequired,
  type: PropTypes.oneOf(['income', 'expense']).isRequired,
  monthLabel: PropTypes.string,
};

export default function TotalCard({ total, type, monthLabel }) {
  const { t } = useLanguage();
  const label = type === 'income' ? t('dashboard.totalIncome') : t('dashboard.totalExpenses');
  const amountClass = `total-card__amount total-card__amount--${type}`;

  return (
    <div className="total-card">
      <span className="total-card__label">{label}</span>
      <span className={amountClass}>{formatUAH(total)}</span>
      {monthLabel && <span className="total-card__month">{monthLabel}</span>}
    </div>
  );
}
