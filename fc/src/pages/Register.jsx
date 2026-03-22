import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import apiFetch from '../utils/apiFetch';

function Register() {
  const { t } = useLanguage();
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    const name = e.target.elements['login-name'].value.trim();
    const email = e.target.elements['email-name'].value.trim();
    const password = e.target.elements['login-pass'].value;
    const repeatPassword = e.target.elements['login-pass-repeat'].value;

    if (!password) {
      setErrorMessage(t('auth.passwordEmpty'));
      return;
    }

    if (password.length < 8) {
      setErrorMessage(t('auth.passwordMin'));
      return;
    }

    if (password !== repeatPassword) {
      setErrorMessage(t('auth.passwordNoMatch'));
      return;
    }

    try {
      const response = await apiFetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const text = await response.text();
        setErrorMessage(text || 'Registration failed');
        return;
      }

      navigate('/');
    } catch {
      setErrorMessage(t('auth.networkError'));
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-block">
        <p className="login-text">{t('auth.register')}</p>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <form className="login-form" onSubmit={handleRegister}>
          <input
            type="text"
            name="login-name"
            className="form-input"
            placeholder={t('auth.enterName')}
            required
          />
          <input
            type="email"
            name="email-name"
            className="form-input"
            placeholder={t('auth.enterEmail')}
            required
          />
          <div className="password-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              name="login-pass"
              className="form-input"
              placeholder={t('auth.enterPassword')}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>
          <div className="password-wrap">
            <input
              type={showRepeatPassword ? 'text' : 'password'}
              name="login-pass-repeat"
              className="form-input"
              placeholder={t('auth.repeatPassword')}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowRepeatPassword((v) => !v)}
            >
              {showRepeatPassword ? '🙈' : '👁'}
            </button>
          </div>
          <button type="submit" className="btn form-btn">
            {t('auth.register')}
          </button>
          <Link to="/" className="btn form-btn back-btn">
            {t('auth.backToLogin')}
          </Link>
        </form>
      </div>
    </div>
  );
}

export default Register;
