<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| All routes are prefixed with "/api". JWT (auth:api) protects most
| endpoints. "login", "register" and "cookie-test" are public so the
| user can obtain a token first.
*/

// Authentication routes (JWT) - follows the Practical 12 style
Route::group([
    'middleware' => 'api',
    'prefix' => 'auth'
], function ($router) {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::get('/user-profile', [AuthController::class, 'userProfile']);
    Route::get('/cookie-test', [AuthController::class, 'cookieTest']);
});

// Dashboard summary endpoint (JWT protected)
Route::group(['middleware' => 'api'], function ($router) {
    Route::get('/dashboard', [DashboardController::class, 'index']);
});

// Self-service profile endpoints — any logged-in user can update
// their own name, email and password.
Route::group(['middleware' => 'api'], function ($router) {
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/profile/password', [AuthController::class, 'updatePassword']);
});

// Departments list (used by forms in the frontend)
Route::group(['middleware' => 'api'], function ($router) {
    Route::get('/departments', [DepartmentController::class, 'index']);
});

// HR reports (HR + Manager only — RBAC inside controller)
Route::group(['middleware' => 'api'], function ($router) {
    Route::get('/reports/attendance',    [ReportController::class, 'attendance']);
    Route::get('/reports/leave',         [ReportController::class, 'leave']);
    Route::get('/reports/headcount',     [ReportController::class, 'headcount']);
    Route::get('/reports/monthly-trend', [ReportController::class, 'monthlyTrend']);
});

// Employees CRUD routes (JWT protected; RBAC checked inside controller)
Route::group(['middleware' => 'api'], function ($router) {
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::post('/employees', [EmployeeController::class, 'store']);
    Route::get('/employees/{id}', [EmployeeController::class, 'show']);
    Route::put('/employees/{id}', [EmployeeController::class, 'update']);
    Route::delete('/employees/{id}', [EmployeeController::class, 'destroy']);
});

// Leaves CRUD routes (JWT protected; RBAC checked inside controller)
Route::group(['middleware' => 'api'], function ($router) {
    // Leave balance endpoints — must be BEFORE /leaves/{id} so "balance"
    // is not matched as an id.
    Route::get('/leave/balance', [LeaveController::class, 'balance']);
    Route::get('/admin/leave/balance/{id}', [LeaveController::class, 'userBalance']);

    Route::get('/leaves', [LeaveController::class, 'index']);
    Route::post('/leaves', [LeaveController::class, 'store']);
    Route::get('/leaves/{id}', [LeaveController::class, 'show']);
    Route::put('/leaves/{id}', [LeaveController::class, 'update']);     // approve/reject
    Route::delete('/leaves/{id}', [LeaveController::class, 'destroy']);
});

// Attendance routes (kept from teammate's work)
Route::group(['middleware' => 'api'], function ($router) {
    Route::get('/attendance/today', [AttendanceController::class, 'today']);
    Route::get('/attendance/summary', [AttendanceController::class, 'summary']);
    Route::get('/attendance', [AttendanceController::class, 'index']);
    Route::post('/attendance/clock-in', [AttendanceController::class, 'clockIn']);
    Route::post('/attendance/clock-out', [AttendanceController::class, 'clockOut']);

    Route::get('/admin/attendance', [AttendanceController::class, 'adminIndex']);
    Route::get('/admin/employees', [AttendanceController::class, 'adminEmployees']);
    Route::get('/admin/attendance/summary', [AttendanceController::class, 'adminSummary']);
    Route::post('/admin/attendance', [AttendanceController::class, 'adminStore']);
});
