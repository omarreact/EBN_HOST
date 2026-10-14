export default function Loading() {
  return (
    <div className="page-loading" role="status" aria-label="Loading stories">
      <span className="sr-only">Loading stories…</span>
      <div className="skeleton skeleton-heading" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton-row">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="skeleton skeleton-card" />
        ))}
      </div>
    </div>
  );
}
