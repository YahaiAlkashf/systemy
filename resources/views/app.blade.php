<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>سيستمى نظام متكامل لادارة الانشطة التجارية</title>
        <meta name="description" content="سيستمى نظام متكامل لإدارة الأنشطة التجارية بجميع أنواعها، يساعدك على متابعة المبيعات والمخزون والفواتير والاشتراكات بسهولة واحترافية." />
        <meta name="keywords" content="سيستم, نظام إدارة, إدارة الأنشطة التجارية, إدارة مبيعات, إدارة مخزون, إدارة فواتير, إدارة اشتراكات, برنامج محاسبة, برنامج ERP, نظام نقاط بيع, POS System" />
        <link rel="icon" type="image/x-icon" href="{{ asset('favicon-v2.ico') }}">
        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap" rel="stylesheet">
        <meta name="google-site-verification" content="Bl_5oW_zQJt_6VSXpwYK9ucchhP7gyxpgCZbKMOs4MM" />
        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
