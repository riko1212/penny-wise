import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    const name = e.target.elements['login-name'].value.trim();
    const email = e.target.elements['email-name'].value.trim();
    const password = e.target.elements['login-pass'].value;
    const repeatPassword = e.target.elements['login-pass-repeat'].value;

    if (!password) {
      setErrorMessage('Please enter a password');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }

    if (password !== repeatPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const text = await response.text();
        setErrorMessage(text || 'Registration failed');
        return;
      }

      // Якщо все пройшло успішно — перенаправляємо на головну
      navigate('/');
    } catch (error) {
      setErrorMessage('Network error. Please try again later.');
    }
  };

  return (
      <div className="login-wrapper">
        <div className="login-block">
          <p className="login-text">Register</p>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <form className="login-form" onSubmit={handleRegister}>
            <input
                type="text"
                name="login-name"
                className="form-input"
                placeholder="Enter name"
                required
            />
            <input
                type="email"
                name="email-name"
                className="form-input"
                placeholder="Enter email"
                required
            />
            <input
                type="password"
                name="login-pass"
                className="form-input"
                placeholder="Enter password"
                required
            />
            <input
                type="password"
                name="login-pass-repeat"
                className="form-input"
                placeholder="Repeat password"
                required
            />
            <button type="submit" className="btn form-btn">
              Register
            </button>
            <Link to="/" className="btn form-btn back-btn">
              Back to Login
            </Link>
          </form>
        </div>
      </div>
  );
}

export default Register;
