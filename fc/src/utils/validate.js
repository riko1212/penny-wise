import { MAX_DESCRIPTION_LENGTH, MAX_AMOUNT } from '../constants';

export function validateTransaction(topic, amount, date) {
  const errors = {};

  if (!topic.trim()) {
    errors.topic = 'Description is required.';
  } else if (topic.trim().length > MAX_DESCRIPTION_LENGTH) {
    errors.topic = `Max ${MAX_DESCRIPTION_LENGTH} characters.`;
  }

  const num = parseFloat(amount);
  if (!amount) {
    errors.income = 'Amount is required.';
  } else if (isNaN(num) || num <= 0) {
    errors.income = 'Amount must be a positive number.';
  } else if (num > MAX_AMOUNT) {
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
