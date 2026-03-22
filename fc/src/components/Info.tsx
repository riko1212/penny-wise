import type { ReactNode } from 'react';
import { Plus, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';

interface InfoProps {
  sum: number;
  type?: 'income' | 'expense';
  onAddClick?: () => void;
  showForm?: boolean;
  children: ReactNode;
}

export default function Info({ sum, children, type = 'expense', onAddClick, showForm }: InfoProps) {
  const { t } = useLanguage();
  const { fmt } = useCurrency();
  const label = type === 'income' ? t('info.income') : t('info.expenses');
  const amountClass = `info-amount info-amount--${type}`;

  return (
    <div className="info">
      <div className="info-header">
        <p className="info-text">
          {label}: <span className={amountClass}>{fmt(sum)}</span>
        </p>
        {onAddClick && (
          <button
            type="button"
            className={`info-add-btn${showForm ? ' info-add-btn--active' : ''}`}
            onClick={onAddClick}
            title={showForm ? t('info.cancel') : t('info.add')}
          >
            {showForm ? <X size={18} strokeWidth={2.5} /> : <Plus size={18} strokeWidth={2.5} />}
            {showForm ? t('info.cancel') : t('info.add')}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
