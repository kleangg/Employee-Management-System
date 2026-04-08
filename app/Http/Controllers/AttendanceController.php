<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AttendanceController extends Controller
{
    public function today(): JsonResponse
    {
        return response()->json([
            'date' => Carbon::now()->toDateString(),
            'clock_in' => Carbon::now()->subHours(2)->toISOString(),
            'clock_out' => null,
            'status' => 'present',
        ]);
    }

    public function summary(Request $request): JsonResponse
    {
        return response()->json([
            'present' => 18,
            'late' => 2,
            'absent' => 0,
            'avg_hours' => 8.2,
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        return response()->json([
            [
                'id' => 1,
                'date' => Carbon::now()->subDays(2)->toDateString(),
                'clock_in' => Carbon::now()->subDays(2)->setTime(9, 5)->toISOString(),
                'clock_out' => Carbon::now()->subDays(2)->setTime(17, 15)->toISOString(),
                'status' => 'present',
            ],
            [
                'id' => 2,
                'date' => Carbon::now()->subDays(1)->toDateString(),
                'clock_in' => Carbon::now()->subDays(1)->setTime(9, 22)->toISOString(),
                'clock_out' => Carbon::now()->subDays(1)->setTime(17, 10)->toISOString(),
                'status' => 'late',
            ],
            [
                'id' => 3,
                'date' => Carbon::now()->toDateString(),
                'clock_in' => Carbon::now()->setTime(9, 0)->toISOString(),
                'clock_out' => null,
                'status' => 'present',
            ],
        ]);
    }

    public function clockIn(): JsonResponse
    {
        return response()->json([
            'message' => 'Clocked in successfully.',
            'clock_in' => Carbon::now()->toISOString(),
            'date' => Carbon::now()->toDateString(),
        ]);
    }

    public function clockOut(): JsonResponse
    {
        return response()->json([
            'message' => 'Clocked out successfully.',
            'clock_out' => Carbon::now()->toISOString(),
            'date' => Carbon::now()->toDateString(),
        ]);
    }

    public function adminIndex(Request $request): JsonResponse
    {
        return response()->json([
            [
                'id' => 1,
                'user_id' => 1,
                'user_name' => 'John Doe',
                'date' => Carbon::now()->subDays(1)->toDateString(),
                'clock_in' => Carbon::now()->subDays(1)->setTime(9, 0)->toISOString(),
                'clock_out' => Carbon::now()->subDays(1)->setTime(17, 0)->toISOString(),
                'status' => 'present',
            ],
            [
                'id' => 2,
                'user_id' => 2,
                'user_name' => 'Jane Smith',
                'date' => Carbon::now()->subDays(1)->toDateString(),
                'clock_in' => Carbon::now()->subDays(1)->setTime(9, 30)->toISOString(),
                'clock_out' => Carbon::now()->subDays(1)->setTime(17, 15)->toISOString(),
                'status' => 'late',
            ],
        ]);
    }

    public function adminEmployees(): JsonResponse
    {
        return response()->json([
            ['id' => 1, 'name' => 'John Doe'],
            ['id' => 2, 'name' => 'Jane Smith'],
            ['id' => 3, 'name' => 'Bob Johnson'],
        ]);
    }

    public function adminSummary(Request $request): JsonResponse
    {
        return response()->json([
            ['user_id' => 1, 'name' => 'John Doe', 'present' => 18, 'late' => 1, 'absent' => 0, 'total_hours' => 144],
            ['user_id' => 2, 'name' => 'Jane Smith', 'present' => 17, 'late' => 2, 'absent' => 1, 'total_hours' => 138],
        ]);
    }

    public function adminStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|integer',
            'date' => 'required|date',
            'clock_in' => 'required|date_format:Y-m-d H:i:s',
            'clock_out' => 'required|date_format:Y-m-d H:i:s',
            'status' => 'required|in:present,late,absent',
        ]);

        return response()->json([
            'message' => 'Attendance record added successfully.',
            'record' => $validated,
        ], 201);
    }
}
