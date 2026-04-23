<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Department;
use App\Models\Leave;
use App\Models\User;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Protect the dashboard endpoint with JWT.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    /**
     * Return dashboard summary data using Eloquent queries.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        // Count total employees
        $totalEmployees = User::count();

        // Count pending leaves waiting for approval
        $pendingLeaves = Leave::where('status', 'pending')->count();

        // Headcount per department (relational query)
        $departmentHeadcount = Department::withCount('users')->get()
            ->map(function ($dept) {
                return [
                    'department' => $dept->name,
                    'count'      => $dept->users_count,
                ];
            });

        // 5 most recent pending leaves with their employee name
        $recentLeaves = Leave::with('user')
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($leave) {
                return [
                    'id'         => $leave->id,
                    'user_name'  => $leave->user ? $leave->user->name : 'Unknown',
                    'type'       => $leave->type,
                    'start_date' => $leave->start_date->toDateString(),
                    'end_date'   => $leave->end_date->toDateString(),
                    'reason'     => $leave->reason,
                    'status'     => $leave->status,
                ];
            });

        // ----- Attendance today (real Eloquent queries) -----
        $today = Carbon::today()->toDateString();

        $todayRecords = Attendance::with('user.department')
            ->where('date', $today)
            ->get();

        $present = $todayRecords->where('status', 'present')->count();
        $late    = $todayRecords->where('status', 'late')->count();
        // Absent = every employee minus those who have any attendance row today
        $absent  = max(0, $totalEmployees - $todayRecords->count());

        $attendanceToday = [
            'present' => $present,
            'late'    => $late,
            'absent'  => $absent,
            'total'   => $totalEmployees,
        ];

        // Build today's attendance list (limit to 10 rows)
        $todayAttendanceList = $todayRecords->take(10)->map(function ($r) {
            return [
                'id'         => $r->id,
                'name'       => $r->user ? $r->user->name : 'Unknown',
                'department' => $r->user && $r->user->department ? $r->user->department->name : '—',
                'clock_in'   => $r->clock_in,
                'status'     => $r->status,
            ];
        });

        // Average attendance rate for this month (simple: present+late out of total possible)
        $monthPrefix = Carbon::now()->format('Y-m');
        $monthRecords = Attendance::where('date', 'like', $monthPrefix . '%')->get();
        $workingDaysSoFar = Carbon::now()->day; // simplistic — counts every day in the month
        $expected = max(1, $totalEmployees * $workingDaysSoFar);
        $actual   = $monthRecords->whereIn('status', ['present', 'late'])->count();
        $avgAttendance = (int) round(($actual / $expected) * 100);

        // Return the full dashboard payload
        return response()->json([
            'total_employees'        => $totalEmployees,
            'pending_leaves'         => $pendingLeaves,
            'avg_attendance'         => $avgAttendance,
            'attendance_today'       => $attendanceToday,
            'attendance_trend'       => [],
            'recent_leaves'          => $recentLeaves,
            'department_headcount'   => $departmentHeadcount,
            'today_attendance_list'  => $todayAttendanceList,
        ]);
    }
}
