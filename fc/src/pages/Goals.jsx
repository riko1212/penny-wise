import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { DashboardSkeleton } from '../components/Skeleton';
import { showToast } from '../utils/toast';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import '../index.css';

const EMPTY_FORM = { name: '', targetAmount: '', categoryName: '', note: '', dueDate: '' };

export default function Goals() {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { t, lang, tc } = useLanguage();
  const { fmt, fromUAH, toUAH, CURRENCY_SYMBOLS, currency } = useCurrency();

  useEffect(() => {
    if (!currentUser) navigate('/');
  }, [currentUser, navigate]);

  const [goals, setGoals] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const dateLocale = lang === 'uk' ? 'uk-UA' : 'en-GB';

  function dueDateInfo(dueDate, reached) {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    const label = due.toLocaleDateString(dateLocale, { day: '2-digit', month: '2-digit', year: 'numeric' });
    if (reached) return { label: t('goals.reachedBy', { date: label }), overdue: false };
    if (diffDays < 0) return { label: t('goals.overdue', { date: label }), overdue: true };
    return { label: t('goals.daysLeft', { date: label, days: diffDays }), overdue: false };
  }

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    fetch(`/api/goals?userId=${currentUser.id}`)
      .then((r) => r.json())
      .then(setGoals)
      .catch(() => setError(t('goals.failedLoad')))
      .finally(() => setLoading(false));
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    fetch(`/api/categories?userId=${currentUser.id}&type=INCOME`)
      .then((r) => r.json())
      .then(setIncomeCategories)
      .catch(() => {});
  }, [currentUser]);

  function openAdd() {
    setEditingGoal(null);
    setFormData(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(goal) {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: String(Number(fromUAH(goal.targetAmount).toFixed(2))),
      categoryName: goal.categoryName,
      note: goal.note || '',
      dueDate: goal.dueDate ? new Date(goal.dueDate).toISOString().slice(0, 10) : '',
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingGoal(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim()) { showToast('error', t('goals.nameRequired')); return; }
    if (!formData.targetAmount || Number(formData.targetAmount) <= 0) { showToast('error', t('goals.amountRequired')); return; }
    if (!formData.categoryName) { showToast('error', t('goals.categoryRequired')); return; }

    const payload = {
      userId: currentUser.id,
      name: formData.name.trim(),
      targetAmount: toUAH(Number(formData.targetAmount)),
      categoryName: formData.categoryName,
      note: formData.note.trim() || null,
      dueDate: formData.dueDate ? new Date(formData.dueDate).getTime() : null,
    };

    setSaving(true);
    try {
      if (editingGoal) {
        const res = await fetch(`/api/goals/${editingGoal.id}?userId=${currentUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
        const updated = await fetch(`/api/goals?userId=${currentUser.id}`).then((r) => r.json());
        setGoals(updated);
      } else {
        const res = await fetch('/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
        const refreshed = await fetch(`/api/goals?userId=${currentUser.id}`).then((r) => r.json());
        setGoals(refreshed);
      }
      showToast('success', editingGoal ? t('goals.updated') : t('goals.created'));
      closeForm();
    } catch (err) {
      showToast('error', err.message || t('goals.failedSave'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(goal) {
    if (!window.confirm(t('goals.deleteConfirm', { name: goal.name }))) return;
    await fetch(`/api/goals/${goal.id}?userId=${currentUser.id}`, { method: 'DELETE' });
    setGoals((prev) => prev.filter((g) => g.id !== goal.id));
  }

  return (
    <>
      <Header />
      <div className="page-wrap">
        <div className="container">
          <div className="dashboard">
            <div className="goals__header">
              <h1 className="dashboard__title goals__header-title">{t('goals.title')}</h1>
              <button className="btn" onClick={openAdd}>{t('goals.addGoal')}</button>
            </div>

            {showForm && (
              <form className="goals__form" onSubmit={handleSubmit}>
                <h2 className="goals__form-title">{editingGoal ? t('goals.editGoal') : t('goals.newGoal')}</h2>
                <label className="profile-label">{t('goals.name')}</label>
                <input
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder={t('goals.namePlaceholder')}
                  maxLength={80}
                />
                <label className="profile-label">{CURRENCY_SYMBOLS[currency]} {t('goals.targetAmount')}</label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData((p) => ({ ...p, targetAmount: e.target.value }))}
                  placeholder="50000"
                />
                <label className="profile-label">{t('goals.incomeCategory')}</label>
                <select
                  className="form-input"
                  value={formData.categoryName}
                  onChange={(e) => setFormData((p) => ({ ...p, categoryName: e.target.value }))}
                >
                  <option value="">{t('goals.selectCategory')}</option>
                  {incomeCategories.map((c) => (
                    <option key={c.id} value={c.name}>{tc(c.name)}</option>
                  ))}
                </select>
                <label className="profile-label">{t('goals.note')}</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={formData.note}
                  onChange={(e) => setFormData((p) => ({ ...p, note: e.target.value }))}
                  placeholder={t('goals.notePlaceholder')}
                />
                <label className="profile-label">{t('goals.deadline')}</label>
                <input
                  className="form-input"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData((p) => ({ ...p, dueDate: e.target.value }))}
                />
                <div className="goals__form-actions">
                  <button className="btn" type="submit" disabled={saving}>
                    {saving ? t('goals.saving') : editingGoal ? t('goals.saveChanges') : t('goals.createGoal')}
                  </button>
                  <button className="btn goals__cancel-btn" type="button" onClick={closeForm}>
                    {t('goals.cancel')}
                  </button>
                </div>
              </form>
            )}

            {loading ? (
              <DashboardSkeleton />
            ) : error ? (
              <p className="api-error">{error}</p>
            ) : goals.length === 0 ? (
              <div className="dashboard__empty">
                <span className="dashboard__empty-icon">🎯</span>
                <h2 className="dashboard__empty-title">{t('goals.noGoals')}</h2>
                <p className="dashboard__empty-text">{t('goals.noGoalsText')}</p>
                <button className="btn" onClick={openAdd}>{t('goals.addGoalBtn')}</button>
              </div>
            ) : (
              <div className="goals__grid">
                {goals.map((goal) => {
                  const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                  const reached = goal.currentAmount >= goal.targetAmount;
                  const barColor = reached ? '#69db7c' : '#5c7cfa';
                  const due = dueDateInfo(goal.dueDate, reached);

                  return (
                    <div key={goal.id} className="goals__card">
                      <div className="goals__card-header">
                        <span className="goals__card-title">{goal.name}</span>
                        <div className="goals__card-actions">
                          <button
                            className="btn goals__action-btn"
                            onClick={() => openEdit(goal)}
                            title="Edit"
                          >✎</button>
                          <button
                            className="btn goals__action-btn goals__action-btn--delete"
                            onClick={() => handleDelete(goal)}
                            title="Delete"
                          >✕</button>
                        </div>
                      </div>
                      {goal.note && <p className="goals__card-note">{goal.note}</p>}
                      <div className="goals__bar-wrap">
                        <div
                          className="goals__bar"
                          style={{ width: `${pct}%`, background: barColor }}
                        />
                      </div>
                      <div className="goals__amounts">
                        <span style={{ color: barColor, fontWeight: 600 }}>{fmt(goal.currentAmount)}</span>
                        <span>{pct.toFixed(0)}%</span>
                        <span>{fmt(goal.targetAmount)}</span>
                      </div>
                      <p className="goals__category">{t('goals.category', { name: tc(goal.categoryName) })}</p>
                      {due && (
                        <p className={`goals__deadline${due.overdue ? ' goals__deadline--overdue' : ''}`}>
                          {due.label}
                        </p>
                      )}
                      {reached && (
                        <p className="goals__reached">{t('goals.reached')}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
