import PropTypes from 'prop-types';

Button.propTypes = {
  children: PropTypes.node,
}

export default function Button({ children }) {
  return <button className="btn category-btn">{children}</button>;
}
