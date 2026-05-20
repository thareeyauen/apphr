import { useState } from 'react';
import { MdArrowForward } from 'react-icons/md';
import { apiLogin } from '../api';
import './Login.css';

export default function Login({ onSignIn }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (busy) return;
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');
    setBusy(true);
    try {
      const user = await apiLogin(email, password);
      onSignIn(user);
    } catch {
      setError('Email or password is incorrect');
    } finally {
      setBusy(false);
    }
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

        <button className="login-submit" type="submit" disabled={busy}>
          <span>{busy ? 'Signing in…' : 'Sign in'}</span>
          <MdArrowForward />
        </button>
      </form>
    </main>
  );
}
