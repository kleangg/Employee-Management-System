// ============================================================
//  pages/AddEmployee.jsx — Create new employee (HR only)
//
//  Form fields: Name, Employee ID, Email, Phone, Department,
//  Position, Date of Joining, Salary
//  POST /api/employees
// ============================================================

import { useState } from "react";
import { createRoot } from "react-dom/client";
import { useAuth, AuthProvider } from "../AuthContext";

// ── Helpers ───────────────────────────────────────────────────
function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

// ── Shared UI ─────────────────────────────────────────────────
function Alert({ type, message, onClose }) {
  if (!message) return null;
  const s = {
    success: "bg-green-50 border-green-200 text-green-800",
    error:   "bg-red-50   border-red-200   text-red-800",
  };
  return (
    <div className={`border rounded-lg px-4 py-3 text-sm flex items-start justify-between gap-3 mb-5 ${s[type]}`}>
      <span>{message}</span>
      <button onClick={onClose} className="opacity-50 hover:opacity-100 flex-shrink-0">✕</button>
    </div>
  );
}

function FormField({ label, children, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

// ── Departments and Positions ─────────────────────────────────
const departments = ['Engineering', 'HR', 'Marketing', 'Finance'];
const positions = {
  Engineering: ['Senior Developer', 'Frontend Developer', 'Backend Developer', 'DevOps Engineer', 'QA Engineer', 'Tech Lead'],
  HR: ['HR Manager', 'HR Executive', 'Recruiter'],
  Marketing: ['Marketing Lead', 'Content Writer', 'SEO Specialist'],
  Finance: ['Financial Analyst', 'Accountant', 'Finance Manager'],
};

// ── Input class ───────────────────────────────────────────────
const inputClass = "w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow";
const selectClass = "w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow";

// ── Main Component ────────────────────────────────────────────
export default function AddEmployee() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: '',
    employeeID: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    date_of_joining: '',
    salary: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    if (field === 'department') {
      setForm(prev => ({ ...prev, position: '' }));
    }
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.employeeID.trim()) e.employeeID = 'Employee ID is required.';
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format.';
    if (!form.phone.trim()) e.phone = 'Phone number is required.';
    if (!form.department) e.department = 'Department is required.';
    if (!form.position) e.position = 'Position is required.';
    if (!form.date_of_joining) e.date_of_joining = 'Date of joining is required.';
    if (!form.salary) e.salary = 'Salary is required.';
    else if (isNaN(form.salary) || Number(form.salary) <= 0) e.salary = 'Salary must be a positive number.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ ...form, salary: Number(form.salary), role: 'Employee' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to add employee.');
        return;
      }
      setSuccess(`Employee "${form.name}" has been added successfully!`);
      setForm({ name: '', employeeID: '', email: '', phone: '', department: '', position: '', date_of_joining: '', salary: '' });
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  const availablePositions = form.department ? (positions[form.department] || []) : [];

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
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

      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-medium text-gray-900">Add New Employee</h1>
        <span className="text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
          HR Only
        </span>
      </div>
      <p className="text-sm text-gray-400 mb-6">Fill in the details below to register a new employee.</p>

      <Alert type="success" message={success} onClose={() => setSuccess('')} />
      <Alert type="error" message={error} onClose={() => setError('')} />

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Name */}
            <FormField label="Full Name" required>
              <input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="e.g. Ahmad Bin Ali" className={inputClass} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </FormField>

            {/* Employee ID */}
            <FormField label="Employee ID" required>
              <input type="text" value={form.employeeID} onChange={(e) => handleChange('employeeID', e.target.value)} placeholder="e.g. EMP016" className={inputClass} />
              {errors.employeeID && <p className="text-xs text-red-500 mt-1">{errors.employeeID}</p>}
            </FormField>

            {/* Email */}
            <FormField label="Email" required>
              <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="e.g. ahmad@company.com" className={inputClass} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </FormField>

            {/* Phone */}
            <FormField label="Phone Number" required>
              <input type="text" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="e.g. 012-345-6789" className={inputClass} />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </FormField>

            {/* Department */}
            <FormField label="Department" required>
              <select value={form.department} onChange={(e) => handleChange('department', e.target.value)} className={selectClass}>
                <option value="">Select department...</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
            </FormField>

            {/* Position */}
            <FormField label="Position" required>
              <select value={form.position} onChange={(e) => handleChange('position', e.target.value)} className={selectClass} disabled={!form.department}>
                <option value="">Select position...</option>
                {availablePositions.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {errors.position && <p className="text-xs text-red-500 mt-1">{errors.position}</p>}
            </FormField>

            {/* Date of Joining */}
            <FormField label="Date of Joining" required>
              <input type="date" value={form.date_of_joining} onChange={(e) => handleChange('date_of_joining', e.target.value)} className={inputClass} />
              {errors.date_of_joining && <p className="text-xs text-red-500 mt-1">{errors.date_of_joining}</p>}
            </FormField>

            {/* Salary */}
            <FormField label="Salary (MYR)" required>
              <input type="number" value={form.salary} onChange={(e) => handleChange('salary', e.target.value)} placeholder="e.g. 5000" min="0" step="100" className={inputClass} />
              {errors.salary && <p className="text-xs text-red-500 mt-1">{errors.salary}</p>}
            </FormField>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Adding...' : 'Add Employee'}
            </button>
            <a
              href="/employees"
              className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              style={{ textDecoration: 'none' }}
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Mount ─────────────────────────────────────────────────────
const container = document.getElementById('addEmployeePage');
if (container) {
  const root = createRoot(container);
  root.render(
    <AuthProvider>
      <AddEmployee />
    </AuthProvider>
  );
}
