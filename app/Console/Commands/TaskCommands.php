<?php

namespace App\Console\Commands;

use App\Mail\TaskCmmandMail;
use Carbon\Carbon;
use App\Models\Task;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use App\Services\WhatsAppService;
use App\Models\CompanyWhatsappSetting;

class TaskCommands extends Command
{
    protected $signature = 'app:task-commands';
    protected $description = 'Send task reminders and update overdue tasks';

    public function handle()
    {
        $today = Carbon::today()->toDateString();
        $tomorrow = Carbon::tomorrow()->toDateString();

        // 1. إرسال تذكيرات المهام المستحقة غداً
        $tasksDueTomorrow = Task::with(['assignee', 'company'])
            ->whereDate('due_date', $tomorrow)
            ->where('status', '!=', 'completed')
            ->get()
            ->groupBy('company_id');

        foreach ($tasksDueTomorrow as $companyId => $tasks) {
            $whatsappSettings = CompanyWhatsappSetting::where('company_id', $companyId)
                ->where('is_connected', true)
                ->first();

            foreach ($tasks as $task) {
                // إرسال إيميل
                if ($task->assignee && $task->assignee->email) {
                    Mail::to($task->assignee->email)
                        ->send(new TaskCmmandMail($task));
                    $this->info("Sent reminder email for task '{$task->title}' to {$task->assignee->email}");
                }

                // إرسال واتساب
                if ($whatsappSettings && $task->assignee && $task->assignee->phone) {
                    try {
                        $whatsappService = new WhatsAppService($companyId);
                        $message = $this->formatTaskMessage($task, 'reminder');
                        $whatsappService->sendMessage($task->assignee->phone, $message);
                        $this->info("Sent WhatsApp reminder for task '{$task->title}' to {$task->assignee->phone}");
                    } catch (\Exception $e) {
                        $this->error("Failed to send WhatsApp: " . $e->getMessage());
                    }
                }
            }
        }

        // 2. تحديث المهام المتأخرة
        $overdueTasks = Task::with(['assignee', 'company'])
            ->where('due_date', '<', $today)
            ->where('status', '!=', 'completed')
            ->where('status', '!=', 'overdue')
            ->get()
            ->groupBy('company_id');

        foreach ($overdueTasks as $companyId => $tasks) {
            $whatsappSettings = CompanyWhatsappSetting::where('company_id', $companyId)
                ->where('is_connected', true)
                ->first();

            foreach ($tasks as $task) {
                $task->update(['status' => 'overdue']);

                // إرسال تنبيه تأخير
                if ($whatsappSettings && $task->assignee && $task->assignee->phone) {
                    try {
                        $whatsappService = new WhatsAppService($companyId);
                        $message = $this->formatTaskMessage($task, 'overdue');
                        $whatsappService->sendMessage($task->assignee->phone, $message);
                        $this->info("Sent WhatsApp overdue alert for task '{$task->title}'");
                    } catch (\Exception $e) {
                        $this->error("Failed to send WhatsApp overdue: " . $e->getMessage());
                    }
                }
            }
        }

        $this->info("Task reminders and overdue updates completed successfully.");
    }

    // دالة مساعدة لتنسيق الرسائل
    protected function formatTaskMessage($task, $type)
    {
        if ($type === 'reminder') {
            return "📋 تذكير بمهمة مستحقة غداً\n\n" .
                   "العنوان: {$task->title}\n" .
                   "الوصف: " . (strlen($task->description) > 50 ? substr($task->description, 0, 50) . '...' : $task->description) . "\n" .
                   "تاريخ الاستحقاق: {$task->due_date}\n" .
                   "الأولوية: {$task->priority}";
        } else {
            return "⚠️ تنبيه: مهمة متأخرة\n\n" .
                   "العنوان: {$task->title}\n" .
                   "تاريخ الاستحقاق: {$task->due_date}\n" .
                   "يرجى إكمال هذه المهمة في أقرب وقت ممكن";
        }
    }
}
