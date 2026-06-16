import { useEffect, useState } from 'react';
import api from '../api/client';
import GigCard from '../components/GigCard';

const categories = ['all', 'tutoring', 'delivery', 'design', 'writing', 'repairs'];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('local');
  const [category, setCategory] = useState('all');
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadGigs() {
      setLoading(true);
      setError('');

      try {
        const response =
          activeTab === 'local'
            ? await api.get('/gigs/local')
            : await api.get('/gigs/global', {
                params: category === 'all' ? {} : { category }
              });

        if (!ignore) {
          setGigs(response.data);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError.response?.data?.message || 'Unable to load gigs');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadGigs();

    return () => {
      ignore = true;
    };
  }, [activeTab, category]);

  async function applyToGig(gigId) {
    try {
      await api.post(`/gigs/${gigId}/apply`);
      setGigs((current) => current.filter((gig) => gig._id !== gigId));
    } catch (applyError) {
      setError(applyError.response?.data?.message || 'Unable to apply to gig');
    }
  }

  return (
    <section className="stack">
      <div className="hero card">
        <div>
          <span className="eyebrow">Marketplace feed</span>
          <h1>Pick up work near you or browse remote gigs.</h1>
          <p>Near You shows local gigs within 5km of your saved location.</p>
        </div>

        <div className="tab-row">
          <button className={activeTab === 'local' ? 'tab active' : 'tab'} onClick={() => setActiveTab('local')} type="button">
            Near You
          </button>
          <button className={activeTab === 'global' ? 'tab active' : 'tab'} onClick={() => setActiveTab('global')} type="button">
            Global
          </button>
        </div>
      </div>

      {activeTab === 'global' ? (
        <div className="card toolbar">
          <label>
            Category
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      {error ? <p className="error-text">{error}</p> : null}

      {loading ? (
        <p className="muted">Loading gigs...</p>
      ) : gigs.length === 0 ? (
        <div className="card empty-state">No gigs found for this filter.</div>
      ) : (
        <div className="grid">
          {gigs.map((gig) => (
            <GigCard key={gig._id} gig={gig} onApply={applyToGig} />
          ))}
        </div>
      )}
    </section>
  );
}