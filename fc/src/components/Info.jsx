import PropTypes from 'prop-types';
import { Plus, X } from 'lucide-react';
import { formatUAH } from '../utils/format';

Info.propTypes = {
  sum: PropTypes.number,
  children: PropTypes.node,
  type: PropTypes.oneOf(['income', 'expense']),
  onAddClick: PropTypes.func,
  showForm: PropTypes.bool,
};

export default function Info({ sum, children, type = 'expense', onAddClick, showForm }) {
  const label = type === 'income' ? 'Income' : 'Expenses';
  const amountClass = `info-amount info-amount--${type}`;

  return (
    <div className="info">
      <div className="info-header">
        <p className="info-text">
          {label}: <span className={amountClass}>{formatUAH(sum)}</span>
        </p>
        {onAddClick && (
          <button
            type="button"
            className={`info-add-btn${showForm ? ' info-add-btn--active' : ''}`}
            onClick={onAddClick}
            title={showForm ? 'Cancel' : 'Add transaction'}
          >
            {showForm ? <X size={18} strokeWidth={2.5} /> : <Plus size={18} strokeWidth={2.5} />}
            {showForm ? 'Cancel' : 'Add'}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
