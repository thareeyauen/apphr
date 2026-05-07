import { MdArrowForward } from 'react-icons/md';
import './Login.css';
import { DEFAULT_USER_TYPE, getUserType, getUserTypeByEmail } from './userTypes';

export default function Login({ onSignIn }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') || '';
    const matchedUser = getUserTypeByEmail(email) || getUserType(DEFAULT_USER_TYPE);

    onSignIn({
      ...matchedUser,
      email: email || matchedUser.email
    });
  };

  return (
    <main className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <p className="login-welcome">Welcome...</p>

        <label className="login-field">
          <span>Work email</span>
          <input name="email" type="email" autoComplete="email" />
        </label>

        <label className="login-field">
          <span>Password</span>
          <input name="password" type="password" autoComplete="current-password" />
        </label>

        <button className="login-submit" type="submit">
          <span>Sign in</span>
          <MdArrowForward />
        </button>
      </form>
    </main>
  );
}
