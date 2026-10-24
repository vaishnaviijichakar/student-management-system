import { useEffect, useState } from 'react';
import { api } from '../api.js';
import StudentTable from '../components/StudentTable.jsx';

export default function SearchStudent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const term = query.trim();
    if (!term) {
      setResults(null);
      setError('');
      setLoading(false);
      return undefined;
    }

    let live = true;
    setLoading(true);
    const timer = setTimeout(() => {
      api
        .list(term)
        .then((r) => {
          if (!live) return;
          setResults(r.data);
          setError('');
        })
        .catch((e) => live && setError(e.message))
        .finally(() => live && setLoading(false));
    }, 350);

    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [query]);

  const removeLocal = (studentId) => setResults((list) => list.filter((s) => s.studentId !== studentId));

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Search students</h1>
          <p>Look up a student by ID, name, email or department.</p>
        </div>
      </header>

      <div className="searchbar">
        <label className="visually-hidden" htmlFor="search">
          Search students
        </label>
        <input
          id="search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try ST101, Sharma or Computer Science"
          autoComplete="off"
        />
      </div>

      {error && (
        <div className="notice error" role="alert">
          {error}
        </div>
      )}
      {!error && loading && <div className="notice">Searching…</div>}
      {!error && !loading && results === null && <div className="notice">Type to start searching.</div>}
      {!error && !loading && results && results.length === 0 && (
        <div className="notice">No students match “{query.trim()}”. Check the spelling or try a shorter term.</div>
      )}
      {!error && !loading && results && results.length > 0 && (
        <>
          <p className="sub result-count">
            {results.length} {results.length === 1 ? 'match' : 'matches'}
          </p>
          <StudentTable students={results} onDeleted={removeLocal} />
        </>
      )}
    </>
  );
}
