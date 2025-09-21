<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification.
     */
    public function store(Request $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            if(!Auth::user()->subscription){
                return redirect('/allplans');
            }else{
            $user = Auth::user();
            if($user->system_type === 'clubs'){
                return redirect('/clubs');
            } else if($user->system_type === 'manager'){
                return redirect('/admin');
            } else if($user->system_type === 'retail' || $user->system_type === 'services' || $user->system_type === 'education' || $user->system_type === 'realEstate' || $user->system_type === 'delivery' || $user->system_type === 'travels' || $user->system_type === 'gym' || $user->system_type === 'hotel'){
                return redirect('/retailFlow');
            } else {
                return redirect('/');
            }
            }
        }

        $request->user()->sendEmailVerificationNotification();

        return back()->with('status', 'verification-link-sent');
    }
}
