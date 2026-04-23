<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddTypeToLeavesTable extends Migration
{
    /**
     * Add a "type" column to store the leave type
     * (e.g. annual, medical, emergency, unpaid).
     *
     * @return void
     */
    public function up()
    {
        Schema::table('leaves', function (Blueprint $table) {
            // Put the column right after "user_id" for readability
            $table->enum('type', ['annual', 'medical', 'emergency', 'unpaid'])
                  ->default('annual')
                  ->after('user_id');
        });
    }

    /**
     * Reverse the migration — drop the type column.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('leaves', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
}
