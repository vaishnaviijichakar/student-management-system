import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import StudentForm from '../components/StudentForm.jsx';
import { useToast } from '../components/Toast.jsx';

export default function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useToast();
  const [student, setStudent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    api
      .get(id)
      .then((r) => live && setStudent(r.data))
      .catch((e) => live && setError(e.message));
    return () => {
      live = false;
    };
  }, [id]);

  const save = async (data) => {
    const { studentId, ...changes } = data; // the ID is fixed
    await api.update(id, changes);
    notify('Student updated successfully.');
    navigate('/students');
  };

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Edit student</h1>
          <p>Change any detail except the Student ID, then save.</p>
        </div>
      </header>

      {error && (
        <div className="notice error" role="alert">
          {error} <Link to="/students">Back to the list</Link>
        </div>
      )}
      {!error && !student && <div className="notice">Loading student…</div>}
      {student && (
        <StudentForm
          isEdit
          submitLabel="Save changes"
          onSubmit={save}
          initial={{
            studentId: student.studentId,
            name: student.name,
            email: student.email || '',
            department: student.department,
            semester: String(student.semester),
            contact: student.contact || '',
          }}
        />
      )}
    </>
  );
}
