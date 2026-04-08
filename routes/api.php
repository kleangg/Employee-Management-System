<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\LeaveController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/leave/balance', [LeaveController::class, 'balance']);
    Route::get('/leave', [LeaveController::class, 'index']);
    Route::post('/leave', [LeaveController::class, 'store']);
    Route::delete('/leave/{id}', [LeaveController::class, 'destroy']);

    // Leave admin routes
    Route::get('/admin/leave', [LeaveController::class, 'adminIndex']);
    Route::get('/admin/leave/balance/{userId}', [LeaveController::class, 'adminBalance']);
    Route::put('/admin/leave/{id}', [LeaveController::class, 'adminUpdate']);
});

// Attendance routes (public for testing)
Route::get('/attendance/today', [AttendanceController::class, 'today']);
Route::get('/attendance/summary', [AttendanceController::class, 'summary']);
Route::get('/attendance', [AttendanceController::class, 'index']);
Route::post('/attendance/clock-in', [AttendanceController::class, 'clockIn']);
Route::post('/attendance/clock-out', [AttendanceController::class, 'clockOut']);

// Attendance admin routes (public for testing)
Route::get('/admin/attendance', [AttendanceController::class, 'adminIndex']);
Route::get('/admin/employees', [AttendanceController::class, 'adminEmployees']);
Route::get('/admin/attendance/summary', [AttendanceController::class, 'adminSummary']);
Route::post('/admin/attendance', [AttendanceController::class, 'adminStore']);