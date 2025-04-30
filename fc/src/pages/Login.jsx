import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const name = e.target.elements['login-name'].value;
    const password = e.target.elements['login-pass'].value;

    try {
      const response = await fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }),
      });

      if (!response.ok) {
        const text = await response.text();
        alert(text || "Login failed");
        return;
      }

      const user = await response.json();
      localStorage.setItem('loggedInUser', JSON.stringify(user));
      navigate('/main');
    } catch (error) {
      alert("Network error. Please try again later.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-block">
        <p className="login-text">Login</p>
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
