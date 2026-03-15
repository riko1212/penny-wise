import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import InfoItem from './InfoItem';

const PAGE_SIZE = 20;

InfoList.propTypes = {
  onDeleteModalOpen: PropTypes.func.isRequired,
  onDeleteItemId: PropTypes.func.isRequired,
  onUpdateItemData: PropTypes.func.isRequired,
  onClearModal: PropTypes.func.isRequired,
  handleClearList: PropTypes.func,
  items: PropTypes.array.isRequired,
  isDeleteModalClose: PropTypes.bool.isRequired,
  isClearModalClose: PropTypes.bool.isRequired,
};

export default function InfoList({
  items = [],
  onDeleteModalOpen,
  isDeleteModalClose,
  onDeleteItemId,
  onClearModal,
  onUpdateItemData,
}) {
  const [sortBy, setSortBy] = useState('order');
  const [search, setSearch] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

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

  // Reset visible count whenever filters/sort/items change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, minAmount, maxAmount, dateFrom, dateTo, sortBy, items]);

  // IntersectionObserver — load next page when sentinel enters viewport
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + PAGE_SIZE);
        }
      },
      { rootMargin: '100px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  function handleClearFilters() {
    setSearch('');
    setMinAmount('');
    setMaxAmount('');
    setDateFrom('');
    setDateTo('');
  }

  return (
    <>
      {/* Search & filter bar */}
      <div className="filter-bar">
        <input
          type="text"
          className="filter-search"
          placeholder="Search by description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className={`btn filter-toggle-btn ${filtersOpen ? 'filter-toggle-btn--active' : ''}`}
          onClick={() => setFiltersOpen((p) => !p)}
        >
          {filtersOpen ? 'Hide filters' : 'Filters'}
          {hasActiveFilters && !filtersOpen && <span className="filter-dot" />}
        </button>
        {hasActiveFilters && (
          <button className="btn filter-clear-btn" onClick={handleClearFilters}>
            Clear
          </button>
        )}
      </div>

      {filtersOpen && (
        <div className="filter-panel">
          <div className="filter-group">
            <label className="filter-label">Amount</label>
            <div className="filter-range">
              <input
                type="number"
                className={`filter-input${amountRangeError ? ' form-input--error' : ''}`}
                placeholder="Min"
                value={minAmount}
                min="0"
                onChange={(e) => setMinAmount(e.target.value)}
              />
              <span className="filter-range-sep">—</span>
              <input
                type="number"
                className={`filter-input${amountRangeError ? ' form-input--error' : ''}`}
                placeholder="Max"
                value={maxAmount}
                min="0"
                onChange={(e) => setMaxAmount(e.target.value)}
              />
            </div>
            {amountRangeError && <span className="form-error">Min cannot exceed Max.</span>}
          </div>
          <div className="filter-group">
            <label className="filter-label">Date range</label>
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
            {dateRangeError && <span className="form-error">Start date cannot be after end date.</span>}
          </div>
        </div>
      )}

      <ul className="info-list">
        {items.length === 0 ? (
          <li className="info-list__empty">No transactions yet. Add your first one above.</li>
        ) : filtered.length === 0 ? (
          <li className="info-list__empty">No transactions match your filters.</li>
        ) : (
          filtered.slice(0, visibleCount).map((item) => (
            <InfoItem
              item={item}
              key={item.id}
              onDeleteModalOpen={onDeleteModalOpen}
              isDeleteModalClose={isDeleteModalClose}
              onDeleteItemId={onDeleteItemId}
              onUpdateItemData={onUpdateItemData}
            />
          ))
        )}
      </ul>

      {filtered.length > visibleCount && (
        <div ref={sentinelRef} className="info-list__sentinel">
          <span className="info-list__sentinel-text">Loading more…</span>
        </div>
      )}
      {filtered.length > 0 && filtered.length <= visibleCount && filtered.length > PAGE_SIZE && (
        <p className="info-list__count">Showing all {filtered.length} transactions</p>
      )}

      <div className="info-actions">
        <div className="info-sorting">
          <label className="info-sort-text" htmlFor="sort-select">
            Sort by:
          </label>
          <select
            className="info-sort-select btn"
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="order">order</option>
            <option value="highest">from highest</option>
            <option value="lowest">from lowest</option>
            <option value="description">description</option>
            <option value="first">from first</option>
            <option value="last">from last</option>
          </select>
        </div>
        <button className="btn" onClick={onClearModal}>
          Clear list
        </button>
      </div>
    </>
  );
}
