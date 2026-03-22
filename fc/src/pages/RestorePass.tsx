import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import apiFetch from '../utils/apiFetch';

function RestorePass() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleRestorePass = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const elements = e.currentTarget.elements as HTMLFormControlsCollection & {
      'login-name': HTMLInputElement;
      'new-pass': HTMLInputElement;
      'repeat-pass': HTMLInputElement;
    };
    const name = elements['login-name'].value;
    const newPassword = elements['new-pass'].value;
    const repeatPassword = elements['repeat-pass'].value;

    if (newPassword.length < 8) {
      setErrorMessage(t('auth.passwordMin'));
      return;
    }

    if (newPassword !== repeatPassword) {
      setErrorMessage(t('auth.passwordNoMatch'));
      return;
    }

    try {
      const res = await apiFetch('/api/users/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, newPassword }),
      });

      const text = await res.text();

      if (!res.ok) {
        setErrorMessage(text || t('auth.failedUpdate'));
        return;
      }

      setSuccessMessage(t('auth.passwordUpdated'));
      setTimeout(() => navigate('/'), 1500);
    } catch {
      setErrorMessage(t('auth.serverError'));
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-block">
        <p className="login-text">{t('auth.restorePass')}</p>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <form className="login-form" onSubmit={handleRestorePass}>
          <input
            type="text"
            name="login-name"
            className="form-input"
            placeholder={t('auth.enterName')}
            required
          />
          <input
            type="password"
            name="new-pass"
            className="form-input"
            placeholder={t('auth.enterNewPassword')}
            required
          />
          <input
            type="password"
            name="repeat-pass"
            className="form-input"
            placeholder={t('auth.repeatNewPassword')}
            required
          />
          <button type="submit" className="btn form-btn">
            {t('auth.restorePassword')}
          </button>
          <Link to="/" className="btn form-btn back-btn">
            {t('auth.backToLogin')}
          </Link>
        </form>
      </div>
    </div>
  );
}

export default RestorePass;
