<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('employeeID')->unique();           // e.g. "EMP001"
            $table->string('email')->unique();
            $table->string('password');
            $table->string('phone_no')->nullable();
            $table->string('position')->nullable();           // e.g. "Software Engineer"
            $table->date('date_of_joining')->nullable();
            $table->decimal('salary', 10, 2)->default(0);

            // Role decides what the user is allowed to do (RBAC)
            $table->enum('role', ['hr', 'manager', 'employee'])->default('employee');

            // Foreign key linking user to the departments table
            $table->unsignedBigInteger('department_id')->nullable();

            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
}
