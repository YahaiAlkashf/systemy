<?php

namespace App\Http\Controllers;

use App\Models\Rent;
use App\Models\CustomerRetailFlow;
use Elibyy\TCPDF\TCPDF;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

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

        $rent = Rent::create([
            'company_id' => Auth::user()->company_id,
            'customer_id' => $request->customer_id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'monthly_rent' => $request->monthly_rent,
            'paid_amount' => $request->paid_amount,
            'subscription_type' => $request->subscription_type,
        ]);

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

        $rent->update([
            'customer_id' => $request->customer_id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'monthly_rent' => $request->monthly_rent,
            'paid_amount' => $request->paid_amount,
            'subscription_type' => $request->subscription_type,
        ]);

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

        if(Auth::user()->system_type === 'gym'){
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
        if(Auth::user()->system_type === 'gym'){
            $pdf->Cell(0, 15, 'تقرير الاشتراكات', 0, 1, 'C');
        } else {
            $pdf->Cell(0, 15, 'تقرير الإيجارات', 0, 1, 'C');
        }
        $pdf->Ln(5);

        $pdf->SetFont('aealarabiya', '', 12);
        $pdf->Cell(0, 8, 'تاريخ التقرير: ' . date('d/m/Y'), 0, 1, 'C');

        if(Auth::user()->system_type === 'gym'){
            $pdf->Cell(0, 8, 'إجمالي الاشتراكات: ' . $rents->count() . ' اشتراك', 0, 1, 'C');
        } else {
            $pdf->Cell(0, 8, 'إجمالي الإيجارات: ' . $rents->count() . ' إيجار', 0, 1, 'C');
        }
        $pdf->Ln(10);

        $pdf->SetFont('aealarabiya', 'B', 10);
        $pdf->SetFillColor(240, 240, 240);
        $pdf->SetTextColor(0, 0, 0);
        $pdf->SetDrawColor(128, 128, 128);
        $pdf->SetLineWidth(0.3);

        $widths = [10,  40, 35, 30, 30, 30, 20];

        if(Auth::user()->system_type === 'gym'){
            $headers = ['#',  'العميل (المشترك)', 'قيمة الاشتراك الشهري', 'تاريخ البداية', 'تاريخ النهاية', 'المبلغ المدفوع', 'نوع الاشتراك'];
        } else {
            $headers = ['#', 'العميل (المستأجر)', 'قيمة الإيجار الشهري', 'تاريخ البداية', 'تاريخ النهاية', 'المبلغ المدفوع', 'نوع الاشتراك'];
        }

        for ($i = 0; $i < count($headers); $i++) {
            $pdf->Cell($widths[$i], 10, $headers[$i], 1, 0, 'C', true);
        }
        $pdf->Ln();

        $pdf->SetFont('aealarabiya', '', 9);
        $fill = false;

        foreach ($rents as $index => $rent) {
            if ($fill) {
                $pdf->SetFillColor(248, 249, 250);
            } else {
                $pdf->SetFillColor(255, 255, 255);
            }

            $subscriptionType = $rent->subscription_type === 'monthly' ? 'شهري' : ($rent->subscription_type === 'yearly' ? 'سنوي' : 'غير محدد');
            $customerName = $rent->customer->name ?? 'غير محدد';
            $monthlyRent = number_format((float)$rent->monthly_rent, 2, '.', ',') . ' ج.م';
            $paidAmount = number_format((float)$rent->paid_amount, 2, '.', ',') . ' ج.م';
            $startDate = $rent->start_date ? $rent->start_date->format('d/m/Y') : '-';
            $endDate = $rent->end_date ? $rent->end_date->format('d/m/Y') : '-';

            $pdf->Cell($widths[0], 6, $index + 1, 1, 0, 'C', $fill);

            $x = $pdf->GetX();
            $y = $pdf->GetY();
            $pdf->MultiCell($widths[2], 6, $customerName, 1, 'R', $fill, 0, '', '', true, 0, false, true, 6, 'M', true);
            $pdf->SetXY($x + $widths[2], $y);

            $pdf->Cell($widths[3], 6, $monthlyRent, 1, 0, 'L', $fill);
            $pdf->Cell($widths[4], 6, $startDate, 1, 0, 'C', $fill);
            $pdf->Cell($widths[5], 6, $endDate, 1, 0, 'C', $fill);
            $pdf->Cell($widths[6], 6, $paidAmount, 1, 0, 'L', $fill);
            $pdf->Cell($widths[7], 6, $subscriptionType, 1, 1, 'C', $fill);

            $fill = !$fill;

            if ($pdf->GetY() + 10 > 190) {
                $pdf->AddPage();
                $pdf->SetFont('aealarabiya', 'B', 10);
                $pdf->SetFillColor(240, 240, 240);
                for ($i = 0; $i < count($headers); $i++) {
                    $pdf->Cell($widths[$i], 10, $headers[$i], 1, 0, 'C', true);
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

        $spreadsheet = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>
    <Workbook xmlns=\"urn:schemas-microsoft-com:office:spreadsheet\"
            xmlns:x=\"urn:schemas-microsoft-com:office:excel\"
            xmlns:ss=\"urn:schemas-microsoft-com:office:spreadsheet\"
            xmlns:html=\"http://www.w3.org/TR/REC-html40\">
    <Worksheet ss:Name=\"" . (Auth::user()->system_type === 'gym' ? "الاشتراكات" : "الإيجارات") . "\">
    <Table>
    <Row>
        <Cell><Data ss:Type=\"String\">#</Data></Cell>
        <Cell><Data ss:Type=\"String\">" . (Auth::user()->system_type === 'gym' ? "رقم الاشتراك" : "رقم العقد") . "</Data></Cell>
        <Cell><Data ss:Type=\"String\">" . (Auth::user()->system_type === 'gym' ? "العميل (المشترك)" : "العميل (المستأجر)") . "</Data></Cell>
        <Cell><Data ss:Type=\"String\">" . (Auth::user()->system_type === 'gym' ? "قيمة الاشتراك الشهري" : "قيمة الإيجار الشهري") . "</Data></Cell>
        <Cell><Data ss:Type=\"String\">تاريخ البداية</Data></Cell>
        <Cell><Data ss:Type=\"String\">تاريخ النهاية</Data></Cell>
        <Cell><Data ss:Type=\"String\">المبلغ المدفوع</Data></Cell>
        <Cell><Data ss:Type=\"String\">نوع الاشتراك</Data></Cell>
    </Row>";

        foreach ($rents as $index => $rent) {
            $subscriptionType = $rent->subscription_type === 'monthly' ? 'شهري' : ($rent->subscription_type === 'yearly' ? 'سنوي' : 'غير محدد');

            $spreadsheet .= "
        <Row>
            <Cell><Data ss:Type=\"Number\">" . ($index + 1) . "</Data></Cell>
            <Cell><Data ss:Type=\"Number\">{$rent->id}</Data></Cell>
            <Cell><Data ss:Type=\"String\">" . ($rent->customer->name ?? '-') . "</Data></Cell>
            <Cell><Data ss:Type=\"Number\">" . number_format((float)$rent->monthly_rent, 2, '.', '') . "</Data></Cell>
            <Cell><Data ss:Type=\"String\">" . ($rent->start_date ? $rent->start_date->format('Y-m-d') : '-') . "</Data></Cell>
            <Cell><Data ss:Type=\"String\">" . ($rent->end_date ? $rent->end_date->format('Y-m-d') : '-') . "</Data></Cell>
            <Cell><Data ss:Type=\"Number\">" . number_format((float)$rent->paid_amount, 2, '.', '') . "</Data></Cell>
            <Cell><Data ss:Type=\"String\">{$subscriptionType}</Data></Cell>
        </Row>";
        }

        $spreadsheet .= "
    </Table>
    </Worksheet>
    </Workbook>";

        $headers = [
            'Content-Type' => 'application/vnd.ms-excel',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
        ];

        return response($spreadsheet, 200, $headers);
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
}
