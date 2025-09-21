<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>تذكير بالمهمة</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 20px; }
        .footer { background: #e5e7eb; padding: 15px; text-align: center; font-size: 14px; }
        .task-info { background: white; padding: 15px; border-radius: 5px; margin-bottom: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>تذكير بالمهمة</h1>
        </div>

        <div class="content">
            <p>مرحباً {{ $task->assignee->name }},</p>

            <p>هذا تذكير بأن المهمة الموكلة إليك تنتهي غداً.</p>

            <div class="task-info">
                <h3>تفاصيل المهمة:</h3>
                <p><strong>العنوان:</strong> {{ $task->title }}</p>
                <p><strong>الوصف:</strong> {{ $task->description ?? 'لا يوجد وصف' }}</p>
                <p><strong>تاريخ الانتهاء:</strong> {{ $task->due_date }}</p>
                <p><strong>الحالة:</strong>
                    @if($task->status == 'pending') معلقة
                    @elseif($task->status == 'in_progress') قيد التنفيذ
                    @elseif($task->status == 'completed') مكتملة
                    @elseif($task->status == 'overdue') متأخرة
                    @endif
                </p>
            </div>

            <p>يرجى الانتهاء من المهمة في الوقت المحدد.</p>

            <p>شكراً،<br>فريق الإدارة</p>
        </div>

        <div class="footer">
            <p>هذا البريد الإلكتروني تم إرساله تلقائياً، يرجى عدم الرد عليه.</p>
            <p>© {{ date('Y') }} {{ $task->company->name ?? 'System' }}</p>
        </div>
    </div>
</body>
</html>
