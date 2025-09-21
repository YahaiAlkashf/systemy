<!DOCTYPE html>
<html>
<head>
    <title>تذكير دفع المستحقات</title>
</head>
<body>


    <p>السيد/ة {{ $customer->name }},</p>

    <p>يرجى العلم بأنه متبقي عليك مبلغ {{ number_format($remainingAmount, 2) }} من {{ number_format($rent->monthly_rent, 2) }}</p>

    <p><strong>تاريخ الاستحقاق:</strong> {{ $dueDate }}</p>

    <p>نرجو السداد قبل تاريخ الاستحقاق لتجنب أي تأخير.</p>

    <p>شكراً لتعاونكم،</p>
    <p>فريق {{ $rent->customer->company->name ?? 'الإدارة' }}</p>
</body>
</html>
