<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Validator;

class AuthController extends Controller
{
    /**
     * Create a new AuthController instance.
     * Protect every method using JWT "auth:api" guard except
     * the ones listed in "except".
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth:api', [
            'except' => ['login', 'register', 'cookieTest']
        ]);
    }

    /**
     * Get a JWT token via given credentials (email, password).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        // Validate the incoming request using Validator facade
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        // If validation fails return 422 with error list
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Attempt to log the user in using the "api" guard (JWT)
        if (! $token = auth()->attempt($validator->validated())) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Cookie requirement: store the current login time in a cookie
        // so the assignment rubric for cookies/session is demonstrated.
        $cookie = cookie('last_login_time', now()->toDateTimeString(), 60);

        // Return the token along with the cookie attached
        return $this->createNewToken($token)->withCookie($cookie);
    }

    /**
     * Register a new user (mainly used for testing or HR account setup).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        // Validate all the fields required to create a user
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|between:2,100',
            'employeeID' => 'required|string|unique:users',
            'email' => 'required|string|email|max:100|unique:users',
            'password' => 'required|string|confirmed|min:6',
            'phone_no' => 'nullable|string|max:20',
            'position' => 'nullable|string|max:100',
            'date_of_joining' => 'nullable|date',
            'salary' => 'nullable|numeric|min:0',
            'role' => 'required|in:hr,manager,employee',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors()->toJson(), 400);
        }

        // Create the user. Merge validated data with the hashed password.
        $user = User::create(array_merge(
            $validator->validated(),
            ['password' => bcrypt($request->password)]
        ));

        return response()->json([
            'message' => 'User successfully registered',
            'user' => $user
        ], 201);
    }

    /**
     * Log the user out (invalidate the JWT token).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        auth()->logout();

        // Remove the cookie we set during login
        $forget = cookie()->forget('last_login_time');

        return response()->json([
            'message' => 'User successfully signed out'
        ])->withCookie($forget);
    }

    /**
     * Refresh an expired JWT token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh()
    {
        return $this->createNewToken(auth()->refresh());
    }

    /**
     * Return the authenticated user's profile (with department).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function userProfile()
    {
        // Eager-load the department relationship in one query
        $user = auth()->user()->load('department');
        return response()->json($user);
    }

    /**
     * Demonstrate cookie usage.
     * Reads the "last_login_time" cookie that was set during login.
     * Required by the assignment rubric (Cookies/Session).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function cookieTest(Request $request)
    {
        $lastLogin = $request->cookie('last_login_time');

        return response()->json([
            'message' => 'Cookie demonstration endpoint',
            'last_login_time' => $lastLogin ?? 'No cookie found. Please login first.'
        ]);
    }

    /**
     * Update the logged-in user's own profile (name + email).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateProfile(Request $request)
    {
        $user = auth()->user();

        // Validate. "unique" ignores the current user's own row
        // so the user can keep their existing email.
        $validator = Validator::make($request->all(), [
            'name'  => 'required|string|between:2,100',
            'email' => 'required|string|email|max:100|unique:users,email,' . $user->id,
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Save new values
        $user->update([
            'name'  => $request->name,
            'email' => $request->email,
        ]);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user'    => $user,
        ]);
    }

    /**
     * Update the logged-in user's password.
     * Requires the current password plus a confirmed new one.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatePassword(Request $request)
    {
        $user = auth()->user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password'         => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Check that the old password really matches what's stored
        if (! \Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'current_password' => ['Current password is incorrect.'],
            ], 422);
        }

        $user->update([
            'password' => bcrypt($request->password),
        ]);

        return response()->json([
            'message' => 'Password updated successfully',
        ]);
    }

    /**
     * Get the token structure shared by login and refresh.
     *
     * @param string $token
     * @return \Illuminate\Http\JsonResponse
     */
    protected function createNewToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60,
            'user' => auth()->user()
        ]);
    }
}
