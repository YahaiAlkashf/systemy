<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        // تأكد من تسجيل دخول المستخدم
        if (!Auth::check()) {
            Auth::login($request->user());
        }

        // تحقق من البريد الإلكتروني أولاً
        if ($request->user()->markEmailAsVerified()) {
            event(new Verified($request->user()));
        }

        // ثم قم بالتوجيه بناءً على نوع المستخدم
        return $this->redirectUser();
    }

    /**
     * توجيه المستخدم بناءً على نوعه
     */
    private function redirectUser(): RedirectResponse
    {
        $user = Auth::user();

        if (!$user->company->subscription) {
            return redirect('/allplans');
        }

        switch ($user->system_type) {
            case 'clubs':
                return redirect('/clubs');
            case 'manager':
                return redirect('/admin');
            case 'retail':
            case 'services':
            case 'education':
            case 'realEstate':
            case 'delivery':
            case 'travels':
            case 'gym':
            case 'hotel':
                return redirect('/retailFlow');
            default:
                return redirect('/');
        }
    }
}
