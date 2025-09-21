<?php

namespace App\Http\Controllers\RetailFlow;
    use Illuminate\Support\Facades\Log;
    use App\Http\Controllers\Controller;
    use App\Models\User;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Auth;
    use Illuminate\Support\Facades\Validator;
    use Illuminate\Support\Facades\Hash;
    use Illuminate\Validation\ValidationException;

    class UserManagementController extends Controller
    {
        public function index(){
            $users = User::where('company_id', Auth::user()->company_id)->get();

            return response()->json([
                'status' => 'success',
                'users' => $users
            ], 200);
        }

public function store(Request $request)
{
$validator = Validator::make($request->all(), [
    'name' => 'required|string|max:255',
    'email' => 'required|email|max:255|unique:users,email',
    'password' => 'required|string|min:6|max:255',
], [
    'name.required' => 'حقل الاسم مطلوب',
    'name.string' => 'الاسم يجب أن يكون نصاً',
    'name.max' => 'الاسم يجب ألا يتجاوز 255 حرفاً',
    'email.required' => 'حقل البريد الإلكتروني مطلوب',
    'email.email' => 'صيغة البريد الإلكتروني غير صحيحة',
    'email.max' => 'البريد الإلكتروني يجب ألا يتجاوز 255 حرفاً',
    'email.unique' => 'البريد الإلكتروني مسجل مسبقاً',
    'password.required' => 'حقل كلمة المرور مطلوب',
    'password.string' => 'كلمة المرور يجب أن تكون نصاً',
    'password.min' => 'كلمة المرور يجب أن تتكون من 6 أحرف على الأقل',
    'password.max' => 'كلمة المرور يجب ألا تتجاوز 255 حرفاً',
]);


    if ($validator->fails()) {
        return response()->json([
            'status' => 'error',
            'errors' => $validator->errors()
        ], 422);
    }

    try {
        $user = User::create([
            'company_id' => Auth::user()->company_id,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'subscription' => Auth::user()->subscription,
            'subscription_expires_at' => Auth::user()->subscription_expires_at,
            'trial_used' => Auth::user()->trial_used,
            'role' => 'admin',
            'country'=>Auth::user()->country
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'User created successfully',
            'user' => $user
        ], 201);

    } catch (\Exception $e) {
        Log::error('User creation failed: ' . $e->getMessage(), [
            'trace' => $e->getTraceAsString()
        ]);

        return response()->json([
            'status' => 'error',
            'message' => 'Failed to create user',
            'error' => $e->getMessage()
        ], 500);
    }
}


        public function destroy($id){
            try {
                $user = User::findOrFail($id);

                if ($user->company_id != Auth::user()->company_id) {
                    return response()->json(['error' => 'Unauthorized'], 403);
                }

                if ($user->role == 'superadmin') {
                    return response()->json(['error' => 'Cannot delete superadmin user'], 422);
                }

                if ($user->id == Auth::user()->id) {
                    return response()->json(['error' => 'Cannot delete your own account'], 422);
                }

                $user->delete();

                return response()->json([
                    'status' => 'success',
                    'message' => 'User deleted successfully'
                ], 200);

            } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
                return response()->json(['error' => 'User not found'], 404);
            } catch (\Exception $e) {
                return response()->json([
                    'error' => 'Failed to delete user',
                    'message' => $e->getMessage()
                ], 500);
            }
        }
    }
