<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>انتهاء عقد الإيجار</title>
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
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            text-align: center;
            margin: 20px 0;
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            
            <h1>انتهاء عقد الإيجار</h1>
        </div>

        <div class="content">
            <p>عزيزي/عزيزتي <strong>{{ $customerName }}</strong>,</p>

            <div class="highlight">
                <h3>نود إعلامكم بأن عقد الإيجار الخاص بكم قد انتهى</h3>
            </div>

            <div class="info-box">
                <h3 style="text-align: center; margin-top: 0; color: #667eea;">تفاصيل العقد المنتهي</h3>

                <div class="info-item">
                    <span class="label">📅 تاريخ الانتهاء:</span>
                    <span class="value">{{ $endDate }}</span>
                </div>

                <div class="info-item">
                    <span class="label">💰 إجمالي المبلغ المستحق:</span>
                    <span class="value">{{ number_format($totalAmount, 2) }} جنيه</span>
                </div>

                <div class="info-item">
                    <span class="label">💳 المبلغ المدفوع:</span>
                    <span class="value">{{ number_format($paidAmount, 2) }} جنيه</span>
                </div>

                <div class="info-item" style="background: #e8f5e8; border-radius: 5px; padding: 10px;">
                    <span class="label" style="color: #2e7d32;">📊 المبلغ المتبقي:</span>
                    <span class="value" style="color: #2e7d32; font-size: 18px;">{{ number_format($remainingAmount, 2) }} جنيه</span>
                </div>
            </div>

            <div class="thank-you">
                <p>نشكركم على ثقتكم بنا ونتطلع لخدمتكم مرة أخرى في المستقبل.</p>
                <p>لأي استفسارات، لا تتردد في التواصل معنا.</p>
            </div>
        </div>

        <div class="footer">
            <p>مع خالص التحيات،</p>
            <p><strong>{{ $companyName }}</strong></p>
            <p style="margin-top: 10px; font-size: 12px; color: #999;">
                هذا البريد الإلكتروني تم إرساله تلقائياً، يرجى عدم الرد عليه
            </p>
        </div>
    </div>
</body>
</html>
