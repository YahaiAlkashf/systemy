<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject ?? 'إشعار نظام الإيجارات' }}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 30px;
        }
        .info-box {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .info-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .info-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        .label {
            font-weight: bold;
            color: #555;
        }
        .value {
            color: #333;
            font-weight: 600;
        }
        .highlight {
            border-radius: 5px;
            padding: 15px;
            text-align: center;
            margin: 20px 0;
            font-weight: 600;
        }
        .highlight-ended {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
        }
        .highlight-due {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            border-top: 1px solid #e9ecef;
        }
        .icon {
            font-size: 48px;
            margin-bottom: 20px;
        }
        .thank-you {
            text-align: center;
            margin: 30px 0;
            font-size: 16px;
            color: #555;
        }
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 15px;
        }
        .status-overdue {
            background: #dc3545;
            color: white;
        }
        .status-due {
            background: #ffc107;
            color: #000;
        }
        .status-ended {
            background: #6c757d;
            color: white;
        }
        .amount-highlight {
            background: #e8f5e8;
            border-radius: 5px;
            padding: 10px;
            border: 1px solid #c8e6c9;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>
                @if($notificationType === 'rent_ended')
                    🔔 انتهاء عقد الإيجار
                @else
                    ⏰ تنبيه تأخر في الدفع
                @endif
            </h1>
        </div>

        <div class="content">
            <p>عزيزي المدير،</p>

            <div class="highlight {{ $notificationType === 'rent_ended' ? 'highlight-ended' : 'highlight-due' }}">
                @if($notificationType === 'rent_ended')
                    <h3>نود إعلامكم بأن عقد الإيجار للعميل التالي قد انتهى</h3>
                @else
                    <h3>يوجد تأخر في دفع الإيجار للعميل التالي</h3>
                @endif
            </div>

            <!-- شارة الحالة -->
            @if($notificationType === 'rent_due')
                <div style="text-align: center;">
                    <span class="status-badge {{ $daysLeft < 0 ? 'status-overdue' : 'status-due' }}">
                        @if($daysLeft < 0)
                            ⚠️ متأخر بمقدار {{ abs($daysLeft) }} يوم
                        @elseif($daysLeft == 0)
                            ⏳ مستحق اليوم
                        @else
                            📅 متبقي {{ $daysLeft }} يوم
                        @endif
                    </span>
                </div>
            @else
                <div style="text-align: center;">
                    <span class="status-badge status-ended">
                        🏁 انتهى العقد
                    </span>
                </div>
            @endif

            <div class="info-box">
                <h3 style="text-align: center; margin-top: 0; color: #667eea;">تفاصيل العقد</h3>

                <div class="info-item">
                    <span class="label">👤 اسم العميل:</span>
                    <span class="value">{{ $rent->customer->name }}</span>
                </div>

                @if($notificationType === 'rent_ended')
                <div class="info-item">
                    <span class="label">📅 تاريخ الانتهاء:</span>
                    <span class="value">{{ \Carbon\Carbon::parse($rent->end_date)->format('Y-m-d') }}</span>
                </div>
                @else
                <div class="info-item">
                    <span class="label">📅 تاريخ الاستحقاق:</span>
                    <span class="value">{{ \Carbon\Carbon::parse($rent->next_rent_date)->format('Y-m-d') }}</span>
                </div>
                @endif

                <div class="info-item">
                    <span class="label">💰 إجمالي الإيجار:</span>
                    <span class="value">{{ number_format($rent->monthly_rent, 2) }} جنيه</span>
                </div>

                <div class="info-item">
                    <span class="label">💳 المبلغ المدفوع:</span>
                    <span class="value">{{ number_format($rent->paid_amount, 2) }} جنيه</span>
                </div>

                <div class="info-item amount-highlight">
                    <span class="label" style="color: #2e7d32;">📊 المبلغ المتبقي:</span>
                    <span class="value" style="color: #2e7d32; font-size: 18px;">
                        {{ number_format($rent->monthly_rent - $rent->paid_amount, 2) }} جنيه
                    </span>
                </div>
            </div>

            @if($notificationType === 'rent_due')
            <div style="background: #e3f2fd; border: 1px solid #bbdefb; border-radius: 5px; padding: 15px; text-align: center; margin: 20px 0;">
                <p style="margin: 0; color: #1565c0; font-weight: 600;">
                    <strong>📞 يرجى متابعة الأمر مع العميل</strong>
                </p>
            </div>
            @endif

            <div class="thank-you">
                <p>هذا إشعار تلقائي من نظام الإيجارات</p>
                <p>لإدارة أفضل للعقود والمستحقات</p>
            </div>
        </div>

        <div class="footer">
            <p>مع خالص التحيات،</p>
            <p><strong>{{ $rent->customer->company->company_name ?? 'نظام الإيجارات' }}</strong></p>
            <p style="margin-top: 10px; font-size: 12px; color: #999;">
                هذا البريد الإلكتروني تم إرساله تلقائياً، يرجى عدم الرد عليه
            </p>
        </div>
    </div>
</body>
</html>
