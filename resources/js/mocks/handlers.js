import { http, HttpResponse } from 'msw';

// Mock data
const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'Employee'
};

const mockLeaveHistory = [
  {
    id: 1,
    type: 'annual',
    start_date: '2024-01-15',
    end_date: '2024-01-17',
    reason: 'Family vacation',
    status: 'approved',
    created_at: '2024-01-10T10:00:00Z'
  },
  {
    id: 2,
    type: 'medical',
    start_date: '2024-02-01',
    end_date: '2024-02-01',
    reason: 'Doctor appointment',
    status: 'approved',
    created_at: '2024-01-25T14:30:00Z'
  }
];

const mockLeaveBalance = {
  annual: 2,
  medical: 1,
  emergency: 0
};

const mockAdminLeaveRequests = [
  {
    id: 1,
    user_id: 1,
    user_name: 'John Doe',
    type: 'annual',
    start_date: '2024-03-15',
    end_date: '2024-03-20',
    reason: 'Spring break',
    status: 'pending',
    created_at: '2024-03-01T09:00:00Z'
  },
  {
    id: 2,
    user_id: 2,
    user_name: 'Jane Smith',
    type: 'medical',
    start_date: '2024-03-10',
    end_date: '2024-03-10',
    reason: 'Medical checkup',
    status: 'approved',
    created_at: '2024-03-05T11:15:00Z'
  }
];

const mockAdminBalance = {
  annual: 5,
  medical: 3,
  emergency: 1
};

// Mock attendance data
const mockTodayAttendance = {
  date: new Date().toISOString().split('T')[0],
  clock_in: new Date().toISOString(),
  clock_out: null,
  status: 'present'
};

const mockAttendanceSummary = {
  present: 18,
  late: 2,
  absent: 0,
  avg_hours: 8.2
};

const mockAttendanceHistory = [
  {
    id: 1,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    clock_in: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString(),
    clock_out: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000).toISOString(),
    status: 'present'
  },
  {
    id: 2,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    clock_in: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 9.5 * 60 * 60 * 1000).toISOString(),
    clock_out: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 17.25 * 60 * 60 * 1000).toISOString(),
    status: 'late'
  },
  {
    id: 3,
    date: new Date().toISOString().split('T')[0],
    clock_in: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    clock_out: null,
    status: 'present'
  }
];

const mockAdminAttendance = [
  {
    id: 1,
    user_id: 1,
    user_name: 'John Doe',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    clock_in: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString(),
    clock_out: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000).toISOString(),
    status: 'present'
  },
  {
    id: 2,
    user_id: 2,
    user_name: 'Jane Smith',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    clock_in: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 9.5 * 60 * 60 * 1000).toISOString(),
    clock_out: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 17.25 * 60 * 60 * 1000).toISOString(),
    status: 'late'
  }
];

const mockEmployees = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' },
  { id: 3, name: 'Bob Johnson' }
];

const mockAdminAttendanceSummary = [
  { user_id: 1, name: 'John Doe', present: 18, late: 1, absent: 0, total_hours: 144 },
  { user_id: 2, name: 'Jane Smith', present: 17, late: 2, absent: 1, total_hours: 138 }
];

// Mock report data
const mockAttendanceReport = [
  { user_id: 1, name: 'John Doe', department: 'Engineering', present: 20, late: 1, absent: 0, total_hours: 160, rate: 95 },
  { user_id: 2, name: 'Jane Smith', department: 'HR', present: 18, late: 2, absent: 1, total_hours: 144, rate: 85 },
  { user_id: 3, name: 'Bob Johnson', department: 'Marketing', present: 19, late: 0, absent: 2, total_hours: 152, rate: 90 }
];

const mockLeaveReport = [
  { user_id: 1, name: 'John Doe', department: 'Engineering', approved: 5, pending: 1, rejected: 0, total_days: 5 },
  { user_id: 2, name: 'Jane Smith', department: 'HR', approved: 3, pending: 0, rejected: 1, total_days: 3 },
  { user_id: 3, name: 'Bob Johnson', department: 'Marketing', approved: 4, pending: 2, rejected: 0, total_days: 4 }
];

const mockHeadcountReport = [
  { department: 'Engineering', count: 15, pct: 50 },
  { department: 'HR', count: 5, pct: 17 },
  { department: 'Marketing', count: 8, pct: 27 },
  { department: 'Finance', count: 2, pct: 6 }
];

const mockMonthlyTrend = [
  { month: 'Jan 2024', present: 280, late: 10, absent: 5 },
  { month: 'Feb 2024', present: 275, late: 15, absent: 3 },
  { month: 'Mar 2024', present: 290, late: 8, absent: 2 },
  { month: 'Apr 2024', present: 285, late: 12, absent: 4 },
  { month: 'May 2024', present: 295, late: 5, absent: 1 },
  { month: 'Jun 2024', present: 288, late: 9, absent: 3 }
];

// Handlers
export const handlers = [
  // Employee leave history
  http.get('/api/leave', () => {
    return HttpResponse.json(mockLeaveHistory);
  }),

  // Employee leave balance
  http.get('/api/leave/balance', () => {
    return HttpResponse.json(mockLeaveBalance);
  }),

  // Submit leave request
  http.post('/api/leave', async ({ request }) => {
    const body = await request.json();
    const newRequest = {
      id: Date.now(),
      ...body,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    mockLeaveHistory.push(newRequest);
    return HttpResponse.json(newRequest, { status: 201 });
  }),

  // Admin: list all leave requests
  http.get('/api/admin/leave', () => {
    return HttpResponse.json(mockAdminLeaveRequests);
  }),

  // Admin: get employee balance
  http.get('/api/admin/leave/balance/:userId', ({ params }) => {
    const { userId } = params;
    return HttpResponse.json({ ...mockAdminBalance, user_id: userId });
  }),

  // Admin: approve/reject leave request
  http.put('/api/admin/leave/:id', async ({ request, params }) => {
    const { id } = params;
    const body = await request.json();
    const requestIndex = mockAdminLeaveRequests.findIndex(r => r.id === parseInt(id));
    if (requestIndex !== -1) {
      mockAdminLeaveRequests[requestIndex] = {
        ...mockAdminLeaveRequests[requestIndex],
        status: body.status,
        note: body.note
      };
      return HttpResponse.json(mockAdminLeaveRequests[requestIndex]);
    }
    return HttpResponse.json({ error: 'Request not found' }, { status: 404 });
  }),

  // Attendance: today's record
  http.get('/api/attendance/today', () => {
    return HttpResponse.json(mockTodayAttendance);
  }),

  // Attendance: monthly summary
  http.get('/api/attendance/summary', () => {
    return HttpResponse.json(mockAttendanceSummary);
  }),

  // Attendance: history
  http.get('/api/attendance', () => {
    return HttpResponse.json(mockAttendanceHistory);
  }),

  // Attendance: clock in
  http.post('/api/attendance/clock-in', () => {
    mockTodayAttendance.clock_in = new Date().toISOString();
    mockTodayAttendance.clock_out = null;
    return HttpResponse.json({
      message: 'Clocked in successfully.',
      clock_in: mockTodayAttendance.clock_in,
      date: mockTodayAttendance.date
    });
  }),

  // Attendance: clock out
  http.post('/api/attendance/clock-out', () => {
    mockTodayAttendance.clock_out = new Date().toISOString();
    return HttpResponse.json({
      message: 'Clocked out successfully.',
      clock_out: mockTodayAttendance.clock_out,
      date: mockTodayAttendance.date
    });
  }),

  // Admin: attendance records
  http.get('/api/admin/attendance', () => {
    return HttpResponse.json(mockAdminAttendance);
  }),

  // Admin: employees list
  http.get('/api/admin/employees', () => {
    return HttpResponse.json(mockEmployees);
  }),

  // Admin: attendance summary
  http.get('/api/admin/attendance/summary', () => {
    return HttpResponse.json(mockAdminAttendanceSummary);
  }),

  // Admin: add attendance record
  http.post('/api/admin/attendance', async ({ request }) => {
    const body = await request.json();
    const newRecord = {
      id: Date.now(),
      ...body
    };
    mockAdminAttendance.push(newRecord);
    return HttpResponse.json(newRecord, { status: 201 });
  }),

  // Reports: attendance report
  http.get('/api/reports/attendance', ({ request }) => {
    const url = new URL(request.url);
    const month = url.searchParams.get('month');
    // For simplicity, return the same data regardless of month
    return HttpResponse.json(mockAttendanceReport);
  }),

  // Reports: leave report
  http.get('/api/reports/leave', ({ request }) => {
    const url = new URL(request.url);
    const year = url.searchParams.get('year');
    // For simplicity, return the same data regardless of year
    return HttpResponse.json(mockLeaveReport);
  }),

  // Reports: headcount report
  http.get('/api/reports/headcount', () => {
    return HttpResponse.json(mockHeadcountReport);
  }),

  // Reports: monthly trend
  http.get('/api/reports/monthly-trend', () => {
    return HttpResponse.json(mockMonthlyTrend);
  })
];