import '../index.css';

import PropTypes from 'prop-types';
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
import { useLanguage } from '../context/LanguageContext';

TransactionPage.propTypes = {
  type: PropTypes.oneOf(['EXPENSE', 'INCOME']).isRequired,
};

export default function TransactionPage({ type }) {
  const [showForm, setShowForm] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { t, tc } = useLanguage();
  const {
    currentUser,
    currentMonthLabel,
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
  } = useTransactions(type);

  const typeLabel = type === 'EXPENSE' ? 'expense' : 'income';
  const emptyIcon = type === 'EXPENSE' ? '🗂️' : '📊';
  const emptyText = type === 'EXPENSE'
    ? t('transaction.emptyExpense')
    : t('transaction.emptyIncome');

  return (
    <>
      <Header />
      <div className="page-wrap">
        <div className="container page-wrap-container">
          <Sidebar
            onCategorySelect={(cat) => { setDrawerOpen(false); setShowForm(false); handleCategoryChange(cat); }}
            userId={currentUser.id}
            type={type}
            mobileOpen={drawerOpen}
            onMobileClose={() => setDrawerOpen(false)}
          />
          <main className="main">
            <button
              type="button"
              className="sidebar-drawer-trigger"
              onClick={() => setDrawerOpen(true)}
            >
              <span className="sidebar-drawer-trigger__icon">☰</span>
              {selectedCategory ? tc(selectedCategory) : t('transaction.categories')}
            </button>
            <h1 className="page-type-title">
              {type === 'EXPENSE' ? t('transaction.titleExpense') : t('transaction.titleIncome')}
            </h1>
            <TotalCard total={totalSum} type={typeLabel} monthLabel={currentMonthLabel} />
            {!selectedCategory && (
              <div className="category-empty-state">
                <span className="category-empty__icon">{emptyIcon}</span>
                <h2 className="category-empty__title">{t('transaction.selectCategory')}</h2>
                <p className="category-empty__text">{emptyText}</p>
              </div>
            )}
            {selectedCategory && loading && <TransactionsSkeleton />}
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
                  type={typeLabel}
                  onAddClick={() => setShowForm((v) => !v)}
                  showForm={showForm}
                >
                  <InfoList
                    items={items}
                    onDeleteModalOpen={handleDeleteModalCloseClick}
                    onDeleteItemId={handleDeleteItem}
                    onUpdateItemData={handleUpdateItemData}
                    onClearModal={handleClearModal}
                    onAddClick={() => setShowForm(true)}
                    type={typeLabel}
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
        isOpen={deleteModalOpen}
        onItemDelete={handleConfirmDelete}
      />
      <ClearModal
        onClearModalClose={handleClearModalCloseClick}
        isOpen={clearModalOpen}
        onClearList={handleClearList}
      />
    </>
  );
}
