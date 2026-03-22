import { MAX_DESCRIPTION_LENGTH, MAX_AMOUNT } from '../constants';

export interface ValidationMessages {
  descriptionRequired?: string;
  maxChars?: string;
  amountRequired?: string;
  amountPositive?: string;
  amountMax?: string;
  dateRequired?: string;
  dateFuture?: string;
}

export interface ValidationErrors {
  topic?: string;
  income?: string;
  date?: string;
}

export function validateTransaction(
  topic: string,
  amount: string | number,
  date: string,
  msgs: ValidationMessages = {}
): ValidationErrors {
  const errors: ValidationErrors = {};

  const m = {
    descriptionRequired: msgs.descriptionRequired || 'Description is required.',
    maxChars: msgs.maxChars || `Max ${MAX_DESCRIPTION_LENGTH} characters.`,
    amountRequired: msgs.amountRequired || 'Amount is required.',
    amountPositive: msgs.amountPositive || 'Amount must be a positive number.',
    amountMax: msgs.amountMax || 'Amount cannot exceed 1 000 000.',
    dateRequired: msgs.dateRequired || 'Date is required.',
    dateFuture: msgs.dateFuture || 'Date cannot be in the future.',
  };

  if (!topic.trim()) {
    errors.topic = m.descriptionRequired;
  } else if (topic.trim().length > MAX_DESCRIPTION_LENGTH) {
    errors.topic = m.maxChars;
  }

  const num = parseFloat(String(amount));
  if (!amount) {
    errors.income = m.amountRequired;
  } else if (isNaN(num) || num <= 0) {
    errors.income = m.amountPositive;
  } else if (num > MAX_AMOUNT) {
    errors.income = m.amountMax;
  }

  if (!date) {
    errors.date = m.dateRequired;
  } else {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (new Date(date) > today) {
      errors.date = m.dateFuture;
    }
  }

  return errors;
}
