<?php

namespace App\Mail;

use App\Models\Company;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SubscriptionExpirationAlert extends Mailable
{
    use Queueable, SerializesModels;

    public $company;
    public $superAdmin;
    public $daysLeft;

    public function __construct(Company $company, User $superAdmin, $daysLeft)
    {
        $this->company = $company;
        $this->superAdmin = $superAdmin;
        $this->daysLeft = $daysLeft;
    }

    public function build()
    {
        return $this->subject('تنبيه: اشتراك الشركة على وشك الانتهاء - ' . config('app.name'))
                    ->view('emails.subscription_alert')
                    ->with([
                        'companyName' => $this->company->company_name,
                        'adminName' => $this->superAdmin->name,
                        'expiryDate' => $this->company->subscription_expires_at->format('Y-m-d'),
                        'daysLeft' => $this->daysLeft
                    ]);
    }
}
