import { useState } from 'react';
import PropTypes from 'prop-types';

Form.propTypes = {
  onAddSum: PropTypes.func.isRequired,
  onAddItems: PropTypes.func.isRequired,
  selectedCategory: PropTypes.string.isRequired,
};

export default function Form({ onAddSum, onAddItems, selectedCategory }) {
  const [income, setIncome] = useState('');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  function handleSubmit(e) {
    e.preventDefault();

    if (!income || !topic) {
      console.error("Income and topic are required");
      return;
    }

    const result = {
      income: parseFloat(income), // Упевніться, що income є числом
      topic,
      date,
      id: Date.now(),
      category: selectedCategory,
    };

    try {
      onAddSum(result.income);
      onAddItems(result);
    } catch (error) {
      console.error("Error in onAddSum or onAddItems:", error);
    }

    setIncome('');
    setTopic('');
    setDate(new Date().toISOString().slice(0, 10));
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="input-wrap">
        <input
          type="text"
          name="user-text"
          className="form-input"
          placeholder="Enter type"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <input
          type="number"
          name="user-sum"
          className="form-input"
          placeholder="Enter sum"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
        />
        <input
          type="date"
          name="user-date"
          className="form-input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <button type="submit" className="form-btn btn">
        Save
      </button>
    </form>
  );
}
