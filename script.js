const DB_KEY = "study_unique_db_v1";
const USER_KEY = "study_unique_user_v1";

let page = "home";
let loginMode = "student";
let selectedStudentId = null;

const defaultData = {
  students: [
    {
      id: "s1",
      name: "Abid Hasan",
      roll: "101",
      className: "CSE 1st Year",
      email: "abid@student.com",
      attendance: [
        { date: "2026-07-12", status: "Present" },
        { date: "2026-07-13", status: "Late" },
        { date: "2026-07-14", status: "Present" }
      ],
      subjects: [
        { name: "Mathematics", progress: 78 },
        { name: "English", progress: 68 },
        { name: "Physics", progress: 55 },
        { name: "ICT", progress: 88 }
      ],
      plans: [
        { date: "2026-07-15", subject: "ICT", topic: "JavaScript DOM", time: "8:00 PM" },
        { date: "2026-07-16", subject: "Physics", topic: "Numerical Problems", time: "9:00 PM" }
      ],
      tasks: [
        { title: "Finish ICT assignment", subject: "ICT", done: false, reviewed: false, comment: "" },
        { title: "Read English chapter 4", subject: "English", done: true, reviewed: true, comment: "Good work." }
      ]
    },
    {
      id: "s2",
      name: "Nusrat Jahan",
      roll: "102",
      className: "CSE 1st Year",
      email: "nusrat@student.com",
      attendance: [
        { date: "2026-07-12", status: "Present" },
        { date: "2026-07-13", status: "Present" },
        { date: "2026-07-14", status: "Absent" }
      ],
      subjects: [
        { name: "Mathematics", progress: 62 },
        { name: "English", progress: 74 },
        { name: "Physics", progress: 49 },
        { name: "ICT", progress: 80 }
      ],
      plans: [
        { date: "2026-07-15", subject: "Mathematics", topic: "Matrix Practice", time: "7:30 PM" }
      ],
      tasks: [
        { title: "Submit physics lab report", subject: "Physics", done: false, reviewed: false, comment: "" }
      ]
    }
  ]
};

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function seedDB() {
  if (!localStorage.getItem(DB_KEY)) {
    localStorage.setItem(DB_KEY, JSON.stringify(clone(defaultData)));
  }
}

function getDB() {
  seedDB();
  return JSON.parse(localStorage.getItem(DB_KEY));
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function logout() {
  localStorage.removeItem(USER_KEY);
  page = "home";
  render();
}

function resetAllData() {
  localStorage.setItem(DB_KEY, JSON.stringify(clone(defaultData)));
  alert("All demo data reset done.");
  render();
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, function (char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char];
  });
}

function makeStudent(name, roll, className, email) {
  return {
    id: "s" + Date.now(),
    name: name,
    roll: roll,
    className: className,
    email: email,
    attendance: [],
    subjects: [
      { name: "Mathematics", progress: 0 },
      { name: "English", progress: 0 },
      { name: "Physics", progress: 0 },
      { name: "ICT", progress: 0 }
    ],
    plans: [],
    tasks: []
  };
}

function getStudent(id) {
  return getDB().students.find(function (student) {
    return student.id === id;
  });
}

function saveStudent(updated) {
  const db = getDB();

  const index = db.students.findIndex(function (student) {
    return student.id === updated.id;
  });

  if (index !== -1) {
    db.students[index] = updated;
    saveDB(db);
  }
}

function average(numbers) {
  if (!numbers.length) return 0;

  return Math.round(
    numbers.reduce(function (a, b) {
      return a + b;
    }, 0) / numbers.length
  );
}

function attendanceRate(student) {
  if (!student.attendance.length) return 0;

  const count = student.attendance.filter(function (item) {
    return item.status === "Present" || item.status === "Late";
  }).length;

  return Math.round((count / student.attendance.length) * 100);
}

function progressRate(student) {
  return average(
    student.subjects.map(function (subject) {
      return subject.progress;
    })
  );
}

function taskDone(student) {
  return student.tasks.filter(function (task) {
    return task.done;
  }).length;
}

function badge(status) {
  if (status === "Present") return '<span class="badge green">Present</span>';
  if (status === "Absent") return '<span class="badge red">Absent</span>';
  if (status === "Late") return '<span class="badge orange">Late</span>';
  if (status === "Done") return '<span class="badge green">Done</span>';
  if (status === "Pending") return '<span class="badge orange">Pending</span>';
  return '<span class="badge">Not Set</span>';
}

function stat(icon, title, value, note) {
  return `
    <div class="card stat">
      <div class="stat-icon">${icon}</div>
      <span>${title}</span>
      <strong>${value}</strong>
      <p>${note || ""}</p>
    </div>
  `;
}

function footer() {
  return `
    <footer class="footer">
      <b>Study Planner & Attendance System</b>
      <span>Student panel + Teacher/Admin panel + localStorage demo.</span>
    </footer>
  `;
}

function render() {
  const user = getUser();

  if (!user) {
    renderLogin();
    return;
  }

  if (user.role === "student") {
    const student = getStudent(user.studentId);

    if (!student) {
      logout();
      return;
    }

    if (page === "home" || page.startsWith("admin")) {
      page = "dashboard";
    }

    renderStudentApp(student);
    return;
  }

  if (user.role === "admin") {
    if (page === "home" || !page.startsWith("admin")) {
      page = "admin-dashboard";
    }

    renderAdminApp();
  }
}

function renderLogin() {
  const students = getDB().students;

  const studentOptions = students
    .map(function (student) {
      return `<option value="${student.id}">${esc(student.name)} - Roll ${esc(student.roll)}</option>`;
    })
    .join("");

  const studentLogin = `
    <h2>Student Login</h2>
    <p>Select a student and enter the student dashboard.</p>

    <form onsubmit="studentLogin(event)">
      <div>
        <label>Select Student</label>
        <select id="studentSelect">${studentOptions}</select>
      </div>

      <button class="btn full" type="submit">Enter Student Dashboard</button>
    </form>

    <div class="note">Student can add plans, tasks and see attendance/reports.</div>
  `;

  const adminLogin = `
    <h2>Admin Login</h2>
    <p>Teacher/admin can see all students, attendance, tasks and reports.</p>

    <form onsubmit="adminLogin(event)">
      <div>
        <label>Email</label>
        <input id="adminEmail" type="email" value="admin@school.com">
      </div>

      <div>
        <label>Password</label>
        <input id="adminPassword" type="password" value="admin123">
      </div>

      <button class="btn full" type="submit">Enter Admin Panel</button>
      <div id="loginError" class="error"></div>
    </form>

    <div class="note">
      Email: <b>admin@school.com</b><br>
      Password: <b>admin123</b>
    </div>
  `;

  const registerForm = `
    <h2>Add New Student</h2>
    <p>Student nijer account create korle admin panel e instantly show korbe.</p>

    <form onsubmit="registerStudent(event)">
      <div>
        <label>Student Name</label>
        <input id="regName" placeholder="Student name" required>
      </div>

      <div>
        <label>Roll</label>
        <input id="regRoll" placeholder="104" required>
      </div>

      <div>
        <label>Class</label>
        <input id="regClass" placeholder="CSE 1st Year" required>
      </div>

      <div>
        <label>Email</label>
        <input id="regEmail" type="email" placeholder="student@email.com" required>
      </div>

      <button class="btn full" type="submit">Create Student Account</button>
    </form>
  `;

  document.getElementById("app").innerHTML = `
    <main class="login-page">
      <section class="hero">
        <div class="brand">
          <div class="logo">SA</div>
          <span>StudyAttend</span>
        </div>

        <h1>Study Planner & Attendance System</h1>

        <p>
          A cleaner, more unique dashboard for students and teachers.
          Students can add plans/tasks. Admin can add students, monitor attendance,
          update progress, review tasks and print reports.
        </p>

        <div class="hero-actions">
          <button class="btn" onclick="changeLogin('student')">Student Portal</button>
          <button class="btn light" onclick="changeLogin('admin')">Teacher Control</button>
          <button class="btn light" onclick="changeLogin('register')">Create Student</button>
        </div>

        <div class="hero-grid">
          <div class="art-card big hero-profile-card">
            <div class="face"></div>

            <div class="hero-card-copy">
              <h3>Student Workspace</h3>
              <p>
                Plan your study, manage daily tasks, and follow your progress
                from one clean dashboard.
              </p>
            </div>

            <div class="mini-pills">
              <span>Daily Plan</span>
              <span>Smart Task</span>
              <span>Progress</span>
            </div>
          </div>

          <div class="art-card hero-info-card">
            <div class="hero-card-top">
              <span class="hero-mini-icon">✅</span>
              <b>Attendance</b>
            </div>

            <p class="card-note">
              Track present, absent and late records with a simple visual report.
            </p>

            <div class="circle">84%</div>
          </div>

          <div class="art-card hero-info-card">
            <div class="hero-card-top">
              <span class="hero-mini-icon">📝</span>
              <b>Tasks</b>
            </div>

            <p class="card-note">
              Add homework, assignments and study goals. Teacher can review them later.
            </p>

            <div class="line w1"></div>
            <div class="line w2"></div>
          </div>

          <div class="art-card hero-info-card">
            <div class="hero-card-top">
              <span class="hero-mini-icon">👨‍🏫</span>
              <b>Teacher View</b>
            </div>

            <p class="card-note">
              Admin can monitor all students, update attendance, and print reports.
            </p>

            <div class="line w3"></div>
            <div class="line w1"></div>
          </div>
        </div>
      </section>

      <section class="login-card">
        <div class="tabs">
          <button class="tab ${loginMode === "student" ? "active" : ""}" onclick="changeLogin('student')">Student</button>
          <button class="tab ${loginMode === "admin" ? "active" : ""}" onclick="changeLogin('admin')">Admin</button>
          <button class="tab ${loginMode === "register" ? "active" : ""}" onclick="changeLogin('register')">Add</button>
        </div>

        ${loginMode === "student" ? studentLogin : ""}
        ${loginMode === "admin" ? adminLogin : ""}
        ${loginMode === "register" ? registerForm : ""}
      </section>
    </main>
  `;
}

function changeLogin(mode) {
  loginMode = mode;
  renderLogin();
}

function studentLogin(event) {
  event.preventDefault();

  const id = document.getElementById("studentSelect").value;

  setUser({
    role: "student",
    studentId: id
  });

  page = "dashboard";
  render();
}

function registerStudent(event) {
  event.preventDefault();

  const db = getDB();

  const student = makeStudent(
    document.getElementById("regName").value.trim(),
    document.getElementById("regRoll").value.trim(),
    document.getElementById("regClass").value.trim(),
    document.getElementById("regEmail").value.trim()
  );

  db.students.push(student);
  saveDB(db);

  setUser({
    role: "student",
    studentId: student.id
  });

  page = "dashboard";
  render();
}

function adminLogin(event) {
  event.preventDefault();

  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value.trim();

  if (email === "admin@school.com" && password === "admin123") {
    setUser({
      role: "admin",
      name: "Teacher Admin"
    });

    page = "admin-dashboard";
    render();
  } else {
    document.getElementById("loginError").textContent = "Wrong email or password.";
  }
}

const studentNav = [
  ["dashboard", "Dashboard", "🏠"],
  ["planner", "Planner", "📘"],
  ["attendance", "Attendance", "✅"],
  ["subjects", "Subjects", "📚"],
  ["tasks", "Tasks", "📝"],
  ["reports", "Reports", "📊"],
  ["settings", "Settings", "⚙️"]
];

const studentTitles = {
  dashboard: ["Dashboard", "Your study, attendance and task overview."],
  planner: ["Study Planner", "Add and manage your study plans."],
  attendance: ["Attendance", "Check your attendance history."],
  subjects: ["Subjects", "Track your subject-wise progress."],
  tasks: ["Tasks", "Add, complete and manage your study tasks."],
  reports: ["Reports", "View and print your performance report."],
  settings: ["Settings", "Profile and demo data settings."]
};

function renderStudentApp(student) {
  const title = studentTitles[page] || studentTitles.dashboard;

  document.getElementById("app").innerHTML = `
    <div class="layout">
      <aside class="sidebar">
        <div class="brand side-brand">
          <div class="logo">SA</div>
          <span>Student Panel</span>
        </div>

        <nav class="nav">
          ${studentNav
            .map(function (item) {
              return `
                <button class="nav-btn ${page === item[0] ? "active" : ""}" onclick="go('${item[0]}')">
                  <span class="ico">${item[2]}</span>
                  ${item[1]}
                </button>
              `;
            })
            .join("")}
        </nav>

        <div class="side-user">
          <div class="user-row">
            <div class="avatar">${esc(student.name.charAt(0))}</div>
            <div>
              <b>${esc(student.name)}</b>
              <small>${esc(student.className)}</small>
            </div>
          </div>

          <button class="btn light full" onclick="logout()">Logout</button>
        </div>
      </aside>

      <main class="main">
        <header class="topbar">
          <div>
            <h1>${title[0]}</h1>
            <p>${title[1]}</p>
          </div>

          <button class="btn light menu-btn" onclick="toggleMenu()">Menu</button>
        </header>

        ${renderStudentPage(student)}
        ${footer()}
      </main>
    </div>
  `;
}

function renderStudentPage(student) {
  if (page === "planner") return studentPlanner(student);
  if (page === "attendance") return studentAttendance(student);
  if (page === "subjects") return studentSubjects(student);
  if (page === "tasks") return studentTasks(student);
  if (page === "reports") return studentReports(student);
  if (page === "settings") return studentSettings(student);

  return studentDashboard(student);
}

function studentDashboard(student) {
  return `
    <section class="grid four">
      ${stat("✅", "Attendance", attendanceRate(student) + "%", "Present + late counted")}
      ${stat("📈", "Study Progress", progressRate(student) + "%", "Subject average")}
      ${stat("📝", "Tasks", taskDone(student) + "/" + student.tasks.length, "Completed tasks")}
      ${stat("📅", "Plans", student.plans.length, "Upcoming plans")}
    </section>

    <section class="grid two mt">
      <div class="card">
        <h2>Subject Progress</h2>
        ${progressList(student)}
      </div>

      <div class="card">
        <h2>Upcoming Plans</h2>
        ${planList(student)}
      </div>
    </section>
  `;
}

function progressList(student) {
  if (!student.subjects.length) return '<div class="empty">No subject found.</div>';

  return student.subjects
    .map(function (subject) {
      return `
        <div class="progress-item">
          <div class="progress-title">
            <span>${esc(subject.name)}</span>
            <span>${subject.progress}%</span>
          </div>

          <div class="progress">
            <i style="width:${subject.progress}%"></i>
          </div>
        </div>
      `;
    })
    .join("");
}

function planList(student) {
  if (!student.plans.length) return '<div class="empty">No study plan added yet.</div>';

  return `
    <div class="list">
      ${student.plans
        .map(function (plan) {
          return `
            <div class="item">
              <div>
                <b>${esc(plan.subject)}</b>
                <p>${esc(plan.topic)} • ${esc(plan.date)} • ${esc(plan.time)}</p>
              </div>

              <span class="badge">Plan</span>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function studentPlanner(student) {
  return `
    <div class="card">
      <h2>Add Study Plan</h2>

      <form class="form-grid" onsubmit="addPlan(event)">
        <div>
          <label>Date</label>
          <input id="planDate" type="date" required>
        </div>

        <div>
          <label>Subject</label>
          <input id="planSubject" placeholder="ICT" required>
        </div>

        <div>
          <label>Topic</label>
          <input id="planTopic" placeholder="JavaScript DOM" required>
        </div>

        <button class="btn" type="submit">Add</button>
      </form>
    </div>

    <div class="card mt">
      <h2>My Plans</h2>
      ${
        student.plans.length
          ? `<div class="list">
              ${student.plans
                .map(function (plan, index) {
                  return `
                    <div class="item">
                      <div>
                        <b>${esc(plan.subject)}</b>
                        <p>${esc(plan.topic)} • ${esc(plan.date)} • ${esc(plan.time)}</p>
                      </div>

                      <button class="btn red small" onclick="deletePlan(${index})">Delete</button>
                    </div>
                  `;
                })
                .join("")}
            </div>`
          : '<div class="empty">No plan found.</div>'
      }
    </div>
  `;
}

function addPlan(event) {
  event.preventDefault();

  const student = getStudent(getUser().studentId);

  student.plans.push({
    date: document.getElementById("planDate").value,
    subject: document.getElementById("planSubject").value.trim(),
    topic: document.getElementById("planTopic").value.trim(),
    time: "8:00 PM"
  });

  saveStudent(student);
  render();
}

function deletePlan(index) {
  const student = getStudent(getUser().studentId);

  student.plans.splice(index, 1);

  saveStudent(student);
  render();
}

function studentAttendance(student) {
  return `
    <section class="grid four">
      ${stat("✅", "Attendance Rate", attendanceRate(student) + "%")}
      ${stat("📆", "Total Days", student.attendance.length)}
      ${stat("🟢", "Present", student.attendance.filter(function (a) { return a.status === "Present"; }).length)}
      ${stat("🔴", "Absent", student.attendance.filter(function (a) { return a.status === "Absent"; }).length)}
    </section>

    <div class="card table-wrap mt">
      <h2>Attendance History</h2>

      <table>
        <tr>
          <th>Date</th>
          <th>Status</th>
        </tr>

        ${
          student.attendance.length
            ? student.attendance
                .map(function (item) {
                  return `
                    <tr>
                      <td>${esc(item.date)}</td>
                      <td>${badge(item.status)}</td>
                    </tr>
                  `;
                })
                .join("")
            : '<tr><td colspan="2">No attendance data yet.</td></tr>'
        }
      </table>
    </div>
  `;
}

function studentSubjects(student) {
  return `
    <section class="grid three">
      ${student.subjects
        .map(function (subject) {
          return `
            <div class="card">
              <h2>${esc(subject.name)}</h2>
              <strong style="font-size:40px">${subject.progress}%</strong>

              <div class="progress mt">
                <i style="width:${subject.progress}%"></i>
              </div>
            </div>
          `;
        })
        .join("")}
    </section>
  `;
}

function studentTasks(student) {
  return `
    <div class="card">
      <h2>Add Task</h2>

      <form class="form-grid" onsubmit="addTask(event)">
        <div>
          <label>Task</label>
          <input id="taskTitle" placeholder="Finish assignment" required>
        </div>

        <div>
          <label>Subject</label>
          <input id="taskSubject" placeholder="ICT" required>
        </div>

        <div>
          <label>Status</label>
          <select id="taskDone">
            <option value="false">Pending</option>
            <option value="true">Done</option>
          </select>
        </div>

        <button class="btn" type="submit">Add</button>
      </form>
    </div>

    <div class="card mt">
      <h2>My Tasks</h2>
      ${taskList(student)}
    </div>
  `;
}

function taskList(student) {
  if (!student.tasks.length) return '<div class="empty">No task found.</div>';

  return `
    <div class="list">
      ${student.tasks
        .map(function (task, index) {
          return `
            <div class="item">
              <div>
                <b>${esc(task.title)}</b>
                <p>${esc(task.subject)} • ${task.done ? "Done" : "Pending"} • ${task.reviewed ? "Reviewed" : "Not reviewed"}</p>
                ${task.comment ? `<p><b>Teacher:</b> ${esc(task.comment)}</p>` : ""}
              </div>

              <button class="btn ${task.done ? "light" : "green"} small" onclick="toggleTask(${index})">
                ${task.done ? "Undo" : "Done"}
              </button>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function addTask(event) {
  event.preventDefault();

  const student = getStudent(getUser().studentId);

  student.tasks.push({
    title: document.getElementById("taskTitle").value.trim(),
    subject: document.getElementById("taskSubject").value.trim(),
    done: document.getElementById("taskDone").value === "true",
    reviewed: false,
    comment: ""
  });

  saveStudent(student);
  render();
}

function toggleTask(index) {
  const student = getStudent(getUser().studentId);

  student.tasks[index].done = !student.tasks[index].done;

  saveStudent(student);
  render();
}

function studentReports(student) {
  return `
    <section class="grid three">
      ${stat("✅", "Attendance", attendanceRate(student) + "%")}
      ${stat("📈", "Progress", progressRate(student) + "%")}
      ${stat("📝", "Tasks", taskDone(student) + "/" + student.tasks.length)}
    </section>

    <div class="card mt">
      <h2>Performance Summary</h2>
      <p>${esc(student.name)} has ${attendanceRate(student)}% attendance and ${progressRate(student)}% average study progress.</p>
      <button class="btn no-print" onclick="window.print()">Print Report</button>
    </div>
  `;
}

function studentSettings(student) {
  return `
    <section class="grid two">
      <div class="card">
        <h2>Profile</h2>
        <p><b>Name:</b> ${esc(student.name)}</p>
        <p><b>Roll:</b> ${esc(student.roll)}</p>
        <p><b>Class:</b> ${esc(student.className)}</p>
        <p><b>Email:</b> ${esc(student.email)}</p>
      </div>

      <div class="card">
        <h2>System</h2>
        <p>This website uses only index.html, style.css and script.js.</p>
        <p>All demo data saves in browser localStorage.</p>
      </div>
    </section>

    <div class="card mt">
      <h2>Reset Demo Data</h2>
      <p>This will reset all students, attendance, tasks and reports.</p>
      <button class="btn red" onclick="resetAllData()">Reset Data</button>
    </div>
  `;
}

const adminNav = [
  ["admin-dashboard", "Overview", "🏠"],
  ["admin-students", "Students", "👥"],
  ["admin-add", "Add Student", "➕"],
  ["admin-attendance", "Attendance", "✅"],
  ["admin-progress", "Progress", "📈"],
  ["admin-review", "Task Review", "💬"],
  ["admin-reports", "Reports", "📊"],
  ["admin-settings", "Settings", "⚙️"]
];

const adminTitles = {
  "admin-dashboard": ["Admin Dashboard", "Teacher can monitor all student activity."],
  "admin-students": ["Students", "Search, view and delete students."],
  "admin-add": ["Add Student", "Admin can add new student manually."],
  "admin-attendance": ["Attendance Monitor", "Update today's attendance."],
  "admin-progress": ["Study Progress", "Update subject progress."],
  "admin-review": ["Task Review", "Review student tasks and comments."],
  "admin-reports": ["Reports", "Print student performance reports."],
  "admin-settings": ["Admin Settings", "Teacher profile and demo settings."]
};

function renderAdminApp() {
  const title = adminTitles[page] || adminTitles["admin-dashboard"];

  document.getElementById("app").innerHTML = `
    <div class="layout admin-theme">
      <aside class="sidebar">
        <div class="brand side-brand">
          <div class="logo">AD</div>
          <span>Admin Panel</span>
        </div>

        <nav class="nav">
          ${adminNav
            .map(function (item) {
              return `
                <button class="nav-btn ${page === item[0] ? "active" : ""}" onclick="go('${item[0]}')">
                  <span class="ico">${item[2]}</span>
                  ${item[1]}
                </button>
              `;
            })
            .join("")}
        </nav>

        <div class="side-user">
          <div class="user-row">
            <div class="avatar admin">T</div>
            <div>
              <b>Teacher Admin</b>
              <small>admin@school.com</small>
            </div>
          </div>

          <button class="btn light full" onclick="logout()">Logout</button>
        </div>
      </aside>

      <main class="main">
        <header class="topbar">
          <div>
            <h1>${title[0]}</h1>
            <p>${title[1]}</p>
          </div>

          <button class="btn light menu-btn" onclick="toggleMenu()">Menu</button>
        </header>

        ${renderAdminPage()}
        ${footer()}
      </main>
    </div>
  `;
}

function renderAdminPage() {
  if (page === "admin-students") return adminStudents();
  if (page === "admin-add") return adminAddStudentPage();
  if (page === "admin-attendance") return adminAttendance();
  if (page === "admin-progress") return adminProgress();
  if (page === "admin-review") return adminReview();
  if (page === "admin-reports") return adminReports();
  if (page === "admin-settings") return adminSettings();

  return adminDashboard();
}

function adminDashboard() {
  const students = getDB().students;

  const present = students.filter(function (student) {
    const last = student.attendance[student.attendance.length - 1];
    return last && last.status === "Present";
  }).length;

  return `
    <section class="grid four">
      ${stat("👥", "Students", students.length)}
      ${stat("✅", "Present", present)}
      ${stat("📈", "Avg Progress", average(students.map(progressRate)) + "%")}
      ${stat("📝", "Total Tasks", students.reduce(function (sum, student) { return sum + student.tasks.length; }, 0))}
    </section>

    <section class="grid two mt">
      <div class="card">
        <h2>Recently Added Students</h2>

        <div class="list">
          ${students
            .slice()
            .reverse()
            .slice(0, 5)
            .map(function (student) {
              return `
                <div class="item">
                  <div>
                    <b>${esc(student.name)}</b>
                    <p>Roll ${esc(student.roll)} • ${esc(student.className)}</p>
                  </div>

                  <span class="badge green">Active</span>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>

      <div class="card">
        <h2>Admin Control</h2>

        <div class="list">
          <div class="item"><b>Add new student</b><span class="badge green">Works</span></div>
          <div class="item"><b>Update attendance</b><span class="badge green">Works</span></div>
          <div class="item"><b>Review student task</b><span class="badge green">Works</span></div>
          <div class="item"><b>Print report</b><span class="badge green">Works</span></div>
        </div>
      </div>
    </section>
  `;
}

function adminStudents() {
  const students = getDB().students;

  return `
    <div class="card">
      <h2>Search Student</h2>
      <input id="studentSearch" oninput="searchAdminStudents()" placeholder="Search by name or roll">
    </div>

    <div class="card table-wrap mt">
      <h2>All Students</h2>

      <table>
        <tr>
          <th>Name</th>
          <th>Roll</th>
          <th>Class</th>
          <th>Attendance</th>
          <th>Progress</th>
          <th>Tasks</th>
          <th>Action</th>
        </tr>

        <tbody id="adminStudentRows">
          ${adminStudentRows(students)}
        </tbody>
      </table>
    </div>
  `;
}

function adminStudentRows(students) {
  if (!students.length) {
    return '<tr><td colspan="7">No student found.</td></tr>';
  }

  return students
    .map(function (student) {
      return `
        <tr>
          <td>${esc(student.name)}</td>
          <td>${esc(student.roll)}</td>
          <td>${esc(student.className)}</td>
          <td>${attendanceRate(student)}%</td>
          <td>${progressRate(student)}%</td>
          <td>${taskDone(student)}/${student.tasks.length}</td>
          <td>
            <button class="btn light small" onclick="viewStudent('${student.id}')">View</button>
            <button class="btn red small" onclick="deleteStudent('${student.id}')">Delete</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function searchAdminStudents() {
  const q = document.getElementById("studentSearch").value.toLowerCase();

  const students = getDB().students.filter(function (student) {
    return student.name.toLowerCase().includes(q) || student.roll.toLowerCase().includes(q);
  });

  document.getElementById("adminStudentRows").innerHTML = adminStudentRows(students);
}

function viewStudent(id) {
  selectedStudentId = id;
  page = "admin-reports";
  render();
}

function deleteStudent(id) {
  if (!confirm("Delete this student?")) return;

  const db = getDB();

  db.students = db.students.filter(function (student) {
    return student.id !== id;
  });

  saveDB(db);
  render();
}

function adminAddStudentPage() {
  return `
    <div class="card">
      <h2>Add New Student</h2>

      <form class="form-grid" onsubmit="adminAddStudent(event)">
        <div>
          <label>Name</label>
          <input id="addName" placeholder="Student name" required>
        </div>

        <div>
          <label>Roll</label>
          <input id="addRoll" placeholder="105" required>
        </div>

        <div>
          <label>Class</label>
          <input id="addClass" placeholder="CSE 1st Year" required>
        </div>

        <div>
          <label>Email</label>
          <input id="addEmail" type="email" placeholder="student@email.com" required>
        </div>

        <button class="btn" type="submit">Add Student</button>
      </form>
    </div>
  `;
}

function adminAddStudent(event) {
  event.preventDefault();

  const db = getDB();

  const student = makeStudent(
    document.getElementById("addName").value.trim(),
    document.getElementById("addRoll").value.trim(),
    document.getElementById("addClass").value.trim(),
    document.getElementById("addEmail").value.trim()
  );

  db.students.push(student);
  saveDB(db);

  alert("Student added. Admin student list e show korbe.");
  page = "admin-students";
  render();
}

function adminAttendance() {
  const students = getDB().students;

  return `
    <div class="card table-wrap">
      <h2>Update Today's Attendance</h2>

      <table>
        <tr>
          <th>Student</th>
          <th>Roll</th>
          <th>Today Status</th>
          <th>Update</th>
        </tr>

        ${students
          .map(function (student) {
            const record = student.attendance.find(function (a) {
              return a.date === today();
            });

            const current = record ? record.status : "Not Set";

            return `
              <tr>
                <td>${esc(student.name)}</td>
                <td>${esc(student.roll)}</td>
                <td>${badge(current)}</td>
                <td>
                  <select onchange="setAttendance('${student.id}', this.value)">
                    <option value="">Choose</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                  </select>
                </td>
              </tr>
            `;
          })
          .join("")}
      </table>
    </div>
  `;
}

function setAttendance(id, status) {
  if (!status) return;

  const student = getStudent(id);

  const record = student.attendance.find(function (a) {
    return a.date === today();
  });

  if (record) {
    record.status = status;
  } else {
    student.attendance.push({
      date: today(),
      status: status
    });
  }

  saveStudent(student);
  render();
}

function adminProgress() {
  const students = getDB().students;

  return `
    <section class="grid two">
      ${students
        .map(function (student) {
          return `
            <div class="card">
              <h2>${esc(student.name)}</h2>

              ${student.subjects
                .map(function (subject, index) {
                  return `
                    <div class="progress-item">
                      <div class="progress-title">
                        <span>${esc(subject.name)}</span>
                        <span>${subject.progress}%</span>
                      </div>

                      <input class="range" type="range" min="0" max="100" value="${subject.progress}" onchange="updateProgress('${student.id}', ${index}, this.value)">

                      <div class="progress">
                        <i style="width:${subject.progress}%"></i>
                      </div>
                    </div>
                  `;
                })
                .join("")}
            </div>
          `;
        })
        .join("")}
    </section>
  `;
}

function updateProgress(id, index, value) {
  const student = getStudent(id);

  student.subjects[index].progress = Number(value);

  saveStudent(student);
  render();
}

function adminReview() {
  const students = getDB().students;

  return `
    <section class="grid">
      ${students
        .map(function (student) {
          return `
            <div class="card">
              <h2>${esc(student.name)}</h2>

              ${
                student.tasks.length
                  ? `<div class="list">
                      ${student.tasks
                        .map(function (task, index) {
                          return `
                            <div class="item">
                              <div style="width:100%">
                                <b>${esc(task.title)}</b>
                                <p>${esc(task.subject)} • ${task.done ? "Done" : "Pending"} • ${task.reviewed ? "Reviewed" : "Not reviewed"}</p>
                                <textarea id="comment_${student.id}_${index}" placeholder="Teacher comment">${esc(task.comment || "")}</textarea>
                              </div>

                              <button class="btn small" onclick="saveReview('${student.id}', ${index})">Save</button>
                            </div>
                          `;
                        })
                        .join("")}
                    </div>`
                  : '<div class="empty">No task found.</div>'
              }
            </div>
          `;
        })
        .join("")}
    </section>
  `;
}

function saveReview(id, index) {
  const student = getStudent(id);
  const comment = document.getElementById(`comment_${id}_${index}`).value.trim();

  student.tasks[index].reviewed = true;
  student.tasks[index].comment = comment;

  saveStudent(student);
  render();
}

function adminReports() {
  const students = getDB().students;
  const chosen = selectedStudentId ? getStudent(selectedStudentId) : null;

  return `
    ${
      chosen
        ? `
          <div class="card">
            <h2>Selected Student Report</h2>
            <p><b>Name:</b> ${esc(chosen.name)}</p>
            <p><b>Roll:</b> ${esc(chosen.roll)}</p>
            <p><b>Attendance:</b> ${attendanceRate(chosen)}%</p>
            <p><b>Progress:</b> ${progressRate(chosen)}%</p>
            <button class="btn light no-print" onclick="selectedStudentId=null; render()">Show All Reports</button>
          </div>
        `
        : ""
    }

    <div class="card no-print mt">
      <h2>Print Reports</h2>
      <p>All student report print korte button click koro.</p>
      <button class="btn" onclick="window.print()">Print Reports</button>
    </div>

    <div class="card table-wrap mt">
      <h2>All Student Reports</h2>

      <table>
        <tr>
          <th>Name</th>
          <th>Roll</th>
          <th>Class</th>
          <th>Attendance</th>
          <th>Progress</th>
          <th>Tasks</th>
        </tr>

        ${students
          .map(function (student) {
            return `
              <tr>
                <td>${esc(student.name)}</td>
                <td>${esc(student.roll)}</td>
                <td>${esc(student.className)}</td>
                <td>${attendanceRate(student)}%</td>
                <td>${progressRate(student)}%</td>
                <td>${taskDone(student)}/${student.tasks.length}</td>
              </tr>
            `;
          })
          .join("")}
      </table>
    </div>
  `;
}

function adminSettings() {
  return `
    <section class="grid two">
      <div class="card">
        <h2>Teacher Profile</h2>
        <p><b>Name:</b> Teacher Admin</p>
        <p><b>Email:</b> admin@school.com</p>
        <p><b>Role:</b> Admin / Teacher</p>
      </div>

      <div class="card">
        <h2>Project Info</h2>
        <p>This is frontend-only demo. Real project needs backend, database and secure login.</p>
        <p>But all buttons in this demo work using localStorage.</p>
      </div>
    </section>

    <div class="card mt">
      <h2>Reset Demo Data</h2>
      <p>This will reset all students, attendance, subjects, plans and tasks.</p>
      <button class="btn red" onclick="resetAllData()">Reset All Data</button>
    </div>
  `;
}

function go(targetPage) {
  page = targetPage;
  render();
}

function toggleMenu() {
  const sidebar = document.querySelector(".sidebar");

  if (sidebar) {
    sidebar.classList.toggle("open");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  seedDB();
  render();
});