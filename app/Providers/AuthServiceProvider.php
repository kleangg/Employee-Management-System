<?php

namespace App\Providers;

use App\Models\Leave;
use App\Models\User;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        //
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        /* define HR role - HR can create, update, delete any employee */
        Gate::define('manage-employees', function (User $user) {
            return $user->role == 'hr';
        });

        /* define view-employees - HR and Manager can view employee list */
        Gate::define('view-employees', function (User $user) {
            return $user->role == 'hr' || $user->role == 'manager';
        });

        /* define view-employee - HR/Manager can view anyone, employee only self */
        Gate::define('view-employee', function (User $user, User $target) {
            if ($user->role == 'hr' || $user->role == 'manager') {
                return true;
            }
            return $user->id == $target->id;
        });

        /* define view-all-leaves - HR and Manager can view every leave */
        Gate::define('view-all-leaves', function (User $user) {
            return $user->role == 'hr' || $user->role == 'manager';
        });

        /* define decide-leave - only HR and Manager can approve/reject */
        Gate::define('decide-leave', function (User $user) {
            return $user->role == 'hr' || $user->role == 'manager';
        });

        /* define manage-leave - HR/Manager manage any, employee own only */
        Gate::define('manage-leave', function (User $user, Leave $leave) {
            if ($user->role == 'hr' || $user->role == 'manager') {
                return true;
            }
            return $user->id == $leave->user_id;
        });
    }
}
