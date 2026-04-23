<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    // Run all seeders. Department must come before User because
    // users rely on department_id as a foreign key.
    public function run()
    {
        $this->call([
            DepartmentSeeder::class,
            UserSeeder::class,
        ]);
    }
}
