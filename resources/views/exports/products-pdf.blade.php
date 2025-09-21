<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>تقرير المنتجات</title>
    <style>
        @font-face {
            font-family: 'XBRiyaz';
            font-style: normal;
            font-weight: 400;
            src: url('{{ storage_path('fonts/XBRiyaz.ttf') }}') format('truetype');
        }

        * {
            box-sizing: border-box;
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
        }

        body {
            font-family: 'XBRiyaz', 'DejaVu Sans', Tahoma, Arial, sans-serif;
            direction: rtl;
            text-align: right;
            color: #000;
            font-size: 14px;
            margin: 0;
            padding: 15px;
            line-height: 1.5;
        }

        .header {
            text-align: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #2c5282;
        }

        .header h1 {
            color: #2c5282;
            font-size: 24px;
            margin: 0 0 10px 0;
            padding: 0;
        }

        .header p {
            color: #718096;
            margin: 0;
            font-size: 16px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 14px;
            page-break-inside: auto;
        }

        tr {
            page-break-inside: avoid;
            page-break-after: auto;
        }

        thead {
            display: table-header-group;
        }

        th, td {
            border: 1px solid #cbd5e0;
            padding: 10px;
            text-align: right;
        }

        th {
            background-color: #f2f2f2;
            font-weight: bold;
            color: #2d3748;
        }

        tbody tr:nth-child(odd) {
            background-color: #f7fafc;
        }

        tbody tr:hover {
            background-color: #ebf8ff;
        }

        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #cbd5e0;
            font-size: 12px;
            color: #718096;
        }

        .numeric {
            text-align: left;
            font-family: 'DejaVu Sans Mono', monospace;
        }

        @page {
            margin: 50px 25px;
            header: html_header;
            footer: html_footer;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <htmlpageheader name="header">
        <div class="header">
            <h1>تقرير المنتجات</h1>
            <p>تاريخ التقرير: {{ date('Y-m-d') }}</p>
        </div>
    </htmlpageheader>

    <!-- Content -->
    <table>
        <thead>
            <tr>
                <th width="5%">#</th>
                <th width="20%">اسم المنتج</th>
                <th width="15%">التصنيف</th>
                <th width="10%">الكمية</th>
                <th width="12%">سعر البيع</th>
                <th width="12%">سعر الجملة</th>
                <th width="13%">مصاريف اضافية</th>
                <th width="13%">صافي الأرباح</th>
            </tr>
        </thead>
        <tbody>
            @foreach($products as $product)
            <tr>
                <td class="numeric">{{ $loop->iteration }}</td>
                <td>{{ $product->name }}</td>
                <td>{{ $product->category ?? 'غير محدد' }}</td>
                <td class="numeric">{{ $product->quantity }}</td>
                <td class="numeric">{{ number_format($product->price, 2) }}</td>
                <td class="numeric">{{ number_format($product->wholesale_price, 2) }}</td>
                <td class="numeric">{{ number_format($product->additional_costs, 2) }}</td>
                <td class="numeric">{{ number_format($product->net_profit, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Footer -->
    <htmlpagefooter name="footer">
        <div class="footer">
            <p>صفحة {PAGENO} من {nbpg}</p>
            <p>تم إنشاء هذا التقرير تلقائياً من نظام إدارة المنتجات</p>
        </div>
    </htmlpagefooter>
</body>
</html>
