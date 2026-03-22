import { useState } from 'react';
import { validateTransaction, ValidationErrors } from '../utils/validate';
import { todayStr } from '../constants';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { MAX_DESCRIPTION_LENGTH } from '../constants';

interface FormProps {
  onAddItems: (item: { income: number; topic: string; date: number; categoryName: string }) => void;
  selectedCategory: string;
}

export default function Form({ onAddItems, selectedCategory }: FormProps) {
  const { t } = useLanguage();
  const { toUAH, CURRENCY_SYMBOLS, currency } = useCurrency();
  const [income, setIncome] = useState('');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState<string>(todayStr);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitted, setSubmitted] = useState(false);

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

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);

    const errs = validateTransaction(topic, income, date, getMsgs());
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    onAddItems({
      income: toUAH(parseFloat(income)),
      topic: topic.trim(),
      date: new Date(date).getTime(),
      categoryName: selectedCategory,
    });

    setIncome('');
    setTopic('');
    setDate(todayStr());
    setErrors({});
    setSubmitted(false);
  }

  function handleChange(field: string, value: string, setter: (v: string) => void): void {
    setter(value);
    if (submitted) {
      const next: Record<string, string> = { topic, income, date, [field]: value };
      const errs = validateTransaction(next.topic, next.income, next.date, getMsgs());
      setErrors(errs);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="input-wrap">
        <input
          type="text"
          name="user-text"
          className={`form-input${errors.topic ? ' form-input--error' : ''}`}
          placeholder={t('form.description')}
          value={topic}
          onChange={(e) => handleChange('topic', e.target.value, setTopic)}
          maxLength={110}
        />
        {errors.topic && <span className="form-error">{errors.topic}</span>}

        <input
          type="number"
          name="user-sum"
          className={`form-input${errors.income ? ' form-input--error' : ''}`}
          placeholder={`${CURRENCY_SYMBOLS[currency]} ${t('form.amount')}`}
          value={income}
          min="0.01"
          step="0.01"
          onChange={(e) => handleChange('income', e.target.value, setIncome)}
        />
        {errors.income && <span className="form-error">{errors.income}</span>}

        <input
          type="date"
          name="user-date"
          className={`form-input${errors.date ? ' form-input--error' : ''}`}
          value={date}
          max={todayStr()}
          onChange={(e) => handleChange('date', e.target.value, setDate)}
        />
        {errors.date && <span className="form-error">{errors.date}</span>}
      </div>
      <button type="submit" className="form-btn btn">
        {t('form.save')}
      </button>
    </form>
  );
}
