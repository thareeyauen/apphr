import { useState } from 'react';
import { MdArrowForward } from 'react-icons/md';
import './Login.css';

export default function Login({ users = [], onSignIn }) {
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');
    const normalizedEmail = email.toLowerCase();
    const matchedUser = users.find((user) => user.email?.toLowerCase() === normalizedEmail);

    if (!matchedUser || matchedUser.password !== password) {
      setError('Email or password is incorrect');
      return;
    }

    onSignIn({
      ...matchedUser
    });
  };

  return (
    <main className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <p className="login-welcome">Welcome...</p>

        <label className="login-field">
          <span>E-mail</span>
          <input name="email" type="email" autoComplete="email" onChange={() => setError('')} />
        </label>

        <label className="login-field">
          <span>Password</span>
          <input name="password" type="password" autoComplete="current-password" onChange={() => setError('')} />
        </label>

        {error && <p className="login-error">{error}</p>}

        <button className="login-submit" type="submit">
          <span>Sign in</span>
          <MdArrowForward />
        </button>
      </form>
    </main>
  );
}
