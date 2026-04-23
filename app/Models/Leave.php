<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Leave extends Model
{
    use HasFactory;

    // Fields we allow to be mass-assigned using Leave::create([...]).
    protected $fillable = [
        'user_id',
        'type',
        'start_date',
        'end_date',
        'reason',
        'status',
    ];

    // Cast dates so Carbon can handle them nicely.
    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
    ];

    // Relationship: a leave belongs to the user (employee) who applied.
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
