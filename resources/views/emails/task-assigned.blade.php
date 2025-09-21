<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>مهمة جديدة</title>
</head>
<body>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: right;">مهمة جديدة مخصصة لك</h2>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2c5282; text-align: right;">{{ $task->title }}</h3>
            <p style="text-align: right; color: #555;">{{ $task->description }}</p>
            
            <div style="text-align: right; margin-top: 15px;">
                <p><strong>تاريخ التسليم:</strong> {{ $task->due_date }}</p>
                <p><strong>الحالة:</strong> 
                    @if($task->status == 'pending') معلقة
                    @elseif($task->status == 'in_progress') جارية
                    @elseif($task->status == 'completed') مكتملة
                    @elseif($task->status == 'overdue') متأخرة
                    @endif
                </p>
            </div>
        </div>

        <p style="text-align: right; color: #777;">
            يمكنك تسجيل الدخول إلى النظام لعرض التفاصيل الكاملة وإدارة المهمة.
        </p>

        <div style="text-align: center; margin-top: 30px; padding: 15px; background: #f0f0f0;">
            <p style="margin: 0; color: #555;">© {{ date('Y') }} MySystem. جميع الحقوق محفوظة.</p>
        </div>
    </div>
</body>
</html>