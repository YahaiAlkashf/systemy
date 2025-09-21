<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>حدث جديد</title>
</head>
<body>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: right;">حدث جديد في النظام</h2>

        <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2c5282; text-align: right;">{{ $event->title }}</h3>

            <div style="text-align: right; margin-top: 15px;">
                <p><strong>التاريخ:</strong> {{ \Carbon\Carbon::parse($event->date)->translatedFormat('l j F Y') }}</p>
                <p><strong>الوصف:</strong> {{ $event->description }}</p>

                @if($event->option === 'select')
                <p><strong>الحضور:</strong> يرجى تأكيد حضورك أو اعتذارك للنشاط</p>
                @endif
            </div>
        </div>

        <p style="text-align: right; color: #777;">
            يمكنك تسجيل الدخول إلى النظام لعرض التفاصيل الكاملة والرد على الحدث.
        </p>

        <div style="text-align: center; margin-top: 30px; padding: 15px; background: #f0f0f0;">
            <p style="margin: 0; color: #555;">© {{ date('Y') }} MySystem. جميع الحقوق محفوظة.</p>
        </div>
    </div>
</body>
</html>
