import { MdArrowForward } from 'react-icons/md';
import './Login.css';

export default function Login({ onSignIn }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSignIn();
  };

  return (
    <main className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <p className="login-welcome">Welcome...</p>

        <label className="login-field">
          <span>Work email</span>
          <input type="email" autoComplete="email" />
        </label>

        <label className="login-field">
          <span>Password</span>
          <input type="password" autoComplete="current-password" />
        </label>

        <button className="login-submit" type="submit">
          <span>Sign in</span>
          <MdArrowForward />
        </button>
      </form>
    </main>
  );
}
