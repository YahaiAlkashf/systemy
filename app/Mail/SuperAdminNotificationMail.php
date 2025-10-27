<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Rent;

class SuperAdminNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $rent;
    public $notificationType;
    public $daysLeft;
    public $customer;

    public function __construct(Rent $rent, $customer, $notificationType, $daysLeft = null)
    {
        $this->rent = $rent;
        $this->customer = $customer;
        $this->notificationType = $notificationType;
        $this->daysLeft = $daysLeft;
    }

    public function build()
    {
        $subject = $this->getSubject();

        return $this->subject($subject)
                    ->view('emails.super_admin_notification')
                    ->with([
                        'rent' => $this->rent,
                        'notificationType' => $this->notificationType,
                        'daysLeft' => $this->daysLeft,
                    ]);
    }

    protected function getSubject()
    {
        switch ($this->notificationType) {
            case 'rent_ended':
                return "إشعار - انتهاء عقد إيجار للعميل {$this->rent->customer->name}";
            case 'rent_due':
                return "تنبيه - تأخر في دفع الإيجار للعميل {$this->rent->customer->name}";
            default:
                return "إشعار نظام الإيجارات";
        }
    }
}
