import { useState, useEffect } from 'react';
import InfoItem from './InfoItem';
import { useLanguage } from '../context/LanguageContext';
import type { Transaction } from '../types';

const PAGE_SIZE = 20;

interface InfoListProps {
  items?: Transaction[];
  onDeleteModalOpen: () => void;
  onDeleteItemId: (id: number) => void;
  onClearModal: () => void;
  onUpdateItemData: (id: number, item: Transaction) => Promise<void>;
  onAddClick?: () => void;
  type?: 'income' | 'expense';
}

export default function InfoList({
  items = [],
  onDeleteModalOpen,
  onDeleteItemId,
  onClearModal,
  onUpdateItemData,
  onAddClick,
  type = 'expense',
}: InfoListProps) {
  const { t } = useLanguage();
  const [sortBy, setSortBy] = useState('order');
  const [search, setSearch] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [sentinelEl, setSentinelEl] = useState<Element | null>(null);

  const hasActiveFilters = search || minAmount || maxAmount || dateFrom || dateTo;
  const amountRangeError = minAmount !== '' && maxAmount !== '' && Number(minAmount) > Number(maxAmount);
  const dateRangeError = dateFrom && dateTo && dateFrom > dateTo;

  let filtered = [...items];

  if (search) {
    filtered = filtered.filter((item) =>
      item.topic.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (minAmount !== '') {
    filtered = filtered.filter((item) => Number(item.income) >= Number(minAmount));
  }
  if (maxAmount !== '') {
    filtered = filtered.filter((item) => Number(item.income) <= Number(maxAmount));
  }
  if (dateFrom) {
    filtered = filtered.filter((item) => item.date >= new Date(dateFrom).getTime());
  }
  if (dateTo) {
    filtered = filtered.filter(
      (item) => item.date <= new Date(dateTo).getTime() + 86399999
    );
  }

  if (filtered.length > 0) {
    switch (sortBy) {
      case 'description':
        filtered.sort((a, b) => a.topic.localeCompare(b.topic));
        break;
      case 'highest':
        filtered.sort((a, b) => b.income - a.income);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.income - b.income);
        break;
      case 'first':
        filtered.sort((a, b) => a.date - b.date);
        break;
      case 'last':
        filtered.sort((a, b) => b.date - a.date);
        break;
      default:
        break;
    }
  }

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, minAmount, maxAmount, dateFrom, dateTo, sortBy, items]);

  useEffect(() => {
    if (!sentinelEl) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + PAGE_SIZE);
        }
      },
      { rootMargin: '100px' }
    );
    observer.observe(sentinelEl);
    return () => observer.disconnect();
  }, [sentinelEl]);

  function handleClearFilters() {
    setSearch('');
    setMinAmount('');
    setMaxAmount('');
    setDateFrom('');
    setDateTo('');
  }

  const hasItems = items.length > 0;

  return (
    <>
      {hasItems && (
        <div className="filter-bar">
          <input
            type="text"
            className="filter-search"
            placeholder={t('infoList.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className={`btn filter-toggle-btn ${filtersOpen ? 'filter-toggle-btn--active' : ''}`}
            onClick={() => setFiltersOpen((p) => !p)}
          >
            {filtersOpen ? t('infoList.hideFilters') : t('infoList.filters')}
            {hasActiveFilters && !filtersOpen && <span className="filter-dot" />}
          </button>
          {hasActiveFilters && (
            <button className="btn filter-clear-btn" onClick={handleClearFilters}>
              {t('infoList.clear')}
            </button>
          )}
        </div>
      )}

      {hasItems && filtersOpen && (
        <div className="filter-panel">
          <div className="filter-group">
            <label className="filter-label">{t('infoList.amount')}</label>
            <div className="filter-range">
              <input
                type="number"
                className={`filter-input${amountRangeError ? ' form-input--error' : ''}`}
                placeholder={t('infoList.min')}
                value={minAmount}
                min="0"
                onChange={(e) => setMinAmount(e.target.value)}
              />
              <span className="filter-range-sep">—</span>
              <input
                type="number"
                className={`filter-input${amountRangeError ? ' form-input--error' : ''}`}
                placeholder={t('infoList.max')}
                value={maxAmount}
                min="0"
                onChange={(e) => setMaxAmount(e.target.value)}
              />
            </div>
            {amountRangeError && <span className="form-error">{t('infoList.amountRangeError')}</span>}
          </div>
          <div className="filter-group">
            <label className="filter-label">{t('infoList.dateRange')}</label>
            <div className="filter-range">
              <input
                type="date"
                className={`filter-input${dateRangeError ? ' form-input--error' : ''}`}
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <span className="filter-range-sep">—</span>
              <input
                type="date"
                className={`filter-input${dateRangeError ? ' form-input--error' : ''}`}
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            {dateRangeError && <span className="form-error">{t('infoList.dateRangeError')}</span>}
          </div>
        </div>
      )}

      <ul className="info-list">
        {!hasItems ? (
          <li className="info-list__empty-state">
            <span className="info-empty__icon">{type === 'income' ? '💰' : '💸'}</span>
            <p className="info-empty__title">{t('infoList.noTransactions')}</p>
            <p className="info-empty__text">
              {type === 'income' ? t('infoList.addFirstIncome') : t('infoList.addFirstExpense')}
            </p>
            {onAddClick && (
              <button className="btn info-empty__cta" onClick={onAddClick}>
                {type === 'income' ? t('infoList.addIncome') : t('infoList.addExpense')}
              </button>
            )}
          </li>
        ) : filtered.length === 0 ? (
          <li className="info-list__empty">{t('infoList.noMatch')}</li>
        ) : (
          filtered.slice(0, visibleCount).map((item) => (
            <InfoItem
              item={item}
              key={item.id}
              onDeleteModalOpen={onDeleteModalOpen}
              onDeleteItemId={onDeleteItemId}
              onUpdateItemData={onUpdateItemData}
            />
          ))
        )}
      </ul>

      {filtered.length > visibleCount && (
        <div ref={setSentinelEl} className="info-list__sentinel">
          <span className="info-list__sentinel-text">{t('infoList.loadingMore')}</span>
        </div>
      )}
      {filtered.length > 0 && filtered.length <= visibleCount && filtered.length > PAGE_SIZE && (
        <p className="info-list__count">{t('infoList.showingAll', { count: filtered.length })}</p>
      )}

      {hasItems && (
        <div className="info-actions">
          <div className="info-sorting">
            <label className="info-sort-text" htmlFor="sort-select">
              {t('infoList.sortBy')}
            </label>
            <select
              className="info-sort-select"
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="order">{t('infoList.sortOrder')}</option>
              <option value="highest">{t('infoList.sortHighest')}</option>
              <option value="lowest">{t('infoList.sortLowest')}</option>
              <option value="description">{t('infoList.sortDescription')}</option>
              <option value="first">{t('infoList.sortFirst')}</option>
              <option value="last">{t('infoList.sortLast')}</option>
            </select>
          </div>
          <button className="btn" onClick={onClearModal}>
            {t('infoList.clearList')}
          </button>
        </div>
      )}
    </>
  );
}
