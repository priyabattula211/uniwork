import { useEffect, useState } from 'react';
import api from '../api/client';
import GigCard from '../components/GigCard';

export default function ProfilePage() {
  const [profileState, setProfileState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadProfile() {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/users/me');
      setProfileState(response.data);
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Unable to load profile');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function selectApplicant(gigId, applicantId) {
    try {
      await api.post(`/gigs/${gigId}/select`, { applicantId });
      await loadProfile();
    } catch (selectError) {
      setError(selectError.response?.data?.message || 'Unable to select applicant');
    }
  }

  if (loading) {
    return <p className="muted">Loading profile...</p>;
  }

  if (!profileState) {
    return <p className="error-text">{error || 'Profile unavailable'}</p>;
  }

  const { profile, postedGigs, appliedGigs } = profileState;

  return (
    <section className="stack">
      <div className="card hero">
        <div>
          <span className="eyebrow">Your profile</span>
          <h1>{profile.name}</h1>
          <p>{profile.city}</p>
        </div>
        <div className="profile-chip">{profile.email}</div>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <section>
        <h2>Posted Gigs</h2>
        <div className="grid">
          {postedGigs.map((gig) => (
            <GigCard
              key={gig._id}
              gig={gig}
              showApply={false}
              showApplicants
              onSelect={selectApplicant}
              selectedApplicantLabel={gig.selectedApplicant?.name}
            />
          ))}
        </div>
      </section>

      <section>
        <h2>Applied Gigs</h2>
        {appliedGigs.length === 0 ? (
          <p className="muted">You have not applied to any gigs yet.</p>
        ) : (
          <div className="grid">
            {appliedGigs.map((gig) => (
              <GigCard key={gig._id} gig={gig} showApply={false} />
            ))}
          </div>
        )}
      </section>
    </section>
  );
}