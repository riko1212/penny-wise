import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

function NotFound() {
  const { t } = useLanguage();
  return (
    <div className="login-wrapper">
      <p className="error-page-text">404</p>
      <Link className="error-page-link" to="/main">{t('notFound.backToMain')}</Link>
    </div>
  );
}

export default NotFound;
