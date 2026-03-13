import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../index.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentUser] = useState(() => JSON.parse(localStorage.getItem('loggedInUser')));

  useEffect(() => {
    if (!currentUser) navigate('/');
  }, [currentUser, navigate]);

  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    Promise.all([
      fetch(`/api/transactions/total?userId=${currentUser.id}&type=INCOME`).then((r) => r.json()),
      fetch(`/api/transactions/total?userId=${currentUser.id}&type=EXPENSE`).then((r) => r.json()),
    ])
      .then(([inc, exp]) => {
        setIncome(inc);
        setExpense(exp);
      })
      .catch((err) => console.error('Dashboard fetch error:', err))
      .finally(() => setLoading(false));
  }, [currentUser]);

  const balance = income - expense;

  return (
    <>
      <Header />
      <div className="page-wrap">
        <div className="container">
          <div className="dashboard">
            <h1 className="dashboard__title">Overview</h1>
            {loading ? (
              <p className="loading">Loading...</p>
            ) : (
              <div className="dashboard__cards">
                <div className="dashboard__card dashboard__card--income">
                  <span className="dashboard__card-label">Total Income</span>
                  <span className="dashboard__card-amount">{income.toFixed(2)} UAH</span>
                </div>
                <div className="dashboard__card dashboard__card--expense">
                  <span className="dashboard__card-label">Total Expenses</span>
                  <span className="dashboard__card-amount">{expense.toFixed(2)} UAH</span>
                </div>
                <div className={`dashboard__card dashboard__card--balance ${balance >= 0 ? 'dashboard__card--positive' : 'dashboard__card--negative'}`}>
                  <span className="dashboard__card-label">Balance</span>
                  <span className="dashboard__card-amount">
                    {balance >= 0 ? '+' : ''}{balance.toFixed(2)} UAH
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
