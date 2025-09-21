<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated
{
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();
            if ($user->hasVerifiedEmail()) {
                if ($user->system_type === 'clubs') {
                    return redirect('/clubs');
                } else if ($user->system_type === 'manager') {
                    return redirect('/admin');
                } else if ($user->system_type === 'retail' || $user->system_type === 'services' || $user->system_type === 'education' || $user->system_type === 'realEstate' || $user->system_type === 'delivery' || $user->system_type === 'travels' || $user->system_type === 'gym' || $user->system_type === 'hotel') {
                    return redirect('/retailFlow');
                } else {
                    return redirect('/');
                }
            }else{
                return  redirect('/verify-email');
            }
        }

        return $next($request);
    }
}
