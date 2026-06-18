import { useState, useEffect, useReducer } from "react";

// ─── Auth Context Simulation ───────────────────────────────────────────────
const USERS_DB = [{ username: "admin", password: "admin123", name: "Admin User" }];

// ─── Initial Tasks ─────────────────────────────────────────────────────────
const INITIAL_TASKS = [
  { id: 1, title: "Design UI mockups", description: "Create wireframes for all screens", priority: "High", status: "Completed", dueDate: "2026-06-10", createdAt: "2026-06-01" },
  { id: 2, title: "Set up project structure", description: "Initialize repo, folder structure, dependencies", priority: "High", status: "In Progress", dueDate: "2026-06-15", createdAt: "2026-06-02" },
  { id: 3, title: "Implement API endpoints", description: "Build REST API for task CRUD operations", priority: "Medium", status: "Todo", dueDate: "2026-06-20", createdAt: "2026-06-03" },
];

// ─── Task Reducer ──────────────────────────────────────────────────────────
function taskReducer(state, action) {
  switch (action.type) {
    case "ADD":
      return [...state, { ...action.task, id: Date.now(), createdAt: new Date().toISOString().split("T")[0] }];
    case "UPDATE":
      return state.map(t => t.id === action.task.id ? action.task : t);
    case "DELETE":
      return state.filter(t => t.id !== action.id);
    case "STATUS":
      return state.map(t => t.id === action.id ? { ...t, status: action.status } : t);
    default:
      return state;
  }
}

const PRIORITIES = ["Low", "Medium", "High"];
const STATUSES = ["Todo", "In Progress", "Completed"];
const PRIORITY_COLOR = { High: "#ef4444", Medium: "#f59e0b", Low: "#22c55e" };
const STATUS_COLOR = { "Todo": "#6366f1", "In Progress": "#f59e0b", "Completed": "#22c55e" };
const STATUS_BG = { "Todo": "#eef2ff", "In Progress": "#fefce8", "Completed": "#f0fdf4" };

// ─── Pill Component ────────────────────────────────────────────────────────
function Pill({ label, color, bg }) {
  return (
    <span style={{ background: bg || "#f1f5f9", color: color || "#475569", borderRadius: 20, padding: "2px 12px", fontSize: 12, fontWeight: 600, display: "inline-block" }}>
      {label}
    </span>
  );
}

// ─── Task Modal ────────────────────────────────────────────────────────────
function TaskModal({ task, onSave, onClose }) {
  const [form, setForm] = useState(task || { title: "", description: "", priority: "Medium", status: "Todo", dueDate: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.title.trim().length > 0 && form.dueDate;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 480, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
        <h2 style={{ margin: "0 0 20px", fontSize: 20, color: "#1e293b" }}>{task ? "Edit Task" : "New Task"}</h2>

        <label style={lbl}>Title *</label>
        <input style={inp} value={form.title} onChange={e => set("title", e.target.value)} placeholder="Task title" />

        <label style={lbl}>Description</label>
        <textarea style={{ ...inp, height: 72, resize: "vertical" }} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Optional details..." />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={lbl}>Priority</label>
            <select style={inp} value={form.priority} onChange={e => set("priority", e.target.value)}>
              {PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Status</label>
            <select style={inp} value={form.status} onChange={e => set("status", e.target.value)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <label style={lbl}>Due Date *</label>
        <input type="date" style={inp} value={form.dueDate} onChange={e => set("dueDate", e.target.value)} />

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600, cursor: "pointer" }}>
            Cancel
          </button>
          <button
            onClick={() => valid && onSave(form)}
            style={{ flex: 2, padding: "10px 0", borderRadius: 10, border: "none", background: valid ? "#6366f1" : "#cbd5e1", color: "#fff", fontWeight: 700, cursor: valid ? "pointer" : "not-allowed", fontSize: 15 }}
          >
            {task ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Task Card ─────────────────────────────────────────────────────────────
function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const overdue = task.status !== "Completed" && new Date(task.dueDate) < new Date();

  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: overdue ? "1.5px solid #fca5a5" : "1.5px solid #f1f5f9", marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>{task.title}</span>
            {overdue && <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 600, background: "#fef2f2", padding: "1px 8px", borderRadius: 20 }}>OVERDUE</span>}
          </div>
          {task.description && <p style={{ margin: "0 0 10px", color: "#64748b", fontSize: 13 }}>{task.description}</p>}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <Pill label={task.priority} color={PRIORITY_COLOR[task.priority]} bg={PRIORITY_COLOR[task.priority] + "18"} />
            <Pill label={task.status} color={STATUS_COLOR[task.status]} bg={STATUS_BG[task.status]} />
            <span style={{ fontSize: 12, color: "#94a3b8" }}>📅 {task.dueDate}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => onEdit(task)} style={iconBtn("#6366f1")}>✏️</button>
          <button onClick={() => onDelete(task.id)} style={iconBtn("#ef4444")}>🗑️</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
        {STATUSES.map(s => (
          <button key={s} onClick={() => onStatusChange(task.id, s)}
            style={{ padding: "4px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1.5px solid", borderColor: task.status === s ? STATUS_COLOR[s] : "#e2e8f0", background: task.status === s ? STATUS_BG[s] : "#fff", color: task.status === s ? STATUS_COLOR[s] : "#94a3b8" }}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Stats Bar ─────────────────────────────────────────────────────────────
function StatsBar({ tasks }) {
  const total = tasks.length;
  const done = tasks.filter(t => t.status === "Completed").length;
  const inprogress = tasks.filter(t => t.status === "In Progress").length;
  const todo = tasks.filter(t => t.status === "Todo").length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
      {[
        { label: "Total", value: total, color: "#6366f1", bg: "#eef2ff" },
        { label: "Todo", value: todo, color: "#f59e0b", bg: "#fefce8" },
        { label: "In Progress", value: inprogress, color: "#3b82f6", bg: "#eff6ff" },
        { label: "Done", value: `${done} (${pct}%)`, color: "#22c55e", bg: "#f0fdf4" },
      ].map(s => (
        <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Login Screen ──────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [show, setShow] = useState(false);

  const login = () => {
    const found = USERS_DB.find(x => x.username === u && x.password === p);
    if (found) onLogin(found);
    else { setErr("Invalid username or password"); setTimeout(() => setErr(""), 2500); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 36, width: "100%", maxWidth: 380, boxShadow: "0 24px 80px rgba(99,102,241,0.25)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 16, margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>✅</div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#1e293b" }}>TaskFlow</h1>
          <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: 14 }}>Sign in to manage your tasks</p>
        </div>

        <label style={lbl}>Username</label>
        <input style={inp} value={u} onChange={e => setU(e.target.value)} placeholder="admin" onKeyDown={e => e.key === "Enter" && login()} />

        <label style={lbl}>Password</label>
        <div style={{ position: "relative" }}>
          <input type={show ? "text" : "password"} style={{ ...inp, paddingRight: 44 }} value={p} onChange={e => setP(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && login()} />
          <button onClick={() => setShow(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#94a3b8" }}>{show ? "🙈" : "👁️"}</button>
        </div>

        {err && <div style={{ background: "#fef2f2", color: "#ef4444", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontWeight: 600, marginTop: 8 }}>{err}</div>}

        <button onClick={login} style={{ width: "100%", padding: "13px 0", marginTop: 20, borderRadius: 12, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer" }}>
          Sign In
        </button>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "#94a3b8" }}>
          Demo: <strong>admin</strong> / <strong>admin123</strong>
        </p>
      </div>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [tasks, dispatch] = useReducer(taskReducer, INITIAL_TASKS);
  const [modal, setModal] = useState(null); // null | "new" | task object
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [sortBy, setSortBy] = useState("dueDate");

  if (!user) return <LoginScreen onLogin={setUser} />;

  const filtered = tasks
    .filter(t => filterStatus === "All" || t.status === filterStatus)
    .filter(t => filterPriority === "All" || t.priority === filterPriority)
    .filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "dueDate") return new Date(a.dueDate) - new Date(b.dueDate);
      if (sortBy === "priority") return PRIORITIES.indexOf(b.priority) - PRIORITIES.indexOf(a.priority);
      return a.title.localeCompare(b.title);
    });

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>✅</span>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>TaskFlow</div>
            <div style={{ color: "#c7d2fe", fontSize: 12 }}>Welcome, {user.name}</div>
          </div>
        </div>
        <button onClick={() => setUser(null)} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Logout
        </button>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px" }}>
        {/* Stats */}
        <StatsBar tasks={tasks} />

        {/* Progress Bar */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Overall Progress</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#6366f1" }}>
              {tasks.length ? Math.round((tasks.filter(t => t.status === "Completed").length / tasks.length) * 100) : 0}%
            </span>
          </div>
          <div style={{ height: 8, background: "#e2e8f0", borderRadius: 8 }}>
            <div style={{ height: "100%", borderRadius: 8, background: "linear-gradient(90deg,#6366f1,#8b5cf6)", width: `${tasks.length ? Math.round((tasks.filter(t => t.status === "Completed").length / tasks.length) * 100) : 0}%`, transition: "width 0.4s" }} />
          </div>
        </div>

        {/* Search & Filter */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <input
            style={{ ...inp, marginBottom: 10 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search tasks..."
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <select style={smallSelect} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="All">All Status</option>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <select style={smallSelect} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
              <option value="All">All Priority</option>
              {PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </select>
            <select style={smallSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="dueDate">By Due Date</option>
              <option value="priority">By Priority</option>
              <option value="title">By Title</option>
            </select>
          </div>
        </div>

        {/* Add Button */}
        <button onClick={() => setModal("new")} style={{ width: "100%", padding: "13px 0", borderRadius: 14, border: "2px dashed #a5b4fc", background: "#eef2ff", color: "#6366f1", fontWeight: 700, fontSize: 15, cursor: "pointer", marginBottom: 16 }}>
          + Add New Task
        </button>

        {/* Task List */}
        {filtered.length === 0
          ? <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
              <div style={{ fontSize: 40 }}>📭</div>
              <div style={{ fontSize: 15, marginTop: 8 }}>No tasks found</div>
            </div>
          : filtered.map(t => (
            <TaskCard key={t.id} task={t}
              onEdit={task => setModal(task)}
              onDelete={id => dispatch({ type: "DELETE", id })}
              onStatusChange={(id, status) => dispatch({ type: "STATUS", id, status })}
            />
          ))
        }
      </div>

      {/* Modal */}
      {modal && (
        <TaskModal
          task={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={form => {
            if (modal === "new") dispatch({ type: "ADD", task: form });
            else dispatch({ type: "UPDATE", task: { ...modal, ...form } });
            setModal(null);
          }}
        />
      )}
    </div>
  );
}

// ─── Shared styles ──────────────────────────────────────────────────────────
const lbl = { display: "block", fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 6, marginTop: 14 };
const inp = { display: "block", width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, color: "#1e293b", outline: "none", boxSizing: "border-box", background: "#f8fafc" };
const smallSelect = { padding: "8px 10px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 13, color: "#475569", cursor: "pointer" };
const iconBtn = (c) => ({ background: c + "14", border: "none", borderRadius: 8, padding: "6px 9px", cursor: "pointer", fontSize: 14, color: c });
