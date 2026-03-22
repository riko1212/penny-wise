import PropTypes from 'prop-types';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';

TotalCard.propTypes = {
  total: PropTypes.number.isRequired,
  type: PropTypes.oneOf(['income', 'expense']).isRequired,
  monthLabel: PropTypes.string,
  categorySum: PropTypes.number,
  categoryName: PropTypes.string,
};

export default function TotalCard({ total, type, monthLabel, categorySum, categoryName }) {
  const { t, tc } = useLanguage();
  const { fmt } = useCurrency();
  const label = type === 'income' ? t('dashboard.totalIncome') : t('dashboard.totalExpenses');
  const amountClass = `total-card__amount total-card__amount--${type}`;
  const hasCategory = categoryName != null && categorySum != null;

  return (
    <div className={`total-card${hasCategory ? ' total-card--split' : ''}`}>
      <div className="total-card__section">
        <span className="total-card__label">{label}</span>
        <span className={amountClass}>{fmt(total)}</span>
        {monthLabel && <span className="total-card__month">{monthLabel}</span>}
      </div>
      {hasCategory && (
        <>
          <div className="total-card__divider" />
          <div className="total-card__section">
            <span className="total-card__label">{tc(categoryName)}</span>
            <span className={amountClass}>{fmt(categorySum)}</span>
            {monthLabel && <span className="total-card__month">{monthLabel}</span>}
          </div>
        </>
      )}
    </div>
  );
}
