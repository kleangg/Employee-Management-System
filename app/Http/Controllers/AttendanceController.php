<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Validator;

class AttendanceController extends Controller
{
    /**
     * Protect every attendance endpoint with JWT.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    /**
     * Return today's attendance record for the logged-in user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function today()
    {
        $userId = auth()->id();
        $today  = Carbon::today()->toDateString();

        $record = Attendance::where('user_id', $userId)
            ->where('date', $today)
            ->first();

        if (!$record) {
            return response()->json([
                'date'      => $today,
                'clock_in'  => null,
                'clock_out' => null,
                'status'    => null,
            ]);
        }

        return response()->json($record);
    }

    /**
     * Return this month's summary counts for the logged-in user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function summary(Request $request)
    {
        $userId = auth()->id();

        // Default to the current month if not specified
        $month = $request->input('month', Carbon::now()->format('Y-m'));

        $records = Attendance::where('user_id', $userId)
            ->where('date', 'like', $month . '%')
            ->get();

        $present = $records->where('status', 'present')->count();
        $late    = $records->where('status', 'late')->count();
        $absent  = $records->where('status', 'absent')->count();

        // Average hours = total hours worked / days with a clock-out
        $totalHours = 0;
        $daysWorked = 0;
        foreach ($records as $r) {
            if ($r->clock_in && $r->clock_out) {
                $totalHours += $r->clock_in->diffInMinutes($r->clock_out) / 60;
                $daysWorked++;
            }
        }
        $avgHours = $daysWorked > 0 ? round($totalHours / $daysWorked, 1) : 0;

        return response()->json([
            'present'   => $present,
            'late'      => $late,
            'absent'    => $absent,
            'avg_hours' => $avgHours,
        ]);
    }

    /**
     * Return this month's attendance history for the logged-in user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $userId = auth()->id();
        $month  = $request->input('month', Carbon::now()->format('Y-m'));

        $records = Attendance::where('user_id', $userId)
            ->where('date', 'like', $month . '%')
            ->orderBy('date', 'desc')
            ->get();

        return response()->json($records);
    }

    /**
     * Clock in for today. Creates a new attendance row.
     * Marks "late" if the current time is past 09:00.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function clockIn()
    {
        $userId = auth()->id();
        $today  = Carbon::today()->toDateString();

        // Already clocked in today?
        $existing = Attendance::where('user_id', $userId)
            ->where('date', $today)
            ->first();

        if ($existing && $existing->clock_in) {
            return response()->json([
                'message' => 'You have already clocked in today.',
            ], 400);
        }

        $now    = Carbon::now();
        $status = $now->hour >= 9 ? 'late' : 'present';

        $record = Attendance::updateOrCreate(
            ['user_id' => $userId, 'date' => $today],
            [
                'clock_in' => $now,
                'status'   => $status,
            ]
        );

        return response()->json([
            'message' => 'Clocked in successfully.',
            'record'  => $record,
        ]);
    }

    /**
     * Clock out for today. Updates today's attendance row.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function clockOut()
    {
        $userId = auth()->id();
        $today  = Carbon::today()->toDateString();

        $record = Attendance::where('user_id', $userId)
            ->where('date', $today)
            ->first();

        if (!$record || !$record->clock_in) {
            return response()->json([
                'message' => 'You have not clocked in today.',
            ], 400);
        }

        if ($record->clock_out) {
            return response()->json([
                'message' => 'You have already clocked out today.',
            ], 400);
        }

        $record->update(['clock_out' => Carbon::now()]);

        return response()->json([
            'message' => 'Clocked out successfully.',
            'record'  => $record,
        ]);
    }

    /**
     * Admin: list every user's attendance for a given month.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function adminIndex(Request $request)
    {
        if (!Gate::allows('view-employees')) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $month = $request->input('month', Carbon::now()->format('Y-m'));

        $records = Attendance::with('user')
            ->where('date', 'like', $month . '%')
            ->orderBy('date', 'desc')
            ->get()
            ->map(function ($r) {
                return [
                    'id'        => $r->id,
                    'user_id'   => $r->user_id,
                    'user_name' => $r->user ? $r->user->name : 'Unknown',
                    'date'      => $r->date->toDateString(),
                    'clock_in'  => $r->clock_in,
                    'clock_out' => $r->clock_out,
                    'status'    => $r->status,
                ];
            });

        return response()->json($records);
    }

    /**
     * Admin: list of employees for the attendance admin dropdown.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function adminEmployees()
    {
        if (!Gate::allows('view-employees')) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $users = User::select('id', 'name')->get();
        return response()->json($users);
    }

    /**
     * Admin: per-user summary for a given month.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function adminSummary(Request $request)
    {
        if (!Gate::allows('view-employees')) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $month = $request->input('month', Carbon::now()->format('Y-m'));
        $users = User::all();
        $result = [];

        foreach ($users as $u) {
            $records = Attendance::where('user_id', $u->id)
                ->where('date', 'like', $month . '%')
                ->get();

            $totalHours = 0;
            foreach ($records as $r) {
                if ($r->clock_in && $r->clock_out) {
                    $totalHours += $r->clock_in->diffInMinutes($r->clock_out) / 60;
                }
            }

            $result[] = [
                'user_id'     => $u->id,
                'name'        => $u->name,
                'present'     => $records->where('status', 'present')->count(),
                'late'        => $records->where('status', 'late')->count(),
                'absent'      => $records->where('status', 'absent')->count(),
                'total_hours' => round($totalHours, 1),
            ];
        }

        return response()->json($result);
    }

    /**
     * Admin: manually add an attendance record for a user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function adminStore(Request $request)
    {
        if (!Gate::allows('manage-employees')) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'user_id'   => 'required|integer|exists:users,id',
            'date'      => 'required|date',
            'clock_in'  => 'required|date',
            'clock_out' => 'required|date|after:clock_in',
            'status'    => 'required|in:present,late,absent',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $record = Attendance::updateOrCreate(
            ['user_id' => $request->user_id, 'date' => $request->date],
            [
                'clock_in'  => $request->clock_in,
                'clock_out' => $request->clock_out,
                'status'    => $request->status,
            ]
        );

        return response()->json([
            'message' => 'Attendance record saved successfully.',
            'record'  => $record,
        ], 201);
    }
}
