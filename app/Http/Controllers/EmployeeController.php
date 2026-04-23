<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Models\User;
use Validator;

class EmployeeController extends Controller
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
     * Read all employees (with relational query and search filter).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // Only HR and Manager are allowed to view the list
        if (! Gate::allows('view-employees')) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        // Start an Eloquent query with the department relationship
        // eager-loaded (relational query using "with").
        $query = User::with('department');

        // Search filter: filter by department_id if given in URL
        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        // Search filter: search by employee name if given in URL
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Search filter: role (hr/manager/employee)
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        // Paginate so the React frontend can read data.data / data.total / data.last_page.
        $perPage = (int) $request->input('per_page', 20);
        $employees = $query->orderBy('name')->paginate($perPage);

        return response()->json($employees);
    }

    /**
     * Create a new employee.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Only HR can add employees
        if (! Gate::allows('manage-employees')) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        // Validate the incoming fields using Validator facade
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|between:2,100',
            'employeeID' => 'required|string|unique:users',
            'email' => 'required|string|email|max:100|unique:users',
            'password' => 'required|string|min:6',
            'phone_no' => 'nullable|string|max:20',
            'position' => 'nullable|string|max:100',
            'date_of_joining' => 'nullable|date',
            'salary' => 'nullable|numeric|min:0',
            'role' => 'required|in:hr,manager,employee',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Create the employee, hashing the password with bcrypt
        $employee = User::create(array_merge(
            $validator->validated(),
            ['password' => bcrypt($request->password)]
        ));

        return response()->json([
            'message' => 'Employee added successfully',
            'employee' => $employee
        ], 201);
    }

    /**
     * Read one employee by id.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        // Find the employee and eager-load related data
        $employee = User::with('department', 'leaves')->find($id);

        if (! $employee) {
            return response()->json([
                'message' => 'Employee not found'
            ], 404);
        }

        // Authorization: employees can only view their own profile
        if (! Gate::allows('view-employee', $employee)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        return response()->json($employee);
    }

    /**
     * Update an employee.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        if (! Gate::allows('manage-employees')) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $employee = User::find($id);

        if (! $employee) {
            return response()->json([
                'message' => 'Employee not found'
            ], 404);
        }

        // Validate. "unique" rules ignore the current user id.
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|between:2,100',
            'employeeID' => 'sometimes|string|unique:users,employeeID,' . $id,
            'email' => 'sometimes|string|email|max:100|unique:users,email,' . $id,
            'password' => 'sometimes|string|min:6',
            'phone_no' => 'nullable|string|max:20',
            'position' => 'nullable|string|max:100',
            'date_of_joining' => 'nullable|date',
            'salary' => 'nullable|numeric|min:0',
            'role' => 'sometimes|in:hr,manager,employee',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $validator->validated();

        // Hash new password if provided
        if (isset($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        }

        $employee->update($data);

        return response()->json([
            'message' => 'Employee updated successfully',
            'employee' => $employee
        ]);
    }

    /**
     * Delete an employee.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        if (! Gate::allows('manage-employees')) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $employee = User::find($id);

        if (! $employee) {
            return response()->json([
                'message' => 'Employee not found'
            ], 404);
        }

        $employee->delete();

        return response()->json([
            'message' => 'Employee deleted successfully'
        ]);
    }
}
