<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\File;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class DeleteOldFiles extends Command
{
    /**
     * اسم الكوماند
     *
     * @var string
     */
    protected $signature = 'files:delete-old';

    /**
     * وصف الكوماند
     *
     * @var string
     */
    protected $description = 'حذف الملفات الأقدم من 60 يوم تلقائياً';


    public function handle()
    {
        $date = Carbon::now()->subDays(60);

        $oldFiles = File::where('created_at', '<', $date)->get();

        $count = 0;

        foreach ($oldFiles as $file) {
            Storage::delete('public/' . $file->path);

            $file->delete();
            $count++;
        }

        $this->info("تم حذف {$count} ملف أقدم من 60 يوم.");
    }
}
