import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');

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
        setErrorMessage(text || 'Login failed');
        return;
      }

      const user = await response.json();
      localStorage.setItem('loggedInUser', JSON.stringify(user));
      navigate('/dashboard');
    } catch {
      setErrorMessage('Network error. Please try again later.');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-block">
        <p className="login-text">Login</p>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <form className="login-form" onSubmit={handleLogin}>
          <input
            type="text"
            name="login-name"
            className="form-input"
            placeholder="Enter name"
            required
          />
          <input
            type="password"
            name="login-pass"
            className="form-input"
            placeholder="Enter password"
            required
          />
          <button type="submit" className="btn form-btn login-btn">
            Login
          </button>
        </form>
        <ul className="login-actions">
          <li>
            <Link className="login-link" to="/register">
              Register?
            </Link>
          </li>
          <li>
            <Link className="login-link" to="/restore-pass">
              Forgot Password?
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Login;
