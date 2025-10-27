<?php

namespace App\Mail;

use App\Models\Rent;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RentCmmandMail extends Mailable
{
    use Queueable, SerializesModels;

    public $rent;
    public $remainingAmount;
    public $dueDate;

    public function __construct(Rent $rent, $remainingAmount, Carbon $dueDate)
    {
        $this->rent = $rent;
        $this->remainingAmount = $remainingAmount;
        $this->dueDate = $dueDate;
    }

    public function build()
    {
        return $this->subject('تذكير دفع المستحقات - ' . $this->rent->customer->company->name ?? '')
                    ->view('emails.rent-reminder')
                    ->with([
                        'rent' => $this->rent,
                        'remainingAmount' => $this->remainingAmount,
                        'dueDate' => $this->rent->next_rent_date,
                        'customer' => $this->rent->customer
                    ]);
    }
}
