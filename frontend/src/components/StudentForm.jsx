import { useState } from 'react';
import { Link } from 'react-router-dom';

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Artificial Intelligence',
  'Electronics',
  'Electrical',
  'Mechanical',
  'Civil',
];

const EMPTY = { studentId: '', name: '', email: '', department: '', semester: '', contact: '' };

function validate(v) {
  const errors = {};
  if (!/^[A-Za-z0-9-]{3,20}$/.test(v.studentId.trim())) errors.studentId = 'Use 3 to 20 letters, digits or hyphens.';
  if (v.name.trim().length < 2) errors.name = 'Enter the student’s full name.';
  if (v.email.trim() && !/^\S+@\S+\.\S+$/.test(v.email.trim())) errors.email = 'Enter a valid email address.';
  if (!v.department.trim()) errors.department = 'Choose or type a department.';
  const semester = Number(v.semester);
  if (!Number.isInteger(semester) || semester < 1 || semester > 8) errors.semester = 'Pick a semester from 1 to 8.';
  if (v.contact.trim() && !/^\d{10}$/.test(v.contact.trim())) errors.contact = 'Contact must be a 10-digit number.';
  return errors;
}

function Field({ label, name, error, hint, full, children }) {
  return (
    <div className={`field${full ? ' full' : ''}${error ? ' has-error' : ''}`}>
      <label htmlFor={name}>{label}</label>
      {children}
      {error ? (
        <p className="field-msg error" id={`${name}-msg`}>
          {error}
        </p>
      ) : hint ? (
        <p className="field-msg" id={`${name}-msg`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export default function StudentForm({ initial, isEdit = false, submitLabel, onSubmit }) {
  const [values, setValues] = useState({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  const change = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    setServerError('');
    try {
      await onSubmit({
        studentId: values.studentId.trim().toUpperCase(),
        name: values.name.trim(),
        email: values.email.trim(),
        department: values.department.trim(),
        semester: Number(values.semester),
        contact: values.contact.trim(),
      });
    } catch (error) {
      setServerError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const props = (name) => ({
    id: name,
    name,
    value: values[name],
    onChange: change,
    'aria-invalid': errors[name] ? 'true' : undefined,
    'aria-describedby': errors[name] || name === 'studentId' ? `${name}-msg` : undefined,
  });

  return (
    <form className="form" onSubmit={submit} noValidate>
      <Field
        label="Student ID"
        name="studentId"
        error={errors.studentId}
        hint={isEdit ? 'The Student ID can’t be changed.' : 'For example ST101.'}
      >
        <input {...props('studentId')} disabled={isEdit} autoComplete="off" />
      </Field>

      <Field label="Full name" name="name" error={errors.name}>
        <input {...props('name')} autoComplete="off" />
      </Field>

      <Field label="Email (optional)" name="email" error={errors.email}>
        <input {...props('email')} type="email" autoComplete="off" />
      </Field>

      <Field label="Contact number (optional)" name="contact" error={errors.contact} hint="10 digits, no spaces.">
        <input {...props('contact')} inputMode="numeric" maxLength={10} autoComplete="off" />
      </Field>

      <Field label="Department" name="department" error={errors.department}>
        <input {...props('department')} list="departments" autoComplete="off" />
        <datalist id="departments">
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d} />
          ))}
        </datalist>
      </Field>

      <Field label="Semester" name="semester" error={errors.semester}>
        <select {...props('semester')}>
          <option value="">Choose semester</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <option key={n} value={n}>
              Semester {n}
            </option>
          ))}
        </select>
      </Field>

      {serverError && (
        <div className="form-error" role="alert">
          {serverError}
        </div>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : submitLabel}
        </button>
        <Link to="/students" className="btn btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
