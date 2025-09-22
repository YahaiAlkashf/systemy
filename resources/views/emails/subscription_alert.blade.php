<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>تنبيه انتهاء اشتراك الشركة</title>
</head>
<body>
    <h2>عزيزي/عزيزتي {{ $adminName }},</h2>

    <p>نود إعلامكم أن اشتراك شركتكم <strong>{{ $companyName }}</strong> في نظامنا سينتهي خلال <strong>{{ $daysLeft }} أيام</strong>.</p>

    <p><strong>تاريخ الانتهاء:</strong> {{ $expiryDate }}</p>

    <p>لضمان استمرارية الخدمة دون انقطاع، يرجى تجديد اشتراك الشركة في أقرب وقت ممكن.</p>

    <p>إذا كان لديكم أي استفسارات، فلا تترددوا في التواصل معنا.</p>

    <br>
    <p>مع تحياتنا،<br>
    فريق {{ config('app.name') }}</p>
</body>
</html>
