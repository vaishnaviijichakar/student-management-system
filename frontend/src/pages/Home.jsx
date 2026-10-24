import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, API_BASE } from '../api.js';

const statusLabel = { checking: 'Checking…', up: 'Online', down: 'Unreachable' };

function Tier({ title, detail, state }) {
  return (
    <div className="tier">
      <h3>
        <span className={`dot ${state}`} aria-hidden="true" />
        {title}
      </h3>
      <p>{detail}</p>
      <p className="tier-state">{statusLabel[state]}</p>
    </div>
  );
}

export default function Home() {
  const [students, setStudents] = useState(null);
  const [error, setError] = useState('');
  const [apiState, setApiState] = useState('checking');
  const [dbState, setDbState] = useState('checking');

  useEffect(() => {
    let live = true;
    api
      .health()
      .then((h) => {
        if (!live) return;
        setApiState('up');
        setDbState(h.database === 'connected' ? 'up' : 'down');
      })
      .catch(() => {
        if (!live) return;
        setApiState('down');
        setDbState('down');
      });
    api
      .list()
      .then((r) => live && setStudents(r.data))
      .catch((e) => live && setError(e.message));
    return () => {
      live = false;
    };
  }, []);

  const departments = students ? new Set(students.map((s) => s.department)).size : 0;

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Student Registry</h1>
          <p>Keep one record per student: add, find, update and remove entries stored in MongoDB Atlas.</p>
        </div>
        <Link className="btn btn-primary" to="/students/new">
          Add student
        </Link>
      </header>

      <section className="tiers" aria-label="Connection status">
        <Tier title="Frontend" detail={window.location.host} state="up" />
        <Tier title="Backend API" detail={API_BASE} state={apiState} />
        <Tier title="Database" detail="MongoDB Atlas, studentDB" state={dbState} />
      </section>

      {error && (
        <div className="notice error" role="alert">
          {error}
        </div>
      )}
      {!error && students === null && (
        <div className="notice">
          Loading records. On a free Render plan the first request can take up to a minute while the server wakes up.
        </div>
      )}

      {students && (
        <>
          <div className="stats">
            <div className="stat">
              <strong>{students.length}</strong>
              Students on record
            </div>
            <div className="stat">
              <strong>{departments}</strong>
              {departments === 1 ? 'Department' : 'Departments'}
            </div>
          </div>

          <h2 className="section-title">Recently added</h2>
          {students.length === 0 ? (
            <div className="notice">
              No students yet. <Link to="/students/new">Add the first record</Link>.
            </div>
          ) : (
            <ul className="recent">
              {students.slice(0, 5).map((s) => (
                <li key={s._id}>
                  <span className="id-cell">{s.studentId}</span>
                  <span>{s.name}</span>
                  <span className="sub">{s.department}</span>
                  <span className="sem">Sem {s.semester}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}
