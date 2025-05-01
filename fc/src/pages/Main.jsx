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

export default function Main() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));

  const [items, setItems] = useState([]);
  const [sum, setSum] = useState(0);
  const [quote, setQuote] = useState(null);
  const [isDeleteModalClose, setIsDeleteModalClose] = useState(true);
  const [isClearModalClose, setIsClearModalClose] = useState(true);
  const [itemIdToDelete, setItemIdToDelete] = useState(null);



  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // ✅ Завантаження транзакцій з бекенда
  useEffect(() => {
    async function fetchTransactions() {
      try {
        const res = await fetch('http://localhost:8080/api/transactions');
        const data = await res.json();
        setItems(data);
        const total = data.reduce((acc, item) => acc + Number(item.amount), 0);
        setSum(total);
      } catch (err) {
        console.error('Error loading transactions:', err);
      }
    }
    fetchTransactions();
  }, []);

  function handleChangeSum(amount) {
    setSum((prev) => prev + Number(amount));
  }

  function handleAddItems(item) {
    setItems((items) => [item, ...items]);
  }

  function handleDeleteModalCloseClick() {
    if (items.length === 0) return;
    setIsDeleteModalClose(!isDeleteModalClose);
  }

  function handleClearModalCloseClick() {
    if (items.length === 0) return;
    setIsClearModalClose(!isClearModalClose);
  }

  function handleDeleteItem(id) {
    setItemIdToDelete(id);
    setIsDeleteModalClose(false);
  }

  function handleConfirmDelete() {
    const updatedItems = items.filter((item) => item.id !== itemIdToDelete);
    setItems(updatedItems);
    const updatedSum = updatedItems.reduce(
        (acc, item) => acc + Number(item.amount),
        0
    );
    setSum(updatedSum);
    setIsDeleteModalClose(true);
  }

  function handleClearList() {
    setItems([]);
    setSum(0);
    setIsClearModalClose(true);
  }

  function handleUpdateItemData(id, updatedItem) {
    const updatedItems = items.map((item) =>
        item.id === id ? updatedItem : item
    );
    setItems(updatedItems);
  }

  return (
      <>
        <Header />
        <div className="page-wrap">
          <div className="container page-wrap-container">
            <Sidebar>
              {quote && (
                  <div className="quote">
                    <p>{quote}</p>
                  </div>
              )}
            </Sidebar>
            <main className="main">
              <Form onAddSum={handleChangeSum} onAddItems={handleAddItems} />
              <Info sum={sum}>
                <InfoList
                    items={items}
                    setItems={setItems} // <--- ось це додай
                    onDeleteModalOpen={handleDeleteModalCloseClick}
                    onUpdateItemData={handleUpdateItemData}
                    onClearModal={handleClearModalCloseClick}
                    isDeleteModalClose={isDeleteModalClose}
                />
              </Info>
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
