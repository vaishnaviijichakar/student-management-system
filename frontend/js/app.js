/**
 * Student Management System - Frontend App Logic
 * Deployed on Vercel | Communicates with Render Backend & MongoDB
 */

// Configuration: Default Backend API URL
const DEFAULT_API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : 'https://student-management-backend.onrender.com';

let currentApiUrl = localStorage.getItem('sms_backend_url') || DEFAULT_API_URL;
let studentsData = [];

// DOM Elements
const apiUrlInput = document.getElementById('apiUrlInput');
const saveApiBtn = document.getElementById('saveApiBtn');
const backendStatusBadge = document.getElementById('backendStatusBadge');
const studentsTableBody = document.getElementById('studentsTableBody');
const searchInput = document.getElementById('searchInput');
const departmentFilter = document.getElementById('departmentFilter');
const statusFilter = document.getElementById('statusFilter');
const statTotal = document.getElementById('statTotal');
const statActive = document.getElementById('statActive');
const statGraduated = document.getElementById('statGraduated');
const statAvgGpa = document.getElementById('statAvgGpa');
const seedDataBtn = document.getElementById('seedDataBtn');

// Modals
const studentModal = document.getElementById('studentModal');
const openAddStudentBtn = document.getElementById('openAddStudentBtn');
const closeStudentModal = document.getElementById('closeStudentModal');
const cancelStudentModal = document.getElementById('cancelStudentModal');
const studentForm = document.getElementById('studentForm');
const modalTitle = document.getElementById('modalTitle');

const mongoDoctorModal = document.getElementById('mongoDoctorModal');
const openMongoDoctorBtn = document.getElementById('openMongoDoctorBtn');
const closeMongoDoctorModal = document.getElementById('closeMongoDoctorModal');
const closeDoctorFooterBtn = document.getElementById('closeDoctorFooterBtn');
const runMongoDoctorBtn = document.getElementById('runMongoDoctorBtn');
const rawMongoUriInput = document.getElementById('rawMongoUriInput');
const mongoDoctorResults = document.getElementById('mongoDoctorResults');
const mongoDoctorOutput = document.getElementById('mongoDoctorOutput');

const toast = document.getElementById('toast');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  apiUrlInput.value = currentApiUrl;
  checkBackendHealth();
  fetchStudents();
  fetchStats();

  // Event Listeners
  saveApiBtn.addEventListener('click', handleSaveApiUrl);
  searchInput.addEventListener('input', renderStudentsTable);
  departmentFilter.addEventListener('change', renderStudentsTable);
  statusFilter.addEventListener('change', renderStudentsTable);
  seedDataBtn.addEventListener('click', handleSeedData);

  // Student Modal Listeners
  openAddStudentBtn.addEventListener('click', () => openStudentModal());
  closeStudentModal.addEventListener('click', closeAllModals);
  cancelStudentModal.addEventListener('click', closeAllModals);
  studentForm.addEventListener('submit', handleSaveStudent);

  // Mongo Doctor Listeners
  openMongoDoctorBtn.addEventListener('click', () => {
    mongoDoctorModal.classList.add('open');
  });
  closeMongoDoctorModal.addEventListener('click', closeAllModals);
  closeDoctorFooterBtn.addEventListener('click', closeAllModals);
  runMongoDoctorBtn.addEventListener('click', handleRunMongoDoctor);

  // Auto-refresh health every 30s
  setInterval(checkBackendHealth, 30000);
});

// Toast notification helper
function showToast(message, isError = false) {
  toast.textContent = message;
  toast.style.backgroundColor = isError ? '#ef4444' : '#1e293b';
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3500);
}

function closeAllModals() {
  studentModal.classList.remove('open');
  mongoDoctorModal.classList.remove('open');
}

// Health Check
async function checkBackendHealth() {
  backendStatusBadge.className = 'badge badge-status-offline';
  backendStatusBadge.textContent = '● Connecting...';

  try {
    const res = await fetch(`${currentApiUrl}/api/health`, { method: 'GET' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const isDbConnected = data.database && data.database.status === 'connected';
    backendStatusBadge.className = 'badge badge-status-online';
    backendStatusBadge.textContent = isDbConnected
      ? '● Backend & MongoDB: Live'
      : '● Render: Online (DB Degraded)';
  } catch (err) {
    backendStatusBadge.className = 'badge badge-status-offline';
    backendStatusBadge.textContent = '● Backend Disconnected';
  }
}

// Save & switch API URL
function handleSaveApiUrl() {
  const newUrl = apiUrlInput.value.trim().replace(/\/+$/, '');
  if (!newUrl) return;
  currentApiUrl = newUrl;
  localStorage.setItem('sms_backend_url', currentApiUrl);
  showToast(`Connected to backend: ${currentApiUrl}`);
  checkBackendHealth();
  fetchStudents();
  fetchStats();
}

// Fetch Students
async function fetchStudents() {
  try {
    const res = await fetch(`${currentApiUrl}/api/students`);
    if (!res.ok) throw new Error('Could not fetch students');
    const json = await res.json();
    studentsData = json.data || [];
    renderStudentsTable();
  } catch (err) {
    console.error('Fetch error:', err);
    studentsTableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 2rem; color: var(--danger);">
          Failed to load students from ${currentApiUrl}. Ensure the Render backend is running.
        </td>
      </tr>
    `;
  }
}

// Fetch Stats
async function fetchStats() {
  try {
    const res = await fetch(`${currentApiUrl}/api/students/stats/summary`);
    if (!res.ok) return;
    const json = await res.json();
    const data = json.data || {};
    statTotal.textContent = data.total || 0;
    statActive.textContent = data.active || 0;
    statGraduated.textContent = data.graduated || 0;
    statAvgGpa.textContent = (data.avgGpa || 0).toFixed(1);
  } catch (err) {
    console.warn('Stats fetch warning:', err);
  }
}

// Render Table
function renderStudentsTable() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedDept = departmentFilter.value;
  const selectedStatus = statusFilter.value;

  const filtered = studentsData.filter((student) => {
    const matchesSearch =
      !searchTerm ||
      student.name?.toLowerCase().includes(searchTerm) ||
      student.rollNumber?.toLowerCase().includes(searchTerm) ||
      student.email?.toLowerCase().includes(searchTerm);

    const matchesDept = selectedDept === 'All' || student.department === selectedDept;
    const matchesStatus = selectedStatus === 'All' || student.status === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  if (filtered.length === 0) {
    studentsTableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-muted);">
          No students match the current criteria. Click "Add New Student" or "Seed Sample Students".
        </td>
      </tr>
    `;
    return;
  }

  studentsTableBody.innerHTML = filtered
    .map((s) => {
      const statusPillClass =
        s.status === 'Active'
          ? 'pill-active'
          : s.status === 'Graduated'
          ? 'pill-graduated'
          : 'pill-inactive';

      const coursesHtml = (s.courses || [])
        .map((c) => `<span class="course-tag">${escapeHtml(c)}</span>`)
        .join('');

      return `
        <tr>
          <td><strong>${escapeHtml(s.rollNumber || '')}</strong></td>
          <td>
            <div class="student-meta">${escapeHtml(s.name || '')}</div>
            <div class="student-email">${escapeHtml(s.email || '')}</div>
          </td>
          <td>${escapeHtml(s.department || '')}</td>
          <td>Yr ${s.year || 1} &bull; Sem ${s.semester || 1}</td>
          <td><strong>${(s.gpa || 0).toFixed(1)}</strong></td>
          <td>${coursesHtml || '<span style="color: #94a3b8;">None</span>'}</td>
          <td><span class="pill ${statusPillClass}">${escapeHtml(s.status || 'Active')}</span></td>
          <td>
            <div class="action-btns">
              <button class="btn-icon" onclick="openStudentModal('${s._id}')" title="Edit Student">✏️</button>
              <button class="btn-icon" onclick="deleteStudent('${s._id}')" title="Delete Student" style="color: var(--danger);">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

// Open Add/Edit Modal
function openStudentModal(id = null) {
  studentForm.reset();
  document.getElementById('studentId').value = '';

  if (id) {
    const student = studentsData.find((s) => s._id === id);
    if (!student) return;
    modalTitle.textContent = 'Edit Student Details';
    document.getElementById('studentId').value = student._id;
    document.getElementById('studentName').value = student.name || '';
    document.getElementById('studentRoll').value = student.rollNumber || '';
    document.getElementById('studentEmail').value = student.email || '';
    document.getElementById('studentDept').value = student.department || 'Computer Science';
    document.getElementById('studentYear').value = student.year || 1;
    document.getElementById('studentSem').value = student.semester || 1;
    document.getElementById('studentGpa').value = student.gpa || 8.0;
    document.getElementById('studentStatus').value = student.status || 'Active';
    document.getElementById('studentCourses').value = (student.courses || []).join(', ');
  } else {
    modalTitle.textContent = 'Add New Student';
  }

  studentModal.classList.add('open');
}

// Save Student (Create or Update)
async function handleSaveStudent(e) {
  e.preventDefault();
  const id = document.getElementById('studentId').value;
  const isEdit = Boolean(id);

  const rawCourses = document.getElementById('studentCourses').value;
  const courses = rawCourses
    ? rawCourses.split(',').map((c) => c.trim()).filter(Boolean)
    : [];

  const payload = {
    name: document.getElementById('studentName').value.trim(),
    rollNumber: document.getElementById('studentRoll').value.trim().toUpperCase(),
    email: document.getElementById('studentEmail').value.trim(),
    department: document.getElementById('studentDept').value,
    year: Number(document.getElementById('studentYear').value),
    semester: Number(document.getElementById('studentSem').value),
    gpa: Number(document.getElementById('studentGpa').value),
    status: document.getElementById('studentStatus').value,
    courses,
  };

  try {
    const url = isEdit ? `${currentApiUrl}/api/students/${id}` : `${currentApiUrl}/api/students`;
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error saving student');

    showToast(isEdit ? 'Student updated successfully!' : 'Student created successfully!');
    closeAllModals();
    fetchStudents();
    fetchStats();
  } catch (err) {
    showToast(err.message, true);
  }
}

// Delete Student
async function deleteStudent(id) {
  if (!confirm('Are you sure you want to delete this student record?')) return;

  try {
    const res = await fetch(`${currentApiUrl}/api/students/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error deleting student');

    showToast('Student deleted successfully');
    fetchStudents();
    fetchStats();
  } catch (err) {
    showToast(err.message, true);
  }
}

// Seed Data
async function handleSeedData() {
  try {
    seedDataBtn.disabled = true;
    seedDataBtn.textContent = '⚡ Seeding...';

    const res = await fetch(`${currentApiUrl}/api/students/seed`, {
      method: 'POST',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Seeding failed');

    showToast(json.message || 'Sample students seeded!');
    fetchStudents();
    fetchStats();
  } catch (err) {
    showToast(err.message, true);
  } finally {
    seedDataBtn.disabled = false;
    seedDataBtn.textContent = '⚡ Seed Sample Students';
  }
}

// MongoDB Doctor Client Runner
function handleRunMongoDoctor() {
  const rawUri = rawMongoUriInput.value.trim();
  if (!rawUri) {
    alert('Please enter a MongoDB URI to analyze.');
    return;
  }

  // Client-side auto-repair engine
  const issues = [];
  const fixes = [];
  let repaired = rawUri;

  const isSrv = rawUri.startsWith('mongodb+srv://');
  const isStd = rawUri.startsWith('mongodb://');
  if (!isSrv && !isStd) {
    issues.push('URI does not start with mongodb+srv:// or mongodb://');
  }

  const protocol = isSrv ? 'mongodb+srv://' : 'mongodb://';
  let rest = rawUri.replace(/^mongodb(\+srv)?:\/\//, '');

  if (rest.includes('@')) {
    const atIdx = rest.lastIndexOf('@');
    const userPass = rest.substring(0, atIdx);
    const hostRest = rest.substring(atIdx + 1);

    if (userPass.includes(':')) {
      const colonIdx = userPass.indexOf(':');
      let user = userPass.substring(0, colonIdx);
      let pass = userPass.substring(colonIdx + 1);

      if (pass.includes('@') || pass.includes('#') || pass.includes(':') || pass.includes('/') || pass.includes('?') || pass.includes('%')) {
        issues.push('Password contains unencoded special characters that crash URI parsers.');
        pass = encodeURIComponent(decodeURIComponent(pass));
        user = encodeURIComponent(decodeURIComponent(user));
        fixes.push('URL-encoded credentials with encodeURIComponent.');
      }

      let host = hostRest;
      let query = '';
      if (hostRest.includes('?')) {
        const qIdx = hostRest.indexOf('?');
        query = hostRest.substring(qIdx + 1);
        host = hostRest.substring(0, qIdx);
      }

      let db = '';
      if (host.includes('/')) {
        const sIdx = host.indexOf('/');
        db = host.substring(sIdx + 1);
        host = host.substring(0, sIdx);
      }

      if (!db || db === 'test') {
        issues.push('Database name is empty or defaulted to "test".');
        db = 'student_management_db';
        fixes.push('Configured database path to "/student_management_db".');
      }

      const params = new URLSearchParams(query);
      if (!params.has('retryWrites')) {
        params.set('retryWrites', 'true');
        fixes.push('Added retryWrites=true');
      }
      if (!params.has('w')) {
        params.set('w', 'majority');
        fixes.push('Added w=majority');
      }

      repaired = `${protocol}${user}:${pass}@${host}/${db}?${params.toString()}`;
    }
  }

  mongoDoctorResults.style.display = 'block';
  mongoDoctorOutput.textContent = JSON.stringify(
    {
      status: issues.length > 0 ? 'Repaired' : 'Valid',
      issuesDetected: issues,
      fixesApplied: fixes,
      repairedConnectionString: repaired,
      cloudInstructions: [
        '1. Copy the repairedConnectionString above.',
        '2. Add to Render: Dashboard -> Service -> Environment -> MONGODB_URI.',
        '3. MongoDB Atlas: In Network Access, whitelist 0.0.0.0/0 (required for Render & Vercel dynamic IPs).',
      ],
    },
    null,
    2
  );
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
