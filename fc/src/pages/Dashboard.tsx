import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChartTooltip from '../components/ChartTooltip';
import { DashboardSkeleton } from '../components/Skeleton';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import '../index.css';
import apiFetch from '../utils/apiFetch';
import type { Transaction, SummaryItem } from '../types';

interface ChartEntry { name: string; value: number; }
interface BarEntry { period: string; income: number; expense: number; }

function formatDate(epochMs: number | null | undefined): string {
  if (!epochMs) return '';
  return new Date(epochMs).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const EXPENSE_COLORS = [
  '#ff6b6b', '#ff922b', '#ffd43b', '#f783ac', '#cc5de8',
  '#845ef7', '#5c7cfa', '#339af0', '#e64980', '#ff8e53',
  '#ff4757', '#ffa502', '#a29bfe', '#fd79a8', '#e17055',
  '#fdcb6e', '#d63031', '#e84393', '#6c5ce7', '#b8860b',
];
const INCOME_COLORS = [
  '#69db7c', '#38d9a9', '#4dabf7', '#a9e34b', '#63e6be',
  '#94d82d', '#20c997', '#1c7ed6', '#7048e8', '#74c0fc',
  '#00cec9', '#55efc4', '#81ecec', '#26de81', '#2bcbba',
  '#45aaf2', '#4b7bec', '#8854d0', '#00b894', '#a3cb38',
];

export default function Dashboard() {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { t, tc } = useLanguage();
  const { fmt } = useCurrency();

  useEffect(() => {
    if (!currentUser) navigate('/');
  }, [currentUser, navigate]);

  const [period, setPeriod] = useState<string>('month');
  const [txFilter, setTxFilter] = useState<'all' | 'INCOME' | 'EXPENSE'>('all');
  const [income, setIncome] = useState<number>(0);
  const [expense, setExpense] = useState<number>(0);
  const [expenseSummary, setExpenseSummary] = useState<ChartEntry[]>([]);
  const [incomeSummary, setIncomeSummary] = useState<ChartEntry[]>([]);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [barData, setBarData] = useState<BarEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    const now = new Date();
    const curMonth = now.getMonth() + 1;
    const curYear = now.getFullYear();
    const periodParams =
      period === 'month' ? `&month=${curMonth}&year=${curYear}` :
      period === 'year'  ? `&year=${curYear}` :
      '';
    Promise.all([
      apiFetch(`/api/transactions/total?userId=${currentUser.id}&type=INCOME${periodParams}`).then((r) => r.json()),
      apiFetch(`/api/transactions/total?userId=${currentUser.id}&type=EXPENSE${periodParams}`).then((r) => r.json()),
      apiFetch(`/api/transactions/summary?userId=${currentUser.id}&type=EXPENSE${periodParams}`).then((r) => r.json()),
      apiFetch(`/api/transactions/summary?userId=${currentUser.id}&type=INCOME${periodParams}`).then((r) => r.json()),
      apiFetch(`/api/transactions/recent?userId=${currentUser.id}`).then((r) => r.json()),
      apiFetch(`/api/transactions/history?userId=${currentUser.id}&type=INCOME&groupBy=month`).then((r) => r.json()),
      apiFetch(`/api/transactions/history?userId=${currentUser.id}&type=EXPENSE&groupBy=month`).then((r) => r.json()),
    ])
      .then(([inc, exp, expSum, incSum, recent, incHistory, expHistory]: [
        number, number,
        SummaryItem[], SummaryItem[],
        Transaction[],
        Array<{ period: string; total: number }>,
        Array<{ period: string; total: number }>
      ]) => {
        setIncome(inc);
        setExpense(exp);
        setExpenseSummary(expSum.map((e) => ({ name: e.categoryName, value: Number(Number(e.total).toFixed(2)) })));
        setIncomeSummary(incSum.map((e) => ({ name: e.categoryName, value: Number(Number(e.total).toFixed(2)) })));
        setRecentTx(recent);

        const allPeriods = [...new Set([...incHistory.map((d) => d.period), ...expHistory.map((d) => d.period)])].sort();
        const merged = allPeriods
          .filter((p) => period === 'year' ? p.startsWith(String(curYear)) : true)
          .map((p) => ({
            period: p,
            income: incHistory.find((d) => d.period === p)?.total ?? 0,
            expense: expHistory.find((d) => d.period === p)?.total ?? 0,
          }));
        setBarData(merged);
      })
      .catch(() => setError(t('dashboard.errorLoad')))
      .finally(() => setLoading(false));
  }, [currentUser, period]);

  const balance = income - expense;
  const isEmpty = income === 0 && expense === 0 && expenseSummary.length === 0 && incomeSummary.length === 0;

  return (
    <>
      <Header />
      <div className="page-wrap">
        <div className="container">
          <div className="dashboard">
            <h1 className="dashboard__title">{t('dashboard.title')}</h1>
            <div className="dashboard__period-filter">
              {['month', 'year', 'all'].map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`dashboard__period-btn${period === p ? ' dashboard__period-btn--active' : ''}`}
                  onClick={() => setPeriod(p)}
                >
                  {t(`dashboard.${p === 'month' ? 'thisMonth' : p === 'year' ? 'thisYear' : 'allTime'}`)}
                </button>
              ))}
            </div>

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
                  <Link to="/income" className="dashboard__card dashboard__card--income dashboard__card--link">
                    <span className="dashboard__card-label">{t('dashboard.totalIncome')}</span>
                    <span className="dashboard__card-amount">{fmt(income)}</span>
                  </Link>
                  <Link to="/main" className="dashboard__card dashboard__card--expense dashboard__card--link">
                    <span className="dashboard__card-label">{t('dashboard.totalExpenses')}</span>
                    <span className="dashboard__card-amount">{fmt(expense)}</span>
                    {income > 0 && (
                      <span className={`dashboard__card-pct${expense > income ? ' dashboard__card-pct--over' : ''}`}>
                        {((expense / income) * 100).toFixed(1)}% {t('dashboard.ofIncome')}
                      </span>
                    )}
                  </Link>
                  <div className={`dashboard__card dashboard__card--balance ${balance >= 0 ? 'dashboard__card--positive' : 'dashboard__card--negative'}`}>
                    <span className="dashboard__card-label">{t('dashboard.balance')}</span>
                    <span className="dashboard__card-amount">
                      {balance >= 0 ? '+' : ''}{fmt(Math.abs(balance))}
                    </span>
                    {income > 0 && (
                      <div className="dashboard__balance-bar-wrap">
                        <div
                          className={`dashboard__balance-bar${balance < 0 ? ' dashboard__balance-bar--over' : ''}`}
                          style={{ width: `${Math.min(100, Math.max(0, (balance / income) * 100)).toFixed(1)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {period !== 'month' && barData.length > 0 && (
                  <div className="dashboard__chart dashboard__chart--wide" style={{ marginTop: 40 }}>
                    <h2 className="dashboard__chart-title">{t('dashboard.incomeVsExpenses')}</h2>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={barData} margin={{ top: 8, right: 24, left: 16, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                        <XAxis dataKey="period" stroke="#aaa" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#aaa" tick={{ fontSize: 12 }} />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend />
                        <Bar dataKey="income" name={t('nav.income')} fill="#69db7c" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" name={t('nav.expenses')} fill="#ff6b6b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="dashboard__charts">
                  {expenseSummary.length > 0 && (
                    <div className="dashboard__chart">
                      <h2 className="dashboard__chart-title">{t('dashboard.expensesByCategory')}</h2>
                      <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                          <Pie data={expenseSummary.map((e) => ({ ...e, name: tc(e.name) }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110}>
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
                          <Pie data={incomeSummary.map((e) => ({ ...e, name: tc(e.name) }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110}>
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

                {recentTx.length > 0 && (
                  <div className="dashboard__recent">
                    <div className="dashboard__recent-header">
                      <h2 className="dashboard__chart-title">{t('dashboard.recentTransactions')}</h2>
                      <div className="dashboard__recent-links">
                        {(['all', 'INCOME', 'EXPENSE'] as const).map((f) => (
                          <button
                            key={f}
                            type="button"
                            className={`dashboard__see-all${txFilter === f ? ' dashboard__see-all--active' : ''}`}
                            onClick={() => setTxFilter(f)}
                          >
                            {f === 'all' ? t('dashboard.seeAll') : f === 'INCOME' ? t('nav.income') : t('nav.expenses')}
                          </button>
                        ))}
                      </div>
                    </div>
                    <ul className="dashboard__recent-list">
                      {recentTx.filter((tx) => txFilter === 'all' || tx.type === txFilter).slice(0, 10).map((tx) => (
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
                              {tx.type === 'INCOME' ? '+' : '−'}{fmt(tx.income)}
                            </span>
                            <span className="dashboard__recent-date">{formatDate(tx.date)}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
