<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>تنبيه انتهاء الاشتراكات</title>
    <style>
        body { font-family: Arial, sans-serif; direction: rtl; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 10px; text-align: center; }
        .content { margin: 20px 0; }
        .user-list { background-color: #f1f1f1; padding: 15px; border-radius: 5px; }
        .footer { margin-top: 20px; text-align: center; color: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>تنبيه انتهاء الاشتراكات</h2>
        </div>

        <div class="content">
            <p>مرحباً {{ $admin->name }},</p>
            <p>هناك {{ $expirationCount }} اشتراك سينتهي خلال 5 أيام:</p>

            <div class="user-list">
                <ul>
                    @foreach($users as $user)
                    <li>
                        {{ $user->name }} ({{ $user->email }}) -
                        ينتهي في: {{ $user->subscription_expires_at->format('Y-m-d') }}
                    </li>
                    @endforeach
                </ul>
            </div>

            <p>يرجى اتخاذ الإجراء اللازم.</p>
        </div>

        <div class="footer">
            <p>سيستمى</p>
        </div>
    </div>
</body>
</html>
