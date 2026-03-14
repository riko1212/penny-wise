import { useState } from 'react';
import PropTypes from 'prop-types';

Form.propTypes = {
  onAddItems: PropTypes.func.isRequired,
  selectedCategory: PropTypes.string.isRequired,
};

function validate(topic, income, date) {
  const errors = {};

  if (!topic.trim()) {
    errors.topic = 'Description is required.';
  } else if (topic.trim().length > 100) {
    errors.topic = 'Max 100 characters.';
  }

  const amount = parseFloat(income);
  if (!income) {
    errors.income = 'Amount is required.';
  } else if (isNaN(amount) || amount <= 0) {
    errors.income = 'Amount must be a positive number.';
  } else if (amount > 1_000_000) {
    errors.income = 'Amount cannot exceed 1 000 000.';
  }

  if (!date) {
    errors.date = 'Date is required.';
  } else {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (new Date(date) > today) {
      errors.date = 'Date cannot be in the future.';
    }
  }

  return errors;
}

export default function Form({ onAddItems, selectedCategory }) {
  const [income, setIncome] = useState('');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);

    const errs = validate(topic, income, date);
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
    setDate(new Date().toISOString().slice(0, 10));
    setErrors({});
    setSubmitted(false);
  }

  function handleChange(field, value, setter) {
    setter(value);
    if (submitted) {
      const next = { topic, income, date, [field]: value };
      const errs = validate(next.topic, next.income, next.date);
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
          max={new Date().toISOString().slice(0, 10)}
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
