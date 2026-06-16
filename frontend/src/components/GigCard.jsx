export default function GigCard({
  gig,
  onApply,
  showApply = true,
  showApplicants = false,
  onSelect,
  selectedApplicantLabel
}) {
  return (
    <article className="card gig-card">
      <div className="gig-card__header">
        <span className="pill">{gig.category}</span>
        <span className={`status status--${gig.status}`}>{gig.status}</span>
      </div>

      <h3>{gig.title}</h3>
      <p>{gig.description}</p>

      <div className="gig-meta">
        <strong>${gig.budget}</strong>
        <span>{gig.type}</span>
      </div>

      {selectedApplicantLabel ? <p className="success-text">Selected: {selectedApplicantLabel}</p> : null}

      {showApplicants ? (
        <div className="applicant-list">
          <h4>Applicants</h4>
          {gig.applicants?.length ? (
            gig.applicants.map((applicant) => (
              <div className="applicant-row" key={applicant._id}>
                <span>
                  {applicant.name} - {applicant.city}
                </span>
                {gig.status === 'open' && onSelect ? (
                  <button className="ghost-button" onClick={() => onSelect(gig._id, applicant._id)} type="button">
                    Select
                  </button>
                ) : null}
              </div>
            ))
          ) : (
            <p className="muted">No applicants yet.</p>
          )}
        </div>
      ) : null}

      {showApply && gig.status === 'open' && onApply ? (
        <button className="primary-button" onClick={() => onApply(gig._id)} type="button">
          Apply
        </button>
      ) : null}
    </article>
  );
}