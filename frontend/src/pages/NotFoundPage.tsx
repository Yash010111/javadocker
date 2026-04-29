import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="app-shell container">
      <div className="card" style={{ textAlign: 'center' }}>
        <h1 className="page-title">404</h1>
        <p className="small-text">Page not found.</p>
        <Link to="/" className="primary" style={{ textDecoration: 'none' }}>
          Back to login
        </Link>
      </div>
    </div>
  );
}
