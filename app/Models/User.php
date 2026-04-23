<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

// We implement JWTSubject so this User model can be used
// by tymon/jwt-auth to generate JSON Web Tokens.
class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    // Columns that can be mass-assigned using User::create([...]).
    protected $fillable = [
        'name',
        'employeeID',
        'email',
        'password',
        'phone_no',
        'position',
        'date_of_joining',
        'salary',
        'role',
        'department_id',
    ];

    // Hide password when the model is converted to JSON.
    protected $hidden = [
        'password',
        'remember_token',
    ];

    // Cast date_of_joining so Laravel treats it as a date.
    protected $casts = [
        'date_of_joining' => 'date',
    ];

    // Relationship: a user belongs to one department.
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    // Relationship: a user (employee) can have many leave records.
    public function leaves()
    {
        return $this->hasMany(Leave::class);
    }

    // ---- Required methods for tymon/jwt-auth ----

    // Return the primary key of the user (used inside the JWT).
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    // Extra claims we want to store in the JWT. We leave it empty here.
    public function getJWTCustomClaims()
    {
        return [];
    }
}
