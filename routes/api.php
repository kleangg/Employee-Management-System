<?php

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

Route::get('/leave/balance', [LeaveController::class, 'balance']);
Route::get('/leave', [LeaveController::class, 'index']);
Route::post('/leave', [LeaveController::class, 'store']);
Route::delete('/leave/{id}', [LeaveController::class, 'destroy']);
