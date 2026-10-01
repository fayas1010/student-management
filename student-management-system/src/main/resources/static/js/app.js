/* ==========================================================================
   STUDENT MANAGEMENT SYSTEM - FRONTEND CLIENT & LOGIC (Ready to Work)
   ========================================================================== */

// Initial Mock / Demo Data for seamless immediate offline testing
const DEMO_STATE = {
  departments: [
    { id: 1, name: "Computer Science & Engineering" },
    { id: 2, name: "Information Technology" },
    { id: 3, name: "Electronics & Communication" },
    { id: 4, name: "Mechanical Engineering" }
  ],
  classrooms: [
    { id: 1, className: "CSE - Hall 301", department: { id: 1, name: "Computer Science & Engineering" } },
    { id: 2, className: "CSE - Lab 2", department: { id: 1, name: "Computer Science & Engineering" } },
    { id: 3, className: "IT - Room 104", department: { id: 2, name: "Information Technology" } },
    { id: 4, className: "ECE - Signal Lab", department: { id: 3, name: "Electronics & Communication" } }
  ],
  staff: [
    { id: 1, name: "Dr. Eleanor Vance", role: "MANAGEMENT", subject: "", department: { id: 1, name: "Computer Science & Engineering" }, classroom: null },
    { id: 2, name: "Prof. Alan Turing", role: "TEACHER", subject: "Algorithms & AI", department: { id: 1, name: "Computer Science & Engineering" }, classroom: { id: 1, className: "CSE - Hall 301" } },
    { id: 3, name: "Dr. Grace Hopper", role: "TEACHER", subject: "Compiler Design", department: { id: 2, name: "Information Technology" }, classroom: { id: 3, className: "IT - Room 104" } },
    { id: 4, name: "Prof. Nikola Tesla", role: "TEACHER", subject: "Electromagnetics", department: { id: 3, name: "Electronics & Communication" }, classroom: { id: 4, className: "ECE - Signal Lab" } }
  ],
  students: [
    { id: 1, name: "Aria Montgomery", rollNumber: "CS2024-001", cgpa: 9.65, classroom: { id: 1, className: "CSE - Hall 301", department: { id: 1, name: "Computer Science & Engineering" } } },
    { id: 2, name: "Lucas Vance", rollNumber: "CS2024-002", cgpa: 8.85, classroom: { id: 1, className: "CSE - Hall 301", department: { id: 1, name: "Computer Science & Engineering" } } },
    { id: 3, name: "Sophia Chen", rollNumber: "IT2024-015", cgpa: 9.20, classroom: { id: 3, className: "IT - Room 104", department: { id: 2, name: "Information Technology" } } },
    { id: 4, name: "Devon Rivera", rollNumber: "EC2024-032", cgpa: 7.45, classroom: { id: 4, className: "ECE - Signal Lab", department: { id: 3, name: "Electronics & Communication" } } },
    { id: 5, name: "Maya Patel", rollNumber: "CS2024-019", cgpa: 6.80, classroom: { id: 2, className: "CSE - Lab 2", department: { id: 1, name: "Computer Science & Engineering" } } },
    { id: 6, name: "Ethan Brooks", rollNumber: "ME2024-008", cgpa: 8.10, classroom: { id: 1, className: "CSE - Hall 301", department: { id: 4, name: "Mechanical Engineering" } } }
  ]
};

// Application State
const AppState = {
  apiBase: window.location.origin.includes('8080') ? '/api' : 'http://localhost:8080/api',
  isLiveBackend: false,
  currentUserRole: localStorage.getItem('sms_role') || 'MANAGEMENT', // default to MANAGEMENT for convenience
  isLoggedIn: localStorage.getItem('sms_logged_in') === 'true',
  students: [],
  staff: [],
  departments: [],
  classrooms: [],
  selectedStudent: null,
  selectedStaff: null,
  selectedDept: null,
  selectedClass: null
};

// ==========================================================================
// TOAST NOTIFICATIONS
// ==========================================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  toast.innerHTML = `<strong>${icon}</strong><span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ==========================================================================
// API CLIENT
// ==========================================================================
async function apiRequest(endpoint, method = 'GET', body = null) {
  if (!AppState.isLiveBackend) {
    return handleMockRequest(endpoint, method, body);
  }

  const url = `${AppState.apiBase}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'role': AppState.currentUserRole
  };

  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || `HTTP ${res.status}`);
    }
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    }
    return await res.text();
  } catch (err) {
    console.warn(`Live API call to ${endpoint} failed:`, err.message);
    throw err;
  }
}

// Mock Handler for offline or fallback demo
function handleMockRequest(endpoint, method, body) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Auth Login
      if (endpoint === '/auth/login' && method === 'POST') {
        if (body.password === 'admin123') {
          resolve("SUCCESS");
        } else {
          reject(new Error("Invalid password (Demo password is: admin123)"));
        }
        return;
      }

      // Departments
      if (endpoint === '/departments') {
        if (method === 'GET') return resolve([...AppState.departments]);
        if (method === 'POST') {
          const newDept = { id: Date.now(), name: body.name };
          AppState.departments.push(newDept);
          return resolve(newDept);
        }
      }
      if (endpoint.startsWith('/departments/')) {
        const id = parseInt(endpoint.split('/')[2]);
        if (method === 'DELETE') {
          AppState.departments = AppState.departments.filter(d => d.id !== id);
          return resolve("Deleted successfully");
        }
        if (method === 'PUT') {
          const idx = AppState.departments.findIndex(d => d.id === id);
          if (idx !== -1) {
            AppState.departments[idx].name = body.name;
            return resolve(AppState.departments[idx]);
          }
        }
      }

      // Classrooms
      if (endpoint === '/classrooms') {
        if (method === 'GET') return resolve([...AppState.classrooms]);
        if (method === 'POST') {
          const dept = AppState.departments.find(d => d.id == (body.department?.id || body.department)) || null;
          const newClass = { id: Date.now(), className: body.className, department: dept };
          AppState.classrooms.push(newClass);
          return resolve(newClass);
        }
      }
      if (endpoint.startsWith('/classrooms/')) {
        const id = parseInt(endpoint.split('/')[2]);
        if (method === 'DELETE') {
          AppState.classrooms = AppState.classrooms.filter(c => c.id !== id);
          return resolve("Deleted successfully");
        }
        if (method === 'PUT') {
          const idx = AppState.classrooms.findIndex(c => c.id === id);
          if (idx !== -1) {
            const dept = AppState.departments.find(d => d.id == (body.department?.id || body.department)) || AppState.classrooms[idx].department;
            AppState.classrooms[idx] = { id, className: body.className, department: dept };
            return resolve(AppState.classrooms[idx]);
          }
        }
      }

      // Students
      if (endpoint === '/students') {
        if (method === 'GET') return resolve([...AppState.students]);
        if (method === 'POST') {
          const cls = AppState.classrooms.find(c => c.id == (body.classroom?.id || body.classroom)) || null;
          const newStudent = { id: Date.now(), name: body.name, rollNumber: body.rollNumber, cgpa: parseFloat(body.cgpa) || 0, classroom: cls };
          AppState.students.push(newStudent);
          return resolve(newStudent);
        }
      }
      if (endpoint.startsWith('/students/rollnumber/')) {
        const roll = endpoint.replace('/students/rollnumber/', '').trim().toLowerCase();
        const found = AppState.students.find(s => s.rollNumber && s.rollNumber.toLowerCase() === roll);
        return resolve(found || null);
      }
      if (endpoint.startsWith('/students/')) {
        const id = parseInt(endpoint.split('/')[2]);
        if (method === 'DELETE') {
          AppState.students = AppState.students.filter(s => s.id !== id);
          return resolve("Deleted successfully");
        }
        if (method === 'PUT') {
          const idx = AppState.students.findIndex(s => s.id === id);
          if (idx !== -1) {
            const cls = AppState.classrooms.find(c => c.id == (body.classroom?.id || body.classroom)) || AppState.students[idx].classroom;
            AppState.students[idx] = { id, name: body.name, rollNumber: body.rollNumber, cgpa: parseFloat(body.cgpa) || 0, classroom: cls };
            return resolve(AppState.students[idx]);
          }
        }
      }

      // Staff
      if (endpoint === '/staff') {
        if (method === 'GET') return resolve([...AppState.staff]);
        if (method === 'POST') {
          const dept = AppState.departments.find(d => d.id == (body.department?.id || body.department)) || null;
          const cls = AppState.classrooms.find(c => c.id == (body.classroom?.id || body.classroom)) || null;
          const newStaff = { id: Date.now(), name: body.name, role: body.role, subject: body.subject, department: dept, classroom: cls };
          AppState.staff.push(newStaff);
          return resolve(newStaff);
        }
      }
      if (endpoint.startsWith('/staff/') && endpoint.endsWith('/classroom')) {
        const id = parseInt(endpoint.split('/')[2]);
        const s = AppState.staff.find(st => st.id === id);
        return resolve(s?.classroom || null);
      }
      if (endpoint.startsWith('/staff/')) {
        const id = parseInt(endpoint.split('/')[2]);
        if (method === 'DELETE') {
          AppState.staff = AppState.staff.filter(st => st.id !== id);
          return resolve("Deleted successfully");
        }
        if (method === 'PUT') {
          const idx = AppState.staff.findIndex(st => st.id === id);
          if (idx !== -1) {
            const dept = AppState.departments.find(d => d.id == (body.department?.id || body.department)) || AppState.staff[idx].department;
            const cls = AppState.classrooms.find(c => c.id == (body.classroom?.id || body.classroom)) || AppState.staff[idx].classroom;
            AppState.staff[idx] = { id, name: body.name, role: body.role, subject: body.subject, department: dept, classroom: cls };
            return resolve(AppState.staff[idx]);
          }
        }
      }

      resolve(null);
    }, 120);
  });
}

// ==========================================================================
// BACKEND DETECTION & INITIALIZATION
// ==========================================================================
async function detectBackend() {
  const pill = document.getElementById('backendStatusPill');
  const statusText = document.getElementById('backendStatusText');

  try {
    const res = await fetch(`${AppState.apiBase}/departments`, { method: 'GET', headers: { 'role': 'MANAGEMENT' } });
    if (res.ok) {
      AppState.isLiveBackend = true;
      if (pill) {
        pill.className = 'status-pill online';
        statusText.textContent = 'Backend: Online (8080)';
      }
      showToast("Connected to Spring Boot Live Backend!", "success");
      return true;
    }
  } catch (e) {
    // Backend is offline or not running yet
  }

  AppState.isLiveBackend = false;
  // Initialize with rich demo state
  AppState.departments = JSON.parse(JSON.stringify(DEMO_STATE.departments));
  AppState.classrooms = JSON.parse(JSON.stringify(DEMO_STATE.classrooms));
  AppState.staff = JSON.parse(JSON.stringify(DEMO_STATE.staff));
  AppState.students = JSON.parse(JSON.stringify(DEMO_STATE.students));

  if (pill) {
    pill.className = 'status-pill demo';
    statusText.textContent = 'Demo Mode (Click to Connect)';
  }
  showToast("Running in Turnkey Demo Mode. All features active!", "info");
  return false;
}

// ==========================================================================
// DATA LOADING
// ==========================================================================
async function loadAllData() {
  try {
    const [depts, classes, staff, students] = await Promise.all([
      apiRequest('/departments'),
      apiRequest('/classrooms'),
      apiRequest('/staff'),
      apiRequest('/students')
    ]);

    AppState.departments = Array.isArray(depts) ? depts : AppState.departments;
    AppState.classrooms = Array.isArray(classes) ? classes : AppState.classrooms;
    AppState.staff = Array.isArray(staff) ? staff : AppState.staff;
    AppState.students = Array.isArray(students) ? students : AppState.students;

    renderDashboard();
    renderStudentsTable();
    renderStaffTable();
    renderDepartmentsAndClassrooms();
    populateDropdowns();
  } catch (err) {
    showToast("Error loading data: " + err.message, "error");
  }
}

// ==========================================================================
// DASHBOARD RENDERING
// ==========================================================================
function renderDashboard() {
  document.getElementById('statTotalStudents').textContent = AppState.students.length;
  document.getElementById('statTotalStaff').textContent = AppState.staff.length;
  document.getElementById('statTotalDepts').textContent = AppState.departments.length;
  document.getElementById('statTotalClasses').textContent = AppState.classrooms.length;

  // Calculate Average CGPA
  const totalCgpa = AppState.students.reduce((acc, s) => acc + (parseFloat(s.cgpa) || 0), 0);
  const avgCgpa = AppState.students.length ? (totalCgpa / AppState.students.length).toFixed(2) : "0.00";
  document.getElementById('statAvgCgpa').textContent = avgCgpa;

  // Calculate CGPA Distributions
  const total = AppState.students.length || 1;
  const distinction = AppState.students.filter(s => s.cgpa >= 8.5).length;
  const firstClass = AppState.students.filter(s => s.cgpa >= 7.0 && s.cgpa < 8.5).length;
  const secondClass = AppState.students.filter(s => s.cgpa >= 5.5 && s.cgpa < 7.0).length;
  const atRisk = AppState.students.filter(s => s.cgpa < 5.5).length;

  document.getElementById('barDistinctionCount').textContent = `${distinction} (${Math.round(distinction/total*100)}%)`;
  document.getElementById('barDistinctionFill').style.width = `${Math.round(distinction/total*100)}%`;

  document.getElementById('barFirstCount').textContent = `${firstClass} (${Math.round(firstClass/total*100)}%)`;
  document.getElementById('barFirstFill').style.width = `${Math.round(firstClass/total*100)}%`;

  document.getElementById('barSecondCount').textContent = `${secondClass} (${Math.round(secondClass/total*100)}%)`;
  document.getElementById('barSecondFill').style.width = `${Math.round(secondClass/total*100)}%`;

  document.getElementById('barRiskCount').textContent = `${atRisk} (${Math.round(atRisk/total*100)}%)`;
  document.getElementById('barRiskFill').style.width = `${Math.round(atRisk/total*100)}%`;

  // Render Recent Registrations Table in Dashboard
  const recentTbody = document.getElementById('recentStudentsTbody');
  if (recentTbody) {
    const recents = [...AppState.students].slice(-4).reverse();
    if (recents.length === 0) {
      recentTbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">No records found.</td></tr>`;
    } else {
      recentTbody.innerHTML = recents.map(s => `
        <tr>
          <td>
            <div class="user-cell">
              <div class="avatar">${getInitials(s.name)}</div>
              <div class="user-info">
                <div class="name">${escapeHtml(s.name)}</div>
                <div class="sub">${escapeHtml(s.rollNumber || 'N/A')}</div>
              </div>
            </div>
          </td>
          <td>${escapeHtml(s.classroom?.className || 'Unassigned')}</td>
          <td>${escapeHtml(s.classroom?.department?.name || 'General')}</td>
          <td>${getCgpaBadge(s.cgpa)}</td>
        </tr>
      `).join('');
    }
  }
}

// ==========================================================================
// STUDENTS DIRECTORY
// ==========================================================================
function renderStudentsTable() {
  const tbody = document.getElementById('studentsTableBody');
  if (!tbody) return;

  const searchQuery = document.getElementById('studentSearchInput')?.value.toLowerCase().trim() || '';
  const deptFilter = document.getElementById('studentDeptFilter')?.value || '';
  const classFilter = document.getElementById('studentClassFilter')?.value || '';
  const sortBy = document.getElementById('studentSortSelect')?.value || 'name';

  let list = AppState.students.filter(s => {
    const matchSearch = (s.name && s.name.toLowerCase().includes(searchQuery)) ||
                        (s.rollNumber && s.rollNumber.toLowerCase().includes(searchQuery));
    const matchDept = !deptFilter || (s.classroom?.department?.id == deptFilter);
    const matchClass = !classFilter || (s.classroom?.id == classFilter);
    return matchSearch && matchDept && matchClass;
  });

  // Sorting
  list.sort((a, b) => {
    if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
    if (sortBy === 'rollNumber') return (a.rollNumber || '').localeCompare(b.rollNumber || '');
    if (sortBy === 'cgpa-desc') return (b.cgpa || 0) - (a.cgpa || 0);
    if (sortBy === 'cgpa-asc') return (a.cgpa || 0) - (b.cgpa || 0);
    return 0;
  });

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            <h4>No students found</h4>
            <p>Try adjusting your search criteria or add a new student using the button above.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map(s => `
    <tr>
      <td>
        <div class="user-cell">
          <div class="avatar">${getInitials(s.name)}</div>
          <div class="user-info">
            <div class="name">${escapeHtml(s.name)}</div>
            <div class="sub">ID: #${s.id}</div>
          </div>
        </div>
      </td>
      <td><strong style="font-family:var(--font-heading); letter-spacing:0.04em;">${escapeHtml(s.rollNumber || 'N/A')}</strong></td>
      <td>${escapeHtml(s.classroom?.department?.name || '—')}</td>
      <td>${escapeHtml(s.classroom?.className || 'Unassigned')}</td>
      <td>${getCgpaBadge(s.cgpa)}</td>
      <td>
        <div class="row-actions">
          <button class="action-icon-btn" title="View Report" onclick="lookupByRoll('${escapeHtml(s.rollNumber)}')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="action-icon-btn" title="Edit Student" onclick="openEditStudentModal(${s.id})">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="action-icon-btn delete" title="Delete Student" onclick="confirmDelete('student', ${s.id}, '${escapeHtml(s.name)}')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ==========================================================================
// STAFF DIRECTORY
// ==========================================================================
function renderStaffTable() {
  const tbody = document.getElementById('staffTableBody');
  if (!tbody) return;

  const searchQuery = document.getElementById('staffSearchInput')?.value.toLowerCase().trim() || '';
  const roleFilter = document.getElementById('staffRoleFilter')?.value || '';
  const deptFilter = document.getElementById('staffDeptFilter')?.value || '';

  let list = AppState.staff.filter(st => {
    const matchSearch = (st.name && st.name.toLowerCase().includes(searchQuery)) ||
                        (st.subject && st.subject.toLowerCase().includes(searchQuery));
    const matchRole = !roleFilter || (st.role && st.role.toUpperCase() === roleFilter.toUpperCase());
    const matchDept = !deptFilter || (st.department?.id == deptFilter);
    return matchSearch && matchRole && matchDept;
  });

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            <h4>No staff members found</h4>
            <p>Add faculty or management staff using the button above.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map(st => `
    <tr>
      <td>
        <div class="user-cell">
          <div class="avatar" style="background: linear-gradient(135deg, #8b5cf6, #ec4899);">${getInitials(st.name)}</div>
          <div class="user-info">
            <div class="name">${escapeHtml(st.name)}</div>
            <div class="sub">ID: #${st.id}</div>
          </div>
        </div>
      </td>
      <td>
        <span class="tag-badge ${st.role?.toLowerCase() === 'management' ? 'management' : 'teacher'}">
          ${escapeHtml(st.role || 'TEACHER')}
        </span>
      </td>
      <td>${escapeHtml(st.subject || '—')}</td>
      <td>${escapeHtml(st.department?.name || '—')}</td>
      <td>
        ${st.classroom ? `
          <span class="tag-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            ${escapeHtml(st.classroom.className)}
          </span>
        ` : '<span style="color:var(--text-dim); font-size:0.8rem;">None (Management)</span>'}
      </td>
      <td>
        <div class="row-actions">
          <button class="action-icon-btn" title="Edit Staff" onclick="openEditStaffModal(${st.id})">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="action-icon-btn delete" title="Delete Staff" onclick="confirmDelete('staff', ${st.id}, '${escapeHtml(st.name)}')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ==========================================================================
// DEPARTMENTS & CLASSROOMS RENDERING
// ==========================================================================
function renderDepartmentsAndClassrooms() {
  const deptList = document.getElementById('departmentsList');
  const classList = document.getElementById('classroomsList');

  if (deptList) {
    if (AppState.departments.length === 0) {
      deptList.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;">No departments added yet.</div>`;
    } else {
      deptList.innerHTML = AppState.departments.map(d => {
        const associatedClasses = AppState.classrooms.filter(c => c.department?.id === d.id).length;
        const associatedStudents = AppState.students.filter(s => s.classroom?.department?.id === d.id).length;
        return `
          <div class="entity-card">
            <div class="entity-card-info">
              <h4>${escapeHtml(d.name)}</h4>
              <p>${associatedClasses} Classrooms • ${associatedStudents} Students enrolled</p>
            </div>
            <div class="row-actions">
              <button class="action-icon-btn" title="Edit" onclick="openEditDeptModal(${d.id})">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="action-icon-btn delete" title="Delete" onclick="confirmDelete('department', ${d.id}, '${escapeHtml(d.name)}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  if (classList) {
    if (AppState.classrooms.length === 0) {
      classList.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;">No classrooms registered yet.</div>`;
    } else {
      classList.innerHTML = AppState.classrooms.map(c => {
        const studentCount = AppState.students.filter(s => s.classroom?.id === c.id).length;
        return `
          <div class="entity-card">
            <div class="entity-card-info">
              <h4>${escapeHtml(c.className)}</h4>
              <p>${escapeHtml(c.department?.name || 'General')} • ${studentCount} Students</p>
            </div>
            <div class="row-actions">
              <button class="action-icon-btn" title="Edit" onclick="openEditClassModal(${c.id})">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="action-icon-btn delete" title="Delete" onclick="confirmDelete('classroom', ${c.id}, '${escapeHtml(c.className)}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

// ==========================================================================
// STUDENT CGPA LOOKUP PORTAL
// ==========================================================================
async function performCgpaLookup(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('cgpaRollInput');
  const roll = input?.value.trim();
  if (!roll) {
    showToast("Please enter a valid student roll number", "warning");
    return;
  }

  try {
    let student = null;
    if (AppState.isLiveBackend) {
      student = await apiRequest(`/students/rollnumber/${encodeURIComponent(roll)}`);
    } else {
      student = AppState.students.find(s => s.rollNumber && s.rollNumber.toLowerCase() === roll.toLowerCase());
    }

    if (!student || !student.name) {
      showToast(`No student found with Roll Number: ${roll}`, "error");
      const card = document.getElementById('cgpaResultCard');
      if (card) card.style.display = 'none';
      return;
    }

    renderStudentResult(student);
    showToast(`Found record for ${student.name}`, "success");
  } catch (err) {
    showToast("Failed to lookup student: " + err.message, "error");
  }
}

function lookupByRoll(rollNumber) {
  switchTab('lookup');
  const input = document.getElementById('cgpaRollInput');
  if (input) {
    input.value = rollNumber;
    performCgpaLookup();
  }
}

function renderStudentResult(s) {
  const card = document.getElementById('cgpaResultCard');
  if (!card) return;

  const cgpa = parseFloat(s.cgpa) || 0;
  let standing = "Needs Improvement";
  let standingClass = "cgpa-low";
  if (cgpa >= 8.5) {
    standing = "Distinction (Honors)";
    standingClass = "cgpa-high";
  } else if (cgpa >= 7.0) {
    standing = "First Class";
    standingClass = "cgpa-mid";
  } else if (cgpa >= 5.5) {
    standing = "Second Class";
    standingClass = "cgpa-avg";
  }

  document.getElementById('resStudentName').textContent = s.name;
  document.getElementById('resRollNumber').textContent = s.rollNumber;
  document.getElementById('resDepartment').textContent = s.classroom?.department?.name || 'General';
  document.getElementById('resClassroom').textContent = s.classroom?.className || 'Unassigned';
  document.getElementById('resScoreNum').textContent = cgpa.toFixed(2);
  
  const standingEl = document.getElementById('resStanding');
  standingEl.textContent = standing;
  standingEl.className = `score-standing ${standingClass}`;

  card.style.display = 'block';
  card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ==========================================================================
// MODAL CONTROLS & CRUD ACTIONS
// ==========================================================================

// Open Modal Helper
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

// Close Modal Helper
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

// Populate Select Dropdowns
function populateDropdowns() {
  const studentDeptFilter = document.getElementById('studentDeptFilter');
  const studentClassFilter = document.getElementById('studentClassFilter');
  const staffDeptFilter = document.getElementById('staffDeptFilter');
  
  const studentClassSelect = document.getElementById('studentClassSelect');
  const staffDeptSelect = document.getElementById('staffDeptSelect');
  const staffClassSelect = document.getElementById('staffClassSelect');
  const classDeptSelect = document.getElementById('classDeptSelect');

  // Fill Dept options
  const deptOptionsHtml = '<option value="">All Departments</option>' + 
    AppState.departments.map(d => `<option value="${d.id}">${escapeHtml(d.name)}</option>`).join('');

  if (studentDeptFilter) studentDeptFilter.innerHTML = deptOptionsHtml;
  if (staffDeptFilter) staffDeptFilter.innerHTML = deptOptionsHtml;
  if (staffDeptSelect) staffDeptSelect.innerHTML = '<option value="">Select Department</option>' + AppState.departments.map(d => `<option value="${d.id}">${escapeHtml(d.name)}</option>`).join('');
  if (classDeptSelect) classDeptSelect.innerHTML = '<option value="">Select Department</option>' + AppState.departments.map(d => `<option value="${d.id}">${escapeHtml(d.name)}</option>`).join('');

  // Fill Classroom options
  const classOptionsHtml = '<option value="">All Classes</option>' + 
    AppState.classrooms.map(c => `<option value="${c.id}">${escapeHtml(c.className)} (${escapeHtml(c.department?.name || 'General')})</option>`).join('');

  if (studentClassFilter) studentClassFilter.innerHTML = classOptionsHtml;
  if (studentClassSelect) studentClassSelect.innerHTML = '<option value="">Select Classroom</option>' + AppState.classrooms.map(c => `<option value="${c.id}">${escapeHtml(c.className)}</option>`).join('');
  if (staffClassSelect) staffClassSelect.innerHTML = '<option value="">None (For Management or General)</option>' + AppState.classrooms.map(c => `<option value="${c.id}">${escapeHtml(c.className)}</option>`).join('');
}

// --- STUDENT CRUD ---
function openAddStudentModal() {
  AppState.selectedStudent = null;
  document.getElementById('studentModalTitle').textContent = "Enroll New Student";
  document.getElementById('studentForm').reset();
  document.getElementById('studentIdHidden').value = "";
  populateDropdowns();
  openModal('studentModal');
}

function openEditStudentModal(id) {
  const s = AppState.students.find(item => item.id === id);
  if (!s) return;
  AppState.selectedStudent = s;
  document.getElementById('studentModalTitle').textContent = "Edit Student Profile";
  document.getElementById('studentIdHidden').value = s.id;
  document.getElementById('studentNameInput').value = s.name || '';
  document.getElementById('studentRollInput').value = s.rollNumber || '';
  document.getElementById('studentCgpaInput').value = s.cgpa || '';
  populateDropdowns();
  if (s.classroom?.id) {
    document.getElementById('studentClassSelect').value = s.classroom.id;
  }
  openModal('studentModal');
}

async function handleStudentSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('studentIdHidden').value;
  const name = document.getElementById('studentNameInput').value.trim();
  const rollNumber = document.getElementById('studentRollInput').value.trim();
  const cgpa = parseFloat(document.getElementById('studentCgpaInput').value) || 0.0;
  const classId = document.getElementById('studentClassSelect').value;

  const payload = {
    name,
    rollNumber,
    cgpa,
    classroom: classId ? { id: parseInt(classId) } : null
  };

  try {
    if (id) {
      await apiRequest(`/students/${id}`, 'PUT', payload);
      showToast(`Updated student ${name}`, 'success');
    } else {
      await apiRequest('/students', 'POST', payload);
      showToast(`Enrolled new student ${name}`, 'success');
    }
    closeModal('studentModal');
    await loadAllData();
  } catch (err) {
    showToast("Failed to save student: " + err.message, 'error');
  }
}

// --- STAFF CRUD ---
function openAddStaffModal() {
  AppState.selectedStaff = null;
  document.getElementById('staffModalTitle').textContent = "Add Faculty / Staff";
  document.getElementById('staffForm').reset();
  document.getElementById('staffIdHidden').value = "";
  populateDropdowns();
  openModal('staffModal');
}

function openEditStaffModal(id) {
  const st = AppState.staff.find(item => item.id === id);
  if (!st) return;
  AppState.selectedStaff = st;
  document.getElementById('staffModalTitle').textContent = "Edit Staff Member";
  document.getElementById('staffIdHidden').value = st.id;
  document.getElementById('staffNameInput').value = st.name || '';
  document.getElementById('staffRoleSelect').value = st.role || 'TEACHER';
  document.getElementById('staffSubjectInput').value = st.subject || '';
  populateDropdowns();
  if (st.department?.id) document.getElementById('staffDeptSelect').value = st.department.id;
  if (st.classroom?.id) document.getElementById('staffClassSelect').value = st.classroom.id;
  openModal('staffModal');
}

async function handleStaffSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('staffIdHidden').value;
  const name = document.getElementById('staffNameInput').value.trim();
  const role = document.getElementById('staffRoleSelect').value;
  const subject = document.getElementById('staffSubjectInput').value.trim();
  const deptId = document.getElementById('staffDeptSelect').value;
  const classId = document.getElementById('staffClassSelect').value;

  const payload = {
    name,
    role,
    subject,
    department: deptId ? { id: parseInt(deptId) } : null,
    classroom: classId ? { id: parseInt(classId) } : null
  };

  try {
    if (id) {
      await apiRequest(`/staff/${id}`, 'PUT', payload);
      showToast(`Updated staff ${name}`, 'success');
    } else {
      await apiRequest('/staff', 'POST', payload);
      showToast(`Added staff ${name}`, 'success');
    }
    closeModal('staffModal');
    await loadAllData();
  } catch (err) {
    showToast("Failed to save staff: " + err.message, 'error');
  }
}

// --- DEPARTMENT CRUD ---
function openAddDeptModal() {
  document.getElementById('deptModalTitle').textContent = "Add Department";
  document.getElementById('deptForm').reset();
  document.getElementById('deptIdHidden').value = "";
  openModal('deptModal');
}

function openEditDeptModal(id) {
  const d = AppState.departments.find(item => item.id === id);
  if (!d) return;
  document.getElementById('deptModalTitle').textContent = "Edit Department";
  document.getElementById('deptIdHidden').value = d.id;
  document.getElementById('deptNameInput').value = d.name || '';
  openModal('deptModal');
}

async function handleDeptSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('deptIdHidden').value;
  const name = document.getElementById('deptNameInput').value.trim();

  try {
    if (id) {
      await apiRequest(`/departments/${id}`, 'PUT', { name });
      showToast(`Updated department ${name}`, 'success');
    } else {
      await apiRequest('/departments', 'POST', { name });
      showToast(`Created department ${name}`, 'success');
    }
    closeModal('deptModal');
    await loadAllData();
  } catch (err) {
    showToast("Failed to save department: " + err.message, 'error');
  }
}

// --- CLASSROOM CRUD ---
function openAddClassModal() {
  document.getElementById('classModalTitle').textContent = "Add Classroom";
  document.getElementById('classForm').reset();
  document.getElementById('classIdHidden').value = "";
  populateDropdowns();
  openModal('classModal');
}

function openEditClassModal(id) {
  const c = AppState.classrooms.find(item => item.id === id);
  if (!c) return;
  document.getElementById('classModalTitle').textContent = "Edit Classroom";
  document.getElementById('classIdHidden').value = c.id;
  document.getElementById('classNameInput').value = c.className || '';
  populateDropdowns();
  if (c.department?.id) document.getElementById('classDeptSelect').value = c.department.id;
  openModal('classModal');
}

async function handleClassSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('classIdHidden').value;
  const className = document.getElementById('classNameInput').value.trim();
  const deptId = document.getElementById('classDeptSelect').value;

  const payload = {
    className,
    department: deptId ? { id: parseInt(deptId) } : null
  };

  try {
    if (id) {
      await apiRequest(`/classrooms/${id}`, 'PUT', payload);
      showToast(`Updated classroom ${className}`, 'success');
    } else {
      await apiRequest('/classrooms', 'POST', payload);
      showToast(`Created classroom ${className}`, 'success');
    }
    closeModal('classModal');
    await loadAllData();
  } catch (err) {
    showToast("Failed to save classroom: " + err.message, 'error');
  }
}

// --- DELETE CONFIRMATION ---
let deleteTarget = { type: null, id: null };

function confirmDelete(type, id, name) {
  deleteTarget = { type, id };
  document.getElementById('deleteItemName').textContent = name;
  openModal('deleteModal');
}

async function executeDelete() {
  const { type, id } = deleteTarget;
  if (!type || !id) return;

  try {
    if (type === 'student') await apiRequest(`/students/${id}`, 'DELETE');
    if (type === 'staff') await apiRequest(`/staff/${id}`, 'DELETE');
    if (type === 'department') await apiRequest(`/departments/${id}`, 'DELETE');
    if (type === 'classroom') await apiRequest(`/classrooms/${id}`, 'DELETE');

    showToast(`Deleted ${type} successfully`, 'success');
    closeModal('deleteModal');
    await loadAllData();
  } catch (err) {
    showToast(`Failed to delete: ${err.message}`, 'error');
  }
}

// --- AUTH & LOGIN ---
function openLoginModal() {
  openModal('loginModal');
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const password = document.getElementById('loginPasswordInput').value;

  try {
    const res = await apiRequest('/auth/login', 'POST', { password });
    if (res === "SUCCESS" || res.includes("SUCCESS")) {
      AppState.isLoggedIn = true;
      AppState.currentUserRole = "MANAGEMENT";
      localStorage.setItem('sms_logged_in', 'true');
      localStorage.setItem('sms_role', 'MANAGEMENT');
      updateAuthUi();
      closeModal('loginModal');
      showToast("Authenticated as Management successfully!", "success");
    } else {
      throw new Error("Invalid password");
    }
  } catch (err) {
    showToast("Authentication failed: " + err.message, "error");
  }
}

function handleLogout() {
  AppState.isLoggedIn = false;
  AppState.currentUserRole = "GUEST";
  localStorage.setItem('sms_logged_in', 'false');
  localStorage.setItem('sms_role', 'GUEST');
  updateAuthUi();
  showToast("Logged out of Management session", "info");
}

function updateAuthUi() {
  const roleBadge = document.getElementById('roleBadgeBtn');
  const roleText = document.getElementById('activeRoleText');
  if (AppState.isLoggedIn) {
    if (roleBadge) roleBadge.className = 'role-badge logged-in';
    if (roleText) roleText.textContent = 'Management (Active)';
  } else {
    if (roleBadge) roleBadge.className = 'role-badge';
    if (roleText) roleText.textContent = 'Management Login';
  }
}

// --- CONNECTION SETTINGS MODAL ---
function openSettingsModal() {
  document.getElementById('settingsApiBase').value = AppState.apiBase;
  document.getElementById('settingsRoleHeader').value = AppState.currentUserRole;
  openModal('settingsModal');
}

async function handleSettingsSubmit(e) {
  e.preventDefault();
  AppState.apiBase = document.getElementById('settingsApiBase').value.trim();
  AppState.currentUserRole = document.getElementById('settingsRoleHeader').value.trim();
  closeModal('settingsModal');
  showToast("Testing connection with new settings...", "info");
  await detectBackend();
  await loadAllData();
}

// ==========================================================================
// NAVIGATION & TABS
// ==========================================================================
function switchTab(targetTab) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === targetTab);
  });

  document.querySelectorAll('.view-section').forEach(sec => {
    sec.classList.toggle('active', sec.id === `${targetTab}View`);
  });
}

// ==========================================================================
// HELPERS
// ==========================================================================
function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getCgpaBadge(cgpa) {
  const val = parseFloat(cgpa) || 0.0;
  let cls = 'cgpa-low';
  if (val >= 8.5) cls = 'cgpa-high';
  else if (val >= 7.0) cls = 'cgpa-mid';
  else if (val >= 5.5) cls = 'cgpa-avg';

  return `<span class="cgpa-pill ${cls}">★ ${val.toFixed(2)}</span>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Theme Toggle
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('sms_theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('themeIcon');
  if (!icon) return;
  if (theme === 'light') {
    icon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`; // moon
  } else {
    icon.innerHTML = `<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>`; // sun
  }
}

// ==========================================================================
// EVENT LISTENERS & DOM READY
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
  // Theme init
  const savedTheme = localStorage.getItem('sms_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  // Tab listeners
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Students filter listeners
  document.getElementById('studentSearchInput')?.addEventListener('input', renderStudentsTable);
  document.getElementById('studentDeptFilter')?.addEventListener('change', renderStudentsTable);
  document.getElementById('studentClassFilter')?.addEventListener('change', renderStudentsTable);
  document.getElementById('studentSortSelect')?.addEventListener('change', renderStudentsTable);

  // Staff filter listeners
  document.getElementById('staffSearchInput')?.addEventListener('input', renderStaffTable);
  document.getElementById('staffRoleFilter')?.addEventListener('change', renderStaffTable);
  document.getElementById('staffDeptFilter')?.addEventListener('change', renderStaffTable);

  // Lookup form
  document.getElementById('cgpaLookupForm')?.addEventListener('submit', performCgpaLookup);

  // Modal forms
  document.getElementById('studentForm')?.addEventListener('submit', handleStudentSubmit);
  document.getElementById('staffForm')?.addEventListener('submit', handleStaffSubmit);
  document.getElementById('deptForm')?.addEventListener('submit', handleDeptSubmit);
  document.getElementById('classForm')?.addEventListener('submit', handleClassSubmit);
  document.getElementById('loginForm')?.addEventListener('submit', handleLoginSubmit);
  document.getElementById('settingsForm')?.addEventListener('submit', handleSettingsSubmit);
  document.getElementById('confirmDeleteBtn')?.addEventListener('click', executeDelete);

  // Auth UI init
  updateAuthUi();

  // Role button click
  document.getElementById('roleBadgeBtn')?.addEventListener('click', () => {
    if (AppState.isLoggedIn) {
      if (confirm("Do you want to log out of Management session?")) {
        handleLogout();
      }
    } else {
      openLoginModal();
    }
  });

  // Backend Status Pill click -> open settings
  document.getElementById('backendStatusPill')?.addEventListener('click', openSettingsModal);

  // Detect backend & load data
  await detectBackend();
  await loadAllData();
});
