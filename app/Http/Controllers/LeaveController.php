<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Models\Leave;
use Validator;

class LeaveController extends Controller
{
    /**
     * Protect every method by JWT guard.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    /**
     * Read leaves. HR/Manager see all leaves, employees see only their own.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        // Eager-load user (relational query) so we can show employee name
        $query = Leave::with('user');

        // Authorization: employees can only see their own leaves
        if (! Gate::allows('view-all-leaves')) {
            $query->where('user_id', $user->id);
        }

        // Optional filter by leave status (pending, approved, rejected)
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $leaves = $query->orderBy('created_at', 'desc')->get();

        return response()->json($leaves);
    }

    /**
     * Create a new leave application.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Validate input
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:annual,medical,emergency,unpaid',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Force the user_id to be the current logged in user
        $leave = Leave::create([
            'user_id' => auth()->id(),
            'type' => $request->type,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Leave applied successfully',
            'leave' => $leave
        ], 201);
    }

    /**
     * Read one leave.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $leave = Leave::with('user')->find($id);

        if (! $leave) {
            return response()->json([
                'message' => 'Leave not found'
            ], 404);
        }

        // HR/Manager can see any, employee only their own
        if (! Gate::allows('manage-leave', $leave)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        return response()->json($leave);
    }

    /**
     * Approve or reject a leave. Only HR and Manager can do this.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        if (! Gate::allows('decide-leave')) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $leave = Leave::find($id);

        if (! $leave) {
            return response()->json([
                'message' => 'Leave not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,approved,rejected',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $leave->update([
            'status' => $request->status,
        ]);

        return response()->json([
            'message' => 'Leave status updated successfully',
            'leave' => $leave
        ]);
    }

    /**
     * Return how many leave days the logged-in user has used so far,
     * grouped by leave type. Only APPROVED leaves are counted.
     *
     * Example response:
     *   { "annual": 6, "medical": 0, "emergency": 0, "unpaid": 0 }
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function balance()
    {
        return response()->json($this->calculateBalance(auth()->id()));
    }

    /**
     * Admin version of balance() — returns the same breakdown for any user.
     * Only HR and Manager can use this.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function userBalance($id)
    {
        if (! Gate::allows('view-all-leaves')) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        return response()->json($this->calculateBalance($id));
    }

    /**
     * Helper: count approved leave days per type for one user.
     *
     * @return array
     */
    private function calculateBalance($userId)
    {
        // Default all leave types to 0 so the frontend always sees every key
        $used = ['annual' => 0, 'medical' => 0, 'emergency' => 0, 'unpaid' => 0];

        // Only approved leaves count towards used days
        $approved = Leave::where('user_id', $userId)
            ->where('status', 'approved')
            ->get();

        foreach ($approved as $leave) {
            // Days = end_date - start_date + 1 (inclusive)
            $days = $leave->start_date->diffInDays($leave->end_date) + 1;
            $type = $leave->type ?: 'annual';
            if (isset($used[$type])) {
                $used[$type] += $days;
            }
        }

        return $used;
    }

    /**
     * Delete / cancel a leave.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $leave = Leave::find($id);

        if (! $leave) {
            return response()->json([
                'message' => 'Leave not found'
            ], 404);
        }

        // Employees can delete their own leaves, HR/Manager can delete any
        if (! Gate::allows('manage-leave', $leave)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $leave->delete();

        return response()->json([
            'message' => 'Leave deleted successfully'
        ]);
    }
}
