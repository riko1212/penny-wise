import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useLanguage } from '../context/LanguageContext';

function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const name = e.target.elements['login-name'].value;
    const password = e.target.elements['login-pass'].value;

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      });

      if (!response.ok) {
        const text = await response.text();
        setErrorMessage(text || t('auth.loginFailed'));
        return;
      }

      const user = await response.json();
      localStorage.setItem('loggedInUser', JSON.stringify(user));
      navigate('/dashboard');
    } catch {
      setErrorMessage(t('auth.networkError'));
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-block">
        <div className="login-logo">
          <Logo />
        </div>
        <p className="login-text">{t('auth.login')}</p>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <form className="login-form" onSubmit={handleLogin}>
          <input
            type="text"
            name="login-name"
            className="form-input"
            placeholder={t('auth.enterName')}
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
          <button type="submit" className="btn form-btn login-btn">
            {t('auth.login')}
          </button>
        </form>
        <ul className="login-actions">
          <li>
            <Link className="login-link" to="/register">
              {t('auth.registerLink')}
            </Link>
          </li>
          <li>
            <Link className="login-link" to="/restore-pass">
              {t('auth.forgotPassword')}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Login;
