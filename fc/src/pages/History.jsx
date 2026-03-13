import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../index.css';

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`;
const prevMonth = (() => {
  const d = new Date(currentYear, now.getMonth() - 1, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
})();
const prevYear = currentYear - 1;

function getChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return (((current - previous) / previous) * 100).toFixed(1);
}

export default function History() {
  const navigate = useNavigate();
  const [currentUser] = useState(() => JSON.parse(localStorage.getItem('loggedInUser')));

  useEffect(() => {
    if (!currentUser) navigate('/');
  }, [currentUser, navigate]);

  const [type, setType] = useState('EXPENSE');
  const [groupBy, setGroupBy] = useState('month');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    fetch(`/api/transactions/history?userId=${currentUser.id}&type=${type}&groupBy=${groupBy}`)
      .then((r) => r.json())
      .then(setData)
      .catch((err) => console.error('History fetch error:', err))
      .finally(() => setLoading(false));
  }, [currentUser, type, groupBy]);

  const getTotal = (period) => data.find((d) => d.period === String(period))?.total ?? 0;

  const thisMonth = getTotal(currentMonth);
  const lastMonth = getTotal(prevMonth);
  const thisYear = getTotal(currentYear);
  const lastYear = getTotal(prevYear);

  const monthChange = getChange(thisMonth, lastMonth);
  const yearChange = getChange(thisYear, lastYear);

  const color = type === 'EXPENSE' ? '#ff6b6b' : '#69db7c';

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
            </div>

            {loading ? (
              <p className="loading">Loading...</p>
            ) : (
              <>
                <div className="dashboard__cards" style={{ marginBottom: 40 }}>
                  <div className="dashboard__card">
                    <span className="dashboard__card-label">This month</span>
                    <span className="dashboard__card-amount" style={{ color }}>{thisMonth.toFixed(2)} UAH</span>
                    <span className={`history__change ${monthChange >= 0 ? 'history__change--up' : 'history__change--down'}`}>
                      {monthChange >= 0 ? '↑' : '↓'} {Math.abs(monthChange)}% vs last month
                    </span>
                  </div>
                  <div className="dashboard__card">
                    <span className="dashboard__card-label">Last month</span>
                    <span className="dashboard__card-amount" style={{ color: '#aaa' }}>{lastMonth.toFixed(2)} UAH</span>
                  </div>
                  <div className="dashboard__card">
                    <span className="dashboard__card-label">This year</span>
                    <span className="dashboard__card-amount" style={{ color }}>{thisYear.toFixed(2)} UAH</span>
                    <span className={`history__change ${yearChange >= 0 ? 'history__change--up' : 'history__change--down'}`}>
                      {yearChange >= 0 ? '↑' : '↓'} {Math.abs(yearChange)}% vs last year
                    </span>
                  </div>
                  <div className="dashboard__card">
                    <span className="dashboard__card-label">Last year</span>
                    <span className="dashboard__card-amount" style={{ color: '#aaa' }}>{lastYear.toFixed(2)} UAH</span>
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
                          formatter={(v) => [`${Number(v).toFixed(2)} UAH`, type === 'EXPENSE' ? 'Expenses' : 'Income']}
                          contentStyle={{ background: '#1e1e2e', border: 'none', borderRadius: 8 }}
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
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
