import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';

interface TotalCardProps {
  total: number;
  type: 'income' | 'expense';
  monthLabel?: string;
  categorySum?: number;
  categoryName?: string | null;
}

export default function TotalCard({ total, type, monthLabel, categorySum, categoryName }: TotalCardProps) {
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
