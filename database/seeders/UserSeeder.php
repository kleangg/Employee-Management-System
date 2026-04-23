<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    // Insert one HR, one Manager and one Employee for quick testing.
    public function run()
    {
        // 1) HR user - can manage everything.
        User::create([
            'name'            => 'Alice HR',
            'employeeID'      => 'EMP001',
            'email'           => 'hr@company.com',
            'password'        => Hash::make('password123'),
            'phone_no'        => '0123456789',
            'position'        => 'HR Officer',
            'date_of_joining' => '2022-01-15',
            'salary'          => 5000,
            'role'            => 'hr',
            'department_id'   => 2, // Human Resources
        ]);

        // 2) Manager user - can view employees and approve leaves.
        User::create([
            'name'            => 'Bob Manager',
            'employeeID'      => 'EMP002',
            'email'           => 'manager@company.com',
            'password'        => Hash::make('password123'),
            'phone_no'        => '0123456788',
            'position'        => 'IT Manager',
            'date_of_joining' => '2021-06-01',
            'salary'          => 8000,
            'role'            => 'manager',
            'department_id'   => 1, // IT
        ]);

        // 3) Normal employee - can only manage own profile/leaves.
        User::create([
            'name'            => 'Charlie Employee',
            'employeeID'      => 'EMP003',
            'email'           => 'employee@company.com',
            'password'        => Hash::make('password123'),
            'phone_no'        => '0123456787',
            'position'        => 'Software Developer',
            'date_of_joining' => '2023-03-10',
            'salary'          => 4000,
            'role'            => 'employee',
            'department_id'   => 1, // IT
        ]);
    }
}
