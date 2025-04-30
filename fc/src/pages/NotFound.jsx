import { Link } from "react-router-dom"

function NotFound () {
  return (
    <div className="login-wrapper">
      <p className="error-page-text">404</p>
      <Link className="error-page-link" to="/main">← Back to main</Link>

    </div>
  )
}

export default NotFound