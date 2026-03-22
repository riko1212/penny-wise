import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../utils/toast';
import apiFetch from '../utils/apiFetch';

const now = new Date();
const CURRENT_MONTH = now.getMonth() + 1;
const CURRENT_YEAR = now.getFullYear();
const CURRENT_MONTH_LABEL = now.toLocaleString('en', { month: 'long', year: 'numeric' });

export function useTransactions(type) {
  const navigate = useNavigate();
  const [currentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('loggedInUser')); } catch { return null; }
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalSum, setTotalSum] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState(null);

  const sum = items.reduce((total, item) => total + Number(item.income), 0);

  function showError(message) { showToast('error', message); }

  useEffect(() => {
    if (!currentUser) return;
    apiFetch(`/api/transactions/total?userId=${currentUser.id}&type=${type}&month=${CURRENT_MONTH}&year=${CURRENT_YEAR}`)
      .then((res) => res.json())
      .then(setTotalSum)
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
      .then(setItems)
      .catch(() => showError('Failed to load transactions. Check your connection.'))
      .finally(() => setLoading(false));
  }, [selectedCategory, currentUser, type]);

  function handleCategoryChange(newCategory) {
    setSelectedCategory(newCategory);
  }

  function handleAddItems(formData) {
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
      .then((saved) => setItems((prev) => [saved, ...prev]))
      .catch(() => showError('Failed to save transaction. Please try again.'));
  }

  function handleDeleteItem(id) {
    setItemIdToDelete(id);
    setDeleteModalOpen(true);
  }

  function handleConfirmDelete() {
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

  function handleUpdateItemData(id, updatedItem) {
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
      .then((saved) =>
        setItems((prev) => prev.map((item) => (item.id === id ? saved : item)))
      )
      .catch((err) => {
        showError('Failed to update transaction. Please try again.');
        throw err;
      });
  }

  function handleClearList() {
    if (!currentUser) return;
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

  function handleDeleteModalCloseClick() {
    setDeleteModalOpen((prev) => !prev);
  }

  function handleClearModalCloseClick() {
    setClearModalOpen((prev) => !prev);
  }

  function handleClearModal() {
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
    handleClearList,
    handleDeleteModalCloseClick,
    handleClearModalCloseClick,
    handleClearModal,
  };
}
