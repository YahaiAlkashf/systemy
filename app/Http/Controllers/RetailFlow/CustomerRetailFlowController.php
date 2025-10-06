<?php

namespace App\Http\Controllers\RetailFlow;

use App\Http\Controllers\Controller;
use App\Models\CustomerRetailFlow;
use Elibyy\TCPDF\TCPDF;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use Inertia\Inertia;

class CustomerRetailFlowController extends Controller
{

    public function index()
    {
        $customers = CustomerRetailFlow::where('company_id', Auth::user()->company_id)->with('invoices')->get();
        return response()->json([
            'status' => 'success',
            'customers' => $customers
        ], 200);
    }



    public function store(Request $request)
    {
$validator = Validator::make($request->all(), [
    'name' => 'required|string|max:255',
    'phone' => 'nullable|string|max:255',
    'email' => 'nullable|email|max:255',
    'address' => 'nullable|string|max:255',
], [
    'name.required' => 'الاسم مطلوب',
    'name.string' => 'الاسم يجب أن يكون نصًا',
    'name.max' => 'الاسم يجب ألا يزيد عن 255 حرفًا',

    'phone.string' => 'رقم الهاتف يجب أن يكون نصًا',
    'phone.max' => 'رقم الهاتف يجب ألا يزيد عن 255 حرفًا',

    'email.email' => 'البريد الإلكتروني غير صالح',
    'email.max' => 'البريد الإلكتروني يجب ألا يزيد عن 255 حرفًا',

    'address.string' => 'العنوان يجب أن يكون نصًا',
    'address.max' => 'العنوان يجب ألا يزيد عن 255 حرفًا',
]);
        CustomerRetailFlow::create([
            'company_id' => Auth::user()->company_id,
            ...$request->only('name', 'phone', 'email', 'address')
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Customer created successfully'
        ], 200);
    }


    public function update(Request $request,  $id)
    {
$validator = Validator::make($request->all(), [
    'name' => 'required|string|max:255',
    'phone' => 'nullable|string|max:255',
    'email' => 'nullable|email|max:255',
    'address' => 'nullable|string|max:255',
], [
    'name.required' => 'الاسم مطلوب',
    'name.string' => 'الاسم يجب أن يكون نصًا',
    'name.max' => 'الاسم يجب ألا يزيد عن 255 حرفًا',

    'phone.string' => 'رقم الهاتف يجب أن يكون نصًا',
    'phone.max' => 'رقم الهاتف يجب ألا يزيد عن 255 حرفًا',

    'email.email' => 'البريد الإلكتروني غير صالح',
    'email.max' => 'البريد الإلكتروني يجب ألا يزيد عن 255 حرفًا',

    'address.string' => 'العنوان يجب أن يكون نصًا',
    'address.max' => 'العنوان يجب ألا يزيد عن 255 حرفًا',
]);
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }
        $customer=CustomerRetailFlow::find($id);
        $customer->update($request->only('name', 'phone', 'email', 'address'));

        return response()->json([
            'status' => 'success',
            'message' => 'Customer updated successfully'
        ], 200);
    }

    public function destroy( $id)
    {
         $customer=CustomerRetailFlow::find($id);
        $customer->delete();
        return response()->json([
            'status' => 'success',
            'message' => 'Customer deleted successfully'
        ], 200);
    }


    public function exportPDF()
        {
            $customers = CustomerRetailFlow::where('company_id', Auth::user()->company_id)->get();

            $pdf = new TCPDF('L', 'mm', 'A4', true, 'UTF-8', false);

            $pdf->SetCreator('Your System');
            $pdf->SetAuthor('Your Name');
            $title="";
            $address="";
            $nameReport="";
            $titleReport='';
            if(Auth::user()->system_type === "delivery"){
                     $pdf->SetTitle('تقرير السائقين');
                     $pdf->SetSubject('تقرير السائقين');
                     $title="اسم السائق";
                     $address="رقم السيارة";
                    $nameReport="تقرير_السائقين.pdf";
                    $titleReport="تقرير السائقين";
            }else{
                     $pdf->SetTitle('تقرير العملاء');
                     $pdf->SetSubject('تقرير العملاء');
                     $title="اسم العميل";
                     $address="العنوان";
                     $nameReport="تقرير_العملاء.pdf";
                     $titleReport="تقرير العملاء";
            }


            $pdf->AddPage();

            $pdf->SetFont('dejavusans', '', 12);

$html = '<table style="width:100%;"><tr><td style="text-align:center; font-family:dejavusans; font-size:20px;">' . $titleReport . '</td></tr></table>';
            $html .= '<p style="text-align:center;">تاريخ التقرير: ' . date('Y-m-d') . '</p>';

            $html .= '<table dir="rtl" border="1" cellpadding="5" style="width:100%; border-collapse:collapse; direction:rtl; text-align:right; font-family:dejavusans;">';
            $html .= "<thead><tr>
                <th>#</th>
                <th>$title</th>
                <th>رقم الهاتف</th>
                <th>البريد الالكترونى</th>
                <th>$address</th>
                <th>تارخ الانشاء</th>
            </tr></thead>";
            $html .= '<tbody>';

            foreach ($customers as $index => $customer) {
                $html .= '<tr>
                    <td>' . ($index + 1) . '</td>
                    <td>' . $customer->name . '</td>
                    <td>' . ($customer->phone ?? 'غير محدد') . '</td>
                    <td>' . ($customer->email ?? 'غير محدد') . '</td>
                    <td>' . ($customer->address ?? 'غير محدد') .  '</td>
                    <td>' .  ($customer->created_at ) .  '</td>

                </tr>';
            }

            $html .= '</tbody></table>';

            $pdf->writeHTML($html, true, false, true, false, '');

            $pdf->Output("$nameReport", 'D');

            exit;
        }


public function exportExcel()
{
    $user = Auth::user();
    $customers = CustomerRetailFlow::where('company_id', $user->company_id)->get();

    $nameTitle = "";
    $addressTitle = "";
    $fileName = "";
    $sheetTitle = "";

    if ($user->system_type === "delivery") {
        $nameTitle = "اسم السائق";
        $addressTitle = "رقم السيارة";
        $fileName = "تقرير_السائقين_" . date('Y-m-d') . '.xlsx';
        $sheetTitle = "السائقين";
    } else {
        $nameTitle = "اسم العميل";
        $addressTitle = "العنوان";
        $fileName = "تقرير_العملاء_" . date('Y-m-d') . '.xlsx';
        $sheetTitle = "العملاء";
    }

    // إنشاء مستند جديد
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();

    // تعيين عنوان الورقة
    $sheet->setTitle($sheetTitle);

    // تعيين اتجاه النص من اليمين لليسار للغة العربية
    $sheet->setRightToLeft(true);

    // تعريف الرؤوس
    $headers = [
        '#', $nameTitle, 'رقم الهاتف', 'البريد الإلكتروني',
        $addressTitle, 'تاريخ الإنشاء'
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
            'color' => ['rgb' => 'FFFF00'] // لون أصفر
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

    $sheet->getStyle('A1:F1')->applyFromArray($headerStyle);

    // إضافة البيانات
    $row = 2;
    foreach ($customers as $index => $customer) {
        $sheet->setCellValue('A' . $row, $index + 1);
        $sheet->setCellValue('B' . $row, $customer->name);
        $sheet->setCellValue('C' . $row, $customer->phone);
        $sheet->setCellValue('D' . $row, $customer->email);
        $sheet->setCellValue('E' . $row, $customer->address);
        $sheet->setCellValue('F' . $row, $customer->created_at->format('Y-m-d'));

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

    if ($customers->count() > 0) {
        $sheet->getStyle('A2:F' . ($row - 1))->applyFromArray($dataStyle);
    }

    // ضبط عرض الأعمدة تلقائياً
    foreach (range('A', 'F') as $column) {
        $sheet->getColumnDimension($column)->setAutoSize(true);
    }

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
