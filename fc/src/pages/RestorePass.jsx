import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function RestorePass() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRestorePass = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const name = e.target.elements['login-name'].value;
    const newPassword = e.target.elements['new-pass'].value;
    const repeatPassword = e.target.elements['repeat-pass'].value;

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== repeatPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      const res = await fetch('/api/users/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, newPassword }),
      });

      const text = await res.text();

      if (!res.ok) {
        setErrorMessage(text || 'Failed to update password');
        return;
      }

      setSuccessMessage('Password successfully updated');
      setTimeout(() => navigate('/'), 1500);
    } catch {
      setErrorMessage('Server error. Please try again.');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-block">
        <p className="login-text">Restore Pass</p>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <form className="login-form" onSubmit={handleRestorePass}>
          <input
            type="text"
            name="login-name"
            className="form-input"
            placeholder="Enter name"
            required
          />
          <input
            type="password"
            name="new-pass"
            className="form-input"
            placeholder="Enter new password"
            required
          />
          <input
            type="password"
            name="repeat-pass"
            className="form-input"
            placeholder="Repeat new password"
            required
          />
          <button type="submit" className="btn form-btn">
            Restore Password
          </button>
          <Link to="/" className="btn form-btn back-btn">
            Back to Login
          </Link>
        </form>
      </div>
    </div>
  );
}

export default RestorePass;
