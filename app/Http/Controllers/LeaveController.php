<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LeaveController extends Controller
{
    public function balance(): JsonResponse
    {
        return response()->json([
            'annual' => 12,
            'medical' => 4,
            'emergency' => 1,
            'unpaid' => 0,
        ]);
    }

    public function index(): JsonResponse
    {
        return response()->json([
            [
                'id' => 1,
                'type' => 'annual',
                'start_date' => '2026-04-10',
                'end_date' => '2026-04-12',
                'days' => 3,
                'reason' => 'Family event',
                'status' => 'approved',
            ],
            [
                'id' => 2,
                'type' => 'medical',
                'start_date' => '2026-04-20',
                'end_date' => '2026-04-21',
                'days' => 2,
                'reason' => 'Doctor appointment',
                'status' => 'pending',
            ],
            [
                'id' => 3,
                'type' => 'emergency',
                'start_date' => '2026-05-02',
                'end_date' => '2026-05-02',
                'days' => 1,
                'reason' => 'Urgent errand',
                'status' => 'rejected',
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string',
        ]);

        return response()->json([
            'message' => 'Leave request submitted successfully.',
            'leave' => [
                'id' => now()->timestamp,
                'type' => $validated['type'],
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'days' => now()->diffInDays(
                    \Carbon\Carbon::parse($validated['start_date']),
                    \Carbon\Carbon::parse($validated['end_date'])
                ) + 1,
                'reason' => $validated['reason'],
                'status' => 'pending',
            ],
        ], 201);
    }

    public function destroy($id): JsonResponse
    {
        return response()->json([
            'message' => 'Leave request cancelled successfully.',
            'id' => (int) $id,
        ]);
    }

    public function adminIndex(): JsonResponse
    {
        return response()->json([
            [
                'id' => 1,
                'user_id' => 1,
                'user_name' => 'John Doe',
                'type' => 'annual',
                'start_date' => '2026-04-10',
                'end_date' => '2026-04-12',
                'days' => 3,
                'reason' => 'Family event',
                'status' => 'approved',
            ],
            [
                'id' => 2,
                'user_id' => 2,
                'user_name' => 'Jane Smith',
                'type' => 'medical',
                'start_date' => '2026-04-20',
                'end_date' => '2026-04-21',
                'days' => 2,
                'reason' => 'Doctor appointment',
                'status' => 'pending',
            ],
            [
                'id' => 3,
                'user_id' => 3,
                'user_name' => 'Bob Johnson',
                'type' => 'emergency',
                'start_date' => '2026-05-02',
                'end_date' => '2026-05-02',
                'days' => 1,
                'reason' => 'Urgent errand',
                'status' => 'rejected',
            ],
        ]);
    }

    public function adminBalance($userId): JsonResponse
    {
        return response()->json([
            'user_id' => (int) $userId,
            'annual' => 12,
            'medical' => 4,
            'emergency' => 1,
            'unpaid' => 0,
        ]);
    }

    public function adminUpdate(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        return response()->json([
            'message' => 'Leave request updated successfully.',
            'id' => (int) $id,
            'status' => $validated['status'],
        ]);
    }
}
