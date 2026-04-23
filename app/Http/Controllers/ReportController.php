<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Department;
use App\Models\Leave;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ReportController extends Controller
{
    /**
     * Protect all report endpoints with JWT + RBAC.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    /**
     * Attendance report for a given month.
     * Returns a per-employee breakdown: present / late / absent / total hours / rate.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function attendance(Request $request)
    {
        if (! Gate::allows('view-employees')) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        // Example: ?month=2026-04 (default = current month)
        $month = $request->input('month', Carbon::now()->format('Y-m'));
        $users = User::with('department')->get();
        $report = [];

        // Number of "expected" working days so far in that month
        $monthStart = Carbon::parse($month . '-01');
        $daysSoFar = $monthStart->isSameMonth(Carbon::now())
            ? Carbon::now()->day
            : $monthStart->daysInMonth;

        foreach ($users as $u) {
            $records = Attendance::where('user_id', $u->id)
                ->where('date', 'like', $month . '%')
                ->get();

            $present = $records->where('status', 'present')->count();
            $late    = $records->where('status', 'late')->count();
            $absent  = max(0, $daysSoFar - ($present + $late));

            // Total hours worked in the month
            $hours = 0;
            foreach ($records as $r) {
                if ($r->clock_in && $r->clock_out) {
                    $hours += $r->clock_in->diffInMinutes($r->clock_out) / 60;
                }
            }

            $attendedDays = $present + $late;
            $rate = $daysSoFar > 0 ? round(($attendedDays / $daysSoFar) * 100) : 0;

            $report[] = [
                'user_id'     => $u->id,
                'name'        => $u->name,
                'department'  => $u->department ? $u->department->name : '—',
                'present'     => $present,
                'late'        => $late,
                'absent'      => $absent,
                'total_hours' => round($hours, 1),
                'rate'        => $rate,
            ];
        }

        return response()->json($report);
    }

    /**
     * Leave report for a given year.
     * Per employee: approved / pending / rejected / total days used.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function leave(Request $request)
    {
        if (! Gate::allows('view-employees')) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $year = $request->input('year', Carbon::now()->format('Y'));
        $users = User::with('department')->get();
        $report = [];

        foreach ($users as $u) {
            $leaves = Leave::where('user_id', $u->id)
                ->whereYear('start_date', $year)
                ->get();

            // Count days used for approved leaves only
            $totalDays = 0;
            foreach ($leaves->where('status', 'approved') as $l) {
                $totalDays += $l->start_date->diffInDays($l->end_date) + 1;
            }

            $report[] = [
                'user_id'         => $u->id,
                'name'            => $u->name,
                'department'      => $u->department ? $u->department->name : '—',
                'approved'        => $leaves->where('status', 'approved')->count(),
                'pending'         => $leaves->where('status', 'pending')->count(),
                'rejected'        => $leaves->where('status', 'rejected')->count(),
                'total_days_used' => $totalDays,
            ];
        }

        return response()->json($report);
    }

    /**
     * Headcount report — number of employees per department.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function headcount()
    {
        if (! Gate::allows('view-employees')) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $departments = Department::withCount('users')->get()->map(function ($d) {
            return [
                'department' => $d->name,
                'count'      => $d->users_count,
            ];
        });

        return response()->json($departments);
    }

    /**
     * Monthly attendance trend — simple placeholder returning zero-rate
     * rows for the last 6 months. Kept intentionally minimal since we
     * only have a few days of real data.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function monthlyTrend()
    {
        if (! Gate::allows('view-employees')) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $trend = [];
        for ($i = 5; $i >= 0; $i--) {
            $m = Carbon::now()->subMonths($i);
            $trend[] = [
                'month' => $m->format('M Y'),
                'rate'  => 0,
            ];
        }

        return response()->json($trend);
    }
}
