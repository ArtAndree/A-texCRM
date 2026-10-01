import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout from '../components/layout/AuthLayout.jsx';
export default function LoginPage() {
  const {
    authenticated,
    login
  } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  if (authenticated && !submitting) return <Navigate to="/" replace />;
  function submit(e) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Заполните логин и пароль.');
      return;
    }
    setSubmitting(true);
    login(username);
    setPassword('');
    navigate('/welcome', {
      replace: true
    });
  }
  return <AuthLayout>
    <h1>Вход</h1>
    <form className="auth-form" onSubmit={submit}>
      <label>Логин<input
        name="username"
        autoComplete="username"
        required
        maxLength={100}
        value={username}
        onChange={e => setUsername(e.target.value)}
      /></label>
      <label>Пароль<input
        name="password"
        type="password"
        autoComplete="current-password"
        required
        maxLength={200}
        value={password}
        onChange={e => setPassword(e.target.value)}
      /></label>
      <Link className="forgot-link" to="/forgot-password">Забыли пароль?</Link>
      {error && <p className="alert" role="alert">{error}</p>}
      <button type="submit">Войти</button>
    </form>
    <p className="auth-note">Демо: любой непустой логин и пароль.</p>
  </AuthLayout>;
}
