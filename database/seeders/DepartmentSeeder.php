<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    // Insert two sample departments into the database.
    public function run()
    {
        Department::create(['name' => 'Information Technology']);
        Department::create(['name' => 'Human Resources']);
    }
}
