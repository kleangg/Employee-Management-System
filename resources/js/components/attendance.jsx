// ============================================================
//  pages/Attendance.jsx  — role-based view
// to see the output of mock data: use attendance?mock=true
//
//  user.role === "HR Admin" → AdminAttendanceView
//  otherwise               → EmployeeAttendanceView
//
//  EMPLOYEE VIEW:
//  - Live clock + clock in / clock out button
//  - Today's status card (clocked in at, hours so far)
//  - Monthly summary (present, late, absent counts)
//  - Full attendance history table
//
//  ADMIN VIEW:
//  - All employees' records table
//  - Filter by employee name, date range, status
//  - Manual attendance entry modal
//  - Per-employee summary report (present/late/absent/hours)
// ============================================================
 
import { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { useAuth, AuthProvider } from "../AuthContext";
 
// ── Shared helpers ────────────────────────────────────────────
 
function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}
 
function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-MY", {
    day: "numeric", month: "short", year: "numeric",
  });
}
 
function formatTime(t) {
  if (!t) return "—";
  // t might be "09:05:00" or a full datetime string
  const date = new Date(t);
  if (isNaN(date)) {
    // It's a time string like "09:05:00"
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12  = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  }
  return date.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" });
}
 
function calcHours(clockIn, clockOut) {
  if (!clockIn || !clockOut) return "—";
  const diff = new Date(clockOut) - new Date(clockIn);
  if (isNaN(diff) || diff <= 0) return "—";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
}
 
// ── Shared UI ─────────────────────────────────────────────────
 
function StatusBadge({ status }) {
  const s = {
    present: "bg-green-50  text-green-700  border border-green-200",
    late:    "bg-amber-50  text-amber-700  border border-amber-200",
    absent:  "bg-red-50    text-red-600    border border-red-200",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${s[status] || s.absent}`}>
      {status}
    </span>
  );
}
 
function Alert({ type, message, onClose }) {
  if (!message) return null;
  const s = { success: "bg-green-50 border-green-200 text-green-800", error: "bg-red-50 border-red-200 text-red-800" };
  return (
    <div className={`border rounded-lg px-4 py-3 text-sm flex items-start justify-between gap-3 mb-4 ${s[type]}`}>
      <span>{message}</span>
      <button onClick={onClose} className="opacity-50 hover:opacity-100">✕</button>
    </div>
  );
}
 
// ── Live clock component ──────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="text-center">
      <p className="text-4xl font-medium text-gray-900 tabular-nums tracking-tight">
        {time.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      </p>
      <p className="text-sm text-gray-400 mt-1">
        {time.toLocaleDateString("en-MY", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      </p>
    </div>
  );
}
 
// ══════════════════════════════════════════════════════════════
//  EMPLOYEE VIEW
// ══════════════════════════════════════════════════════════════
function EmployeeAttendanceView() {
  const { user } = useAuth();
 
  const [today,     setToday]     = useState(null);   // today's record
  const [summary,   setSummary]   = useState(null);   // monthly summary
  const [history,   setHistory]   = useState([]);     // full history
  const [loading,   setLoading]   = useState(true);
  const [clocking,  setClocking]  = useState(false);  // clock in/out loading
  const [success,   setSuccess]   = useState("");
  const [error,     setError]     = useState("");
  const [month,     setMonth]     = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
 
  useEffect(() => { fetchAll(); }, [month]);
 
  async function fetchAll() {
    setLoading(true);
    try {
      const [todayRes, summaryRes, historyRes] = await Promise.all([
        fetch("/api/attendance/today",          { headers: authHeaders() }),
        fetch(`/api/attendance/summary?month=${month}`, { headers: authHeaders() }),
        fetch(`/api/attendance?month=${month}`, { headers: authHeaders() }),
      ]);
      setToday(todayRes.ok   ? await todayRes.json()   : null);
      setSummary(summaryRes.ok ? await summaryRes.json() : null);
      setHistory(historyRes.ok ? await historyRes.json() : []);
    } catch { setError("Failed to load attendance data."); }
    finally  { setLoading(false); }
  }
 
  // Clock in or clock out depending on current state
  async function handleClock() {
    setClocking(true);
    setError("");
    const endpoint = today?.clock_in && !today?.clock_out
      ? "/api/attendance/clock-out"
      : "/api/attendance/clock-in";
    try {
      const res  = await fetch(endpoint, { method: "POST", headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed."); return; }
      setSuccess(today?.clock_in ? "Clocked out successfully!" : "Clocked in successfully!");
      fetchAll();
    } catch { setError("Network error. Please try again."); }
    finally  { setClocking(false); }
  }
 
  const isClockedIn  = today?.clock_in && !today?.clock_out;
  const isClockedOut = today?.clock_in && today?.clock_out;
 
  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-medium text-gray-900 mb-1">Attendance</h1>
      <p className="text-sm text-gray-400 mb-6">
        Welcome, {user?.name?.split(" ")[0]}. Track your daily attendance here.
      </p>
 
      <Alert type="success" message={success} onClose={() => setSuccess("")} />
      <Alert type="error"   message={error}   onClose={() => setError("")} />
 
      {/* ── Clock in/out card ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 mb-6 flex flex-col items-center gap-6">
        <LiveClock />
 
        {/* Status indicator */}
        <div className="text-center">
          {isClockedIn && (
            <p className="text-sm text-green-600 font-medium mb-1">
              Clocked in at {formatTime(today.clock_in)}
            </p>
          )}
          {isClockedOut && (
            <p className="text-sm text-gray-500 mb-1">
              {formatTime(today.clock_in)} → {formatTime(today.clock_out)} · {calcHours(today.clock_in, today.clock_out)}
            </p>
          )}
          {!today?.clock_in && !loading && (
            <p className="text-sm text-gray-400 mb-1">You haven't clocked in yet today.</p>
          )}
        </div>
 
        {/* Clock in / out button */}
        {!isClockedOut ? (
          <button
            onClick={handleClock}
            disabled={clocking}
            className={[
              "px-10 py-3 rounded-xl text-base font-medium text-white transition-all disabled:opacity-60",
              isClockedIn
                ? "bg-red-500 hover:bg-red-600"     // clock out = red
                : "bg-green-600 hover:bg-green-700", // clock in  = green
            ].join(" ")}
          >
            {clocking ? "Please wait..." : isClockedIn ? "Clock out" : "Clock in"}
          </button>
        ) : (
          <div className="px-6 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500">
            Done for today — see you tomorrow!
          </div>
        )}
      </div>
 
      {/* ── Monthly summary cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Present", value: summary?.present ?? "—", color: "text-green-600", bg: "bg-green-50"  },
          { label: "Late",    value: summary?.late    ?? "—", color: "text-amber-600", bg: "bg-amber-50"  },
          { label: "Absent",  value: summary?.absent  ?? "—", color: "text-red-500",   bg: "bg-red-50"    },
          { label: "Avg hours", value: summary?.avg_hours ?? "—", color: "text-blue-600", bg: "bg-blue-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} border border-gray-100 rounded-xl p-4`}>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-2xl font-medium ${color}`}>{value}</p>
          </div>
        ))}
      </div>
 
      {/* Month picker */}
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm text-gray-500">Showing month:</label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
 
      {/* ── Attendance history table ── */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-medium text-gray-900">Attendance history</h2>
        </div>
        {loading ? (
          <div className="p-6 text-sm text-gray-400">Loading...</div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">No records for this month.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Date", "Clock in", "Clock out", "Hours worked", "Status"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {history.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{formatDate(r.date)}</td>
                    <td className="px-6 py-4 text-gray-600">{formatTime(r.clock_in)}</td>
                    <td className="px-6 py-4 text-gray-600">{formatTime(r.clock_out)}</td>
                    <td className="px-6 py-4 text-gray-600">{calcHours(r.clock_in, r.clock_out)}</td>
                    <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
 
// ══════════════════════════════════════════════════════════════
//  ADMIN VIEW
// ══════════════════════════════════════════════════════════════
 
// ── Manual attendance modal ───────────────────────────────────
function ManualEntryModal({ employees, onClose, onDone }) {
  const [userId,   setUserId]   = useState("");
  const [date,     setDate]     = useState(new Date().toISOString().split("T")[0]);
  const [clockIn,  setClockIn]  = useState("09:00");
  const [clockOut, setClockOut] = useState("18:00");
  const [status,   setStatus]   = useState("present");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
 
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          user_id:   userId,
          date,
          clock_in:  `${date} ${clockIn}:00`,
          clock_out: `${date} ${clockOut}:00`,
          status,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed."); return; }
      onDone("Attendance record added successfully.");
      onClose();
    } catch { setError("Network error. Please try again."); }
    finally  { setLoading(false); }
  }
 
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50 }}>
      <div className="bg-white rounded-xl border border-gray-200 w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-medium text-gray-900">Mark attendance manually</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>
 
        {error && <Alert type="error" message={error} onClose={() => setError("")} />}
 
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee select */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Employee</label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select employee...</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
 
          {/* Date */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
 
          {/* Clock in / out */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Clock in</label>
              <input type="time" value={clockIn} onChange={(e) => setClockIn(e.target.value)} required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Clock out</label>
              <input type="time" value={clockOut} onChange={(e) => setClockOut(e.target.value)} required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
          </div>
 
          {/* Status */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Status</label>
            <div className="flex gap-2">
              {["present", "late", "absent"].map((s) => (
                <button key={s} type="button" onClick={() => setStatus(s)}
                  className={[
                    "flex-1 py-2 rounded-lg text-sm font-medium border transition-all capitalize",
                    status === s && s === "present" ? "bg-green-50 border-green-400 text-green-700"
                    : status === s && s === "late"  ? "bg-amber-50 border-amber-400 text-amber-700"
                    : status === s && s === "absent" ? "bg-red-50 border-red-400 text-red-600"
                    : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50",
                  ].join(" ")}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
 
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
              {loading ? "Saving..." : "Save record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
 
// ── Summary report table ──────────────────────────────────────
function SummaryReport({ data }) {
  if (!data || data.length === 0) return null;
 
  // CSV export — creates a downloadable file in the browser
  function exportCSV() {
    const headers = ["Employee", "Present", "Late", "Absent", "Total Hours"];
    const rows = data.map((r) => [r.name, r.present, r.late, r.absent, r.total_hours]);
    const csv  = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `attendance-summary-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
 
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-base font-medium text-gray-900">Employee summary report</h2>
        <button onClick={exportCSV}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <path d="M8 1v9M4 6l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Employee", "Present", "Late", "Absent", "Total hours"].map((h) => (
                <th key={h} className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((r) => (
              <tr key={r.user_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">{r.name}</td>
                <td className="px-6 py-4"><span className="text-green-600 font-medium">{r.present}</span></td>
                <td className="px-6 py-4"><span className="text-amber-600 font-medium">{r.late}</span></td>
                <td className="px-6 py-4"><span className="text-red-500 font-medium">{r.absent}</span></td>
                <td className="px-6 py-4 text-gray-600">{r.total_hours}h</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
 
function AdminAttendanceView() {
  const [records,   setRecords]   = useState([]);
  const [summary,   setSummary]   = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [success,   setSuccess]   = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showSum,   setShowSum]   = useState(false);
 
  // Filters
  const [filterName,   setFilterName]   = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate,   setFilterDate]   = useState("");
  const [month,        setMonth]        = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
 
  useEffect(() => { fetchAll(); }, [month]);
 
  async function fetchAll() {
    setLoading(true);
    try {
      const [recRes, empRes, sumRes] = await Promise.all([
        fetch(`/api/admin/attendance?month=${month}`,  { headers: authHeaders() }),
        fetch("/api/admin/employees",                   { headers: authHeaders() }),
        fetch(`/api/admin/attendance/summary?month=${month}`, { headers: authHeaders() }),
      ]);
      setRecords(recRes.ok   ? await recRes.json()   : []);
      setEmployees(empRes.ok ? await empRes.json()   : []);
      setSummary(sumRes.ok   ? await sumRes.json()   : []);
    } catch { console.error("Failed to load admin attendance"); }
    finally  { setLoading(false); }
  }
 
  // Apply filters to records
  const filtered = records.filter((r) => {
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    if (filterDate   && r.date !== filterDate)               return false;
    if (filterName   && !r.user_name.toLowerCase().includes(filterName.toLowerCase())) return false;
    return true;
  });
 
  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-medium text-gray-900">Attendance</h1>
        <span className="text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
          HR Admin view
        </span>
      </div>
      <p className="text-sm text-gray-400 mb-6">Monitor and manage employee attendance records.</p>
 
      <Alert type="success" message={success} onClose={() => setSuccess("")} />
 
      {/* Action buttons */}
      <div className="flex gap-3 mb-6">
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Mark attendance
        </button>
        <button onClick={() => setShowSum(!showSum)}
          className="flex items-center gap-2 border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M4 8h8M4 5h8M4 11h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {showSum ? "Hide" : "Show"} summary report
        </button>
      </div>
 
      {/* Summary report (toggleable) */}
      {showSum && <SummaryReport data={summary} />}
 
      {/* Month picker + filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        <input type="text" value={filterName} onChange={(e) => setFilterName(e.target.value)}
          placeholder="Search employee..."
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"/>
        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All statuses</option>
          <option value="present">Present</option>
          <option value="late">Late</option>
          <option value="absent">Absent</option>
        </select>
        {(filterName || filterDate || filterStatus !== "all") && (
          <button onClick={() => { setFilterName(""); setFilterDate(""); setFilterStatus("all"); }}
            className="text-sm text-gray-400 hover:text-gray-600 px-2">
            Clear filters
          </button>
        )}
      </div>
 
      {/* Records table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">No records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Employee", "Date", "Clock in", "Clock out", "Hours", "Status"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-800">{r.user_name}</td>
                    <td className="px-5 py-4 text-gray-600">{formatDate(r.date)}</td>
                    <td className="px-5 py-4 text-gray-600">{formatTime(r.clock_in)}</td>
                    <td className="px-5 py-4 text-gray-600">{formatTime(r.clock_out)}</td>
                    <td className="px-5 py-4 text-gray-600">{calcHours(r.clock_in, r.clock_out)}</td>
                    <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
 
      {showModal && (
        <ManualEntryModal
          employees={employees}
          onClose={() => setShowModal(false)}
          onDone={(msg) => { setSuccess(msg); fetchAll(); }}
        />
      )}
    </div>
  );
}
 
// ── Main export — role switch ─────────────────────────────────
export default function Attendance() {
  const { user } = useAuth();
  if (!user) return null;
  return user.role === "HR Admin"
    ? <AdminAttendanceView />
    : <EmployeeAttendanceView />;
}

// ── Mount the component ─────────────────
const container = document.getElementById('attendancePage');
if (container) {
  const root = createRoot(container);
  root.render(
    <AuthProvider>
      <Attendance />
    </AuthProvider>
  );
}
