import { http, HttpResponse } from 'msw';

// ── Mock Employees (full dataset) ─────────────────────────────
const mockEmployees = [
  { id: 1, employeeID: 'EMP001', name: 'John Doe', email: 'john.doe@company.com', phone: '012-345-6789', department: 'Engineering', position: 'Senior Developer', date_of_joining: '2021-03-15', salary: 8500, role: 'Employee', status: 'Active' },
  { id: 2, employeeID: 'EMP002', name: 'Jane Smith', email: 'jane.smith@company.com', phone: '012-456-7890', department: 'HR', position: 'HR Manager', date_of_joining: '2020-01-10', salary: 9200, role: 'HR', status: 'Active' },
  { id: 3, employeeID: 'EMP003', name: 'Bob Johnson', email: 'bob.johnson@company.com', phone: '013-567-8901', department: 'Marketing', position: 'Marketing Lead', date_of_joining: '2022-06-20', salary: 7800, role: 'Manager', status: 'Active' },
  { id: 4, employeeID: 'EMP004', name: 'Alice Wong', email: 'alice.wong@company.com', phone: '011-678-9012', department: 'Engineering', position: 'Frontend Developer', date_of_joining: '2023-01-05', salary: 6500, role: 'Employee', status: 'Active' },
  { id: 5, employeeID: 'EMP005', name: 'Charlie Brown', email: 'charlie.brown@company.com', phone: '014-789-0123', department: 'Finance', position: 'Financial Analyst', date_of_joining: '2021-09-12', salary: 7200, role: 'Employee', status: 'Active' },
  { id: 6, employeeID: 'EMP006', name: 'Diana Lee', email: 'diana.lee@company.com', phone: '016-890-1234', department: 'Engineering', position: 'Backend Developer', date_of_joining: '2022-04-18', salary: 7000, role: 'Employee', status: 'Active' },
  { id: 7, employeeID: 'EMP007', name: 'Edward Tan', email: 'edward.tan@company.com', phone: '017-901-2345', department: 'HR', position: 'HR Executive', date_of_joining: '2023-07-01', salary: 5500, role: 'Employee', status: 'Active' },
  { id: 8, employeeID: 'EMP008', name: 'Fiona Chen', email: 'fiona.chen@company.com', phone: '018-012-3456', department: 'Marketing', position: 'Content Writer', date_of_joining: '2022-11-25', salary: 5000, role: 'Employee', status: 'Inactive' },
  { id: 9, employeeID: 'EMP009', name: 'George Lim', email: 'george.lim@company.com', phone: '019-123-4567', department: 'Engineering', position: 'DevOps Engineer', date_of_joining: '2021-05-30', salary: 8000, role: 'Employee', status: 'Active' },
  { id: 10, employeeID: 'EMP010', name: 'Hannah Ng', email: 'hannah.ng@company.com', phone: '012-234-5678', department: 'Finance', position: 'Accountant', date_of_joining: '2020-08-14', salary: 6800, role: 'Employee', status: 'Active' },
  { id: 11, employeeID: 'EMP011', name: 'Ivan Kumar', email: 'ivan.kumar@company.com', phone: '013-345-6789', department: 'Engineering', position: 'QA Engineer', date_of_joining: '2023-03-22', salary: 6000, role: 'Employee', status: 'Active' },
  { id: 12, employeeID: 'EMP012', name: 'Julia Ong', email: 'julia.ong@company.com', phone: '014-456-7890', department: 'Marketing', position: 'SEO Specialist', date_of_joining: '2022-09-08', salary: 5500, role: 'Employee', status: 'Active' },
  { id: 13, employeeID: 'EMP013', name: 'Kevin Raj', email: 'kevin.raj@company.com', phone: '016-567-8901', department: 'Engineering', position: 'Tech Lead', date_of_joining: '2019-12-01', salary: 10000, role: 'Manager', status: 'Active' },
  { id: 14, employeeID: 'EMP014', name: 'Lisa Tan', email: 'lisa.tan@company.com', phone: '017-678-9012', department: 'HR', position: 'Recruiter', date_of_joining: '2023-05-15', salary: 5200, role: 'Employee', status: 'Active' },
  { id: 15, employeeID: 'EMP015', name: 'Michael Yap', email: 'michael.yap@company.com', phone: '018-789-0123', department: 'Finance', position: 'Finance Manager', date_of_joining: '2020-02-28', salary: 9500, role: 'Manager', status: 'Active' },
];

// ── Mock Users for login ──────────────────────────────────────
const mockUsers = [
  { email: 'admin@company.com', password: 'password', name: 'Admin User', role: 'HR Admin', id: 100 },
  { email: 'jane.smith@company.com', password: 'password', name: 'Jane Smith', role: 'HR Admin', id: 2 },
  { email: 'bob.johnson@company.com', password: 'password', name: 'Bob Johnson', role: 'Manager', id: 3 },
  { email: 'kevin.raj@company.com', password: 'password', name: 'Kevin Raj', role: 'Manager', id: 13 },
  { email: 'john.doe@company.com', password: 'password', name: 'John Doe', role: 'Employee', id: 1 },
];

// ── Mock leave data ───────────────────────────────────────────
const mockLeaveHistory = [
  { id: 1, type: 'annual', start_date: '2024-01-15', end_date: '2024-01-17', reason: 'Family vacation', status: 'approved', created_at: '2024-01-10T10:00:00Z' },
  { id: 2, type: 'medical', start_date: '2024-02-01', end_date: '2024-02-01', reason: 'Doctor appointment', status: 'approved', created_at: '2024-01-25T14:30:00Z' },
];

const mockLeaveBalance = { annual: 2, medical: 1, emergency: 0 };

const mockAdminLeaveRequests = [
  { id: 1, user_id: 1, user_name: 'John Doe', type: 'annual', start_date: '2024-03-15', end_date: '2024-03-20', reason: 'Spring break', status: 'pending', created_at: '2024-03-01T09:00:00Z' },
  { id: 2, user_id: 2, user_name: 'Jane Smith', type: 'medical', start_date: '2024-03-10', end_date: '2024-03-10', reason: 'Medical checkup', status: 'approved', created_at: '2024-03-05T11:15:00Z' },
  { id: 3, user_id: 4, user_name: 'Alice Wong', type: 'annual', start_date: '2024-04-01', end_date: '2024-04-05', reason: 'Personal travel', status: 'pending', created_at: '2024-03-20T08:30:00Z' },
  { id: 4, user_id: 9, user_name: 'George Lim', type: 'emergency', start_date: '2024-03-25', end_date: '2024-03-25', reason: 'Family emergency', status: 'pending', created_at: '2024-03-24T16:45:00Z' },
];

const mockAdminBalance = { annual: 5, medical: 3, emergency: 1 };

// ── Mock attendance data ──────────────────────────────────────
const mockTodayAttendance = {
  date: new Date().toISOString().split('T')[0],
  clock_in: new Date().toISOString(),
  clock_out: null,
  status: 'present'
};

const mockAttendanceSummary = { present: 18, late: 2, absent: 0, avg_hours: 8.2 };

const mockAttendanceHistory = [
  { id: 1, date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], clock_in: new Date(Date.now() - 2 * 86400000 + 9 * 3600000).toISOString(), clock_out: new Date(Date.now() - 2 * 86400000 + 17 * 3600000).toISOString(), status: 'present' },
  { id: 2, date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], clock_in: new Date(Date.now() - 1 * 86400000 + 9.5 * 3600000).toISOString(), clock_out: new Date(Date.now() - 1 * 86400000 + 17.25 * 3600000).toISOString(), status: 'late' },
  { id: 3, date: new Date().toISOString().split('T')[0], clock_in: new Date(Date.now() - 2 * 3600000).toISOString(), clock_out: null, status: 'present' },
];

const mockAdminAttendance = [
  { id: 1, user_id: 1, user_name: 'John Doe', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], clock_in: new Date(Date.now() - 86400000 + 9 * 3600000).toISOString(), clock_out: new Date(Date.now() - 86400000 + 17 * 3600000).toISOString(), status: 'present' },
  { id: 2, user_id: 2, user_name: 'Jane Smith', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], clock_in: new Date(Date.now() - 86400000 + 9.5 * 3600000).toISOString(), clock_out: new Date(Date.now() - 86400000 + 17.25 * 3600000).toISOString(), status: 'late' },
];

const mockAdminAttendanceSummary = [
  { user_id: 1, name: 'John Doe', present: 18, late: 1, absent: 0, total_hours: 144 },
  { user_id: 2, name: 'Jane Smith', present: 17, late: 2, absent: 1, total_hours: 138 },
];

// ── Mock report data ──────────────────────────────────────────
const mockAttendanceReport = [
  { user_id: 1, name: 'John Doe', department: 'Engineering', present: 20, late: 1, absent: 0, total_hours: 160, rate: 95 },
  { user_id: 2, name: 'Jane Smith', department: 'HR', present: 18, late: 2, absent: 1, total_hours: 144, rate: 85 },
  { user_id: 3, name: 'Bob Johnson', department: 'Marketing', present: 19, late: 0, absent: 2, total_hours: 152, rate: 90 },
];

const mockLeaveReport = [
  { user_id: 1, name: 'John Doe', department: 'Engineering', approved: 5, pending: 1, rejected: 0, total_days: 5 },
  { user_id: 2, name: 'Jane Smith', department: 'HR', approved: 3, pending: 0, rejected: 1, total_days: 3 },
  { user_id: 3, name: 'Bob Johnson', department: 'Marketing', approved: 4, pending: 2, rejected: 0, total_days: 4 },
];

const mockHeadcountReport = [
  { department: 'Engineering', count: 6, pct: 40 },
  { department: 'HR', count: 3, pct: 20 },
  { department: 'Marketing', count: 3, pct: 20 },
  { department: 'Finance', count: 3, pct: 20 },
];

const mockMonthlyTrend = [
  { month: 'Jan 2024', present: 280, late: 10, absent: 5 },
  { month: 'Feb 2024', present: 275, late: 15, absent: 3 },
  { month: 'Mar 2024', present: 290, late: 8, absent: 2 },
  { month: 'Apr 2024', present: 285, late: 12, absent: 4 },
  { month: 'May 2024', present: 295, late: 5, absent: 1 },
  { month: 'Jun 2024', present: 288, late: 9, absent: 3 },
];

// ── Mock dashboard data ───────────────────────────────────────
const mockDashboard = {
  total_employees: 15,
  attendance_today: { present: 11, late: 2, absent: 2, total: 15 },
  pending_leaves: 3,
  avg_attendance: 91.5,
  attendance_trend: [
    { month: 'Oct', rate: 88 },
    { month: 'Nov', rate: 91 },
    { month: 'Dec', rate: 85 },
    { month: 'Jan', rate: 92 },
    { month: 'Feb', rate: 90 },
    { month: 'Mar', rate: 94 },
  ],
  recent_leaves: [
    { id: 1, employee: 'John Doe', type: 'Annual', days: 5, status: 'pending' },
    { id: 3, employee: 'Alice Wong', type: 'Annual', days: 5, status: 'pending' },
    { id: 4, employee: 'George Lim', type: 'Emergency', days: 1, status: 'pending' },
  ],
  department_headcount: [
    { department: 'Engineering', count: 6 },
    { department: 'HR', count: 3 },
    { department: 'Marketing', count: 3 },
    { department: 'Finance', count: 3 },
  ],
  today_attendance_list: [
    { name: 'John Doe', department: 'Engineering', clock_in: '09:02 AM', status: 'present' },
    { name: 'Jane Smith', department: 'HR', clock_in: '08:55 AM', status: 'present' },
    { name: 'Bob Johnson', department: 'Marketing', clock_in: '09:35 AM', status: 'late' },
    { name: 'Alice Wong', department: 'Engineering', clock_in: '08:58 AM', status: 'present' },
    { name: 'Charlie Brown', department: 'Finance', clock_in: '09:10 AM', status: 'present' },
    { name: 'Diana Lee', department: 'Engineering', clock_in: '—', status: 'absent' },
    { name: 'Edward Tan', department: 'HR', clock_in: '09:45 AM', status: 'late' },
    { name: 'George Lim', department: 'Engineering', clock_in: '08:50 AM', status: 'present' },
    { name: 'Hannah Ng', department: 'Finance', clock_in: '09:00 AM', status: 'present' },
    { name: 'Ivan Kumar', department: 'Engineering', clock_in: '—', status: 'absent' },
    { name: 'Kevin Raj', department: 'Engineering', clock_in: '08:45 AM', status: 'present' },
    { name: 'Lisa Tan', department: 'HR', clock_in: '09:05 AM', status: 'present' },
    { name: 'Michael Yap', department: 'Finance', clock_in: '09:01 AM', status: 'present' },
  ],
};

// ── Mock employee profile data ────────────────────────────────
function getEmployeeProfile(id) {
  const emp = mockEmployees.find(e => e.id === parseInt(id));
  if (!emp) return null;
  return {
    ...emp,
    address: '123 Jalan Bukit Bintang, 55100 Kuala Lumpur',
    emergency_contact: '012-999-8888',
    attendance: {
      summary: { present: 20, late: 1, absent: 0, avg_hours: 8.1 },
      recent: [
        { date: '2024-03-20', clock_in: '09:00 AM', clock_out: '06:05 PM', hours: '9h 5m', status: 'present' },
        { date: '2024-03-19', clock_in: '09:15 AM', clock_out: '06:00 PM', hours: '8h 45m', status: 'present' },
        { date: '2024-03-18', clock_in: '09:32 AM', clock_out: '06:10 PM', hours: '8h 38m', status: 'late' },
        { date: '2024-03-17', clock_in: '08:55 AM', clock_out: '05:50 PM', hours: '8h 55m', status: 'present' },
        { date: '2024-03-14', clock_in: '09:00 AM', clock_out: '06:00 PM', hours: '9h 0m', status: 'present' },
      ],
    },
    leave: {
      balance: { annual: 10, medical: 12, emergency: 3 },
      used: { annual: 4, medical: 2, emergency: 0 },
      history: [
        { id: 1, type: 'annual', start_date: '2024-01-15', end_date: '2024-01-17', days: 3, status: 'approved', reason: 'Family vacation' },
        { id: 2, type: 'medical', start_date: '2024-02-01', end_date: '2024-02-02', days: 2, status: 'approved', reason: 'Flu / sick leave' },
        { id: 3, type: 'annual', start_date: '2024-03-25', end_date: '2024-03-25', days: 1, status: 'pending', reason: 'Personal day' },
      ],
    },
  };
}

// ═══════════════════════════════════════════════════════════════
//  HANDLERS
// ═══════════════════════════════════════════════════════════════
export const handlers = [

  // ── Auth ─────────────────────────────────────────────────────
  http.post('/api/login', async ({ request }) => {
    const body = await request.json();
    const user = mockUsers.find(u => u.email === body.email && u.password === body.password);
    if (!user) {
      return HttpResponse.json(
        { message: 'Invalid credentials. Please check your email and password.' },
        { status: 401 }
      );
    }
    return HttpResponse.json({
      token: 'mock-jwt-token-' + user.id,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  }),

  http.post('/api/forgot-password', async ({ request }) => {
    const body = await request.json();
    const user = mockUsers.find(u => u.email === body.email);
    if (!user) {
      return HttpResponse.json(
        { message: 'If an account exists with this email, a password reset link has been sent.' },
        { status: 200 }
      );
    }
    return HttpResponse.json({
      message: 'Password reset link has been sent to your email address.',
    });
  }),

  // ── Profile ─────────────────────────────────────────────────
  http.put('/api/profile', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ user: { ...body, role: 'HR Admin', id: 1 } });
  }),

  http.put('/api/profile/password', async ({ request }) => {
    const body = await request.json();
    if (body.current_password === 'wrong') {
      return HttpResponse.json({ message: 'Current password is incorrect.' }, { status: 422 });
    }
    return HttpResponse.json({ message: 'Password updated.' });
  }),

  // ── Employees CRUD ──────────────────────────────────────────
  http.get('/api/employees', ({ request }) => {
    const url = new URL(request.url);
    const search = (url.searchParams.get('search') || '').toLowerCase();
    const department = url.searchParams.get('department') || '';
    const role = url.searchParams.get('role') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('per_page') || '8');

    let filtered = [...mockEmployees];

    if (search) {
      filtered = filtered.filter(e =>
        e.name.toLowerCase().includes(search) ||
        e.email.toLowerCase().includes(search) ||
        e.employeeID.toLowerCase().includes(search)
      );
    }
    if (department) {
      filtered = filtered.filter(e => e.department === department);
    }
    if (role) {
      filtered = filtered.filter(e => e.position === role);
    }

    const total = filtered.length;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const start = (page - 1) * perPage;
    const data = filtered.slice(start, start + perPage);

    return HttpResponse.json({
      data,
      current_page: page,
      last_page: lastPage,
      per_page: perPage,
      total,
    });
  }),

  http.get('/api/employees/:id', ({ params }) => {
    const profile = getEmployeeProfile(params.id);
    if (!profile) {
      return HttpResponse.json({ message: 'Employee not found.' }, { status: 404 });
    }
    return HttpResponse.json(profile);
  }),

  http.post('/api/employees', async ({ request }) => {
    const body = await request.json();
    const newEmployee = {
      id: Date.now(),
      ...body,
      status: 'Active',
    };
    mockEmployees.push(newEmployee);
    return HttpResponse.json(newEmployee, { status: 201 });
  }),

  http.put('/api/employees/:id', async ({ request, params }) => {
    const body = await request.json();
    const idx = mockEmployees.findIndex(e => e.id === parseInt(params.id));
    if (idx === -1) {
      return HttpResponse.json({ message: 'Employee not found.' }, { status: 404 });
    }
    mockEmployees[idx] = { ...mockEmployees[idx], ...body };
    return HttpResponse.json(mockEmployees[idx]);
  }),

  // ── Dashboard ───────────────────────────────────────────────
  http.get('/api/dashboard', () => {
    return HttpResponse.json(mockDashboard);
  }),

  // ── Leave (employee) ───────────────────────────────────────
  http.get('/api/leave', () => {
    return HttpResponse.json(mockLeaveHistory);
  }),

  http.get('/api/leave/balance', () => {
    return HttpResponse.json(mockLeaveBalance);
  }),

  http.post('/api/leave', async ({ request }) => {
    const body = await request.json();
    const newRequest = { id: Date.now(), ...body, status: 'pending', created_at: new Date().toISOString() };
    mockLeaveHistory.push(newRequest);
    return HttpResponse.json(newRequest, { status: 201 });
  }),

  // ── Leave (admin) ──────────────────────────────────────────
  http.get('/api/admin/leave', () => {
    return HttpResponse.json(mockAdminLeaveRequests);
  }),

  http.get('/api/admin/leave/balance/:userId', ({ params }) => {
    return HttpResponse.json({ ...mockAdminBalance, user_id: params.userId });
  }),

  http.put('/api/admin/leave/:id', async ({ request, params }) => {
    const body = await request.json();
    const idx = mockAdminLeaveRequests.findIndex(r => r.id === parseInt(params.id));
    if (idx !== -1) {
      mockAdminLeaveRequests[idx] = { ...mockAdminLeaveRequests[idx], status: body.status, note: body.note };
      return HttpResponse.json(mockAdminLeaveRequests[idx]);
    }
    return HttpResponse.json({ error: 'Request not found' }, { status: 404 });
  }),

  // ── Attendance (employee) ──────────────────────────────────
  http.get('/api/attendance/today', () => {
    return HttpResponse.json(mockTodayAttendance);
  }),

  http.get('/api/attendance/summary', () => {
    return HttpResponse.json(mockAttendanceSummary);
  }),

  http.get('/api/attendance', () => {
    return HttpResponse.json(mockAttendanceHistory);
  }),

  http.post('/api/attendance/clock-in', () => {
    mockTodayAttendance.clock_in = new Date().toISOString();
    mockTodayAttendance.clock_out = null;
    return HttpResponse.json({ message: 'Clocked in successfully.', clock_in: mockTodayAttendance.clock_in, date: mockTodayAttendance.date });
  }),

  http.post('/api/attendance/clock-out', () => {
    mockTodayAttendance.clock_out = new Date().toISOString();
    return HttpResponse.json({ message: 'Clocked out successfully.', clock_out: mockTodayAttendance.clock_out, date: mockTodayAttendance.date });
  }),

  // ── Attendance (admin) ─────────────────────────────────────
  http.get('/api/admin/attendance', () => {
    return HttpResponse.json(mockAdminAttendance);
  }),

  http.get('/api/admin/employees', () => {
    return HttpResponse.json(mockEmployees.map(e => ({ id: e.id, name: e.name })));
  }),

  http.get('/api/admin/attendance/summary', () => {
    return HttpResponse.json(mockAdminAttendanceSummary);
  }),

  http.post('/api/admin/attendance', async ({ request }) => {
    const body = await request.json();
    const newRecord = { id: Date.now(), ...body };
    mockAdminAttendance.push(newRecord);
    return HttpResponse.json(newRecord, { status: 201 });
  }),

  // ── Reports ────────────────────────────────────────────────
  http.get('/api/reports/attendance', () => {
    return HttpResponse.json(mockAttendanceReport);
  }),

  http.get('/api/reports/leave', () => {
    return HttpResponse.json(mockLeaveReport);
  }),

  http.get('/api/reports/headcount', () => {
    return HttpResponse.json(mockHeadcountReport);
  }),

  http.get('/api/reports/monthly-trend', () => {
    return HttpResponse.json(mockMonthlyTrend);
  }),
];