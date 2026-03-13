import { useState, useEffect } from 'react';
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

  const sum = items.reduce((total, item) => total + Number(item.income), 0);

  // Fetch total whenever items change (add/delete/clear)
  useEffect(() => {
    if (!currentUser) return;
    fetch(`/api/transactions/total?userId=${currentUser.id}&type=${type}&month=${CURRENT_MONTH}&year=${CURRENT_YEAR}`)
      .then((res) => res.json())
      .then(setTotalSum)
      .catch((err) => console.error('Fetch total error:', err));
  }, [currentUser, type, items]);

  useEffect(() => {
    if (!selectedCategory || !currentUser) return;
    setLoading(true);
    fetch(`/api/transactions?userId=${currentUser.id}&categoryName=${encodeURIComponent(selectedCategory)}&type=${type}&month=${CURRENT_MONTH}&year=${CURRENT_YEAR}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch transactions');
        return res.json();
      })
      .then(setItems)
      .catch((err) => console.error('Fetch transactions error:', err))
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
        if (!res.ok) throw new Error('Failed to create transaction');
        return res.json();
      })
      .then((saved) => setItems((prev) => [saved, ...prev]))
      .catch((err) => console.error('Create transaction error:', err));
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
        if (!res.ok) throw new Error('Failed to delete transaction');
        setItems((prev) => prev.filter((item) => item.id !== itemIdToDelete));
        setIsDeleteModalClose(true);
      })
      .catch((err) => console.error('Delete transaction error:', err));
  }

  function handleUpdateItemData(id, updatedItem) {
    if (!currentUser) return;
    fetch(`/api/transactions/${id}?userId=${currentUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedItem),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update transaction');
        return res.json();
      })
      .then((saved) =>
        setItems((prev) => prev.map((item) => (item.id === id ? saved : item)))
      )
      .catch((err) => console.error('Update transaction error:', err));
  }

  function handleClearList() {
    if (!currentUser) return;
    fetch(`/api/transactions?userId=${currentUser.id}&categoryName=${encodeURIComponent(selectedCategory)}&type=${type}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to clear transactions');
        setItems([]);
        setIsClearModalClose(true);
      })
      .catch((err) => console.error('Clear transactions error:', err));
  }

  function handleDeleteModalCloseClick() {
    if (items.length === 0) return;
    setIsDeleteModalClose((prev) => !prev);
  }

  function handleClearModalCloseClick() {
    if (items.length === 0) return;
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
