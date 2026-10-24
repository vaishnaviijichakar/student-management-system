import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import StudentTable from '../components/StudentTable.jsx';

export default function StudentList() {
  const [students, setStudents] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    api
      .list()
      .then((r) => live && setStudents(r.data))
      .catch((e) => live && setError(e.message));
    return () => {
      live = false;
    };
  }, []);

  const removeLocal = (studentId) => setStudents((list) => list.filter((s) => s.studentId !== studentId));

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Student list</h1>
          <p>
            {students
              ? `${students.length} ${students.length === 1 ? 'record' : 'records'} in the database.`
              : 'Loading records…'}
          </p>
        </div>
        <Link className="btn btn-primary" to="/students/new">
          Add student
        </Link>
      </header>

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
      {students && students.length === 0 && (
        <div className="notice">
          No students yet. <Link to="/students/new">Add the first record</Link>.
        </div>
      )}
      {students && students.length > 0 && <StudentTable students={students} onDeleted={removeLocal} />}
    </>
  );
}
