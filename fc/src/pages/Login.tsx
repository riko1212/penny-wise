import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';
import { useLanguage } from '../context/LanguageContext';
import apiFetch from '../utils/apiFetch';
import type { User } from '../types';

function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setErrorMessage('');
    const elements = e.currentTarget.elements as HTMLFormControlsCollection & {
      'login-name': HTMLInputElement;
      'login-pass': HTMLInputElement;
    };
    const name = elements['login-name'].value;
    const password = elements['login-pass'].value;

    try {
      const response = await apiFetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      });

      if (!response.ok) {
        const text = await response.text();
        setErrorMessage(text || t('auth.loginFailed'));
        return;
      }

      const user = await response.json() as User;
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
              {showPassword ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
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
