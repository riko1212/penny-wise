import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Form from '../components/Form';
import Info from '../components/Info';
import InfoList from '../components/InfoList';
import Footer from '../components/Footer';
import TopicList from '../components/TopicList';
import DeleteModal from '../components/DeleteModal';
import ClearModal from '../components/ClearModal';

export default function Main() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const [categories, setCategories] = useState(() => {
    const storedCategories = localStorage.getItem(
      `categories_${currentUser.id}`
    );
    return storedCategories ? JSON.parse(storedCategories) : ['Default'];
  });

  const [selectedCategory, setSelectedCategory] = useState(null);

  const [sum, setSum] = useState(0);
  const [items, setItems] = useState([]);
  const [quote, setQuote] = useState(null);
  const [isDeleteModalClose, setIsDeleteModalClose] = useState(true);
  const [isClearModalClose, setIsClearModalClose] = useState(true);
  const [itemIdToDelete, setItemIdToDelete] = useState(null);

  useEffect(() => {
    if (selectedCategory) {
      const storeSum = localStorage.getItem(
        `sum_${currentUser.id}_${selectedCategory}`
      );
      setSum(storeSum ? JSON.parse(storeSum) : 0);

      const storeItems = localStorage.getItem(
        `items_${currentUser.id}_${selectedCategory}`
      );
      setItems(storeItems ? JSON.parse(storeItems) : []);
    }
  }, [selectedCategory, currentUser.id]);

  async function fetchQuote() {
    try {
      const response = await fetch('https://api.quotable.io/random');
      const data = await response.json();
      setQuote(data.content);
    } catch (error) {
      console.error('Error fetching quote:', error);
    }
  }

  useEffect(() => {
    fetchQuote();
  }, []);

  function handleDeleteModalCloseClick() {
    if (items.length === 0) {
      return;
    }
    setIsDeleteModalClose(!isDeleteModalClose);
  }

  function handleClearModalCloseClick() {
    if (items.length === 0) {
      return;
    }
    setIsClearModalClose(!isClearModalClose);
  }

  function handleChangeSum(data) {
    setSum((sum) => sum + Number(data));
  }

  function handleAddItems(item) {
    setItems((items) => [item, ...items]);
  }

  function handleDeleteItem(id) {
    setItemIdToDelete(id);
    setIsDeleteModalClose(false);
  }

  function handleClearModal() {
    setIsClearModalClose(false);
  }

  function handleConfirmDelete() {
    setItems(items.filter((item) => item.id !== itemIdToDelete));
    setSum(
      items
        .filter((item) => item.id !== itemIdToDelete)
        .reduce((total, amount) => total + Number(amount.income), 0)
    );
    setIsDeleteModalClose(true);
  }

  function handleUpdateItemData(id, updatedItem) {
    const updatedItems = items.map((item) =>
      item.id === id ? updatedItem : item
    );
    setItems(updatedItems);
  }

  function handleClearList() {
    setItems([]);
    setSum(0);
    setIsClearModalClose(true);
  }

  function handleCategoryChange(newCategory) {
    setSelectedCategory(newCategory);
  }

  function handleAddCategory(newCategory) {
    if (!categories.includes(newCategory)) {
      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      localStorage.setItem(
        `categories_${currentUser.id}`,
        JSON.stringify(updatedCategories)
      );
      setSelectedCategory(newCategory);
    }
  }

  useEffect(() => {
    if (selectedCategory) {
      localStorage.setItem(
        `items_${currentUser.id}_${selectedCategory}`,
        JSON.stringify(items)
      );
      localStorage.setItem(
        `sum_${currentUser.id}_${selectedCategory}`,
        JSON.stringify(sum)
      );
    }
  }, [items, sum, currentUser.id, selectedCategory]);

  return (
    <>
      <Header />
      <div className="page-wrap">
        <div className="container page-wrap-container">
          <Sidebar onCategorySelect={handleCategoryChange}>
            <TopicList
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              onAddCategory={handleAddCategory}
            />
          </Sidebar>
          <main className="main">
            {!selectedCategory && quote && (
              <div className="quote">
                <p>{quote}</p>
              </div>
            )}
            {selectedCategory && (
              <>
                <Form
                  onAddSum={handleChangeSum}
                  onAddItems={handleAddItems}
                  selectedCategory={selectedCategory}
                />
                <Info sum={sum}>
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
