<?php

namespace App\Http\Controllers;

use App\Models\Rent;
use App\Models\CustomerRetailFlow;
use Elibyy\TCPDF\TCPDF;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
class RentsController extends Controller
{
    public function index()
    {
        $rents = Rent::with('customer')
            ->where('company_id', Auth::user()->company_id)
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $rents,
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|exists:customer_retail_flows,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'monthly_rent' => 'required|numeric|min:0',
            'paid_amount' => 'required|numeric|min:0',
            'subscription_type' => 'required|in:monthly,yearly',
        ], [
            'customer_id.required' => 'العميل مطلوب',
            'customer_id.exists' => 'العميل غير موجود',

            'start_date.required' => 'تاريخ البداية مطلوب',
            'start_date.date' => 'تاريخ البداية غير صالح',

            'end_date.required' => 'تاريخ النهاية مطلوب',
            'end_date.date' => 'تاريخ النهاية غير صالح',
            'end_date.after_or_equal' => 'تاريخ النهاية يجب أن يكون مساويًا أو بعد تاريخ البداية',

            'monthly_rent.required' => 'الإيجار الشهري مطلوب',
            'monthly_rent.numeric' => 'الإيجار الشهري يجب أن يكون رقمًا',
            'monthly_rent.min' => 'الإيجار الشهري لا يمكن أن يكون أقل من 0',

            'paid_amount.required' => 'المبلغ المدفوع مطلوب',
            'paid_amount.numeric' => 'المبلغ المدفوع يجب أن يكون رقمًا',
            'paid_amount.min' => 'المبلغ المدفوع لا يمكن أن يكون أقل من 0',

            'subscription_type.required' => 'نوع الاشتراك مطلوب',
            'subscription_type.in' => 'نوع الاشتراك يجب أن يكون شهري أو سنوي',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }
        if ($request->subscription_type === 'monthly') {
            if($request->paid_amount >=$request->monthly_rent){
                $rent = Rent::create([
                    'company_id' => Auth::user()->company_id,
                    'customer_id' => $request->customer_id,
                    'start_date' => $request->start_date,
                    'end_date' => $request->end_date,
                    'monthly_rent' => $request->monthly_rent,
                    'paid_amount' => 0,
                    'subscription_type' => $request->subscription_type,
                    'next_rent_date' => \Carbon\Carbon::parse($request->start_date)->addMonth(2),
                    'flag'=>2,
                ]);
            }else{
             $rent = Rent::create([
                'company_id' => Auth::user()->company_id,
                'customer_id' => $request->customer_id,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'monthly_rent' => $request->monthly_rent,
                'paid_amount' => $request->paid_amount,
                'subscription_type' => $request->subscription_type,
                'next_rent_date' => \Carbon\Carbon::parse($request->start_date)->addMonth(),
            ]);
            }

        } else {
             if($request->paid_amount >=$request->monthly_rent){
            $rent = Rent::create([
                'company_id' => Auth::user()->company_id,
                'customer_id' => $request->customer_id,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'monthly_rent' => $request->monthly_rent,
                'paid_amount' => $request->paid_amount,
                'subscription_type' => $request->subscription_type,
                'next_rent_date' => \Carbon\Carbon::parse($request->start_date)->addYear(2),
                'flag'=>2,
            ]);
        }
        else{
            $rent = Rent::create([
                'company_id' => Auth::user()->company_id,
                'customer_id' => $request->customer_id,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'monthly_rent' => $request->monthly_rent,
                'paid_amount' => $request->paid_amount,
                'subscription_type' => $request->subscription_type,
                'next_rent_date' => \Carbon\Carbon::parse($request->start_date)->addYear(),
            ]);
        }
        }


        return response()->json([
            'status' => 'success',
            'message' => Auth::user()->system_type === 'gym' ? 'تم إنشاء الاشتراك' : 'تم إنشاء عقد الإيجار',
            'id' => $rent->id,
        ], 200);
    }

    public function update(Request $request, $id)
    {
        $rent = Rent::where('company_id', Auth::user()->company_id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|exists:customer_retail_flows,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'monthly_rent' => 'required|numeric|min:0',
            'subscription_type' => 'required|in:monthly,yearly',
        ], [
            'customer_id.required' => 'العميل مطلوب',
            'customer_id.exists' => 'العميل غير موجود',

            'start_date.required' => 'تاريخ البداية مطلوب',
            'start_date.date' => 'تاريخ البداية غير صالح',

            'end_date.required' => 'تاريخ النهاية مطلوب',
            'end_date.date' => 'تاريخ النهاية غير صالح',
            'end_date.after_or_equal' => 'تاريخ النهاية يجب أن يكون مساويًا أو بعد تاريخ البداية',

            'monthly_rent.required' => 'الإيجار الشهري مطلوب',
            'monthly_rent.numeric' => 'الإيجار الشهري يجب أن يكون رقمًا',
            'monthly_rent.min' => 'الإيجار الشهري لا يمكن أن يكون أقل من 0',

            'paid_amount.required' => 'المبلغ المدفوع مطلوب',
            'paid_amount.numeric' => 'المبلغ المدفوع يجب أن يكون رقمًا',
            'paid_amount.min' => 'المبلغ المدفوع لا يمكن أن يكون أقل من 0',

            'subscription_type.required' => 'نوع الاشتراك مطلوب',
            'subscription_type.in' => 'نوع الاشتراك يجب أن يكون شهري أو سنوي',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }
        if ($rent->start_date !== $request->start_date) {
            if ($request->subscription_type === 'monthly') {

                $rent->update([
                    'customer_id' => $request->customer_id,
                    'start_date' => $request->start_date,
                    'end_date' => $request->end_date,
                    'monthly_rent' => $request->monthly_rent,
                    'subscription_type' => $request->subscription_type,
                    'next_rent_date' => \Carbon\Carbon::parse($request->start_date)->addMonth($rent->flag),
                ]);
            } else {
                $rent->update([
                    'customer_id' => $request->customer_id,
                    'start_date' => $request->start_date,
                    'end_date' => $request->end_date,
                    'monthly_rent' => $request->monthly_rent,
                    'subscription_type' => $request->subscription_type,
                    'next_rent_date' => \Carbon\Carbon::parse($request->start_date)->addYear($rent->flag),
                ]);
            }
        }else{
            $rent->update([
                'customer_id' => $request->customer_id,
                'end_date' => $request->end_date,
                'monthly_rent' => $request->monthly_rent,
                'subscription_type' => $request->subscription_type,
            ]);
        }


        return response()->json([
            'status' => 'success',
            'message' => Auth::user()->system_type === 'gym' ? 'تم تحديث الاشتراك' : 'تم تحديث عقد الإيجار',
        ], 200);
    }

    public function destroy($id)
    {
        $rent = Rent::where('company_id', Auth::user()->company_id)->findOrFail($id);
        $rent->delete();

        return response()->json([
            'status' => 'success',
            'message' => Auth::user()->system_type === 'gym' ? 'تم حذف الاشتراك' : 'تم حذف عقد الإيجار',
        ], 200);
    }

    public function exportRentsPDF()
    {
        $rents = Rent::with('customer')
            ->where('company_id', Auth::user()->company_id)
            ->get();

        $pdf = new TCPDF('L', 'mm', 'A4', true, 'UTF-8', false);

        if (Auth::user()->system_type === 'gym') {
            $pdf->SetCreator('نظام إدارة الاشتراكات');
            $pdf->SetAuthor('النظام');
            $pdf->SetTitle('تقرير الاشتراكات');
            $pdf->SetSubject('تقرير الاشتراكات');
        } else {
            $pdf->SetCreator('نظام إدارة الإيجارات');
            $pdf->SetAuthor('النظام');
            $pdf->SetTitle('تقرير الإيجارات');
            $pdf->SetSubject('تقرير الإيجارات');
        }

        $pdf->SetMargins(10, 15, 10);
        $pdf->SetAutoPageBreak(true, 15);
        $pdf->AddPage();

        $pdf->SetFont('aealarabiya', 'B', 16);
        $title = Auth::user()->system_type === 'gym' ? 'تقرير الاشتراكات' : 'تقرير الإيجارات';
        $pdf->Cell(0, 15, $title, 0, 1, 'C');
        $pdf->Ln(5);

        $pdf->SetFont('aealarabiya', '', 12);
        $pdf->Cell(0, 8, 'تاريخ التقرير: ' . date('d/m/Y'), 0, 1, 'C');
        $countLabel = Auth::user()->system_type === 'gym' ? 'إجمالي الاشتراكات' : 'إجمالي الإيجارات';
        $pdf->Cell(0, 8, $countLabel . ': ' . $rents->count(), 0, 1, 'C');
        $pdf->Ln(10);

        $pdf->SetFont('aealarabiya', 'B', 10);
        $pdf->SetFillColor(240, 240, 240);
        $pdf->SetTextColor(0, 0, 0);
        $pdf->SetDrawColor(128, 128, 128);
        $pdf->SetLineWidth(0.3);

        $widths = [8, 35, 30, 25, 25, 25, 25, 25, 18];

        if (Auth::user()->system_type === 'gym') {
            $headers = ['#', 'العميل (المشترك)', 'قيمة الاشتراك الشهري', 'تاريخ البداية', 'تاريخ النهاية', 'تاريخ السداد القادم', 'المبلغ المدفوع', 'نوع الاشتراك'];
        } else {
            $headers = ['#', 'العميل (المستأجر)', 'قيمة الإيجار الشهري', 'تاريخ البداية', 'تاريخ النهاية', 'تاريخ السداد القادم', 'المبلغ المدفوع', 'نوع الاشتراك'];
        }

        foreach ($headers as $i => $header) {
            $pdf->Cell($widths[$i], 10, $header, 1, 0, 'C', true);
        }
        $pdf->Ln();

        $pdf->SetFont('aealarabiya', '', 9);
        $fill = false;

        foreach ($rents as $index => $rent) {
            $pdf->SetFillColor($fill ? 248 : 255, $fill ? 249 : 255, $fill ? 250 : 255);

            $subscriptionType = $rent->subscription_type === 'monthly' ? 'شهري' :
                                ($rent->subscription_type === 'yearly' ? 'سنوي' : 'غير محدد');
            $customerName = $rent->customer->name ?? 'غير محدد';
            $monthlyRent = number_format((float)$rent->monthly_rent, 2) . ' ج.م';
            $paidAmount = number_format((float)$rent->paid_amount, 2) . ' ج.م';
            $startDate = $rent->start_date ? $rent->start_date->format('d/m/Y') : '-';
            $endDate = $rent->end_date ? $rent->end_date->format('d/m/Y') : '-';
            $nextRentDate = $rent->next_rent_date ?? '-';

            $pdf->Cell($widths[0], 6, $index + 1, 1, 0, 'C', $fill);
            $pdf->Cell($widths[1], 6, $customerName, 1, 0, 'R', $fill);
            $pdf->Cell($widths[2], 6, $monthlyRent, 1, 0, 'C', $fill);
            $pdf->Cell($widths[3], 6, $startDate, 1, 0, 'C', $fill);
            $pdf->Cell($widths[4], 6, $endDate, 1, 0, 'C', $fill);
            $pdf->Cell($widths[5], 6, $nextRentDate, 1, 0, 'C', $fill);
            $pdf->Cell($widths[6], 6, $paidAmount, 1, 0, 'C', $fill);
            $pdf->Cell($widths[7], 6, $subscriptionType, 1, 1, 'C', $fill);

            $fill = !$fill;

            if ($pdf->GetY() + 10 > 190) {
                $pdf->AddPage();
                $pdf->SetFont('aealarabiya', 'B', 10);
                $pdf->SetFillColor(240, 240, 240);
                foreach ($headers as $i => $header) {
                    $pdf->Cell($widths[$i], 10, $header, 1, 0, 'C', true);
                }
                $pdf->Ln();
                $pdf->SetFont('aealarabiya', '', 9);
            }
        }

        $pdf->Ln(10);
        $pdf->SetFont('aealarabiya', '', 8);
        $pdf->SetTextColor(128, 128, 128);
        $pdf->Cell(0, 5, 'التاريخ والوقت: ' . date('d/m/Y H:i:s'), 0, 1, 'C');

        $fileName = (Auth::user()->system_type === 'gym' ? 'تقرير_الاشتراكات_' : 'تقرير_عقود_الإيجار_') . date('Y-m-d') . '.pdf';

        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="' . $fileName . '"');
        header('Cache-Control: private, max-age=0, must-revalidate');
        header('Pragma: public');

        $pdf->Output($fileName, 'D');
        exit;
    }



public function exportRentsExcel()
{
    $rents = Rent::with('customer')
        ->where('company_id', Auth::user()->company_id)
        ->get();

    $fileName = (Auth::user()->system_type === 'gym' ? 'الاشتراكات_' : 'عقود_الإيجار_') . date('Y-m-d') . '.xlsx';

    // إنشاء مستند جديد
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->setTitle(Auth::user()->system_type === 'gym' ? 'الاشتراكات' : 'الإيجارات');
    $sheet->setRightToLeft(true);

    // تعريف الرؤوس
    $headers = [
        '#',
        Auth::user()->system_type === 'gym' ? 'رقم الاشتراك' : 'رقم العقد',
        Auth::user()->system_type === 'gym' ? 'العميل (المشترك)' : 'العميل (المستأجر)',
        Auth::user()->system_type === 'gym' ? 'قيمة الاشتراك الشهري' : 'قيمة الإيجار الشهري',
        'تاريخ البداية',
        'تاريخ النهاية',
        'تاريخ السداد القادم',
        'المبلغ المدفوع',
        'نوع الاشتراك'
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
    foreach ($rents as $index => $rent) {
        $col = 'A';

        // #
        $sheet->setCellValue($col++ . $row, $index + 1);

        // رقم الاشتراك/العقد
        $sheet->setCellValue($col++ . $row, $rent->id);

        // العميل
        $sheet->setCellValue($col++ . $row, $rent->customer->name ?? '-');

        // قيمة الاشتراك/الإيجار الشهري
        $sheet->setCellValue($col++ . $row, number_format((float)$rent->monthly_rent, 2, '.', ''));

        // تاريخ البداية
        $sheet->setCellValue($col++ . $row, $rent->start_date ? $rent->start_date->format('Y-m-d') : '-');

        // تاريخ النهاية
        $sheet->setCellValue($col++ . $row, $rent->end_date ? $rent->end_date->format('Y-m-d') : '-');

        // تاريخ السداد القادم
        $sheet->setCellValue($col++ . $row, $rent->next_rent_date ? $rent->next_rent_date : '-');

        // المبلغ المدفوع
        $sheet->setCellValue($col++ . $row, number_format((float)$rent->paid_amount, 2, '.', ''));

        // نوع الاشتراك
        $subscriptionType = $rent->subscription_type === 'monthly' ? 'شهري' : ($rent->subscription_type === 'yearly' ? 'سنوي' : 'غير محدد');
        $sheet->setCellValue($col . $row, $subscriptionType);

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

    if ($rents->count() > 0) {
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

    public function exportRentPDF($id)
    {
        $rent = Rent::with('customer')
            ->where('company_id', Auth::user()->company_id)
            ->find($id);

        if (!$rent) {
            throw new NotFoundHttpException('العقد غير موجود');
        }

        $pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);

        if (Auth::user()->system_type === 'gym') {
            $pdf->SetCreator('نظام إدارة الاشتراكات');
            $pdf->SetAuthor('النظام');
            $pdf->SetTitle('عقد اشتراك #' . $rent->id);
        } else {
            $pdf->SetCreator('نظام إدارة الإيجارات');
            $pdf->SetAuthor('النظام');
            $pdf->SetTitle('عقد إيجار #' . $rent->id);
        }

        $pdf->AddPage();
        $pdf->SetFont('dejavusans', '', 12);

        $subscriptionType = $rent->subscription_type === 'monthly' ? 'شهري' : ($rent->subscription_type === 'yearly' ? 'سنوي' : 'غير محدد');

        $html = '<div style="direction:rtl; font-family:dejavusans;">';

        if (Auth::user()->system_type === 'gym') {
            $html .= '<h1 style="text-align:center;">عقد اشتراك</h1>';
            $html .= '<p><strong>رقم الاشتراك:</strong> #' . $rent->id . '</p>';
            $html .= '<p><strong>العميل (المشترك):</strong> ' . ($rent->customer->name ?? '-') . '</p>';
            $html .= '<p><strong>قيمة الاشتراك :</strong> ' . number_format((float)$rent->monthly_rent, 2) . ' ج.م</p>';
        } else {
            $html .= '<h1 style="text-align:center;">عقد إيجار</h1>';
            $html .= '<p><strong>رقم العقد:</strong> #' . $rent->id . '</p>';
            $html .= '<p><strong>العميل (المستأجر):</strong> ' . ($rent->customer->name ?? '-') . '</p>';
            $html .= '<p><strong>قيمة الإيجار :</strong> ' . number_format((float)$rent->monthly_rent, 2) . ' ج.م</p>';
        }

        $html .= '<p><strong>تاريخ البداية:</strong> ' . ($rent->start_date ? $rent->start_date->format('Y-m-d') : '-') . '</p>';
        $html .= '<p><strong>تاريخ النهاية:</strong> ' . ($rent->end_date ? $rent->end_date->format('Y-m-d') : '-') . '</p>';
        $html .= '<p><strong>المبلغ المدفوع:</strong> ' . number_format((float)$rent->paid_amount, 2) . ' ج.م</p>';
        $html .= '<p><strong>نوع الاشتراك:</strong> ' . $subscriptionType . '</p>';
        $html .= '<hr />';
        $html .= '<p style="text-align:center;">شكراً لتعاملكم معنا</p>';
        $html .= '</div>';

        $pdf->writeHTML($html, true, false, true, false, '');

        $fileName = (Auth::user()->system_type === 'gym' ? 'عقد_اشتراك_' : 'عقد_إيجار_') . $rent->id . '_' . date('Y-m-d') . '.pdf';

        $pdf->Output($fileName, 'D');
        exit;
    }


   public function paid(Request $request, $id){
    $rent=Rent::where('company_id',Auth::user()->company_id)->findOrFail($id);
     $validator = Validator::make($request->all(), [
            'paid_amount' => 'required|numeric|min:0',]
     );
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }
         if($request->paid_amount >= $rent->monthly_rent){
            $rent->update([
                'paid_amount' => $request->paid_amount,
                'flag'=>$rent->flag+1,
            ]);
            if ($rent->subscription_type === 'monthly') {
            $rent->update([
                'next_rent_date' => \Carbon\Carbon::parse($rent->start_date)->addMonth($rent->flag),
                'paid_amount' =>0,
            ]);
        }else{
            $rent->update([
                'next_rent_date' => \Carbon\Carbon::parse($rent->start_date)->addYears($rent->flag),
                'paid_amount' =>0,
            ]);
            }
         }else{
            $rent->update([
                'paid_amount' => $request->paid_amount,
            ]);
         }
    }
}
