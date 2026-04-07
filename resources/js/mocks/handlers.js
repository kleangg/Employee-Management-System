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
  })
];