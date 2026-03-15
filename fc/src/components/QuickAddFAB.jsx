import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { showToast } from '../utils/toast';

const HIDDEN_PATHS = ['/', '/register', '/restore-pass'];

export default function QuickAddFAB() {
  const location = useLocation();
  const [currentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('loggedInUser')); } catch { return null; }
  });

  const [open, setOpen] = useState(false);
  const [type, setType] = useState('EXPENSE');
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !currentUser) return;
    fetch(`/api/categories?userId=${currentUser.id}&type=${type}`)
      .then((r) => r.json())
      .then((cats) => {
        setCategories(cats);
        setCategoryName(cats[0]?.name || '');
      })
      .catch(() => {});
  }, [open, type, currentUser]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const isHidden = !currentUser || HIDDEN_PATHS.includes(location.pathname);
  if (isHidden) return null;

  function handleTypeChange(newType) {
    setType(newType);
    setCategoryName('');
  }

  function handleClose() {
    setOpen(false);
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().slice(0, 10));
    setType('EXPENSE');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!description.trim()) { showToast('error', 'Description is required.'); return; }
    if (!amount || Number(amount) <= 0) { showToast('error', 'Amount must be greater than 0.'); return; }
    if (!categoryName) { showToast('error', 'Please select a category.'); return; }
    if (!date) { showToast('error', 'Date is required.'); return; }

    setSaving(true);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          topic: description.trim(),
          income: Number(amount),
          categoryName,
          type,
          date: new Date(date).getTime(),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      showToast('success', `${type === 'INCOME' ? 'Income' : 'Expense'} added.`);
      handleClose();
    } catch (err) {
      showToast('error', err.message || 'Failed to add transaction.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        className={`fab${open ? ' fab--open' : ''}`}
        onClick={() => (open ? handleClose() : setOpen(true))}
        title={open ? 'Close' : 'Quick add transaction'}
        aria-label={open ? 'Close' : 'Add transaction'}
      >
        <span className="fab__icon">+</span>
      </button>

      {open && (
        <>
          <div className="fab-backdrop" onClick={handleClose} />
          <div className="fab-modal" role="dialog" aria-modal="true" aria-label="Quick add transaction">
            <div className="fab-modal__header">
              <h2 className="fab-modal__title">Quick add</h2>
              <button type="button" className="fab-modal__close" onClick={handleClose} aria-label="Close">✕</button>
            </div>

            <div className="fab-type-toggle">
              <button
                type="button"
                className={`fab-type-btn${type === 'EXPENSE' ? ' fab-type-btn--active fab-type-btn--expense' : ''}`}
                onClick={() => handleTypeChange('EXPENSE')}
              >
                Expense
              </button>
              <button
                type="button"
                className={`fab-type-btn${type === 'INCOME' ? ' fab-type-btn--active fab-type-btn--income' : ''}`}
                onClick={() => handleTypeChange('INCOME')}
              >
                Income
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="profile-label">Description</label>
              <input
                className="form-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Grocery shopping"
                maxLength={100}
                autoFocus
              />

              <label className="profile-label">Amount (₴)</label>
              <input
                className="form-input"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />

              <label className="profile-label">Category</label>
              <select
                className="form-input"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              >
                <option value="">— select category —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>

              <label className="profile-label">Date</label>
              <input
                className="form-input"
                type="date"
                value={date}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDate(e.target.value)}
              />

              <button type="submit" className="btn fab-modal__submit" disabled={saving}>
                {saving ? 'Saving…' : `Add ${type === 'INCOME' ? 'income' : 'expense'}`}
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );
}
