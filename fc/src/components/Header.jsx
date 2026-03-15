import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User } from 'lucide-react';
import Logo from './Logo';

const AVATAR_COLORS = {
  indigo:  'linear-gradient(135deg, #6366f1, #38b2ac)',
  rose:    'linear-gradient(135deg, #f43f5e, #fb923c)',
  violet:  'linear-gradient(135deg, #8b5cf6, #ec4899)',
  teal:    'linear-gradient(135deg, #14b8a6, #3b82f6)',
  amber:   'linear-gradient(135deg, #f59e0b, #ef4444)',
  emerald: 'linear-gradient(135deg, #10b981, #06b6d4)',
};

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/history',   label: 'History' },
  { to: '/goals',     label: 'Goals' },
  { to: '/main',      label: 'Expenses' },
  { to: '/income',    label: 'Income' },
];

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
  let userName = null;
  try { userName = JSON.parse(localStorage.getItem('loggedInUser')); } catch { }

  const [theme, setTheme] = useState(getInitialTheme);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarColor, setAvatarColor] = useState(
    () => localStorage.getItem('avatarColor') || 'indigo'
  );
  const [avatarImage, setAvatarImage] = useState(
    () => localStorage.getItem('avatarImage') || null
  );
  const dropdownRef = useRef(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Sync avatar color/image when localStorage changes (e.g. from Profile page)
  useEffect(() => {
    function onStorage(e) {
      if (e.key === 'avatarColor') setAvatarColor(e.newValue || 'indigo');
      if (e.key === 'avatarImage') setAvatarImage(e.newValue || null);
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme === 'default' ? '' : theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Close dropdown on outside click / ESC
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

  // Close mobile menu on ESC
  useEffect(() => {
    if (!mobileMenuOpen) return;
    function handleKey(e) {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

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

  const avatarStyle = avatarImage ? {} : { background: AVATAR_COLORS[avatarColor] || AVATAR_COLORS.indigo };

  return (
    <>
      <header className="header">
        <div className="container header-container">
          <Link to="/dashboard" className="header-logo">
            <Logo />
          </Link>

          {/* Desktop nav */}
          <nav className="header-nav">
            <ul className="menu-list">
              {NAV_LINKS.map(({ to, label }) => (
                <li key={to} className="menu-item">
                  <Link
                    to={to}
                    className={`menu-link ${location.pathname === to ? 'menu-link--active' : ''}`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="user-menu" ref={dropdownRef}>
              <button
                type="button"
                className="user-avatar"
                onClick={() => setDropdownOpen((o) => !o)}
                aria-expanded={dropdownOpen}
                title="User menu"
                style={avatarStyle}
              >
                {avatarImage
                  ? <img src={avatarImage} alt="avatar" className="user-avatar__img" />
                  : getInitials(userName?.name)
                }
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
                  <Link
                    to="/profile"
                    className="user-dropdown__item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User size={15} />
                    <span>Profile</span>
                  </Link>
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

          {/* Mobile right side: avatar + hamburger */}
          <div className="header-mobile-controls">
            <button
              type="button"
              className="user-avatar"
              onClick={() => { navigate('/profile'); }}
              title="Profile"
              style={avatarStyle}
            >
              {avatarImage
                ? <img src={avatarImage} alt="avatar" className="user-avatar__img" />
                : getInitials(userName?.name)
              }
            </button>
            <button
              type="button"
              className="hamburger-btn"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              <span className={`hamburger-icon ${mobileMenuOpen ? 'hamburger-icon--open' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="mobile-nav-backdrop" onClick={() => setMobileMenuOpen(false)} />
      )}
      <nav className={`mobile-nav ${mobileMenuOpen ? 'mobile-nav--open' : ''}`}>
        <ul className="mobile-nav__list">
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to}>
              <Link
                to={to}
                className={`mobile-nav__link ${location.pathname === to ? 'mobile-nav__link--active' : ''}`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mobile-nav__divider" />
        <div className="mobile-nav__footer">
          <button className="mobile-nav__link mobile-nav__link--action" onClick={handleThemeToggle}>
            {themeIcon} Theme: {themeLabel}
          </button>
          <button className="mobile-nav__link mobile-nav__link--danger" onClick={handleLogout}>
            ↩ Log Out
          </button>
        </div>
      </nav>
    </>
  );
}
