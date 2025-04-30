import { Link, useNavigate } from 'react-router-dom';

function RestorePass() {
  const navigate = useNavigate();

  const handleRestorePass = (e) => {
    e.preventDefault();
    const name = e.target.elements['login-name'].value;
    const newPassword = e.target.elements['new-pass'].value;
    const repeatPassword = e.target.elements['repeat-pass'].value;

    if (newPassword !== repeatPassword) {
      alert('Passwords do not match');
      return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex((user) => user.name === name);

    if (userIndex === -1) {
      alert('User not found');
      return;
    }

    users[userIndex].password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));
    alert('Password successfully updated');

    navigate('/');
  };

  return (
    <div className="login-wrapper">
      <div className="login-block">
        <p className="login-text">Restore Pass</p>
        <form className="login-form" onSubmit={handleRestorePass}>
          <input
            type="text"
            name="login-name"
            className="form-input"
            placeholder="Enter name"
          />
          <input
            type="password"
            name="new-pass"
            className="form-input"
            placeholder="Enter new password"
          />
          <input
            type="password"
            name="repeat-pass"
            className="form-input"
            placeholder="Repeat new password"
          />
          <button type="submit" className="btn form-btn">
            Restore Password
          </button>
          <Link to="/" className="btn form-btn back-btn">
            Back to Login
          </Link>
        </form>
      </div>
    </div>
  );
}

export default RestorePass;
