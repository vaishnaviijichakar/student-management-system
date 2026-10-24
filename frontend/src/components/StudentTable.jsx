import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import ConfirmDialog from './ConfirmDialog.jsx';
import { useToast } from './Toast.jsx';

export default function StudentTable({ students, onDeleted }) {
  const notify = useToast();
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await api.remove(target.studentId);
      notify(`${target.name} was deleted.`);
      onDeleted(target.studentId);
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setBusy(false);
      setTarget(null);
    }
  };

  return (
    <>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Semester</th>
              <th>Contact</th>
              <th>
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id}>
                <td className="id-cell">{s.studentId}</td>
                <td>
                  {s.name}
                  <div className="sub">{s.email || 'No email on record'}</div>
                </td>
                <td>{s.department}</td>
                <td>
                  <span className="sem">{s.semester}</span>
                </td>
                <td>{s.contact || '—'}</td>
                <td>
                  <div className="actions">
                    <Link
                      className="btn btn-secondary btn-sm"
                      to={`/students/${encodeURIComponent(s.studentId)}/edit`}
                      aria-label={`Edit ${s.name}`}
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => setTarget(s)}
                      aria-label={`Delete ${s.name}`}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={Boolean(target)}
        title="Delete this student?"
        message={
          target ? `${target.name} (${target.studentId}) will be removed from the database. This can’t be undone.` : ''
        }
        confirmLabel="Delete student"
        cancelLabel="Keep student"
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setTarget(null)}
      />
    </>
  );
}
