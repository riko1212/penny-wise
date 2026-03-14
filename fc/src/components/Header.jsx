import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Logo from './Logo';

function getInitialTheme() {
  return localStorage.getItem('theme') || 'default';
}

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = localStorage.getItem('loggedInUser');
  const userName = JSON.parse(user);

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme === 'default' ? '' : theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme((prev) => {
      if (prev === 'default') return 'dark';
      if (prev === 'dark') return 'light';
      return 'default';
    });
  };

  const themeIcon = theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '🌤';

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container header-container">
        <Link to="/dashboard" className="header-logo">
          <Logo />
        </Link>
        <nav className="header-nav">
          <ul className="menu-list">
            <li className="menu-item">
              <Link
                to="/dashboard"
                className={`menu-link ${location.pathname === '/dashboard' ? 'menu-link--active' : ''}`}
              >
                Dashboard
              </Link>
            </li>
            <li className="menu-item">
              <Link
                to="/history"
                className={`menu-link ${location.pathname === '/history' ? 'menu-link--active' : ''}`}
              >
                History
              </Link>
            </li>
            <li className="menu-item">
              <Link
                to="/main"
                className={`menu-link ${location.pathname === '/main' ? 'menu-link--active' : ''}`}
              >
                Expenses
              </Link>
            </li>
            <li className="menu-item">
              <Link
                to="/income"
                className={`menu-link ${location.pathname === '/income' ? 'menu-link--active' : ''}`}
              >
                Income
              </Link>
            </li>
          </ul>
          <p className="greet-text">Welcome, {userName.name}!</p>
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={handleThemeToggle}
            title="Toggle theme"
          >
            {themeIcon}
          </button>
          <button
            type="button"
            className="logout-btn btn"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </nav>
      </div>
    </header>
  );
}
