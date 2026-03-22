import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatUAH } from '../utils/format';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChartTooltip from '../components/ChartTooltip';
import { DashboardSkeleton } from '../components/Skeleton';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useLanguage } from '../context/LanguageContext';
import '../index.css';

function formatDate(epochMs) {
  if (!epochMs) return '';
  return new Date(epochMs).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const EXPENSE_COLORS = ['#ff6b6b', '#ff8e53', '#ffd43b', '#ff922b', '#f783ac', '#e64980', '#cc5de8', '#845ef7', '#5c7cfa', '#339af0'];
const INCOME_COLORS  = ['#69db7c', '#38d9a9', '#4dabf7', '#74c0fc', '#a9e34b', '#63e6be', '#94d82d', '#20c997', '#1c7ed6', '#7048e8'];

export default function Dashboard() {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { t, tc } = useLanguage();

  useEffect(() => {
    if (!currentUser) navigate('/');
  }, [currentUser, navigate]);

  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [expenseSummary, setExpenseSummary] = useState([]);
  const [incomeSummary, setIncomeSummary] = useState([]);
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    Promise.all([
      fetch(`/api/transactions/total?userId=${currentUser.id}&type=INCOME`).then((r) => r.json()),
      fetch(`/api/transactions/total?userId=${currentUser.id}&type=EXPENSE`).then((r) => r.json()),
      fetch(`/api/transactions/summary?userId=${currentUser.id}&type=EXPENSE`).then((r) => r.json()),
      fetch(`/api/transactions/summary?userId=${currentUser.id}&type=INCOME`).then((r) => r.json()),
      fetch(`/api/transactions/recent?userId=${currentUser.id}`).then((r) => r.json()),
    ])
      .then(([inc, exp, expSum, incSum, recent]) => {
        setIncome(inc);
        setExpense(exp);
        setExpenseSummary(expSum.map((e) => ({ name: e.categoryName, value: Number(Number(e.total).toFixed(2)) })));
        setIncomeSummary(incSum.map((e) => ({ name: e.categoryName, value: Number(Number(e.total).toFixed(2)) })));
        setRecentTx(recent);
      })
      .catch(() => setError(t('dashboard.errorLoad')))
      .finally(() => setLoading(false));
  }, [currentUser]);

  const balance = income - expense;
  const isEmpty = income === 0 && expense === 0 && expenseSummary.length === 0 && incomeSummary.length === 0;

  return (
    <>
      <Header />
      <div className="page-wrap">
        <div className="container">
          <div className="dashboard">
            <h1 className="dashboard__title">{t('dashboard.title')}</h1>
            {loading ? (
              <DashboardSkeleton />
            ) : error ? (
              <p className="api-error">{error}</p>
            ) : isEmpty ? (
              <div className="dashboard__empty">
                <span className="dashboard__empty-icon">📊</span>
                <h2 className="dashboard__empty-title">{t('dashboard.noTransactions')}</h2>
                <p className="dashboard__empty-text">{t('dashboard.noTransactionsText')}</p>
                <div className="dashboard__empty-actions">
                  <Link to="/income" className="btn">{t('dashboard.addIncome')}</Link>
                  <Link to="/main" className="btn">{t('dashboard.addExpenses')}</Link>
                </div>
              </div>
            ) : (
              <>
                <div className="dashboard__cards">
                  <div className="dashboard__card dashboard__card--income">
                    <span className="dashboard__card-label">{t('dashboard.totalIncome')}</span>
                    <span className="dashboard__card-amount">{formatUAH(income)}</span>
                  </div>
                  <div className="dashboard__card dashboard__card--expense">
                    <span className="dashboard__card-label">{t('dashboard.totalExpenses')}</span>
                    <span className="dashboard__card-amount">{formatUAH(expense)}</span>
                  </div>
                  <div className={`dashboard__card dashboard__card--balance ${balance >= 0 ? 'dashboard__card--positive' : 'dashboard__card--negative'}`}>
                    <span className="dashboard__card-label">{t('dashboard.balance')}</span>
                    <span className="dashboard__card-amount">
                      {balance >= 0 ? '+' : ''}{formatUAH(Math.abs(balance))}
                    </span>
                  </div>
                </div>

                {recentTx.length > 0 && (
                  <div className="dashboard__recent">
                    <div className="dashboard__recent-header">
                      <h2 className="dashboard__chart-title">{t('dashboard.recentTransactions')}</h2>
                      <div className="dashboard__recent-links">
                        <Link to="/income" className="dashboard__see-all">{t('nav.income')}</Link>
                        <Link to="/main" className="dashboard__see-all">{t('nav.expenses')}</Link>
                      </div>
                    </div>
                    <ul className="dashboard__recent-list">
                      {recentTx.map((tx) => (
                        <li key={tx.id} className="dashboard__recent-item">
                          <span className={`dashboard__recent-badge dashboard__recent-badge--${tx.type === 'INCOME' ? 'income' : 'expense'}`}>
                            {tx.type === 'INCOME' ? '+' : '−'}
                          </span>
                          <div className="dashboard__recent-info">
                            <span className="dashboard__recent-topic">{tx.topic}</span>
                            <span className="dashboard__recent-cat">{tc(tx.categoryName)}</span>
                          </div>
                          <div className="dashboard__recent-right">
                            <span className={`dashboard__recent-amount dashboard__recent-amount--${tx.type === 'INCOME' ? 'income' : 'expense'}`}>
                              {tx.type === 'INCOME' ? '+' : '−'}{formatUAH(tx.income)}
                            </span>
                            <span className="dashboard__recent-date">{formatDate(tx.date)}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="dashboard__charts">
                  {expenseSummary.length > 0 && (
                    <div className="dashboard__chart">
                      <h2 className="dashboard__chart-title">{t('dashboard.expensesByCategory')}</h2>
                      <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                          <Pie data={expenseSummary.map((e) => ({ ...e, name: tc(e.name) }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                            {expenseSummary.map((_, i) => (
                              <Cell key={i} fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<ChartTooltip />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {incomeSummary.length > 0 && (
                    <div className="dashboard__chart">
                      <h2 className="dashboard__chart-title">{t('dashboard.incomeByCategory')}</h2>
                      <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                          <Pie data={incomeSummary.map((e) => ({ ...e, name: tc(e.name) }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                            {incomeSummary.map((_, i) => (
                              <Cell key={i} fill={INCOME_COLORS[i % INCOME_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<ChartTooltip />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
