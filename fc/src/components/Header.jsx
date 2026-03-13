import { useNavigate, useLocation, Link } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = localStorage.getItem('loggedInUser');
  const userName = JSON.parse(user);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container header-container">
        <Link to="/main" className="header-logo">
          Logo
        </Link>
        <nav className="header-nav">
          <ul className="menu-list">
            <li className="menu-item">
              <Link
                to="/main"
                className={`menu-link ${location.pathname === '/main' ? 'menu-link--active' : ''}`}
              >
                Expenses
              </Link>
            </li>
            <li className="menu-item">
              <Link
                to="/income"
                className={`menu-link ${location.pathname === '/income' ? 'menu-link--active' : ''}`}
              >
                Income
              </Link>
            </li>
          </ul>
          <p className="greet-text">Welcome, {userName.name}!</p>
          <button
            type="button"
            className="logout-btn btn"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </nav>
      </div>
    </header>
  );
}
