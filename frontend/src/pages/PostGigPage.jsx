import { useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const categories = ['tutoring', 'delivery', 'design', 'writing', 'repairs'];

export default function PostGigPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'tutoring',
    type: 'local',
    budget: ''
  });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setStatus('');

    try {
      const payload = {
        ...form,
        budget: Number(form.budget)
      };

      if (form.type === 'local') {
        payload.location = {
          lat: user.location.coordinates[1],
          lng: user.location.coordinates[0]
        };
      }

      await api.post('/gigs', payload);
      setStatus('Gig posted successfully.');
      setForm({ title: '', description: '', category: 'tutoring', type: 'local', budget: '' });
    } catch (postError) {
      setError(postError.response?.data?.message || 'Unable to create gig');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card form-card">
      <span className="eyebrow">Create a gig</span>
      <h1>Post a new task</h1>
      <p className="muted">Local gigs reuse your saved location. Global gigs are visible to everyone.</p>

      <form className="form" onSubmit={handleSubmit}>
        <div className="toggle-row">
          <button
            className={form.type === 'local' ? 'tab active' : 'tab'}
            type="button"
            onClick={() => setForm({ ...form, type: 'local' })}
          >
            Local
          </button>
          <button
            className={form.type === 'global' ? 'tab active' : 'tab'}
            type="button"
            onClick={() => setForm({ ...form, type: 'global' })}
          >
            Global
          </button>
        </div>

        <label>
          Category
          <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
            {categories.map((categoryOption) => (
              <option key={categoryOption} value={categoryOption}>
                {categoryOption}
              </option>
            ))}
          </select>
        </label>
        <label>
          Title
          <input type="text" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
        </label>
        <label>
          Description
          <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
        </label>
        <label>
          Budget
          <input
            type="number"
            min="0"
            value={form.budget}
            onChange={(event) => setForm({ ...form, budget: event.target.value })}
            required
          />
        </label>

        {error ? <p className="error-text">{error}</p> : null}
        {status ? <p className="success-text">{status}</p> : null}

        <button className="primary-button" disabled={loading} type="submit">
          {loading ? 'Posting...' : 'Post Gig'}
        </button>
      </form>
    </section>
  );
}