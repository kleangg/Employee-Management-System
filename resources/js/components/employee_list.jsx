// ============================================================
//  pages/EmployeeList.jsx — Employee directory
//
//  For Managers and HR roles.
//  Features:
//  - Search bar (name/email/ID)
//  - Filter by department and position
//  - Paginated employee table
//  - Click row → employee profile
//  - HR sees "Add Employee" button
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

// ── Status badge ──────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = status === "Active"
    ? "bg-green-50 text-green-700 border border-green-200"
    : "bg-gray-100 text-gray-500 border border-gray-200";
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s}`}>
      {status}
    </span>
  );
}

// ── Role badge ────────────────────────────────────────────────
function RoleBadge({ role }) {
  // Backend stores role as lowercase enum: 'hr', 'manager', 'employee'.
  // We map those to colour + display label here.
  const colors = {
    hr:       'bg-blue-50 text-blue-700',
    manager:  'bg-purple-50 text-purple-700',
    employee: 'bg-gray-100 text-gray-600',
  };
  const labels = { hr: 'HR', manager: 'Manager', employee: 'Employee' };
  const key = (role || '').toLowerCase();
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[key] || colors.employee}`}>
      {labels[key] || role}
    </span>
  );
}

// ── Get initials ──────────────────────────────────────────────
function getInitials(name = "") {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Departments are loaded from /api/departments at runtime.

// ── Main Component ────────────────────────────────────────────
export default function EmployeeList() {
  const { user } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage] = useState(20);

  // Load departments once so the filter dropdown matches real data.
  useEffect(() => {
    fetch('/api/departments', { headers: authHeaders() })
      .then(r => r.ok ? r.json() : [])
      .then(d => setDepartments(Array.isArray(d) ? d : []))
      .catch(() => setDepartments([]));
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [search, department, role, page]);

  async function fetchEmployees() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
      });
      if (search) params.set('search', search);
      // Backend expects department_id (integer), not a department name.
      if (department) params.set('department_id', department);
      if (role) params.set('role', role);

      const res = await fetch(`/api/employees?${params}`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.data || []);
        setTotalPages(data.last_page || 1);
        setTotal(data.total || 0);
      }
    } catch {
      console.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(value) {
    setSearch(value);
    setPage(1);
  }

  function handleDepartmentChange(value) {
    setDepartment(value);
    setPage(1);
  }

  function handleRoleChange(value) {
    setRole(value);
    setPage(1);
  }

  function clearFilters() {
    setSearch('');
    setDepartment('');
    setRole('');
    setPage(1);
  }

  const hasFilters = search || department || role;
  const isHR = user?.role === "hr";

  if (!user) return null;

  return (
    <div className="p-6" style={{ maxWidth: '100%' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-medium text-gray-900">Employees</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{total} employee{total !== 1 ? 's' : ''}</span>
          {isHR && (
            <a
              href="/employees/add"
              className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              style={{ textDecoration: 'none' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Add Employee
            </a>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-400 mb-6">Manage and view employee information across your organisation.</p>

      {/* Search & Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name, email, or ID..."
              className="w-full border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Department filter */}
          <select
            value={department}
            onChange={(e) => handleDepartmentChange(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>

          {/* Role filter (backend enum: hr/manager/employee) */}
          <select
            value={role}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
          >
            <option value="">All Roles</option>
            <option value="hr">HR</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>

          {/* Clear */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-400 hover:text-gray-600 px-2 py-2 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-gray-400">Loading employees...</div>
        ) : employees.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" viewBox="0 0 48 48" fill="none">
              <path d="M34 40H14l-2-14h24l-2 14zM10 18h28M16 18V14a8 8 0 0116 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-sm text-gray-400">No employees found matching your criteria.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider" style={{ width: '22%' }}>Employee</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider" style={{ width: '10%' }}>ID</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider" style={{ width: '20%' }}>Email</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider" style={{ width: '13%' }}>Department</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider" style={{ width: '15%' }}>Position</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider" style={{ width: '10%' }}>Status</th>
                  {isHR && (
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider" style={{ width: '10%' }}>Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {employees.map(emp => (
                  <tr
                    key={emp.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/employees/${emp.id}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0 border border-blue-100">
                          {getInitials(emp.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{emp.name}</p>
                          <p className="text-xs text-gray-400 truncate">{emp.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{emp.employeeID}</td>
                    <td className="px-4 py-3 text-gray-500 truncate">{emp.email}</td>
                    <td className="px-4 py-3 text-gray-600 truncate">{emp.department?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 truncate">{emp.position}</td>
                    <td className="px-4 py-3"><StatusBadge status={emp.status} /></td>
                    {isHR && (
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); window.location.href = `/employees/edit/${emp.id}`; }}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
              <p className="text-sm text-gray-400">
                Showing {((page - 1) * perPage) + 1} – {Math.min(page * perPage, total)} of {total}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={[
                      "w-9 h-9 text-sm rounded-lg transition-all",
                      p === page
                        ? "bg-blue-600 text-white font-medium shadow-sm"
                        : "text-gray-600 hover:bg-gray-100",
                    ].join(" ")}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Mount ─────────────────────────────────────────────────────
const container = document.getElementById('employeeListPage');
if (container) {
  const root = createRoot(container);
  root.render(
    <AuthProvider>
      <EmployeeList />
    </AuthProvider>
  );
}
