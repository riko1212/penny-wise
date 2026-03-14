import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const now = new Date();
const CURRENT_MONTH = now.getMonth() + 1;
const CURRENT_YEAR = now.getFullYear();
const CURRENT_MONTH_LABEL = now.toLocaleString('en', { month: 'long', year: 'numeric' });

export function useTransactions(type) {
  const navigate = useNavigate();
  const [currentUser] = useState(() => JSON.parse(localStorage.getItem('loggedInUser')));

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalSum, setTotalSum] = useState(0);
  const [isDeleteModalClose, setIsDeleteModalClose] = useState(true);
  const [isClearModalClose, setIsClearModalClose] = useState(true);
  const [itemIdToDelete, setItemIdToDelete] = useState(null);
  const [apiError, setApiError] = useState(null);

  const sum = items.reduce((total, item) => total + Number(item.income), 0);

  const showError = useCallback((message) => {
    setApiError(message);
    setTimeout(() => setApiError(null), 5000);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    fetch(`/api/transactions/total?userId=${currentUser.id}&type=${type}&month=${CURRENT_MONTH}&year=${CURRENT_YEAR}`)
      .then((res) => res.json())
      .then(setTotalSum)
      .catch(() => showError('Failed to load total. Check your connection.'));
  }, [currentUser, type, items]);

  useEffect(() => {
    if (!selectedCategory || !currentUser) return;
    setLoading(true);
    fetch(`/api/transactions?userId=${currentUser.id}&categoryName=${encodeURIComponent(selectedCategory)}&type=${type}&month=${CURRENT_MONTH}&year=${CURRENT_YEAR}`)
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
    fetch('/api/transactions', {
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
    setIsDeleteModalClose(false);
  }

  function handleConfirmDelete() {
    if (!currentUser) return;
    fetch(`/api/transactions/${itemIdToDelete}?userId=${currentUser.id}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        setItems((prev) => prev.filter((item) => item.id !== itemIdToDelete));
        setIsDeleteModalClose(true);
      })
      .catch(() => showError('Failed to delete transaction. Please try again.'));
  }

  function handleUpdateItemData(id, updatedItem) {
    if (!currentUser) return;
    fetch(`/api/transactions/${id}?userId=${currentUser.id}`, {
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
      .catch(() => showError('Failed to update transaction. Please try again.'));
  }

  function handleClearList() {
    if (!currentUser) return;
    fetch(`/api/transactions?userId=${currentUser.id}&categoryName=${encodeURIComponent(selectedCategory)}&type=${type}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        setItems([]);
        setIsClearModalClose(true);
      })
      .catch(() => showError('Failed to clear transactions. Please try again.'));
  }

  function handleDeleteModalCloseClick() {
    setIsDeleteModalClose((prev) => !prev);
  }

  function handleClearModalCloseClick() {
    setIsClearModalClose((prev) => !prev);
  }

  function handleClearModal() {
    setIsClearModalClose(false);
  }

  return {
    currentUser,
    currentMonthLabel: CURRENT_MONTH_LABEL,
    selectedCategory,
    items,
    loading,
    sum,
    totalSum,
    isDeleteModalClose,
    isClearModalClose,
    apiError,
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
