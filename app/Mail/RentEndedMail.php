<?php

namespace App\Mail;

use App\Models\Rent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Carbon\Carbon;

class RentEndedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $rent;

    public function __construct(Rent $rent)
    {
        $this->rent = $rent;
    }

    public function build()
    {
        return $this->subject('انتهاء عقد الإيجار')
                    ->view('emails.rent_ended')
                    ->with([
                        'customerName' => $this->rent->customer->name,
                        'endDate' => Carbon::parse($this->rent->end_date)->format('Y-m-d'),
                        'totalAmount' => $this->rent->monthly_rent,
                        'paidAmount' => $this->rent->paid_amount,
                        'remainingAmount' => $this->rent->monthly_rent - $this->rent->paid_amount,
                        'companyName' => $this->rent->customer->company->company_name ?? 'الشركة',
                    ]);
    }
}
