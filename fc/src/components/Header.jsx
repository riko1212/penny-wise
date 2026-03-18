import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User } from 'lucide-react';
import Logo from './Logo';
import { AVATAR_COLORS, THEMES } from '../constants';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useEscapeKey } from '../hooks/useEscapeKey';

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
  const userName = useCurrentUser();

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

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  useEscapeKey(() => setDropdownOpen(false), dropdownOpen);
  useEscapeKey(() => setMobileMenuOpen(false), mobileMenuOpen);

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

  const currentTheme = THEMES.find((t) => t.id === theme) || THEMES[0];
  const themeIcon = currentTheme.icon;
  const themeLabel = currentTheme.label;

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/');
  };

  const avatarBg = AVATAR_COLORS.find((c) => c.id === avatarColor)?.value || AVATAR_COLORS[0].value;
  const avatarStyle = avatarImage ? {} : { background: avatarBg };

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
