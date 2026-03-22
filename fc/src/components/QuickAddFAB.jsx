import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { showToast } from '../utils/toast';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { todayStr } from '../constants';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';

const HIDDEN_PATHS = ['/', '/register', '/restore-pass'];

export default function QuickAddFAB() {
  const location = useLocation();
  const currentUser = useCurrentUser();
  const { t, tc } = useLanguage();
  const { toUAH, CURRENCY_SYMBOLS, currency } = useCurrency();

  const [open, setOpen] = useState(false);
  const [type, setType] = useState('EXPENSE');
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayStr);
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

  function handleClose() {
    setOpen(false);
    setAmount('');
    setDescription('');
    setDate(todayStr());
    setType('EXPENSE');
  }

  useEscapeKey(handleClose, open);

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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!description.trim()) { showToast('error', t('fab.descriptionRequired')); return; }
    if (!amount || Number(amount) <= 0) { showToast('error', t('fab.amountRequired')); return; }
    if (!categoryName) { showToast('error', t('fab.categoryRequired')); return; }
    if (!date) { showToast('error', t('fab.dateRequired')); return; }

    setSaving(true);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          topic: description.trim(),
          income: toUAH(Number(amount)),
          categoryName,
          type,
          date: new Date(date).getTime(),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      showToast('success', type === 'INCOME' ? t('fab.addedIncome') : t('fab.addedExpense'));
      handleClose();
    } catch (err) {
      showToast('error', err.message || t('fab.failedAdd'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        className={`fab${open ? ' fab--open' : ''}`}
        onClick={() => (open ? handleClose() : setOpen(true))}
        title={open ? t('fab.close') : t('fab.quickAdd')}
        aria-label={open ? t('fab.close') : t('fab.quickAdd')}
      >
        <span className="fab__icon">+</span>
      </button>

      {open && (
        <>
          <div className="fab-backdrop" onClick={handleClose} />
          <div className="fab-modal" role="dialog" aria-modal="true" aria-label={t('fab.quickAdd')}>
            <div className="fab-modal__header">
              <h2 className="fab-modal__title">{t('fab.quickAdd')}</h2>
              <button type="button" className="fab-modal__close" onClick={handleClose} aria-label={t('fab.close')}>✕</button>
            </div>

            <div className="fab-type-toggle">
              <button
                type="button"
                className={`fab-type-btn${type === 'EXPENSE' ? ' fab-type-btn--active fab-type-btn--expense' : ''}`}
                onClick={() => handleTypeChange('EXPENSE')}
              >
                {t('fab.expense')}
              </button>
              <button
                type="button"
                className={`fab-type-btn${type === 'INCOME' ? ' fab-type-btn--active fab-type-btn--income' : ''}`}
                onClick={() => handleTypeChange('INCOME')}
              >
                {t('fab.income')}
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="profile-label">{t('fab.description')}</label>
              <input
                className="form-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('fab.descriptionPlaceholder')}
                maxLength={100}
                autoFocus
              />

              <label className="profile-label">{CURRENCY_SYMBOLS[currency]} {t('fab.amount')}</label>
              <input
                className="form-input"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />

              <label className="profile-label">{t('fab.category')}</label>
              <select
                className="form-input"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              >
                <option value="">{t('fab.selectCategory')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{tc(c.name)}</option>
                ))}
              </select>

              <label className="profile-label">{t('fab.date')}</label>
              <input
                className="form-input"
                type="date"
                value={date}
                max={todayStr()}
                onChange={(e) => setDate(e.target.value)}
              />

              <button type="submit" className="btn fab-modal__submit" disabled={saving}>
                {saving ? t('fab.saving') : type === 'INCOME' ? t('fab.addIncome') : t('fab.addExpense')}
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );
}
