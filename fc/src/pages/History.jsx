import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';
import { formatUAH } from '../utils/format';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChartTooltip from '../components/ChartTooltip';
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
  const [currentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('loggedInUser')); } catch { return null; }
  });

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
      .catch(() => setError('Failed to load history. Check your connection.'))
      .finally(() => setLoading(false));
  }, [currentUser, type, groupBy]);

  useEffect(() => {
    if (!currentUser || viewMode !== 'category') return;
    setCatLoading(true);
    setCatError(null);
    fetch(`/api/transactions/history/categories?userId=${currentUser.id}&type=${type}&groupBy=${groupBy}`)
      .then((r) => r.json())
      .then(setCatData)
      .catch(() => setCatError('Failed to load category history. Check your connection.'))
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

  // Category view helpers
  const categories = [...new Set(catData.map((d) => d.categoryName))];
  const currentPeriod = groupBy === 'year' ? String(currentYear) : currentMonth;
  const prevPeriod = groupBy === 'year' ? String(prevYear) : prevMonth;

  function getCatTotal(period, cat) {
    return catData.find((d) => d.period === period && d.categoryName === cat)?.total ?? 0;
  }

  const stackedData = [...new Set(catData.map((d) => d.period))].sort().map((period) => {
    const entry = { period };
    categories.forEach((cat) => { entry[cat] = getCatTotal(period, cat); });
    return entry;
  });

  return (
    <>
      <Header />
      <div className="page-wrap">
        <div className="container">
          <div className="dashboard">
            <h1 className="dashboard__title">History</h1>

            <div className="history__controls">
              <div className="history__toggle">
                <button
                  className={`btn ${type === 'EXPENSE' ? 'history__toggle-btn--active' : ''}`}
                  onClick={() => setType('EXPENSE')}
                >
                  Expenses
                </button>
                <button
                  className={`btn ${type === 'INCOME' ? 'history__toggle-btn--active' : ''}`}
                  onClick={() => setType('INCOME')}
                >
                  Income
                </button>
              </div>
              <div className="history__toggle">
                <button
                  className={`btn ${groupBy === 'month' ? 'history__toggle-btn--active' : ''}`}
                  onClick={() => setGroupBy('month')}
                >
                  Monthly
                </button>
                <button
                  className={`btn ${groupBy === 'year' ? 'history__toggle-btn--active' : ''}`}
                  onClick={() => setGroupBy('year')}
                >
                  Yearly
                </button>
              </div>
              <div className="history__toggle">
                <button
                  className={`btn ${viewMode === 'total' ? 'history__toggle-btn--active' : ''}`}
                  onClick={() => setViewMode('total')}
                >
                  Total
                </button>
                <button
                  className={`btn ${viewMode === 'category' ? 'history__toggle-btn--active' : ''}`}
                  onClick={() => setViewMode('category')}
                >
                  By category
                </button>
              </div>
            </div>

            {viewMode === 'total' && (
              loading ? (
                <p className="loading">Loading...</p>
              ) : error ? (
                <p className="api-error">{error}</p>
              ) : (
                <>
                  <div className="dashboard__cards" style={{ marginBottom: 40 }}>
                    <div className="dashboard__card">
                      <span className="dashboard__card-label">This month</span>
                      <span className="dashboard__card-amount" style={{ color }}>{formatUAH(thisMonth)}</span>
                      <span className={`history__change ${monthChange >= 0 ? 'history__change--up' : 'history__change--down'}`}>
                        {monthChange >= 0 ? '↑' : '↓'} {Math.abs(monthChange)}% vs last month
                      </span>
                    </div>
                    <div className="dashboard__card">
                      <span className="dashboard__card-label">Last month</span>
                      <span className="dashboard__card-amount" style={{ color: '#aaa' }}>{formatUAH(lastMonth)}</span>
                    </div>
                    <div className="dashboard__card">
                      <span className="dashboard__card-label">This year</span>
                      <span className="dashboard__card-amount" style={{ color }}>{formatUAH(thisYear)}</span>
                      <span className={`history__change ${yearChange >= 0 ? 'history__change--up' : 'history__change--down'}`}>
                        {yearChange >= 0 ? '↑' : '↓'} {Math.abs(yearChange)}% vs last year
                      </span>
                    </div>
                    <div className="dashboard__card">
                      <span className="dashboard__card-label">Last year</span>
                      <span className="dashboard__card-amount" style={{ color: '#aaa' }}>{formatUAH(lastYear)}</span>
                    </div>
                  </div>

                  {data.length === 0 ? (
                    <p className="loading">No data for selected period.</p>
                  ) : (
                    <div className="dashboard__chart" style={{ maxWidth: '100%' }}>
                      <ResponsiveContainer width="100%" height={360}>
                        <BarChart data={data} margin={{ top: 8, right: 24, left: 16, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="period" stroke="#aaa" tick={{ fontSize: 12 }} />
                          <YAxis stroke="#aaa" tick={{ fontSize: 12 }} />
                          <Tooltip
                            content={<ChartTooltip valueLabel={type === 'EXPENSE' ? 'Expenses' : 'Income'} />}
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
                <p className="loading">Loading...</p>
              ) : catError ? (
                <p className="api-error">{catError}</p>
              ) : catData.length === 0 ? (
                <p className="loading">No category data for selected period.</p>
              ) : (
                <>
                  {/* Comparison table */}
                  <div className="dashboard__chart history__cat-section" style={{ maxWidth: '100%', marginBottom: 32 }}>
                    <table className="history__cat-table">
                      <thead>
                        <tr>
                          <th className="history__cat-th">Category</th>
                          <th className="history__cat-th">{currentPeriod}</th>
                          <th className="history__cat-th">{prevPeriod}</th>
                          <th className="history__cat-th">Change</th>
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
                                {cat}
                              </td>
                              <td className="history__cat-td">{formatUAH(curr)}</td>
                              <td className="history__cat-td history__cat-td--muted">{formatUAH(prev)}</td>
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

                  {/* Stacked bar chart */}
                  <div className="dashboard__chart" style={{ maxWidth: '100%' }}>
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
                            dataKey={cat}
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
