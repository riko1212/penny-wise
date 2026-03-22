import PropTypes from 'prop-types';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';

TotalCard.propTypes = {
  total: PropTypes.number.isRequired,
  type: PropTypes.oneOf(['income', 'expense']).isRequired,
  monthLabel: PropTypes.string,
};

export default function TotalCard({ total, type, monthLabel }) {
  const { t } = useLanguage();
  const { fmt } = useCurrency();
  const label = type === 'income' ? t('dashboard.totalIncome') : t('dashboard.totalExpenses');
  const amountClass = `total-card__amount total-card__amount--${type}`;

  return (
    <div className="total-card">
      <span className="total-card__label">{label}</span>
      <span className={amountClass}>{fmt(total)}</span>
      {monthLabel && <span className="total-card__month">{monthLabel}</span>}
    </div>
  );
}
