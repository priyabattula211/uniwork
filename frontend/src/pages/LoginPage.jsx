import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (loginError) {
      setError(loginError.response?.data?.message || 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-layout card">
      <div>
        <span className="eyebrow">Welcome back</span>
        <h1>Sign in to UniWORK</h1>
        <p>Find local gigs near you or browse global work from anywhere.</p>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <button className="primary-button" disabled={loading} type="submit">
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>

      <p className="muted">
        New here? <Link to="/signup">Create an account</Link>
      </p>
    </section>
  );
}