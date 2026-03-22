import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChartTooltip from '../components/ChartTooltip';
import { HistorySkeleton } from '../components/Skeleton';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import '../index.css';

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`;
const prevMonth = (() => {
  const d = new Date(currentYear, now.getMonth() - 1, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
})();
const prevYear = currentYear - 1;

const COLORS = ['#5c7cfa','#ff6b6b','#69db7c','#ffd43b','#f783ac','#38d9a9','#ff922b','#cc5de8','#4dabf7','#94d82d'];

function getChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return (((current - previous) / previous) * 100).toFixed(1);
}

export default function History() {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { t, tc } = useLanguage();
  const { fmt } = useCurrency();

  useEffect(() => {
    if (!currentUser) navigate('/');
  }, [currentUser, navigate]);

  const [type, setType] = useState('EXPENSE');
  const [groupBy, setGroupBy] = useState('month');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [viewMode, setViewMode] = useState('total');
  const [catData, setCatData] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    fetch(`/api/transactions/history?userId=${currentUser.id}&type=${type}&groupBy=${groupBy}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError(t('history.errorLoad')))
      .finally(() => setLoading(false));
  }, [currentUser, type, groupBy]);

  useEffect(() => {
    if (!currentUser || viewMode !== 'category') return;
    setCatLoading(true);
    setCatError(null);
    fetch(`/api/transactions/history/categories?userId=${currentUser.id}&type=${type}&groupBy=${groupBy}`)
      .then((r) => r.json())
      .then(setCatData)
      .catch(() => setCatError(t('history.errorCatLoad')))
      .finally(() => setCatLoading(false));
  }, [currentUser, type, groupBy, viewMode]);

  const getTotal = (period) => data.find((d) => d.period === String(period))?.total ?? 0;

  const thisMonth = getTotal(currentMonth);
  const lastMonth = getTotal(prevMonth);
  const thisYear = getTotal(currentYear);
  const lastYear = getTotal(prevYear);

  const monthChange = getChange(thisMonth, lastMonth);
  const yearChange = getChange(thisYear, lastYear);

  const color = type === 'EXPENSE' ? '#ff6b6b' : '#69db7c';

  const categories = [...new Set(catData.map((d) => d.categoryName))];
  const currentPeriod = groupBy === 'year' ? String(currentYear) : currentMonth;
  const prevPeriod = groupBy === 'year' ? String(prevYear) : prevMonth;

  function getCatTotal(period, cat) {
    return catData.find((d) => d.period === period && d.categoryName === cat)?.total ?? 0;
  }

  const stackedData = [...new Set(catData.map((d) => d.period))].sort().map((period) => {
    const entry = { period };
    categories.forEach((cat) => { entry[tc(cat)] = getCatTotal(period, cat); });
    return entry;
  });

  return (
    <>
      <Header />
      <div className="page-wrap">
        <div className="container">
          <div className="dashboard">
            <h1 className="dashboard__title">{t('history.title')}</h1>

            <div className="history__controls">
              <div className="history__toggle">
                <button
                  className={`btn ${type === 'EXPENSE' ? 'history__toggle-btn--active' : ''}`}
                  onClick={() => setType('EXPENSE')}
                >
                  {t('history.expenses')}
                </button>
                <button
                  className={`btn ${type === 'INCOME' ? 'history__toggle-btn--active' : ''}`}
                  onClick={() => setType('INCOME')}
                >
                  {t('history.income')}
                </button>
              </div>
              <div className="history__toggle">
                <button
                  className={`btn ${groupBy === 'month' ? 'history__toggle-btn--active' : ''}`}
                  onClick={() => setGroupBy('month')}
                >
                  {t('history.monthly')}
                </button>
                <button
                  className={`btn ${groupBy === 'year' ? 'history__toggle-btn--active' : ''}`}
                  onClick={() => setGroupBy('year')}
                >
                  {t('history.yearly')}
                </button>
              </div>
              <div className="history__toggle">
                <button
                  className={`btn ${viewMode === 'total' ? 'history__toggle-btn--active' : ''}`}
                  onClick={() => setViewMode('total')}
                >
                  {t('history.total')}
                </button>
                <button
                  className={`btn ${viewMode === 'category' ? 'history__toggle-btn--active' : ''}`}
                  onClick={() => setViewMode('category')}
                >
                  {t('history.byCategory')}
                </button>
              </div>
            </div>

            {viewMode === 'total' && (
              loading ? (
                <HistorySkeleton />
              ) : error ? (
                <p className="api-error">{error}</p>
              ) : (
                <>
                  <div className="dashboard__cards history__cards">
                    <div className="dashboard__card">
                      <span className="dashboard__card-label">{t('history.thisMonth')}</span>
                      <span className="dashboard__card-amount" style={{ color }}>{fmt(thisMonth)}</span>
                      <span className={`history__change ${monthChange >= 0 ? 'history__change--up' : 'history__change--down'}`}>
                        {monthChange >= 0 ? '↑' : '↓'} {Math.abs(monthChange)}% {t('history.vsLastMonth')}
                      </span>
                    </div>
                    <div className="dashboard__card">
                      <span className="dashboard__card-label">{t('history.lastMonth')}</span>
                      <span className="dashboard__card-amount" style={{ color: '#aaa' }}>{fmt(lastMonth)}</span>
                    </div>
                    <div className="dashboard__card">
                      <span className="dashboard__card-label">{t('history.thisYear')}</span>
                      <span className="dashboard__card-amount" style={{ color }}>{fmt(thisYear)}</span>
                      <span className={`history__change ${yearChange >= 0 ? 'history__change--up' : 'history__change--down'}`}>
                        {yearChange >= 0 ? '↑' : '↓'} {Math.abs(yearChange)}% {t('history.vsLastYear')}
                      </span>
                    </div>
                    <div className="dashboard__card">
                      <span className="dashboard__card-label">{t('history.lastYear')}</span>
                      <span className="dashboard__card-amount" style={{ color: '#aaa' }}>{fmt(lastYear)}</span>
                    </div>
                  </div>

                  {data.length === 0 ? (
                    <p className="loading">{t('history.noData')}</p>
                  ) : (
                    <div className="dashboard__chart history__chart-wide">
                      <ResponsiveContainer width="100%" height={360}>
                        <BarChart data={data} margin={{ top: 8, right: 24, left: 16, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="period" stroke="#aaa" tick={{ fontSize: 12 }} />
                          <YAxis stroke="#aaa" tick={{ fontSize: 12 }} />
                          <Tooltip
                            content={<ChartTooltip valueLabel={type === 'EXPENSE' ? t('history.expenses') : t('history.income')} />}
                          />
                          <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                            {data.map((_, i) => (
                              <Cell key={i} fill={color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </>
              )
            )}

            {viewMode === 'category' && (
              catLoading ? (
                <HistorySkeleton />
              ) : catError ? (
                <p className="api-error">{catError}</p>
              ) : catData.length === 0 ? (
                <p className="loading">{t('history.noCatData')}</p>
              ) : (
                <>
                  <div className="dashboard__chart history__cat-section">
                    <table className="history__cat-table">
                      <thead>
                        <tr>
                          <th className="history__cat-th">{t('history.category')}</th>
                          <th className="history__cat-th">{currentPeriod}</th>
                          <th className="history__cat-th">{prevPeriod}</th>
                          <th className="history__cat-th">{t('history.change')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((cat, i) => {
                          const curr = getCatTotal(currentPeriod, cat);
                          const prev = getCatTotal(prevPeriod, cat);
                          const change = getChange(curr, prev);
                          const up = Number(change) >= 0;
                          return (
                            <tr key={cat} className="history__cat-row">
                              <td className="history__cat-td">
                                <span
                                  className="history__cat-dot"
                                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                                />
                                {tc(cat)}
                              </td>
                              <td className="history__cat-td">{fmt(curr)}</td>
                              <td className="history__cat-td history__cat-td--muted">{fmt(prev)}</td>
                              <td className="history__cat-td">
                                <span style={{ color: up ? '#69db7c' : '#ff6b6b', fontWeight: 600 }}>
                                  {up ? '↑' : '↓'} {Math.abs(change)}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="dashboard__chart history__chart-wide">
                    <ResponsiveContainer width="100%" height={360}>
                      <BarChart data={stackedData} margin={{ top: 8, right: 24, left: 16, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="period" stroke="#aaa" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#aaa" tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        {categories.map((cat, i) => (
                          <Bar
                            key={cat}
                            dataKey={tc(cat)}
                            stackId="a"
                            fill={COLORS[i % COLORS.length]}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
