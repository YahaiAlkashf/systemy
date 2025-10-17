<?php

namespace App\Http\Controllers\RetailFlow;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\ProductRetailFlow;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Elibyy\TCPDF\TCPDF;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class ProductRetailFlowController extends Controller
{
    public function index()
    {
        $products = ProductRetailFlow::where('company_id', Auth::user()->company_id)->get();
        return response()->json([
            'status' => 'success',
            'products' => $products
        ], 200);
    }

    public function getProductByBarcode($barcode)
    {
        try {
            if (Auth::user()->system_type !== "retail") {
                return response()->json([
                    'success' => false,
                    'message' => 'ميزة الباركود متاحة لأنظمة البيع بالتجزئة فقط'
                ], 403);
            }

            $product = ProductRetailFlow::where('barcode', $barcode)
                ->where('company_id', Auth::user()->company_id)
                ->first();

            return response()->json([
                'success' => true,
                'product' => $product
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching product: ' . $e->getMessage()
            ], 500);
        }
    }

public function store(Request $request)
{
    try {
        $rules = [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'net_profit' => 'required|numeric',
            'wholesale_price' => 'required|numeric',
            'category' => 'nullable|string|max:255',
            'additional_costs' => 'nullable|numeric',
        ];


        $customMessages = [
            'name.required' => 'اسم المنتج مطلوب',
            'name.string' => 'اسم المنتج يجب أن يكون نصاً',
            'name.max' => 'اسم المنتج يجب ألا يتجاوز 255 حرفاً',
            'price.required' => 'السعر مطلوب',
            'price.numeric' => 'السعر يجب أن يكون رقماً',
            'net_profit.required' => 'صافي الربح مطلوب',
            'net_profit.numeric' => 'صافي الربح يجب أن يكون رقماً',
            'wholesale_price.required' => 'سعر الجملة مطلوب',
            'wholesale_price.numeric' => 'سعر الجملة يجب أن يكون رقماً',
            'category.string' => 'الفئة يجب أن تكون نصاً',
            'category.max' => 'الفئة يجب ألا تتجاوز 255 حرفاً',
            'additional_costs.numeric' => 'التكاليف الإضافية يجب أن تكون رقماً',
            'quantity.required' => 'الكمية مطلوبة',
            'quantity.integer' => 'الكمية يجب أن تكون عدداً صحيحاً',
            'quantity.string' => 'الكمية يجب أن تكون نصاً',
            'barcode.string' => 'الباركود يجب أن يكون نصاً',
            'barcode.unique' => 'الباركود مسجل مسبقاً',
        ];

        if (Auth::user()->system_type === "retail") {
            $rules['barcode'] = 'nullable|string|unique:product_retail_flows,barcode,NULL,id,company_id,' . Auth::user()->company_id;
        }

        if ( Auth::user()->system_type === "realEstate" || Auth::user()->system_type === "retail") {
            if (Auth::user()->system_type === "realEstate") {
                $rules['price'] = 'required|string';
                $rules['net_profit'] = 'required|string';
                $rules['wholesale_price'] = 'required|string';
                $rules['quantity'] = 'nullable|integer';


                $customMessages['price.string'] = 'السعر يجب أن يكون نصاً';
                $customMessages['net_profit.string'] = 'صافي الربح يجب أن يكون نصاً';
                $customMessages['wholesale_price.string'] = 'سعر الشراء يجب أن يكون نصاً';
            } else {
                $rules['quantity'] = 'required|integer';
            }
        } else if (Auth::user()->system_type === "delivery") {
            $rules['net_profit'] = 'required|numeric';
            $rules['wholesale_price'] = 'required|string';
            $rules['quantity'] = 'required|string';


            $customMessages['wholesale_price.string'] = 'سعر الجملة يجب أن يكون نصاً';
            $customMessages['quantity.string'] = 'الكمية يجب أن تكون نصاً';
        }

        $validator = Validator::make($request->all(), $rules, $customMessages);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $productData = [
            'company_id' => Auth::user()->company_id,
            'name' => $request->name,
            'price' => $request->price,
            'net_profit' => $request->net_profit,
            'wholesale_price' => $request->wholesale_price,
            'category' => $request->category,
            'additional_costs' => $request->additional_costs ?? 0,
        ];

        if (Auth::user()->system_type === "retail") {
            $productData['barcode'] = $request->barcode;
        }

        if (Auth::user()->system_type !== "services" &&
            Auth::user()->system_type !== "education" &&
            Auth::user()->system_type !== "travels"&&Auth::user()->system_type !== "realEstate") {
            $productData['quantity'] = $request->quantity;
        }

        $product = ProductRetailFlow::create($productData);

        if ($product->quantity < 5 &&
            Auth::user()->system_type === "retail" ) {
            Notification::create([
                'title' => "المنتج {$product->name} على وشك النفاذ",
                "message" => "كمية {$product->name} اقل من خمسة",
                "company_id" => $product->company_id,
            ]);
        }

    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'حدث خطأ غير متوقع',
            'error' => $e->getMessage()
        ], 500);
    }

    return response()->json([
        'status' => 'success',
        'message' => 'تم إنشاء المنتج بنجاح',
        'product' => $product
    ], 200);
}

public function update(Request $request, $id)
{
    try {
        $product = ProductRetailFlow::where('id', $id)
            ->where('company_id', Auth::user()->company_id)
            ->firstOrFail();

        $rules = [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'net_profit' => 'required|numeric',
            'wholesale_price' => 'required|numeric',
            'category' => 'nullable|string|max:255',
            'additional_costs' => 'nullable|numeric',
        ];

        $customMessages = [
            'name.required' => 'اسم المنتج مطلوب',
            'name.string' => 'اسم المنتج يجب أن يكون نصاً',
            'name.max' => 'اسم المنتج يجب ألا يتجاوز 255 حرفاً',
            'price.required' => 'السعر مطلوب',
            'price.numeric' => 'السعر يجب أن يكون رقماً',
            'net_profit.required' => 'صافي الربح مطلوب',
            'net_profit.numeric' => 'صافي الربح يجب أن يكون رقماً',
            'wholesale_price.required' => 'سعر الجملة مطلوب',
            'wholesale_price.numeric' => 'سعر الجملة يجب أن يكون رقماً',
            'category.string' => 'الفئة يجب أن تكون نصاً',
            'category.max' => 'الفئة يجب ألا تتجاوز 255 حرفاً',
            'additional_costs.numeric' => 'التكاليف الإضافية يجب أن تكون رقماً',
            'quantity.required' => 'الكمية مطلوبة',
            'quantity.integer' => 'الكمية يجب أن تكون عدداً صحيحاً',
            'quantity.string' => 'الكمية يجب أن تكون نصاً',
            'barcode.string' => 'الباركود يجب أن يكون نصاً',
            'barcode.unique' => 'الباركود مسجل مسبقاً',
        ];

        if (Auth::user()->system_type === "retail" ) {
            $rules['barcode'] = 'nullable|string|unique:product_retail_flows,barcode,' . $id . ',id,company_id,' . Auth::user()->company_id;
        }

        if ( Auth::user()->system_type === "retail" || Auth::user()->system_type === "gym") {
            $rules['quantity'] = 'required|integer';
        } else if (Auth::user()->system_type === "delivery") {
            $rules['net_profit'] = 'required|numeric';
            $rules['wholesale_price'] = 'required|string';
            $rules['quantity'] = 'required|string';

            $customMessages['wholesale_price.string'] = 'سعر الجملة يجب أن يكون نصاً';
            $customMessages['quantity.string'] = 'الكمية يجب أن تكون نصاً';
        }

        $validator = Validator::make($request->all(), $rules, $customMessages);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $updateData = [
            'name' => $request->name,
            'price' => $request->price,
            'net_profit' => $request->net_profit,
            'wholesale_price' => $request->wholesale_price,
            'category' => $request->category,
            'additional_costs' => $request->additional_costs ?? 0,
        ];

        if (Auth::user()->system_type === "retail") {
            $updateData['barcode'] = $request->barcode;
        }

        if (Auth::user()->system_type !== "services" &&
            Auth::user()->system_type !== "education" &&
            Auth::user()->system_type !== "travels") {
            $updateData['quantity'] = $request->quantity;
        }

        $product->update($updateData);

        if ($product->quantity < 5 &&
            Auth::user()->system_type === "retail" ) {
            Notification::create([
                'title' => "المنتج {$product->name} على وشك النفاذ",
                "message" => "كمية {$product->name} اقل من خمسة",
                "company_id" => $product->company_id,
            ]);
        }

    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'حدث خطأ غير متوقع أثناء التحديث',
            'error' => $e->getMessage()
        ], 500);
    }

    return response()->json([
        'status' => 'success',
        'message' => 'تم تحديث المنتج بنجاح',
        'product' => $product
    ], 200);
}

    public function destroy($id)
    {
        try {
            $product = ProductRetailFlow::where('id', $id)
                ->where('company_id', Auth::user()->company_id)
                ->firstOrFail();

            $product->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Product deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Product not found or cannot be deleted'
            ], 404);
        }
    }

    public function exportPDF()
    {
        $products = ProductRetailFlow::where('company_id', Auth::user()->company_id)->get();
        $user = Auth::user();

        $pdf = new TCPDF('L', 'mm', 'A4', true, 'UTF-8', false);

        $pdf->SetCreator('Your System');
        $pdf->SetAuthor('Your Name');

        $systemTitles = [
            "retail" => "تقرير المنتجات",
            "services" => "تقرير الخدمات",
            "education" => "تقرير التعليم",
            "realEstate" => "تقرير العقارات",
            "delivery" => "تقرير الطلبات",
            "travels" => "تقرير الرحلات"
        ];

        $title = $systemTitles[$user->system_type] ?? "تقرير المنتجات";
        $pdf->SetTitle($title);
        $pdf->SetSubject($title);

        $pdf->AddPage();
        $pdf->SetFont('dejavusans', '', 12);

        $nameColumnTitle = "";
        $quantityColumnTitle = "";
        $priceColumnTitle = "";
        $wholesaleColumnTitle = "";

        switch ($user->system_type) {
            case "services":
                $nameColumnTitle = "اسم الخدمة";
                $quantityColumnTitle = "";
                $priceColumnTitle = "سعر الخدمة";
                $wholesaleColumnTitle = "تكلفة الخدمة";
                break;
            case "education":
                $nameColumnTitle = "اسم الدورة";
                $quantityColumnTitle = "";
                $priceColumnTitle = "سعر الدورة";
                $wholesaleColumnTitle = "تكلفة الدورة";
                break;
            case "realEstate":
                $nameColumnTitle = "اسم العقار";
                $quantityColumnTitle = "الكمية";
                $priceColumnTitle = "سعر البيع";
                $wholesaleColumnTitle = "سعر الشراء";
                break;
            case "delivery":
                $nameColumnTitle = "اسم الطلب";
                $quantityColumnTitle = "حالة الطلب";
                $priceColumnTitle = "سعر الطلب";
                $wholesaleColumnTitle = "عنوان الطلب";
                break;
            case "travels":
                $nameColumnTitle = "اسم الرحلة";
                $quantityColumnTitle = "";
                $priceColumnTitle = "سعر الرحلة";
                $wholesaleColumnTitle = "تكلفة الرحلة";
                break;
            default:
                $nameColumnTitle = "اسم المنتج";
                $quantityColumnTitle = "الكمية";
                $priceColumnTitle = "سعر البيع";
                $wholesaleColumnTitle = "سعر الجملة";
        }

        $html = '<h1 style="text-align:center; font-family:dejavusans;">' . $title . '</h1>';
        $html .= '<p style="text-align:center;">تاريخ التقرير: ' . date('Y-m-d') . '</p>';

        $html .= '<table dir="rtl" border="1" cellpadding="5" style="width:100%; border-collapse:collapse; direction:rtl; text-align:right; font-family:dejavusans;">';
        $html .= "<thead><tr>
                <th>#</th>
                <th>$nameColumnTitle</th>
                <th>التصنيف</th>";

        if ($user->system_type === "retail") {
            $html .= "<th>الباركود</th>";
        }

        if (!empty($quantityColumnTitle)) {
            $html .= "<th>$quantityColumnTitle</th>";
        }

        $html .= "
                <th>$priceColumnTitle</th>
                <th>$wholesaleColumnTitle</th>
                <th>مصاريف اضافية</th>
                <th>صافي الأرباح</th>
                <th>تاريخ الإنشاء</th>
                </tr></thead>";

        $html .= '<tbody>';

        foreach ($products as $index => $product) {
            $html .= '<tr>
                    <td>' . ($index + 1) . '</td>
                    <td>' . $product->name . '</td>
                    <td>' . ($product->category ?? 'غير محدد') . '</td>';

            if ($user->system_type === "retail") {
                $html .= '<td>' . ($product->barcode ?? 'لا يوجد') . '</td>';
            }

            if (!empty($quantityColumnTitle)) {
                $html .= '<td>' . $product->quantity . '</td>';
            }

            $html .= '
                    <td>' . number_format($product->price, 2) . '</td>
                    <td>' . ($user->system_type === "delivery" ? $product->wholesale_price : number_format($product->wholesale_price, 2)) . '</td>
                    <td>' . number_format($product->additional_costs, 2) . '</td>
                    <td>' . number_format($product->net_profit, 2) . '</td>
                    <td>' . $product->created_at->format('Y-m-d') . '</td>
                    </tr>';
        }

        $html .= '</tbody></table>';

        $pdf->writeHTML($html, true, false, true, false, '');

        $fileName = str_replace(' ', '_', $title) . '.pdf';
        $pdf->Output($fileName, 'D');

        exit;
    }

    public function exportExcel()
    {
        $users = User::with('company')->where('role', 'superadmin')->where('system_type', '!=', 'manager')->get();

        $fileName = 'المستخدمين_' . date('Y-m-d') . '.xlsx';

        // إنشاء مستند جديد
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('المستخدمين');
        $sheet->setRightToLeft(true);

        // تعريف الرؤوس
        $headers = [
            '#',
            'الاسم',
            'الرتبة',
            'البريد الإلكتروني',
            'الهاتف',
            'نوع النظام',
            'الدولة',
            'اسم الشركة',
            'العنوان',
            'نوع الباقة',
            'تاريخ الإنشاء'
        ];

        // إضافة الرؤوس
        $sheet->fromArray($headers, null, 'A1');

        // تنسيق الرؤوس
        $headerStyle = [
            'font' => [
                'bold' => true,
                'size' => 12,
                'color' => ['rgb' => '000000']
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'color' => ['rgb' => 'FFFF00']
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '000000']
                ]
            ]
        ];

        // تحديد العمود الأخير بناءً على عدد الرؤوس
        $lastHeaderColumn = chr(64 + count($headers));
        $sheet->getStyle('A1:' . $lastHeaderColumn . '1')->applyFromArray($headerStyle);

        // إضافة البيانات
        $row = 2;
        foreach ($users as $index => $user) {
            $col = 'A';

            // #
            $sheet->setCellValue($col++ . $row, $index + 1);

            // الاسم
            $sheet->setCellValue($col++ . $row, $user->name);

            // الرتبة
            $sheet->setCellValue($col++ . $row, $user->role);

            // البريد الإلكتروني
            $sheet->setCellValue($col++ . $row, $user->email);

            // الهاتف
            $sheet->setCellValue($col++ . $row, $user->company->phone ?? 'غير محدد');

            // نوع النظام
            $sheet->setCellValue($col++ . $row, $user->system_type);

            // الدولة
            $sheet->setCellValue($col++ . $row, $user->country);

            // اسم الشركة
            $sheet->setCellValue($col++ . $row, $user->company->company_name ?? 'غير محدد');

            // العنوان
            $sheet->setCellValue($col++ . $row, $user->company->address ?? 'غير محدد');

            // نوع الباقة
            $sheet->setCellValue($col++ . $row, $user->company->subscription ?? 'غير محدد');

            // تاريخ الإنشاء
            $sheet->setCellValue($col . $row, $user->created_at->format('Y-m-d'));

            $row++;
        }

        // تنسيق بيانات الجدول
        $dataStyle = [
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'DDDDDD']
                ]
            ]
        ];

        if ($users->count() > 0) {
            $sheet->getStyle('A2:' . $lastHeaderColumn . ($row - 1))->applyFromArray($dataStyle);
        }

        // ضبط عرض الأعمدة تلقائياً
        foreach (range('A', $lastHeaderColumn) as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        // إنشاء الكاتب وإرجاع الملف
        $writer = new Xlsx($spreadsheet);

        ob_start();
        $writer->save('php://output');
        $content = ob_get_clean();

        return response($content, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
            'Cache-Control' => 'max-age=0',
        ]);
    }


}
