<?php

namespace App\Console\Commands;

use App\Models\Company;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\SubscriptionExpirationAlert;

class ExpireSubscriptions extends Command
{
    protected $signature = 'subscriptions:expire';
    protected $description = 'إلغاء الاشتراكات المنتهية + تنبيه السوبر أدمن لو فاضل 5 أيام';

    public function handle()
    {
        $expiredCompanies = Company::whereNotNull('subscription_expires_at')
            ->where('subscription_expires_at', '<', now())
            ->where('role','!=','manager')
            ->get();

        $expiredCount = 0;
        foreach ($expiredCompanies as $company) {
            try {
                $company->update([
                    'subscription' => null,
                    'subscription_expires_at' => null,
                    'subscription_cancelled_at' => now()
                ]);
                $expiredCount++;
                $this->info("تم إلغاء اشتراك الشركة: {$company->id} - {$company->company_name}");
            } catch (\Exception $e) {
                $this->error("فشل في إلغاء اشتراك الشركة: {$company->id} - {$e->getMessage()}");
                Log::error("فشل إلغاء اشتراك الشركة {$company->id}", ['error' => $e->getMessage()]);
            }
        }

        $companiesExpiringSoon = Company::whereNotNull('subscription_expires_at')
            ->where('subscription_expires_at', '>', now())
            ->where('subscription_expires_at', '<=', now()->addDays(5))
            ->where('role','!=','manager')
            ->get();

        $expiringCount = $companiesExpiringSoon->count();

        if ($expiringCount > 0) {
            try {
                $message = "تنبيه: هناك {$expiringCount} اشتراك سينتهي خلال 5 أيام:\n";
                $notifiedAdmins = 0;

                foreach ($companiesExpiringSoon as $company) {
                    $superAdmin = User::where('company_id', $company->id)
                                      ->where('role', 'superadmin')
                                      ->first();

                    if ($superAdmin) {
                        $expiryDate = $company->subscription_expires_at->format('Y-m-d');
                        $daysLeft = now()->diffInDays($company->subscription_expires_at);

                        Mail::to($superAdmin->email)->send(new SubscriptionExpirationAlert($company, $superAdmin, $daysLeft));

                        $message .= " - {$company->company_name} (السوبر أدمن: {$superAdmin->email}) ينتهي في: {$expiryDate} (متبقي {$daysLeft} أيام)\n";
                        $notifiedAdmins++;
                        $this->info("تم إرسال تنبيه لسوبر أدمن الشركة: {$company->company_name} - {$superAdmin->email}");
                    } else {
                        $message .= " - {$company->company_name} (لم يتم العثور على سوبر أدمن) ينتهي في: {$expiryDate}\n";
                        $this->warning("لم يتم العثور على سوبر أدمن للشركة: {$company->company_name}");
                    }
                }

                Log::info($message);
                $this->info("\n" . $message);
                $this->info("تم إرسال إشعار لـ {$notifiedAdmins} سوبر أدمن بخصوص {$expiringCount} اشتراك سينتهي خلال 5 أيام.");

            } catch (\Exception $e) {
                $this->error("فشل في إرسال الإيميل: {$e->getMessage()}");
                Log::error("فشل إرسال إيميل انتهاء الاشتراكات", ['error' => $e->getMessage()]);
            }
        } else {
            $this->info("لا توجد اشتراكات ستنتهي خلال 5 أيام.");
        }

        $this->info("تم معالجة {$expiredCount} اشتراك منتهي.");
    }
}
