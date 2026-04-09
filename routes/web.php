<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Auth::routes();

Route::get('/home', [App\Http\Controllers\HomeController::class, 'index'])->name('home');

Route::get('/profile', function () {
    return view('user_profile');
});

Route::get('/leave', function () {
    return view('leave');
});

Route::get('/attendance', function () {
    return view('attendance');
});

Route::get('/reports', function () {
    return view('reports');
});

Route::get('/login-page', function () {
    return view('login');
});

Route::get('/forgot-password', function () {
    return view('forgot_password');
});

Route::get('/dashboard', function () {
    return view('dashboard');
});

Route::get('/employees', function () {
    return view('employee_list');
});

Route::get('/employees/add', function () {
    return view('add_employee');
});

Route::get('/employees/edit/{id}', function () {
    return view('edit_employee');
});

Route::get('/employees/{id}', function () {
    return view('employee_profile_page');
});