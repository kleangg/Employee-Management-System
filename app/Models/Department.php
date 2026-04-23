<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    // Fields we are allowed to mass-assign with Department::create([...]).
    protected $fillable = ['name'];

    // Relationship: one department has many users (employees).
    public function users()
    {
        return $this->hasMany(User::class);
    }
}
