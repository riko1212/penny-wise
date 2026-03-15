import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatUAH } from '../utils/format';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { DashboardSkeleton } from '../components/Skeleton';
import { showToast } from '../utils/toast';
import '../index.css';

const EMPTY_FORM = { name: '', targetAmount: '', categoryName: '', note: '', dueDate: '' };

function dueDateInfo(dueDate, reached) {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const now = new Date();
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  const label = due.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
  if (reached) return { label: `Досягнуто до ${label}`, overdue: false };
  if (diffDays < 0) return { label: `Прострочено (${label})`, overdue: true };
  return { label: `До ${label} · ${diffDays} дн.`, overdue: false };
}

export default function Goals() {
  const navigate = useNavigate();
  const [currentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('loggedInUser')); } catch { return null; }
  });

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

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    fetch(`/api/goals?userId=${currentUser.id}`)
      .then((r) => r.json())
      .then(setGoals)
      .catch(() => setError('Failed to load goals.'))
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
      targetAmount: String(goal.targetAmount),
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
    if (!formData.name.trim()) { showToast('error', 'Name is required.'); return; }
    if (!formData.targetAmount || Number(formData.targetAmount) <= 0) { showToast('error', 'Target amount must be greater than 0.'); return; }
    if (!formData.categoryName) { showToast('error', 'Please select a category.'); return; }

    const payload = {
      userId: currentUser.id,
      name: formData.name.trim(),
      targetAmount: Number(formData.targetAmount),
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
        // refresh goals to get updated currentAmount
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
      showToast('success', editingGoal ? 'Goal updated.' : 'Goal created.');
      closeForm();
    } catch (err) {
      showToast('error', err.message || 'Failed to save goal.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(goal) {
    if (!window.confirm(`Delete goal "${goal.name}"?`)) return;
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
              <h1 className="dashboard__title" style={{ marginBottom: 0 }}>Goals</h1>
              <button className="btn" onClick={openAdd}>+ Add goal</button>
            </div>

            {showForm && (
              <form className="goals__form" onSubmit={handleSubmit}>
                <h2 className="goals__form-title">{editingGoal ? 'Edit goal' : 'New goal'}</h2>
                <label className="profile-label">Name</label>
                <input
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Vacation"
                  maxLength={80}
                />
                <label className="profile-label">Target amount (₴)</label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData((p) => ({ ...p, targetAmount: e.target.value }))}
                  placeholder="50000"
                />
                <label className="profile-label">Income category</label>
                <select
                  className="form-input"
                  value={formData.categoryName}
                  onChange={(e) => setFormData((p) => ({ ...p, categoryName: e.target.value }))}
                >
                  <option value="">— select category —</option>
                  {incomeCategories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <label className="profile-label">Note (optional)</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={formData.note}
                  onChange={(e) => setFormData((p) => ({ ...p, note: e.target.value }))}
                  placeholder="Any details..."
                />
                <label className="profile-label">Deadline (optional)</label>
                <input
                  className="form-input"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData((p) => ({ ...p, dueDate: e.target.value }))}
                />
                <div className="goals__form-actions">
                  <button className="btn" type="submit" disabled={saving}>
                    {saving ? 'Saving…' : editingGoal ? 'Save changes' : 'Create goal'}
                  </button>
                  <button className="btn" type="button" onClick={closeForm} style={{ background: 'transparent', border: '1px solid var(--glass-border)' }}>
                    Cancel
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
                <h2 className="dashboard__empty-title">No goals yet</h2>
                <p className="dashboard__empty-text">Create your first savings goal and track your progress.</p>
                <button className="btn" onClick={openAdd}>Add goal</button>
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
                        <span style={{ color: barColor, fontWeight: 600 }}>{formatUAH(goal.currentAmount)}</span>
                        <span>{pct.toFixed(0)}%</span>
                        <span>{formatUAH(goal.targetAmount)}</span>
                      </div>
                      <p className="goals__category">Category: {goal.categoryName}</p>
                      {due && (
                        <p className={`goals__deadline${due.overdue ? ' goals__deadline--overdue' : ''}`}>
                          {due.label}
                        </p>
                      )}
                      {reached && (
                        <p className="goals__reached">Goal reached!</p>
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
