import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Pencil, Trash2, Check, X, Calendar } from 'lucide-react';
import { validateTransaction } from '../utils/validate';
import { todayStr } from '../constants';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { MAX_DESCRIPTION_LENGTH } from '../constants';

InfoItem.propTypes = {
  onDeleteItemId: PropTypes.func,
  onUpdateItemData: PropTypes.func,
  item: PropTypes.object.isRequired,
};

export default function InfoItem({ onDeleteItemId, item, onUpdateItemData }) {
  const { t, lang } = useLanguage();
  const { fmt, fromUAH, toUAH } = useCurrency();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTopic, setEditedTopic] = useState(item.topic);
  const [editedIncome, setEditedIncome] = useState(() => fromUAH(item.income));
  const [editedDate, setEditedDate] = useState(
    new Date(item.date).toISOString().slice(0, 10)
  );
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setEditedTopic(item.topic);
    setEditedIncome(fromUAH(item.income));
    setEditedDate(new Date(item.date).toISOString().slice(0, 10));
    setErrors({});
  }, [item]);

  function getMsgs() {
    return {
      descriptionRequired: t('validate.descriptionRequired'),
      maxChars: t('validate.maxChars', { max: MAX_DESCRIPTION_LENGTH }),
      amountRequired: t('validate.amountRequired'),
      amountPositive: t('validate.amountPositive'),
      amountMax: t('validate.amountMax'),
      dateRequired: t('validate.dateRequired'),
      dateFuture: t('validate.dateFuture'),
    };
  }

  function isToday(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateFromTimestamp = new Date(date);
    const timestampDate = new Date(
      dateFromTimestamp.getFullYear(),
      dateFromTimestamp.getMonth(),
      dateFromTimestamp.getDate()
    );
    return today.getTime() === timestampDate.getTime();
  }

  function handleFieldChange(field, value) {
    const next = { topic: editedTopic, income: editedIncome, date: editedDate, [field]: value };
    if (field === 'topic') setEditedTopic(value);
    if (field === 'income') setEditedIncome(value);
    if (field === 'date') setEditedDate(value);
    if (Object.keys(errors).length > 0) {
      setErrors(validateTransaction(next.topic, next.income, next.date, getMsgs()));
    }
  }

  async function handleSave() {
    const errs = validateTransaction(editedTopic, editedIncome, editedDate, getMsgs());
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const updatedItem = {
      ...item,
      topic: editedTopic.trim(),
      income: toUAH(parseFloat(editedIncome)),
      date: new Date(editedDate).getTime(),
    };
    try {
      await onUpdateItemData(item.id, updatedItem);
      setIsEditing(false);
      setErrors({});
    } catch {
      // error already shown via showError in the hook; keep edit mode open
    }
  }

  function handleCancel() {
    setEditedTopic(item.topic);
    setEditedIncome(fromUAH(item.income));
    setEditedDate(new Date(item.date).toISOString().slice(0, 10));
    setErrors({});
    setIsEditing(false);
  }

  const dateLocale = lang === 'uk' ? 'uk-UA' : 'en-GB';

  return (
    <li className="info-item">
      <div className="info-item-wrap">
        {isEditing ? (
          <div className="info-item-edit-fields">
            <div className="info-item-edit-field">
              <input
                type="text"
                value={editedTopic}
                onChange={(e) => handleFieldChange('topic', e.target.value)}
                className={`form-input form-input-edit${errors.topic ? ' form-input--error' : ''}`}
                maxLength={110}
              />
              {errors.topic && <span className="form-error">{errors.topic}</span>}
            </div>
            <div className="info-item-edit-field">
              <input
                type="number"
                value={editedIncome}
                min="0.01"
                step="0.01"
                onChange={(e) => handleFieldChange('income', e.target.value)}
                className={`form-input form-input-edit${errors.income ? ' form-input--error' : ''}`}
              />
              {errors.income && <span className="form-error">{errors.income}</span>}
            </div>
            <div className="info-item-edit-field">
              <div className="date-input-wrap">
                <Calendar size={15} className="date-input-icon" />
                <input
                  type="date"
                  value={editedDate}
                  max={todayStr()}
                  onChange={(e) => handleFieldChange('date', e.target.value)}
                  className={`form-input form-input-edit${errors.date ? ' form-input--error' : ''}`}
                />
              </div>
              {errors.date && <span className="form-error">{errors.date}</span>}
            </div>
          </div>
        ) : (
          <>
            <p className="info-item-text">{item.topic}:</p>
            <p className="info-item-count">{fmt(item.income)}</p>
            <p className="info-item-data">
              <Calendar size={13} style={{ opacity: 0.5, verticalAlign: 'middle', marginRight: 4 }} />
              {isToday(item.date)
                ? t('common.today')
                : new Date(item.date).toLocaleDateString(dateLocale)}
            </p>
          </>
        )}
      </div>
      <div className="info-icons">
        {isEditing ? (
          <>
            <button
              type="button"
              className="info-icon-btn info-icon-btn--save"
              onClick={handleSave}
              title="Save"
            >
              <Check size={16} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              className="info-icon-btn info-icon-btn--cancel"
              onClick={handleCancel}
              title="Cancel"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </>
        ) : (
          <button
            type="button"
            className="info-icon-btn info-icon-btn--edit"
            onClick={() => setIsEditing(true)}
            title="Edit"
          >
            <Pencil size={15} strokeWidth={2} />
          </button>
        )}
        <button
          type="button"
          className="info-icon-btn info-icon-btn--delete"
          onClick={() => onDeleteItemId(item.id)}
          title="Delete"
        >
          <Trash2 size={15} strokeWidth={2} />
        </button>
      </div>
    </li>
  );
}
