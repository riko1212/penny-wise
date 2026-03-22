import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <Link to="/main" className="footer-logo">
          Logo
        </Link>
        <ul className="contacts-list">
          <li className="contacts-item">0999999999</li>
          <li className="contacts-item">test@test.ua</li>
        </ul>
      </div>
    </footer>
  );
}
