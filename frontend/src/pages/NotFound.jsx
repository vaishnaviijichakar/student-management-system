import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <>
      <header className="page-head">
        <div>
          <h1>Page not found</h1>
          <p>That address doesn’t match any page in the registry.</p>
        </div>
      </header>
      <Link className="btn btn-primary" to="/">
        Go to Home
      </Link>
    </>
  );
}
