import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import StudentForm from '../components/StudentForm.jsx';
import { useToast } from '../components/Toast.jsx';

export default function AddStudent() {
  const navigate = useNavigate();
  const notify = useToast();

  const save = async (data) => {
    await api.create(data);
    notify('Student added successfully.');
    navigate('/students');
  };

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Add student</h1>
          <p>Enter the student’s details. Student ID, name, department and semester are required.</p>
        </div>
      </header>
      <StudentForm submitLabel="Add student" onSubmit={save} />
    </>
  );
}
