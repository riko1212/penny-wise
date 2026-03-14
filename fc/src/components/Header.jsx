import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Logo from './Logo';

function getInitialTheme() {
  return localStorage.getItem('theme') || 'default';
}

function getInitials(name) {
  if (!name) return '?';
  return name.slice(0, 2).toUpperCase();
}

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = localStorage.getItem('loggedInUser');
  const userName = JSON.parse(user);

  const [theme, setTheme] = useState(getInitialTheme);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme === 'default' ? '' : theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    function handleKey(e) {
      if (e.key === 'Escape') setDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [dropdownOpen]);

  const handleThemeToggle = () => {
    setTheme((prev) => {
      if (prev === 'default') return 'dark';
      if (prev === 'dark') return 'light';
      return 'default';
    });
  };

  const themeIcon = theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '🌤';
  const themeLabel = theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'Default';

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

          <div className="user-menu" ref={dropdownRef}>
            <button
              type="button"
              className="user-avatar"
              onClick={() => setDropdownOpen((o) => !o)}
              aria-expanded={dropdownOpen}
              title="User menu"
            >
              {getInitials(userName?.name)}
            </button>

            {dropdownOpen && (
              <div className="user-dropdown">
                <div className="user-dropdown__info">
                  <span className="user-dropdown__name">{userName?.name}</span>
                  {userName?.email && (
                    <span className="user-dropdown__email">{userName.email}</span>
                  )}
                </div>
                <div className="user-dropdown__divider" />
                <button
                  type="button"
                  className="user-dropdown__item"
                  onClick={handleThemeToggle}
                >
                  <span>{themeIcon}</span>
                  <span>Theme: {themeLabel}</span>
                </button>
                <div className="user-dropdown__divider" />
                <button
                  type="button"
                  className="user-dropdown__item user-dropdown__item--danger"
                  onClick={handleLogout}
                >
                  <span>↩</span>
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
