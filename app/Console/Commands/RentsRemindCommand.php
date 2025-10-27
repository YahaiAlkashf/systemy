<?php

namespace App\Console\Commands;

use App\Mail\RentCmmandMail;
use App\Mail\RentEndedMail;
use App\Mail\SuperAdminNotificationMail;
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
    protected $description = 'Send daily email and WhatsApp reminders for rents 5 days before the next due date and notify on rent end date.';

    public function handle()
    {
        Log::info('Rents Reminder Command: Starting execution.');
        $today = Carbon::today();

        // أولاً: معالجة العقود التي انتهت اليوم
        $this->processEndedRents($today);

        // ثانياً: معالجة التذكيرات للعقود المستحقة قريباً
        $this->processDueRents($today);

        Log::info('Rents Reminder Command: Execution finished.');
        return 0;
    }

    /**
     * جلب العقود التي انتهت اليوم، إرسال إشعارات، وتعطيلها
     */
    private function processEndedRents(Carbon $today)
    {
        $endedRents = Rent::with('customer.company.users')
            ->where('flag', 1)
            ->whereDate('end_date', $today)
            ->get();

        if ($endedRents->isEmpty()) {
            Log::info('No rents ended today.');
            return;
        }

        $this->info("Found " . $endedRents->count() . " rents that ended today.");

        foreach ($endedRents as $rent) {
            $customer = $rent->customer;
            if (!$customer) {
                Log::warning("Skipping ended rent {$rent->id}: Customer not found.");
                continue;
            }

            $this->info("Processing ended rent #{$rent->id} for customer: {$customer->name}");

            // إرسال إشعارات الانتهاء للعميل والمدير
            $this->sendRentEndedNotifications($rent, $customer);

            // تعطيل العقد لمنع إرسال تذكيرات مستقبلية
            $rent->update(['flag' => 0]);
            Log::info("Deactivated rent #{$rent->id} as its end date has been reached.");
        }
    }

    /**
     * جلب العقود المستحقة خلال 5 أيام، وإرسال تذكيرات
     */
    private function processDueRents(Carbon $today)
    {
        $reminderLimitDate = $today->copy()->addDays(5);

        $dueRents = Rent::with('customer.company.users')
            ->where('flag', 1)
            ->whereColumn('paid_amount', '<', 'monthly_rent')
            ->whereNotNull('next_rent_date')
            ->whereBetween('next_rent_date', [$today, $reminderLimitDate])
            ->get();

        if ($dueRents->isEmpty()) {
            Log::info("No rents due for reminders in the next 5 days.");
            return;
        }

        $this->info("Found " . $dueRents->count() . " rents due for reminders.");

        foreach ($dueRents as $rent) {
            $customer = $rent->customer;
            if (!$customer) {
                Log::warning("Skipping due rent {$rent->id}: Customer not found.");
                continue;
            }

            $dueDate = Carbon::parse($rent->next_rent_date);
            $daysLeft = $today->diffInDays($dueDate, false);
            $remainingAmount = $rent->monthly_rent - $rent->paid_amount;

            $this->info("Processing due rent #{$rent->id} for customer: {$customer->name}. Due in {$daysLeft} days.");

            // إرسال تذكيرات الدفع للعميل والمدير
            $this->sendRentDueNotifications($rent, $customer, $remainingAmount, $dueDate, $daysLeft);
        }
    }

    /**
     * إرسال إشعارات انتهاء العقد
     */
    private function sendRentEndedNotifications(Rent $rent, $customer)
    {
        // إرسال إيميل للعميل
        if ($customer->email) {
            try {
                Mail::to($customer->email)->send(new RentEndedMail($rent));
                $this->info("✓ Sent RENT ENDED email to CUSTOMER: {$customer->email}");
                Log::info("Sent rent ended email to customer {$customer->email} for rent {$rent->id}");
            } catch (\Exception $e) {
                $this->error("✗ Failed to send RENT ENDED email to customer {$customer->email}: " . $e->getMessage());
                Log::error("Failed to send rent ended email to customer {$customer->email}: " . $e->getMessage());
            }
        }

        // إرسال واتساب للعميل
        if ($customer->phone) {
            $this->sendWhatsAppMessage($customer, 'rent_ended', ['rent' => $rent]);
        }

        // إرسال إشعارات للمدراء
        $this->notifySuperAdmins($rent, $customer, 'rent_ended');
    }

    /**
     * إرسال تذكيرات الدفع
     */
    private function sendRentDueNotifications(Rent $rent, $customer, $remainingAmount, Carbon $dueDate, int $daysLeft)
    {
        // إرسال إيميل للعميل
        if ($customer->email) {
            try {
                Mail::to($customer->email)->send(new RentCmmandMail($rent, $remainingAmount, $dueDate));
                $this->info("✓ Sent RENT DUE email to CUSTOMER: {$customer->email}");
                Log::info("Sent rent due email to customer {$customer->email} for rent {$rent->id}");
            } catch (\Exception $e) {
                $this->error("✗ Failed to send RENT DUE email to customer {$customer->email}: " . $e->getMessage());
                Log::error("Failed to send rent due email to customer {$customer->email}: " . $e->getMessage());
            }
        }

        // إرسال واتساب للعميل
        if ($customer->phone) {
            $this->sendWhatsAppMessage($customer, 'rent_due', [
                'rent' => $rent,
                'remainingAmount' => $remainingAmount,
                'dueDate' => $dueDate
            ]);
        }

        // إرسال إشعارات للمدراء
        $this->notifySuperAdmins($rent, $customer, 'rent_due', $daysLeft);
    }

    /**
     * إرسال إشعارات لمدراء الشركة
     */
    protected function notifySuperAdmins(Rent $rent, $customer, string $notificationType, int $daysLeft = null)
    {
        $company = $customer->company;
        if (!$company) {
            Log::warning("No company found for rent {$rent->id} to notify superadmins.");
            return;
        }

        $superAdmins = $company->users()->where('role', 'superadmin')->get();
        if ($superAdmins->isEmpty()) {
            Log::warning("No superadmins found for company {$company->id}.");
            return;
        }

        foreach ($superAdmins as $superAdmin) {
            // إرسال إيميل للمدير
            if ($superAdmin->email) {
                try {
                    Mail::to($superAdmin->email)->send(new SuperAdminNotificationMail($rent, $customer, $notificationType, $daysLeft));
                    $this->info("✓ Sent super admin email to: {$superAdmin->email}");
                    Log::info("Sent super admin notification email to {$superAdmin->email} for rent {$rent->id}");
                } catch (\Exception $e) {
                    $this->error("✗ Failed to send super admin email to {$superAdmin->email}: " . $e->getMessage());
                    Log::error("Failed to send super admin email to {$superAdmin->email}: " . $e->getMessage());
                }
            }
        }

        // إرسال واتساب لرقم الشركة
        if ($company->phone) {
            $this->sendWhatsAppMessage($company, "superadmin_{$notificationType}", [
                'rent' => $rent,
                'customer' => $customer,
                'daysLeft' => $daysLeft
            ], true);
        }
    }

    /**
     * إرسال رسائل واتساب
     */
    private function sendWhatsAppMessage($recipient, string $type, array $data, bool $isCompany = false)
    {
        $companyId = $isCompany ? $recipient->id : $recipient->company_id;
        $phone = $recipient->phone;

        $whatsappSettings = CompanyWhatsappSetting::where('company_id', $companyId)->where('is_connected', true)->first();
        if (!$whatsappSettings) {
            Log::warning("WhatsApp is not connected for company #{$companyId}. Skipping message.");
            return;
        }

        try {
            $whatsappService = new WhatsAppService($companyId);
            $cleanPhone = $this->cleanPhoneNumber($phone);
            $message = $this->formatWhatsAppMessage($type, $data);
            $whatsappService->sendMessage($cleanPhone, $message);
            $this->info("✓ Sent WhatsApp '{$type}' to: {$cleanPhone}");
            Log::info("Sent WhatsApp '{$type}' to {$cleanPhone} for company #{$companyId}");
        } catch (\Exception $e) {
            $this->error("✗ Failed to send WhatsApp to {$phone}: " . $e->getMessage());
            Log::error("Failed to send WhatsApp to {$phone} for company #{$companyId}: " . $e->getMessage());
        }
    }

    /**
     * تنسيق رسائل الواتساب
     */
    private function formatWhatsAppMessage(string $type, array $data): string
    {
        $rent = $data['rent'];
        $customer = $data['customer'] ?? $rent->customer;
        $companyName = $customer->company->company_name ?? 'شركتك';

        switch ($type) {
            case 'rent_due':
                $dueDateFormatted = $data['dueDate']->format('Y-m-d');
                return "⏰ تذكير بدفع الإيجار

" .
                       "عزيزي/عزيزتي {$customer->name},

" .
                       "نود تذكيركم بأن الإيجار مستحق للدفع.
" .
                       "📅 تاريخ الاستحقاق: {$dueDateFormatted}
" .
                       "💰 المبلغ المتبقي: {$data['remainingAmount']} جنيه

" .
                       "يرجى تسديد المبلغ في أقرب وقت ممكن.
" .
                       "{$companyName}";

            case 'rent_ended':
                return "🏁 انتهاء عقد الإيجار

" .
                       "عزيزي/عزيزتي {$customer->name},

" .
                       "نود إعلامكم بأن عقد الإيجار الخاص بكم قد انتهى اليوم.
" .
                       "💰 المبلغ المتبقي إن وجد: " . ($rent->monthly_rent - $rent->paid_amount) . " جنيه

" .
                       "شكراً لثقتكم بنا.
" .
                       "{$companyName}";

            case 'superadmin_rent_due':
                return "🔔 تنبيه للمدير - إيجار مستحق

" .
                       "العميل: {$customer->name}
" .
                       "متبقي للاستحقاق: {$data['daysLeft']} يوم/أيام
" .
                       "المبلغ المتبقي: " . ($rent->monthly_rent - $rent->paid_amount) . " جنيه

" .
                       "يرجى المتابعة.";

            case 'superadmin_rent_ended':
                return "🔔 إشعار للمدير - انتهاء عقد

" .
                       "انتهى عقد الإيجار اليوم للعميل:
" .
                       "العميل: {$customer->name}
" .
                       "المبلغ المتبقي إن وجد: " . ($rent->monthly_rent - $rent->paid_amount) . " جنيه";

            default:
                return '';
        }
    }

    /**
     * تنظيف رقم الهاتف وإضافة كود الدولة
     */
    protected function cleanPhoneNumber($phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);
        if (empty($phone)) {
            throw new \Exception('رقم الهاتف فارغ أو غير صالح.');
        }
        if (substr($phone, 0, 2) === '20') {
            return $phone;
        }
        if (substr($phone, 0, 1) === '0') {
            return '20' . substr($phone, 1);
        }
        return '20' . $phone;
    }
}
