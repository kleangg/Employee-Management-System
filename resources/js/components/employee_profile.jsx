// ============================================================
//  pages/EmployeeProfile.jsx — Employee detail view
//
//  For Managers and HR roles.
//  Tabs: Personal Info, Job Details, Attendance, Leave
//  Fetches from GET /api/employees/:id
// ============================================================

import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { useAuth, AuthProvider } from "../AuthContext";

// ── Helpers ───────────────────────────────────────────────────
function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    Accept: "application/json",
  };
}

function getEmployeeIdFromUrl() {
  const parts = window.location.pathname.split('/');
  return parts[parts.length - 1];
}

function getInitials(name = "") {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-MY", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatMoney(n) {
  if (!n && n !== 0) return "—";
  return 'MYR ' + Number(n).toLocaleString('en-MY', { minimumFractionDigits: 2 });
}

// ── Status badge ──────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    present:  "bg-green-50  text-green-700  border border-green-200",
    late:     "bg-amber-50  text-amber-700  border border-amber-200",
    absent:   "bg-red-50    text-red-600    border border-red-200",
    approved: "bg-green-50  text-green-700  border border-green-200",
    pending:  "bg-amber-50  text-amber-700  border border-amber-200",
    rejected: "bg-red-50    text-red-600    border border-red-200",
    Active:   "bg-green-50  text-green-700  border border-green-200",
    Inactive: "bg-gray-100  text-gray-500   border border-gray-200",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${map[status] || map.present}`}>
      {status}
    </span>
  );
}

// ── Info row ──────────────────────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-400 w-36 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-900 font-medium">{value || "—"}</span>
    </div>
  );
}

// ── Personal Info Tab ─────────────────────────────────────────
function PersonalInfoTab({ emp }) {
  return (
    <div>
      <InfoRow label="Full Name" value={emp.name} />
      <InfoRow label="Email" value={emp.email} />
      <InfoRow label="Phone" value={emp.phone} />
      <InfoRow label="Address" value={emp.address} />
      <InfoRow label="Emergency Contact" value={emp.emergency_contact} />
      <InfoRow label="Status" value={<StatusBadge status={emp.status} />} />
    </div>
  );
}

// ── Job Details Tab ───────────────────────────────────────────
function JobDetailsTab({ emp }) {
  return (
    <div>
      <InfoRow label="Employee ID" value={<span className="font-mono text-xs bg-gray-50 px-2 py-1 rounded">{emp.employeeID}</span>} />
      <InfoRow label="Department" value={emp.department?.name || '—'} />
      <InfoRow label="Position" value={emp.position} />
      <InfoRow label="Role" value={emp.role} />
      <InfoRow label="Date of Joining" value={formatDate(emp.date_of_joining)} />
      <InfoRow label="Salary" value={formatMoney(emp.salary)} />
    </div>
  );
}

// ── Attendance Tab ────────────────────────────────────────────
function AttendanceTab({ attendance }) {
  if (!attendance) return <p className="text-sm text-gray-400 py-4">No attendance data available.</p>;

  const { summary, recent } = attendance;

  return (
    <div>
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Present", value: summary?.present ?? "—", color: "text-green-600", bg: "bg-green-50" },
          { label: "Late", value: summary?.late ?? "—", color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Absent", value: summary?.absent ?? "—", color: "text-red-500", bg: "bg-red-50" },
          { label: "Avg Hours", value: summary?.avg_hours ?? "—", color: "text-blue-600", bg: "bg-blue-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} border border-gray-100 rounded-xl p-3`}>
            <p className="text-xs text-gray-500 mb-0.5">{label}</p>
            <p className={`text-xl font-medium ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Recent attendance */}
      <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Attendance</h3>
      {(!recent || recent.length === 0) ? (
        <p className="text-sm text-gray-400">No recent records.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["Date", "Clock In", "Clock Out", "Hours", "Status"].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recent.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800 font-medium">{formatDate(r.date)}</td>
                  <td className="px-4 py-3 text-gray-600">{r.clock_in}</td>
                  <td className="px-4 py-3 text-gray-600">{r.clock_out}</td>
                  <td className="px-4 py-3 text-gray-600">{r.hours}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Leave Tab ─────────────────────────────────────────────────
function LeaveTab({ leave }) {
  if (!leave) return <p className="text-sm text-gray-400 py-4">No leave data available.</p>;

  const { balance, used, history } = leave;

  const types = [
    { key: "annual", label: "Annual", total: balance?.annual ?? 14, usedVal: used?.annual ?? 0, bar: "bg-blue-500", color: "text-blue-700" },
    { key: "medical", label: "Medical", total: balance?.medical ?? 14, usedVal: used?.medical ?? 0, bar: "bg-teal-500", color: "text-teal-700" },
    { key: "emergency", label: "Emergency", total: balance?.emergency ?? 3, usedVal: used?.emergency ?? 0, bar: "bg-amber-500", color: "text-amber-700" },
  ];

  return (
    <div>
      {/* Balance cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {types.map(({ key, label, total, usedVal, bar, color }) => {
          const remaining = total - usedVal;
          const pct = Math.round((remaining / total) * 100);
          return (
            <div key={key} className="bg-white border border-gray-100 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-2">{label} Leave</p>
              <div className="h-1.5 bg-gray-100 rounded-full mb-2 overflow-hidden">
                <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-lg font-medium ${color}`}>{remaining}</span>
                <span className="text-xs text-gray-400">/ {total} days left</span>
              </div>
              {usedVal > 0 && <p className="text-xs text-gray-400 mt-0.5">{usedVal} day{usedVal > 1 ? 's' : ''} used</p>}
            </div>
          );
        })}
      </div>

      {/* Leave history */}
      <h3 className="text-sm font-medium text-gray-700 mb-3">Leave History</h3>
      {(!history || history.length === 0) ? (
        <p className="text-sm text-gray-400">No leave records.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["Type", "From", "To", "Days", "Reason", "Status"].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {history.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800 capitalize font-medium">{r.type}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(r.start_date)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(r.end_date)}</td>
                  <td className="px-4 py-3 text-gray-600">{r.days}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{r.reason}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function EmployeeProfile() {
  const { user } = useAuth();
  const empId = getEmployeeIdFromUrl();

  const [emp, setEmp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    try {
      const res = await fetch(`/api/employees/${empId}`, { headers: authHeaders() });
      if (res.ok) {
        setEmp(await res.json());
      }
    } catch {
      console.error("Failed to fetch employee profile");
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  const isHR = user?.role === "hr";

  const tabs = [
    { key: "personal", label: "Personal Info" },
    { key: "job", label: "Job Details" },
    { key: "attendance", label: "Attendance" },
    { key: "leave", label: "Leave Record" },
  ];

  if (loading) {
    return (
      <div className="p-8 max-w-4xl">
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-sm text-gray-400">Loading employee profile...</p>
        </div>
      </div>
    );
  }

  if (!emp) {
    return (
      <div className="p-8 max-w-4xl">
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-sm text-gray-400">Employee not found.</p>
          <a href="/employees" className="text-sm text-blue-600 mt-2 inline-block">← Back to employee list</a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Back */}
      <a
        href="/employees"
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors"
        style={{ textDecoration: 'none' }}
      >
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to employee list
      </a>

      {/* Profile header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl font-bold text-white flex-shrink-0 shadow-lg">
            {getInitials(emp.name)}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">{emp.name}</h1>
            <p className="text-sm text-gray-400">{emp.position} · {emp.department?.name || '—'}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <StatusBadge status={emp.status} />
              <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{emp.role}</span>
              <span className="text-xs text-gray-400 font-mono">{emp.employeeID}</span>
            </div>
          </div>

          {/* Edit button (HR only) */}
          {isHR && (
            <a
              href={`/employees/edit/${emp.id}`}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-lg px-4 py-2 transition-colors"
              style={{ textDecoration: 'none' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Edit
            </a>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={[
              "text-sm px-4 py-1.5 rounded-md transition-all whitespace-nowrap",
              activeTab === tab.key
                ? "bg-white text-gray-900 font-medium shadow-sm"
                : "text-gray-500 hover:text-gray-700",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        {activeTab === "personal" && <PersonalInfoTab emp={emp} />}
        {activeTab === "job" && <JobDetailsTab emp={emp} />}
        {activeTab === "attendance" && <AttendanceTab attendance={emp.attendance} />}
        {activeTab === "leave" && <LeaveTab leave={emp.leave} />}
      </div>
    </div>
  );
}

// ── Mount ─────────────────────────────────────────────────────
const container = document.getElementById('employeeProfilePage');
if (container) {
  const root = createRoot(container);
  root.render(
    <AuthProvider>
      <EmployeeProfile />
    </AuthProvider>
  );
}
