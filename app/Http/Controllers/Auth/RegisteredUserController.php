<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Member;
use App\Models\Cycle;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'company_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'logo'=>'nullable|max:2048',
            'system_type'=>'required',
            'country'=>'required'
        ]);

        $logo = null;
        if($request->hasFile('logo') && $request->file('logo')->isValid()){
            $logo = $request->file('logo')->store('companies_logo', 'public');
        }
        $company = Company::create([
            'company_name' => $request->company_name,
            'phone' => $request->phone,
            'address' => $request->address,
            'logo' => $logo,
        ]);
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'company_id' => $company->id,
            'system_type' => $request->system_type,
            'role' => 'superadmin',
            'country'=>$request->country
        ]);
        if($request->system_type==='clubs'){
            $member = Member::create([
            'name'=>$request->name,
            'phone' => $request->phone,
            'role' => 'manager',
            'rating' => 5,
            'user_id' => $user->id,
            'company_id'=>$user->company_id
        ]);

        }
        return redirect()->route('verification.notice');
        event(new Registered($user));

        Auth::login($user);
        $user->sendEmailVerificationNotification();

    }
}
