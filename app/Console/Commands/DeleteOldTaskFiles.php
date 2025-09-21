<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\TaskFile;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class DeleteOldTaskFiles extends Command
{
    protected $signature = 'tasks:delete-old-files';
    protected $description = 'حذف ملفات التاسكات الأقدم من 60 يوم';

    public function handle()
    {
        $date = Carbon::now()->subDays(60);

        $oldFiles = TaskFile::where('created_at', '<', $date)->get();
        $count = 0;

        foreach ($oldFiles as $file) {
            Storage::disk('public')->delete($file->file_path);
            $file->delete();
            $count++;
        }

        $this->info("تم حذف {$count} ملف من ملفات التاسكات الأقدم من 60 يوم.");
    }
}
