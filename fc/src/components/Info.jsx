import PropTypes from 'prop-types'

Info.propTypes = {
  sum: PropTypes.number,
  children: PropTypes.object,
}

export default function Info({ sum, children }) {
  return (
    <div className="info">
      <p className="info-text">
        Kids: <span className="info-amount">{sum} UAH</span>
      </p>
      {children}
    </div>
  );
}
