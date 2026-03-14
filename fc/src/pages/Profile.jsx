import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../index.css';

const AVATAR_COLORS = [
  { id: 'indigo', value: 'linear-gradient(135deg, #6366f1, #38b2ac)' },
  { id: 'rose',   value: 'linear-gradient(135deg, #f43f5e, #fb923c)' },
  { id: 'violet', value: 'linear-gradient(135deg, #8b5cf6, #ec4899)' },
  { id: 'teal',   value: 'linear-gradient(135deg, #14b8a6, #3b82f6)' },
  { id: 'amber',  value: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
  { id: 'emerald',value: 'linear-gradient(135deg, #10b981, #06b6d4)' },
];

const THEMES = [
  { id: 'default', label: 'Default', icon: '🌤' },
  { id: 'dark',    label: 'Dark',    icon: '🌙' },
  { id: 'light',   label: 'Light',   icon: '☀️' },
];

function getInitials(name) {
  if (!name) return '?';
  return name.slice(0, 2).toUpperCase();
}

export default function Profile() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(
    () => JSON.parse(localStorage.getItem('loggedInUser'))
  );
  const [activeTab, setActiveTab] = useState('profile');

  // Profile tab state
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [avatarColor, setAvatarColor] = useState(
    () => localStorage.getItem('avatarColor') || AVATAR_COLORS[0].id
  );
  const [profileMsg, setProfileMsg] = useState(null);

  // Security tab state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityMsg, setSecurityMsg] = useState(null);

  // Appearance tab state
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'default');

  // Danger zone state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState(null);

  function applyMessage(setter, type, text) {
    setter({ type, text });
    if (type === 'success') setTimeout(() => setter(null), 4000);
  }

  // ── Profile save ──────────────────────────────────────
  async function handleProfileSave(e) {
    e.preventDefault();
    if (!name.trim()) {
      applyMessage(setProfileMsg, 'error', 'Name cannot be empty.');
      return;
    }
    try {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      if (!res.ok) {
        const text = await res.text();
        applyMessage(setProfileMsg, 'error', text || 'Update failed.');
        return;
      }
      const updated = await res.json();
      const stored = { ...currentUser, name: updated.name, email: updated.email };
      localStorage.setItem('loggedInUser', JSON.stringify(stored));
      localStorage.setItem('avatarColor', avatarColor);
      setCurrentUser(stored);
      applyMessage(setProfileMsg, 'success', 'Profile updated successfully.');
    } catch {
      applyMessage(setProfileMsg, 'error', 'Network error. Try again.');
    }
  }

  function handleAvatarColorChange(colorId) {
    setAvatarColor(colorId);
    localStorage.setItem('avatarColor', colorId);
  }

  // ── Security save ─────────────────────────────────────
  async function handlePasswordSave(e) {
    e.preventDefault();
    if (!currentPassword) {
      applyMessage(setSecurityMsg, 'error', 'Enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      applyMessage(setSecurityMsg, 'error', 'New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      applyMessage(setSecurityMsg, 'error', 'Passwords do not match.');
      return;
    }
    try {
      const res = await fetch(`/api/users/${currentUser.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const text = await res.text();
        applyMessage(setSecurityMsg, 'error', text || 'Failed to update password.');
        return;
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      applyMessage(setSecurityMsg, 'success', 'Password changed successfully.');
    } catch {
      applyMessage(setSecurityMsg, 'error', 'Network error. Try again.');
    }
  }

  // ── Theme change ──────────────────────────────────────
  function handleThemeChange(themeId) {
    setTheme(themeId);
    localStorage.setItem('theme', themeId);
    document.documentElement.dataset.theme = themeId === 'default' ? '' : themeId;
  }

  // ── Delete account ────────────────────────────────────
  async function handleDeleteAccount() {
    try {
      const res = await fetch(`/api/users/${currentUser.id}`, { method: 'DELETE' });
      if (!res.ok) {
        applyMessage(setDeleteMsg, 'error', 'Failed to delete account.');
        return;
      }
      localStorage.clear();
      navigate('/');
    } catch {
      applyMessage(setDeleteMsg, 'error', 'Network error. Try again.');
    }
  }

  const selectedColor = AVATAR_COLORS.find((c) => c.id === avatarColor)?.value
    || AVATAR_COLORS[0].value;

  return (
    <>
      <Header />
      <div className="page-wrap">
        <div className="container">
          <div className="profile-page">

            {/* Avatar + name header */}
            <div className="profile-hero">
              <div className="avatar-preview" style={{ background: selectedColor }}>
                {getInitials(currentUser?.name)}
              </div>
              <div>
                <h1 className="profile-hero__name">{currentUser?.name}</h1>
                <p className="profile-hero__email">{currentUser?.email}</p>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="profile-tabs">
              {[
                { id: 'profile',    label: 'Profile' },
                { id: 'security',   label: 'Security' },
                { id: 'appearance', label: 'Appearance' },
                { id: 'danger',     label: 'Danger Zone' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`profile-tab${activeTab === tab.id ? ' profile-tab--active' : ''}${tab.id === 'danger' ? ' profile-tab--danger' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Tab: Profile ── */}
            {activeTab === 'profile' && (
              <div className="profile-section">
                <h2 className="profile-section__title">Profile information</h2>
                <form onSubmit={handleProfileSave}>
                  <label className="profile-label">Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={50}
                  />
                  <label className="profile-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <label className="profile-label">Avatar color</label>
                  <div className="avatar-colors">
                    {AVATAR_COLORS.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        className={`avatar-color-btn${avatarColor === color.id ? ' avatar-color-btn--active' : ''}`}
                        style={{ background: color.value }}
                        onClick={() => handleAvatarColorChange(color.id)}
                        title={color.id}
                      />
                    ))}
                  </div>

                  {profileMsg && (
                    <p className={profileMsg.type === 'success' ? 'success-message' : 'error-message'}>
                      {profileMsg.text}
                    </p>
                  )}
                  <button type="submit" className="btn form-btn">Save changes</button>
                </form>
              </div>
            )}

            {/* ── Tab: Security ── */}
            {activeTab === 'security' && (
              <div className="profile-section">
                <h2 className="profile-section__title">Change password</h2>
                <form onSubmit={handlePasswordSave}>
                  <label className="profile-label">Current password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <label className="profile-label">New password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                  />
                  <label className="profile-label">Confirm new password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                  />
                  {securityMsg && (
                    <p className={securityMsg.type === 'success' ? 'success-message' : 'error-message'}>
                      {securityMsg.text}
                    </p>
                  )}
                  <button type="submit" className="btn form-btn">Update password</button>
                </form>
              </div>
            )}

            {/* ── Tab: Appearance ── */}
            {activeTab === 'appearance' && (
              <div className="profile-section">
                <h2 className="profile-section__title">Theme</h2>
                <div className="profile-theme-cards">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`profile-theme-card${theme === t.id ? ' profile-theme-card--active' : ''}`}
                      onClick={() => handleThemeChange(t.id)}
                    >
                      <span className="profile-theme-card__icon">{t.icon}</span>
                      <span className="profile-theme-card__label">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Tab: Danger Zone ── */}
            {activeTab === 'danger' && (
              <div className="profile-section danger-zone">
                <h2 className="profile-section__title danger-zone__title">Danger Zone</h2>
                <p className="danger-zone__text">
                  Deleting your account is permanent. All your transactions and categories will be removed and cannot be recovered.
                </p>
                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    className="btn danger-zone__btn"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete account
                  </button>
                ) : (
                  <div className="danger-zone__confirm">
                    <p className="danger-zone__confirm-text">Are you sure? This cannot be undone.</p>
                    <div className="danger-zone__confirm-actions">
                      <button type="button" className="btn danger-zone__btn" onClick={handleDeleteAccount}>
                        Yes, delete my account
                      </button>
                      <button type="button" className="btn danger-zone__cancel" onClick={() => setShowDeleteConfirm(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {deleteMsg && (
                  <p className="error-message" style={{ marginTop: 12 }}>{deleteMsg.text}</p>
                )}
              </div>
            )}

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Link to="/dashboard" className="login-link" style={{ fontSize: 14 }}>
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
