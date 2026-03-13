import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Form from '../components/Form';
import Info from '../components/Info';
import InfoList from '../components/InfoList';
import Footer from '../components/Footer';
import DeleteModal from '../components/DeleteModal';
import ClearModal from '../components/ClearModal';

export default function Income() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [isDeleteModalClose, setIsDeleteModalClose] = useState(true);
  const [isClearModalClose, setIsClearModalClose] = useState(true);
  const [itemIdToDelete, setItemIdToDelete] = useState(null);

  const sum = items.reduce((total, item) => total + Number(item.income), 0);

  useEffect(() => {
    if (!selectedCategory) return;
    fetch(`/api/transactions?userId=${currentUser.id}&categoryName=${encodeURIComponent(selectedCategory)}&type=INCOME`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch transactions');
        return res.json();
      })
      .then(setItems)
      .catch((err) => console.error('Fetch transactions error:', err));
  }, [selectedCategory, currentUser.id]);

  function handleCategoryChange(newCategory) {
    setSelectedCategory(newCategory);
  }

  function handleAddItems(formData) {
    fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        userId: currentUser.id,
        categoryName: selectedCategory,
        type: 'INCOME',
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
    fetch(`/api/transactions?userId=${currentUser.id}&categoryName=${encodeURIComponent(selectedCategory)}&type=INCOME`, {
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
    setIsDeleteModalClose(!isDeleteModalClose);
  }

  function handleClearModalCloseClick() {
    if (items.length === 0) return;
    setIsClearModalClose(!isClearModalClose);
  }

  function handleClearModal() {
    setIsClearModalClose(false);
  }

  return (
    <>
      <Header />
      <div className="page-wrap">
        <div className="container page-wrap-container">
          <Sidebar
            onCategorySelect={handleCategoryChange}
            userId={currentUser.id}
          />
          <main className="main">
            {!selectedCategory && (
              <div className="quote">
                <p>Track your income — know what you earn. 💰</p>
              </div>
            )}
            {selectedCategory && (
              <>
                <Form
                  onAddItems={handleAddItems}
                  selectedCategory={selectedCategory}
                />
                <Info sum={sum} type="income">
                  <InfoList
                    items={items}
                    onDeleteItem={handleConfirmDelete}
                    onDeleteModalOpen={handleDeleteModalCloseClick}
                    isDeleteModalClose={isDeleteModalClose}
                    isClearModalClose={isClearModalClose}
                    onDeleteItemId={handleDeleteItem}
                    onUpdateItemData={handleUpdateItemData}
                    onClearModal={handleClearModal}
                  />
                </Info>
              </>
            )}
          </main>
        </div>
      </div>
      <Footer />
      <DeleteModal
        onDeleteModalClose={handleDeleteModalCloseClick}
        isDeleteModalClose={isDeleteModalClose}
        onItemDelete={handleConfirmDelete}
      />
      <ClearModal
        onClearModalClose={handleClearModalCloseClick}
        isClearModalClose={isClearModalClose}
        onClearList={handleClearList}
      />
    </>
  );
}
