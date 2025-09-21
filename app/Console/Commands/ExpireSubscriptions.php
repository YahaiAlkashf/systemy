<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ExpireSubscriptions extends Command
{
    protected $signature = 'subscriptions:expire';
    protected $description = 'إلغاء الاشتراكات المنتهية + تنبيه المدير لو فاضل 5 أيام';

    public function handle()
    {
        $expiredUsers = User::whereNotNull('subscription_expires_at')
            ->where('subscription_expires_at', '<', now())
            ->get();

        $expiredCount = 0;
        foreach ($expiredUsers as $user) {
            try {
                $user->update([
                    'subscription' => null,
                    'subscription_expires_at' => null,
                    'subscription_cancelled_at' => now()
                ]);
                $expiredCount++;
                $this->info("تم إلغاء اشتراك المستخدم: {$user->id} - {$user->email}");
            } catch (\Exception $e) {
                $this->error("فشل في إلغاء اشتراك المستخدم: {$user->id} - {$e->getMessage()}");
                Log::error("فشل إلغاء اشتراك المستخدم {$user->id}", ['error' => $e->getMessage()]);
            }
        }

        $usersExpiringSoon = User::whereNotNull('subscription_expires_at')
            ->where('subscription_expires_at', '>', now())
            ->where('subscription_expires_at', '<=', now()->addDays(5))
            ->get();

        $expiringCount = $usersExpiringSoon->count();

        if ($expiringCount > 0) {
            try {
                $superAdmins = User::where('role', 'superadmin')->get();

                $message = "تنبيه: هناك {$expiringCount} اشتراك سينتهي خلال 5 أيام:\n";

                foreach ($usersExpiringSoon as $user) {
                    $expiryDate = $user->subscription_expires_at->format('Y-m-d');
                    $message .= " - {$user->name} ({$user->email}) ينتهي في: {$expiryDate}\n";
                }

                Log::info($message);

                $this->info("\n" . $message);

                $this->info("تم تسجيل إشعار بخصوص {$expiringCount} اشتراك سينتهي خلال 5 أيام.");

            } catch (\Exception $e) {
                $this->error("فشل في تسجيل الإشعار: {$e->getMessage()}");
                Log::error("فشل تسجيل إشعار انتهاء الاشتراكات", ['error' => $e->getMessage()]);
            }
        } else {
            $this->info("لا توجد اشتراكات ستنتهي خلال 5 أيام.");
        }

        $this->info("تم معالجة {$expiredCount} اشتراك منتهي.");
    }
}
