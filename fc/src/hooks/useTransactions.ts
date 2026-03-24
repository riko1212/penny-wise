import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../utils/toast';
import apiFetch from '../utils/apiFetch';
import type { User, Transaction } from '../types';

const now = new Date();
const CURRENT_MONTH = now.getMonth() + 1;
const CURRENT_YEAR = now.getFullYear();
const CURRENT_MONTH_LABEL = now.toLocaleString('en', { month: 'long', year: 'numeric' });

export interface NewTransactionData {
  income: number;
  topic: string;
  date: number;
  categoryName: string;
}

export interface UseTransactionsReturn {
  currentUser: User | null;
  currentMonthLabel: string;
  selectedCategory: string | null;
  items: Transaction[];
  loading: boolean;
  sum: number;
  totalSum: number;
  deleteModalOpen: boolean;
  clearModalOpen: boolean;
  handleCategoryChange: (cat: string) => void;
  handleAddItems: (formData: NewTransactionData) => void;
  handleDeleteItem: (id: number) => void;
  handleConfirmDelete: () => void;
  handleUpdateItemData: (id: number, updatedItem: Transaction) => Promise<void>;
  handleDuplicateItem: (item: Transaction) => void;
  handleClearList: () => void;
  handleDeleteModalCloseClick: () => void;
  handleClearModalCloseClick: () => void;
  handleClearModal: () => void;
}

export function useTransactions(type: 'EXPENSE' | 'INCOME'): UseTransactionsReturn {
  const navigate = useNavigate();
  const [currentUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('loggedInUser') ?? 'null') as User | null; } catch { return null; }
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalSum, setTotalSum] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState<number | null>(null);

  const sum = items.reduce((total, item) => total + Number(item.income), 0);

  function showError(message: string) { showToast('error', message); }

  useEffect(() => {
    if (!currentUser) return;
    apiFetch(`/api/transactions/total?userId=${currentUser.id}&type=${type}&month=${CURRENT_MONTH}&year=${CURRENT_YEAR}`)
      .then((res) => res.json())
      .then((val: number) => setTotalSum(val))
      .catch(() => showError('Failed to load total. Check your connection.'));
  }, [currentUser, type, items]);

  useEffect(() => {
    if (!selectedCategory || !currentUser) return;
    setLoading(true);
    apiFetch(`/api/transactions?userId=${currentUser.id}&categoryName=${encodeURIComponent(selectedCategory)}&type=${type}&month=${CURRENT_MONTH}&year=${CURRENT_YEAR}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: Transaction[]) => setItems(data))
      .catch(() => showError('Failed to load transactions. Check your connection.'))
      .finally(() => setLoading(false));
  }, [selectedCategory, currentUser, type]);

  function handleCategoryChange(newCategory: string): void {
    setSelectedCategory(newCategory);
  }

  function handleAddItems(formData: NewTransactionData): void {
    if (!currentUser) return;
    apiFetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        userId: currentUser.id,
        categoryName: selectedCategory,
        type,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((saved: Transaction) => setItems((prev) => [saved, ...prev]))
      .catch(() => showError('Failed to save transaction. Please try again.'));
  }

  function handleDeleteItem(id: number): void {
    setItemIdToDelete(id);
    setDeleteModalOpen(true);
  }

  function handleConfirmDelete(): void {
    if (!currentUser) return;
    apiFetch(`/api/transactions/${itemIdToDelete}?userId=${currentUser.id}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        setItems((prev) => prev.filter((item) => item.id !== itemIdToDelete));
        setDeleteModalOpen(false);
      })
      .catch(() => showError('Failed to delete transaction. Please try again.'));
  }

  function handleUpdateItemData(id: number, updatedItem: Transaction): Promise<void> {
    if (!currentUser) return Promise.resolve();
    return apiFetch(`/api/transactions/${id}?userId=${currentUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedItem),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((saved: Transaction) =>
        setItems((prev) => prev.map((item) => (item.id === id ? saved : item)))
      )
      .catch((err: unknown) => {
        showError('Failed to update transaction. Please try again.');
        throw err;
      });
  }

  function handleDuplicateItem(item: Transaction): void {
    if (!currentUser) return;
    apiFetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: item.topic,
        income: item.income,
        date: Date.now(),
        categoryName: item.categoryName,
        type,
        userId: currentUser.id,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((saved: Transaction) => setItems((prev) => [saved, ...prev]))
      .catch(() => showError('Failed to duplicate transaction. Please try again.'));
  }

  function handleClearList(): void {
    if (!currentUser || !selectedCategory) return;
    apiFetch(`/api/transactions?userId=${currentUser.id}&categoryName=${encodeURIComponent(selectedCategory)}&type=${type}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        setItems([]);
        setClearModalOpen(false);
      })
      .catch(() => showError('Failed to clear transactions. Please try again.'));
  }

  function handleDeleteModalCloseClick(): void {
    setDeleteModalOpen((prev) => !prev);
  }

  function handleClearModalCloseClick(): void {
    setClearModalOpen((prev) => !prev);
  }

  function handleClearModal(): void {
    setClearModalOpen(true);
  }

  return {
    currentUser,
    currentMonthLabel: CURRENT_MONTH_LABEL,
    selectedCategory,
    items,
    loading,
    sum,
    totalSum,
    deleteModalOpen,
    clearModalOpen,
    handleCategoryChange,
    handleAddItems,
    handleDeleteItem,
    handleConfirmDelete,
    handleUpdateItemData,
    handleDuplicateItem,
    handleClearList,
    handleDeleteModalCloseClick,
    handleClearModalCloseClick,
    handleClearModal,
  };
}
