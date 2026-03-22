export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Transaction {
  id: number;
  topic: string;
  income: number;
  date: number;
  categoryName: string;
  type: 'INCOME' | 'EXPENSE';
}

export interface Category {
  id: number;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  userId: number;
}

export interface Goal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  categoryName: string;
  note?: string | null;
  dueDate?: number | null;
}

export interface SummaryItem {
  categoryName: string;
  total: number;
}

export interface HistoryEntry {
  period: string;
  total: number;
}
