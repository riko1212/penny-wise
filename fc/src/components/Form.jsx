import { useState } from 'react';
import PropTypes from 'prop-types';
import { validateTransaction } from '../utils/validate';
import { todayStr } from '../constants';

Form.propTypes = {
  onAddItems: PropTypes.func.isRequired,
  selectedCategory: PropTypes.string.isRequired,
};

export default function Form({ onAddItems, selectedCategory }) {
  const [income, setIncome] = useState('');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState(todayStr);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);

    const errs = validateTransaction(topic, income, date);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    onAddItems({
      income: parseFloat(income),
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

  function handleChange(field, value, setter) {
    setter(value);
    if (submitted) {
      const next = { topic, income, date, [field]: value };
      const errs = validateTransaction(next.topic, next.income, next.date);
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
          placeholder="Description"
          value={topic}
          onChange={(e) => handleChange('topic', e.target.value, setTopic)}
          maxLength={110}
        />
        {errors.topic && <span className="form-error">{errors.topic}</span>}

        <input
          type="number"
          name="user-sum"
          className={`form-input${errors.income ? ' form-input--error' : ''}`}
          placeholder="Amount"
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
        Save
      </button>
    </form>
  );
}
