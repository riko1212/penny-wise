import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-container">
        <p className="footer-copy">© {year} Penny Wise</p>
        <nav className="footer-nav">
          <Link to="/dashboard" className="footer-nav__link">{t('nav.dashboard')}</Link>
          <Link to="/main" className="footer-nav__link">{t('nav.expenses')}</Link>
          <Link to="/income" className="footer-nav__link">{t('nav.income')}</Link>
          <Link to="/goals" className="footer-nav__link">{t('nav.goals')}</Link>
        </nav>
      </div>
    </footer>
  );
}
