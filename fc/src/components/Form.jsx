import { useState } from 'react';
import PropTypes from 'prop-types';

Form.propTypes = {
  onAddSum: PropTypes.func.isRequired,
  onAddItems: PropTypes.func.isRequired,
};

export default function Form({ onAddSum, onAddItems }) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedType = type.trim();
    const parsedAmount = parseFloat(amount);

    if (!trimmedType || Number.isNaN(amount) || amount <= 0) {
      console.error('Введіть коректні дані: тип і додатне число для суми.');
      return;
    }

    const transactionData = {
      type: trimmedType,
      amount: parsedAmount,
      date,
    };

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:8080/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error: ${errorData.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('Успішно збережено:', data);

      // Оновлюємо суму та елементи в батьківському компоненті
      onAddSum(data.amount);
      onAddItems({
        id: data.id,
        amount: data.amount,
        type: data.type,
        date: new Date(data.date).getTime(),
      });

      // Очищаємо форму після успішного додавання
      setAmount('');
      setType('');
      setDate(new Date().toISOString().slice(0, 10));
    } catch (err) {
      console.error('Помилка при збереженні транзакції:', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <form className="form" onSubmit={handleSubmit}>
        <div className="input-wrap">
          <input
              type="text"
              name="user-text"
              className="form-input"
              placeholder="Enter type"
              value={type}
              onChange={(e) => setType(e.target.value)}
          />
          <input
              type="number"
              name="user-sum"
              className="form-input"
              placeholder="Enter sum"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
          />
          <input
              type="date"
              name="user-date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <button type="submit" className="form-btn btn" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </form>
  );
}
