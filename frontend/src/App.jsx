import { NavLink, Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx';
import StudentList from './pages/StudentList.jsx';
import AddStudent from './pages/AddStudent.jsx';
import EditStudent from './pages/EditStudent.jsx';
import SearchStudent from './pages/SearchStudent.jsx';
import NotFound from './pages/NotFound.jsx';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/students', label: 'Student list', end: true },
  { to: '/students/new', label: 'Add student' },
  { to: '/search', label: 'Search' },
];

export default function App() {
  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">
          Student Registry
          <small>Information management</small>
        </div>
        <nav className="nav" aria-label="Main">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <p className="side-foot">React on Netlify, Express on Render, MongoDB on Atlas.</p>
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/students" element={<StudentList />} />
          <Route path="/students/new" element={<AddStudent />} />
          <Route path="/students/:id/edit" element={<EditStudent />} />
          <Route path="/search" element={<SearchStudent />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}
