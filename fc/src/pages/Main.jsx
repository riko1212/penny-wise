import '../index.css';

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

export default function Main() {
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
            onCategorySelect={handleCategoryChange}
            userId={currentUser.id}
            type="EXPENSE"
          />
          <main className="main">
            <TotalCard total={totalSum} type="expense" monthLabel={currentMonthLabel} />
            {!selectedCategory && (
              <div className="quote">
                <p>Small steps every day → big results. 💸</p>
              </div>
            )}
            {selectedCategory && loading && (
              <div className="loading">Loading...</div>
            )}
            {selectedCategory && !loading && (
              <>
                <Form
                  onAddItems={handleAddItems}
                  selectedCategory={selectedCategory}
                />
                <Info sum={sum} type="expense">
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
