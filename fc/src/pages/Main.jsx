import '../index.css';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Form from '../components/Form';
import Info from '../components/Info';
import InfoList from '../components/InfoList';
import Footer from '../components/Footer';
import DeleteModal from '../components/DeleteModal';
import ClearModal from '../components/ClearModal';
import { useTransactions } from '../hooks/useTransactions';
import TotalCard from '../components/TotalCard';
import { TransactionsSkeleton } from '../components/Skeleton';

export default function Main() {
  const [showForm, setShowForm] = useState(false);
  const {
    currentUser,
    currentMonthLabel,
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
  } = useTransactions('EXPENSE');

  return (
    <>
      <Header />
      <div className="page-wrap">
        <div className="container page-wrap-container">
          <Sidebar
            onCategorySelect={(cat) => { setShowForm(false); handleCategoryChange(cat); }}
            userId={currentUser.id}
            type="EXPENSE"
          />
          <main className="main">

            <TotalCard total={totalSum} type="expense" monthLabel={currentMonthLabel} />
            {!selectedCategory && (
              <div className="category-empty-state">
                <span className="category-empty__icon">🗂️</span>
                <h2 className="category-empty__title">Select a category</h2>
                <p className="category-empty__text">Choose a category from the sidebar to view and manage your expenses.</p>
              </div>
            )}
            {selectedCategory && loading && (
              <TransactionsSkeleton />
            )}
            {selectedCategory && !loading && (
              <>
                {showForm && (
                  <Form
                    onAddItems={(item) => { handleAddItems(item); setShowForm(false); }}
                    selectedCategory={selectedCategory}
                  />
                )}
                <Info
                  sum={sum}
                  type="expense"
                  onAddClick={() => setShowForm((v) => !v)}
                  showForm={showForm}
                >
                  <InfoList
                    items={items}
                    onDeleteItem={handleConfirmDelete}
                    onDeleteModalOpen={handleDeleteModalCloseClick}
                    isDeleteModalClose={isDeleteModalClose}
                    isClearModalClose={isClearModalClose}
                    onDeleteItemId={handleDeleteItem}
                    onUpdateItemData={handleUpdateItemData}
                    onClearModal={handleClearModal}
                    onAddClick={() => setShowForm(true)}
                    type="expense"
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
