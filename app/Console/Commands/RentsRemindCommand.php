<?php

namespace App\Console\Commands;

use App\Mail\RentCmmandMail;
use App\Mail\RentEndedMail; // هتضيف هذا الـ Mail الجديد
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use App\Models\Rent;
use Carbon\Carbon;
use App\Services\WhatsAppService;
use App\Models\CompanyWhatsappSetting;
use Illuminate\Support\Facades\Log;

class RentsRemindCommand extends Command
{
    protected $signature = 'rents:remind';
    protected $description = 'Send daily email and WhatsApp reminders for rents 5 days before monthly due date until paid';

    public function handle()
    {
        Log::info('Starting rents reminder command');

        $today = Carbon::today();

        $rents = Rent::with(['customer' => function($query) {
                $query->select('id', 'company_id', 'name', 'phone', 'email');
            }, 'customer.company' => function($query) {
                $query->select('id', 'company_name');
            }])
            ->whereColumn('paid_amount', '<', 'monthly_rent')
            ->get(['id', 'customer_id', 'start_date', 'monthly_rent', 'paid_amount', 'end_date']); // أضيف end_date هنا

        Log::info('Total rents to process: ' . $rents->count());

        $emailCount = 0;
        $whatsappCount = 0;
        $endedEmailCount = 0;
        $endedWhatsappCount = 0;

        foreach ($rents as $rent) {
            if (!$rent->customer) {
                $this->warn("Skipping rent {$rent->id} - no customer");
                Log::warning("Skipping rent {$rent->id} - no customer found");
                continue;
            }

            // التحقق من انتهاء مدة الإيجار
            if ($rent->end_date && Carbon::parse($rent->end_date)->lessThanOrEqualTo($today)) {
                $this->info("🏁 Rent ended: {$rent->id}, end date: {$rent->end_date}");

                // إرسال إيميل انتهاء الإيجار
                if ($rent->customer->email) {
                    try {
                        Mail::to($rent->customer->email)
                            ->send(new RentEndedMail($rent));
                        $endedEmailCount++;
                        $this->info("✓ Sent RENT ENDED email to: {$rent->customer->email}");
                        Log::info("Sent rent ended email to {$rent->customer->email} for rent {$rent->id}");
                    } catch (\Exception $e) {
                        $this->error("✗ Failed to send RENT ENDED email to {$rent->customer->email}: " . $e->getMessage());
                        Log::error("Failed to send rent ended email to {$rent->customer->email}: " . $e->getMessage());
                    }
                }

                // إرسال واتساب انتهاء الإيجار
                if ($rent->customer->phone) {
                    try {
                        $this->sendRentEndedWhatsApp($rent);
                        $endedWhatsappCount++;
                        $this->info("✓ Sent RENT ENDED WhatsApp to: {$rent->customer->phone}");
                        Log::info("Sent rent ended WhatsApp to {$rent->customer->phone} for rent {$rent->id}");
                    } catch (\Exception $e) {
                        $this->error("✗ Failed to send RENT ENDED WhatsApp to {$rent->customer->phone}: " . $e->getMessage());
                        Log::error("Failed to send rent ended WhatsApp to {$rent->customer->phone}: " . $e->getMessage());
                    }
                }

                continue; // تخطي الإيجار المنتهي
            }

            $startDate = Carbon::parse($rent->start_date);
            $currentDueDate = $this->calculateDueDate($startDate, $today);

            $diff = $today->diffInDays($currentDueDate, false);

            if ($diff <= 5 && $diff >= 0) {
                $remainingAmount = $rent->monthly_rent - $rent->paid_amount;

                $this->info("Processing rent {$rent->id}: due {$currentDueDate->format('Y-m-d')}, diff {$diff} days, remaining {$remainingAmount}");

                if ($rent->customer->email) {
                    try {
                        Mail::to($rent->customer->email)
                            ->send(new RentCmmandMail($rent, $remainingAmount, $currentDueDate));
                        $emailCount++;
                        $this->info("✓ Sent email to: {$rent->customer->email}");
                        Log::info("Sent email to {$rent->customer->email} for rent {$rent->id}");
                    } catch (\Exception $e) {
                        $this->error("✗ Failed to send email to {$rent->customer->email}: " . $e->getMessage());
                        Log::error("Failed to send email to {$rent->customer->email}: " . $e->getMessage());
                    }
                } else {
                    $this->warn("No email for customer {$rent->customer->id}");
                    Log::warning("No email address for customer {$rent->customer->id} - rent {$rent->id}");
                }

                if ($rent->customer->phone) {
                    try {
                        $this->sendWhatsAppReminder($rent, $remainingAmount, $currentDueDate);
                        $whatsappCount++;
                        $this->info("✓ Sent WhatsApp to: {$rent->customer->phone}");
                        Log::info("Sent WhatsApp to {$rent->customer->phone} for rent {$rent->id}");
                    } catch (\Exception $e) {
                        $this->error("✗ Failed to send WhatsApp to {$rent->customer->phone}: " . $e->getMessage());
                        Log::error("Failed to send WhatsApp to {$rent->customer->phone}: " . $e->getMessage());
                    }
                } else {
                    $this->warn("No phone for customer {$rent->customer->id}");
                    Log::warning("No phone number for customer {$rent->customer->id} - rent {$rent->id}");
                }
            } else {
                $this->info("Skipping rent {$rent->id}: diff {$diff} days (not in 0-5 range)");
                Log::debug("Skipping rent {$rent->id} - due in {$diff} days (not in reminder range)");
            }
        }

        $this->info("Rents reminders sent - Emails: {$emailCount}, WhatsApp: {$whatsappCount}");
        $this->info("Rent ended notifications - Emails: {$endedEmailCount}, WhatsApp: {$endedWhatsappCount}");
        Log::info("Rents reminders completed - Emails: {$emailCount}, WhatsApp: {$whatsappCount} | Rent ended: {$endedEmailCount} emails, {$endedWhatsappCount} WhatsApp");

        return 0;
    }

    // دالة جديدة لرسائل واتساب انتهاء الإيجار
    protected function sendRentEndedWhatsApp($rent)
    {
        $companyId = $rent->customer->company_id;

        $whatsappSettings = CompanyWhatsappSetting::where('company_id', $companyId)
            ->where('is_connected', true)
            ->first();

        if (!$whatsappSettings) {
            Log::info("No WhatsApp settings for company {$companyId}, skipping rent ended WhatsApp for rent {$rent->id}");
            return;
        }

        $whatsappService = new WhatsAppService($companyId);

        $cleanPhone = $this->cleanPhoneNumber($rent->customer->phone);
        $message = $this->formatRentEndedWhatsAppMessage($rent);

        $whatsappService->sendMessage($cleanPhone, $message);
    }


    protected function formatRentEndedWhatsAppMessage($rent)
    {
        $endDateFormatted = Carbon::parse($rent->end_date)->format('Y-m-d');
        $companyName = $rent->customer->company->company_name ?? 'الشركة';

        return "🏁 انتهاء عقد الإيجار\n\n" .
               "عزيزي/عزيزتي {$rent->customer->name},\n\n" .
               "نود إعلامكم بأن عقد الإيجار الخاص بكم قد انتهى:\n" .
               "📅 تاريخ الانتهاء: {$endDateFormatted}\n" .
               "💰 إجمالي المبلغ المستحق: {$rent->monthly_rent} جنيه\n" .
               "💳 المبلغ المدفوع: {$rent->paid_amount} جنيه\n" .
               "📊 المبلغ المتبقي: " . ($rent->monthly_rent - $rent->paid_amount) . " جنيه\n\n" .
               "شكراً لثقتكم بنا.\n" .
               "{$companyName}";
    }


    protected function calculateDueDate(Carbon $startDate, Carbon $today): Carbon
    {
        $startDay = $startDate->day;

        $daysInMonth = $today->daysInMonth;
        $day = min($startDay, $daysInMonth);

        $currentMonthDueDate = Carbon::create($today->year, $today->month, $day);

        if ($today->greaterThan($currentMonthDueDate)) {
            return $currentMonthDueDate->addMonth();
        }

        return $currentMonthDueDate;
    }

    protected function sendWhatsAppReminder($rent, $remainingAmount, $dueDate)
    {
        $companyId = $rent->customer->company_id;

        $whatsappSettings = CompanyWhatsappSetting::where('company_id', $companyId)
            ->where('is_connected', true)
            ->first();

        if (!$whatsappSettings) {
            Log::info("No WhatsApp settings for company {$companyId}, skipping WhatsApp for rent {$rent->id}");
            return;
        }

        $whatsappService = new WhatsAppService($companyId);

        $cleanPhone = $this->cleanPhoneNumber($rent->customer->phone);
        $message = $this->formatWhatsAppMessage($rent, $remainingAmount, $dueDate);

        $whatsappService->sendMessage($cleanPhone, $message);
    }

    protected function formatWhatsAppMessage($rent, $remainingAmount, $dueDate)
    {
        $dueDateFormatted = $dueDate->format('Y-m-d');
        $companyName = $rent->customer->company->company_name ?? 'الشركة';

        return "⏰ تذكير بدفع مستحقات\n\n" .
               "عزيزي/عزيزتي {$rent->customer->name},\n\n" .
               "هذا تذكير بدفع المستحقات المستحقة:\n" .
               "📅 تاريخ الاستحقاق: {$dueDateFormatted}\n" .
               "💰 المبلغ المستحق: {$rent->monthly_rent} جنيه\n" .
               "💳 المبلغ المدفوع: {$rent->paid_amount} جنيه\n" .
               "📊 المبلغ المتبقي: {$remainingAmount} جنيه\n\n" .
               "يرجى تسديد المبلغ في أقرب وقت ممكن.\n" .
               "شكراً لتعاونكم\n" .
               "{$companyName}";
    }

    protected function cleanPhoneNumber($phone)
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);

        if (empty($phone)) {
            throw new \Exception('رقم الهاتف غير صالح بعد التنظيف');
        }

        if (substr($phone, 0, 1) === '0') {
            $phone = '20' . substr($phone, 1);
        }
        elseif (strlen($phone) === 9 && substr($phone, 0, 1) !== '0') {
            $phone = '20' . $phone;
        }
        elseif (strlen($phone) === 10 && substr($phone, 0, 1) === '1') {
            $phone = '20' . $phone;
        }

        if (strlen($phone) < 10) {
            throw new \Exception('رقم الهاتف قصير جداً: ' . $phone);
        }

        return $phone;
    }
}
