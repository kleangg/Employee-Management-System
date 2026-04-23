<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    // Columns we allow mass-assignment on.
    protected $fillable = [
        'user_id',
        'date',
        'clock_in',
        'clock_out',
        'status',
    ];

    // Cast date/datetime fields so Carbon handles them automatically.
    protected $casts = [
        'date'      => 'date',
        'clock_in'  => 'datetime',
        'clock_out' => 'datetime',
    ];

    // Relationship: an attendance record belongs to one user.
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
