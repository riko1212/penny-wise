import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default function ProtectedRoute({ children }) {
  const user = localStorage.getItem('loggedInUser');
  if (!user) return <Navigate to="/" replace />;
  return children;
}
