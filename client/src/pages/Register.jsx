import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

const initialForm = { name: '', email: '', password: '', confirmPassword: '' };

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Fill in your name, email, and password.');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      navigate('/chat', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create your account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <h2>Create your account</h2>
      <p className="auth-sub">Join ConnectHub and start messaging in real time.</p>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            name="name"
            type="text"
            className="input"
            placeholder="Your name"
            value={form.name}
            onChange={handleChange}
            autoComplete="name"
            autoFocus
          />
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            className="input"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            className="input"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
          />
        </div>

        <div className="field">
          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            className="input"
            placeholder="Repeat your password"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
          />
        </div>

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}
