<?php

namespace App\Http\Controllers\RetailFlow;

use App\Http\Controllers\Controller;
use App\Models\InvoiceRetailFlow;
use App\Models\CustomerRetailFlow;
use App\Models\InvoiceItemRetailFlow;
use App\Models\ProductRetailFlow;
use Elibyy\TCPDF\TCPDF;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InvoiceRetailFlowController extends Controller
{
    public function index()
    {
        $invoices = InvoiceRetailFlow::with('customer', 'items.product')
            ->where('company_id', Auth::user()->company_id)
            ->get();

        return response()->json([
            'status' => 'success',
            'invoices' => $invoices
        ], 200);
    }

public function store(Request $request)
{
    try {
        $systemType = Auth::user()->system_type;

        $baseRules = [
            'customer_id' => 'nullable|exists:customer_retail_flows,id',
            'products' => 'array|required|min:1',
            'prices' => 'array|required|min:1',
            'paid_amount' => 'nullable|numeric|min:0',
            'total_profit' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
        ];

        if ($systemType === "realEstate" || $systemType === "retail" || $systemType === "delivery") {
            $baseRules['quantities'] = 'array|required';
        }

        $customMessages = [
            'customer_id.exists' => 'العميل المحدد غير موجود',
            'products.required' => 'المنتجات مطلوبة',
            'products.array' => 'يجب أن تكون المنتجات مصفوفة',
            'products.min' => 'يجب إضافة منتج واحد على الأقل',
            'prices.required' => 'الأسعار مطلوبة',
            'prices.array' => 'يجب أن تكون الأسعار مصفوفة',
            'prices.min' => 'يجب إضافة سعر واحد على الأقل',
            'paid_amount.numeric' => 'المبلغ المدفوع يجب أن يكون رقماً',
            'paid_amount.min' => 'المبلغ المدفوع لا يمكن أن يكون سالباً',
            'total_profit.required' => 'إجمالي الربح مطلوب',
            'total_profit.numeric' => 'إجمالي الربح يجب أن يكون رقماً',
            'total_profit.min' => 'إجمالي الربح لا يمكن أن يكون سالباً',
            'total.required' => 'الإجمالي مطلوب',
            'total.numeric' => 'الإجمالي يجب أن يكون رقماً',
            'total.min' => 'الإجمالي لا يمكن أن يكون سالباً',
            'quantities.required' => 'الكميات مطلوبة',
            'quantities.array' => 'يجب أن تكون الكميات مصفوفة',
        ];

        $validator = Validator::make($request->all(), $baseRules, $customMessages);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        if (($systemType === "realEstate" || $systemType === "retail" || $systemType === "delivery") &&
            (count($request->products) !== count($request->quantities) ||
                count($request->products) !== count($request->prices))
        ) {
            return response()->json([
                'status' => 'error',
                'errors' => ['بيانات المنتجات غير متطابقة (عدد المنتجات، الكميات، والأسعار يجب أن يكون متساوياً)']
            ], 422);
        }

        DB::beginTransaction();

        try {
            $invoiceData = [
                'company_id' => Auth::user()->company_id,
                'customer_id' => $request->customer_id,
                'total_profit' => (float) $request->total_profit,
                'total' => (float) $request->total,
                'paid_amount' => (float) ($request->paid_amount ?? 0),
            ];

            if ($invoiceData['paid_amount'] == 0) {
                $invoiceData['status'] = 'pending';
            } elseif ($invoiceData['paid_amount'] < $invoiceData['total']) {
                $invoiceData['status'] = 'partial';
            } else {
                $invoiceData['status'] = 'paid';
            }

            $invoice = InvoiceRetailFlow::create($invoiceData);

            foreach ($request->products as $index => $productId) {
                $product = ProductRetailFlow::find($productId);

                if (!$product) {
                    throw new Exception('المنتج غير موجود: ' . $productId);
                }

                $itemData = [
                    'invoice_id' => $invoice->id,
                    'product_id' => $productId,
                    'price' => (float) $request->prices[$index],
                ];

                if ($systemType === "retail" || $systemType === "delivery") {
                    $quantity = (int) $request->quantities[$index];

                    if ($systemType === "retail" && (int) $product->quantity < $quantity) {
                        throw new Exception('الكمية غير كافية للمنتج: ' . $product->name);
                    }

                    $itemData['quantity'] = $quantity;

                    if ($systemType === "retail") {
                        $currentQuantity = (int) $product->quantity;
                        $product->quantity = $currentQuantity - $quantity;
                        $product->save();
                    }
                }

                InvoiceItemRetailFlow::create($itemData);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'تم إنشاء الفاتورة بنجاح',
                'invoice_id' => $invoice->id
            ], 200);
        } catch (Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'errors' => [$e->getMessage()]
            ], 422);
        }
    } catch (Exception $e) {
        return response()->json([
            'status' => 'error',
            'errors' => ['حدث خطأ غير متوقع']
        ], 500);
    }
}

public function update(Request $request, $id)
{
    try {
        $systemType = Auth::user()->system_type;
        $invoice = InvoiceRetailFlow::find($id);

        if (!$invoice) {
            return response()->json([
                'status' => 'error',
                'errors' => ['الفاتورة غير موجودة']
            ], 404);
        }

        $baseRules = [
            'customer_id' => 'nullable|exists:customer_retail_flows,id',
            'products' => 'array|required|min:1',
            'prices' => 'array|required|min:1',
            'paid_amount' => 'nullable|numeric|min:0',
            'total_profit' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
        ];

        if ($systemType === "retail" || $systemType === "delivery") {
            $baseRules['quantities'] = 'array|required';
        }

        $customMessages = [
            'customer_id.exists' => 'العميل المحدد غير موجود',
            'products.required' => 'المنتجات مطلوبة',
            'products.array' => 'يجب أن تكون المنتجات مصفوفة',
            'products.min' => 'يجب إضافة منتج واحد على الأقل',
            'prices.required' => 'الأسعار مطلوبة',
            'prices.array' => 'يجب أن تكون الأسعار مصفوفة',
            'prices.min' => 'يجب إضافة سعر واحد على الأقل',
            'paid_amount.numeric' => 'المبلغ المدفوع يجب أن يكون رقماً',
            'paid_amount.min' => 'المبلغ المدفوع لا يمكن أن يكون سالباً',
            'total_profit.required' => 'إجمالي الربح مطلوب',
            'total_profit.numeric' => 'إجمالي الربح يجب أن يكون رقماً',
            'total_profit.min' => 'إجمالي الربح لا يمكن أن يكون سالباً',
            'total.required' => 'الإجمالي مطلوب',
            'total.numeric' => 'الإجمالي يجب أن يكون رقماً',
            'total.min' => 'الإجمالي لا يمكن أن يكون سالباً',
            'quantities.required' => 'الكميات مطلوبة',
            'quantities.array' => 'يجب أن تكون الكميات مصفوفة',
        ];

        $validator = Validator::make($request->all(), $baseRules, $customMessages);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        if (($systemType === "realEstate" || $systemType === "retail" || $systemType === "delivery") &&
            (count($request->products) !== count($request->quantities) ||
                count($request->products) !== count($request->prices))
        ) {
            return response()->json([
                'status' => 'error',
                'errors' => ['بيانات المنتجات غير متطابقة (عدد المنتجات، الكميات، والأسعار يجب أن يكون متساوياً)']
            ], 422);
        }

        DB::beginTransaction();

        try {
            $invoiceData = [
                'customer_id' => $request->customer_id,
                'total_profit' => (float) $request->total_profit,
                'total' => (float) $request->total,
                'paid_amount' => (float) ($request->paid_amount ?? 0),
            ];

            if ($invoiceData['paid_amount'] == 0) {
                $invoiceData['status'] = 'pending';
            } elseif ($invoiceData['paid_amount'] < $invoiceData['total']) {
                $invoiceData['status'] = 'partial';
            } elseif ($invoiceData['paid_amount'] > $invoiceData['total']) {
                throw new Exception('المبلغ المدفوع لا يمكن أن يكون أكبر من الإجمالي');
            } else {
                $invoiceData['status'] = 'paid';
            }

            $invoice->update($invoiceData);

            if ($systemType === "retail") {
                foreach ($invoice->items as $item) {
                    $product = ProductRetailFlow::find($item->product_id);
                    if ($product) {
                        $currentQuantity = (int) $product->quantity;
                        $oldItemQuantity = (int) $item->quantity;
                        $product->quantity = $currentQuantity + $oldItemQuantity;
                        $product->save();
                    }
                }
            }

            $invoice->items()->delete();

            foreach ($request->products as $index => $productId) {
                $product = ProductRetailFlow::find($productId);

                if (!$product) {
                    throw new Exception('المنتج غير موجود: ' . $productId);
                }

                $itemData = [
                    'invoice_id' => $invoice->id,
                    'product_id' => $productId,
                    'price' => (float) $request->prices[$index],
                ];

                if ($systemType === "retail" || $systemType === "delivery" || $systemType === "realEstate") {
                    $quantity = (int) $request->quantities[$index];

                    if ($systemType === "retail" && (int) $product->quantity < $quantity) {
                        throw new Exception('الكمية غير كافية للمنتج: ' . $product->name);
                    }

                    $itemData['quantity'] = $quantity;
                    if ($systemType === "retail" || $systemType === "gym") {
                        $currentQuantity = (int) $product->quantity;
                        $product->quantity = $currentQuantity - $quantity;
                        $product->save();
                    }
                }

                InvoiceItemRetailFlow::create($itemData);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'تم تحديث الفاتورة بنجاح',
                'invoice_id' => $invoice->id
            ], 200);
        } catch (Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'errors' => [$e->getMessage()]
            ], 422);
        }
    } catch (Exception $e) {
        return response()->json([
            'status' => 'error',
            'errors' => ['حدث خطأ غير متوقع أثناء التحديث']
        ], 500);
    }
}

    public function destroy($id)
    {
        $invoice = InvoiceRetailFlow::find($id);

        if (!$invoice) {
            return response()->json([
                'status' => 'error',
                'message' => 'الفاتورة غير موجودة'
            ], 404);
        }

        DB::transaction(function () use ($invoice) {
            $systemType = Auth::user()->system_type;

            if ($systemType === "retail" || $systemType === "realEstate" || $systemType === "delivery") {
                foreach ($invoice->items as $item) {
                    $product = ProductRetailFlow::find($item->product_id);
                    if ($product) {
                        $product->quantity += $item->quantity;
                        $product->save();
                    }
                }
            }

            $invoice->items()->delete();
            $invoice->delete();
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Invoice deleted successfully'
        ], 200);
    }

public function exportInvoicesPDF()
{
    $invoices = InvoiceRetailFlow::with('customer', 'items.product')
        ->where('company_id', Auth::user()->company_id)
        ->get();

    $user = Auth::user();
    $pdf = new TCPDF('L', 'mm', 'A4', true, 'UTF-8', false);

    $pdf->SetCreator('نظام إدارة الفواتير');
    $pdf->SetAuthor('النظام');

    $systemTitles = [
        "retail" => "تقرير فواتير المبيعات",
        "gym" => "تقرير فواتير المبيعات",
        "hotel" => "تقرير فواتير المبيعات",
        "services" => "تقرير فواتير الخدمات",
        "education" => "تقرير فواتير الدورات",
        "realEstate" => "تقرير فواتير العقارات",
        "delivery" => "تقرير فواتير التوصيل",
        "travels" => "تقرير فواتير الرحلات"
    ];

    $title = $systemTitles[$user->system_type] ?? "تقرير الفواتير";
    $pdf->SetTitle($title);
    $pdf->SetSubject($title);

    $pdf->AddPage();
    $pdf->SetFont('dejavusans', '', 10);

    $customerColumnTitle = ($user->system_type === "delivery") ? "السائق" : "العميل";

    // ==================== الهيدر ====================
    $html = '<h1 style="text-align:center; font-family:dejavusans;">' . $title . '</h1>';
    $html .= '<p style="text-align:center;">تاريخ التقرير: ' . date('Y-m-d') . '</p>';
    $html .= '<p style="text-align:center;">إجمالي الفواتير: ' . $invoices->count() . '</p>';

    // ==================== جدول الفواتير ====================
    $html .= '<table border="1" cellpadding="5" style="width:100%; border-collapse:collapse; direction:rtl; text-align:center; font-family:dejavusans;">
        <thead>
            <tr style="background-color:#f2f2f2; font-weight:bold;">
                <th>#</th>
                <th>' . $customerColumnTitle . '</th>
                <th>الإجمالي</th>
                <th>المدفوع</th>
                <th>المتبقي</th>';

    if ($user->system_type !== "delivery") {
        $html .= '<th>صافي الربح</th>';
    }

    $html .= '<th>الحالة</th>
              <th>عدد العناصر</th>
              <th>تاريخ الإنشاء</th>
            </tr>
        </thead>';

    $html .= '<tbody>';

    $totalSum = 0;
    $totalPaid = 0;
    $totalProfit = 0;

    foreach ($invoices as $index => $invoice) {
        $remaining = $invoice->total - $invoice->paid_amount;
        $itemsCount = $invoice->items->count();

        $totalSum += $invoice->total;
        $totalPaid += $invoice->paid_amount;
        $totalProfit += $invoice->total_profit;

        $html .= '<tr>
                    <td>' . ($index + 1) . '</td>
                    <td>' . ($invoice->customer->name ?? 'نقدي') . '</td>
                    <td>' . number_format($invoice->total, 2) . '</td>
                    <td>' . number_format($invoice->paid_amount, 2) . '</td>
                    <td>' . number_format($remaining, 2) . '</td>';

        if ($user->system_type !== "delivery") {
            $html .= '<td>' . number_format($invoice->total_profit, 2) . '</td>';
        }

        $html .= '<td>' . $this->getStatusArabic($invoice->status) . '</td>
                  <td>' . $itemsCount . '</td>
                  <td>' . $invoice->created_at->format('Y-m-d') . '</td>
                </tr>';
    }

    $html .= '</tbody>';

    // ==================== الفوتر (الإجماليات) ====================
    $colspan = ($user->system_type !== "delivery") ? 5 : 4; // عدد الأعمدة قبل قيمة الإجمالي

    $html .= '<tfoot>
        <tr>
            <td colspan="' . $colspan . '" style="text-align:left; font-weight:bold;">إجمالي الفواتير:</td>
            <td style="font-weight:bold;">' . number_format($totalSum, 2) . '</td>
            <td colspan="' . ($user->system_type !== "delivery" ? 2 : 3) . '"></td>
        </tr>
        <tr>
            <td colspan="' . $colspan . '" style="text-align:left; font-weight:bold;">إجمالي المدفوع:</td>
            <td style="font-weight:bold;">' . number_format($totalPaid, 2) . '</td>
            <td colspan="' . ($user->system_type !== "delivery" ? 2 : 3) . '"></td>
        </tr>
        <tr>
            <td colspan="' . $colspan . '" style="text-align:left; font-weight:bold;">إجمالي المتبقي:</td>
            <td style="font-weight:bold;">' . number_format($totalSum - $totalPaid, 2) . '</td>
            <td colspan="' . ($user->system_type !== "delivery" ? 2 : 3) . '"></td>
        </tr>
    </tfoot>';

    $html .= '</table>';

    // ==================== إحصائيات إضافية ====================
    $statusCounts = ['pending' => 0, 'partial' => 0, 'paid' => 0];
    foreach ($invoices as $invoice) {
        $statusCounts[$invoice->status]++;
    }

    $html .= '<div style="margin-top:20px; text-align:left; direction:rtl;">';
    $html .= '<h3>إحصائيات الحالة:</h3>';
    $html .= '<p><strong>الفواتير المعلقة:</strong> ' . $statusCounts['pending'] . ' (' . number_format(($statusCounts['pending'] / max($invoices->count(), 1)) * 100, 1) . '%)</p>';
    $html .= '<p><strong>الفواتير المدفوعة جزئياً:</strong> ' . $statusCounts['partial'] . ' (' . number_format(($statusCounts['partial'] / max($invoices->count(), 1)) * 100, 1) . '%)</p>';
    $html .= '<p><strong>الفواتير المدفوعة بالكامل:</strong> ' . $statusCounts['paid'] . ' (' . number_format(($statusCounts['paid'] / max($invoices->count(), 1)) * 100, 1) . '%)</p>';
    $html .= '</div>';

    $pdf->writeHTML($html, true, false, true, false, '');

    $fileName = str_replace(' ', '_', $title) . '_' . date('Y-m-d') . '.pdf';
    $pdf->Output($fileName, 'D');

    exit;
}






    private function getStatusArabic($status)
    {
        $statuses = [
            'pending' => 'معلق',
            'partial' => 'جزئي',
            'paid' => 'مدفوع'
        ];

        return $statuses[$status] ?? $status;
    }

    public function exportInvoicesExcel()
    {
        $user = Auth::user();
        $invoices = InvoiceRetailFlow::with('customer', 'items.product')
            ->where('company_id', $user->company_id)
            ->get();

        $systemTitles = [
            "retail" => "فواتير_المبيعات",
            "services" => "فواتير_الخدمات",
            "education" => "فواتير_الدورات",
            "realEstate" => "فواتير_العقارات",
            "delivery" => "فواتير_التوصيل",
            "travels" => "فواتير_الرحلات"
        ];

        $fileTitle = $systemTitles[$user->system_type] ?? "فواتير";
        $fileName = $fileTitle . '_' . date('Y-m-d') . '.xlsx';

        $customerColumnTitle = ($user->system_type === "delivery") ? "السائق" : "العميل";

        $spreadsheet = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>
        <Workbook xmlns=\"urn:schemas-microsoft-com:office:spreadsheet\"
                xmlns:x=\"urn:schemas-microsoft-com:office:excel\"
                xmlns:ss=\"urn:schemas-microsoft-com:office:spreadsheet\"
                xmlns:html=\"http://www.w3.org/TR/REC-html40\">
        <Worksheet ss:Name=\"الفواتير\">
        <Table>
        <Row>
            <Cell><Data ss:Type=\"String\">#</Data></Cell>
            <Cell><Data ss:Type=\"String\">رقم الفاتورة</Data></Cell>
            <Cell><Data ss:Type=\"String\">{$customerColumnTitle}</Data></Cell>
            <Cell><Data ss:Type=\"String\">الإجمالي</Data></Cell>
            <Cell><Data ss:Type=\"String\">المدفوع</Data></Cell>
            <Cell><Data ss:Type=\"String\">المتبقي</Data></Cell>";

            if ($user->system_type !== "delivery") {
                $spreadsheet .= "<Cell><Data ss:Type=\"String\">صافي الربح</Data></Cell>";
            }

            $spreadsheet .= "
            <Cell><Data ss:Type=\"String\">الحالة</Data></Cell>
            <Cell><Data ss:Type=\"String\">عدد العناصر</Data></Cell>
            <Cell><Data ss:Type=\"String\">تاريخ الإنشاء</Data></Cell>
        </Row>";

        $totalSum = 0;
        $totalPaid = 0;
        $totalProfit = 0;
        $totalInvoices = $invoices->count();

        foreach ($invoices as $index => $invoice) {
            $remaining = $invoice->total - $invoice->paid_amount;
            $itemsCount = $invoice->items->count();

            $totalSum += $invoice->total;
            $totalPaid += $invoice->paid_amount;
            $totalProfit += $invoice->total_profit;

            $spreadsheet .= "
        <Row>
            <Cell><Data ss:Type=\"Number\">" . ($index + 1) . "</Data></Cell>
            <Cell><Data ss:Type=\"Number\">{$invoice->id}</Data></Cell>
            <Cell><Data ss:Type=\"String\">" . ($invoice->customer->name ?? 'نقدي') . "</Data></Cell>
            <Cell><Data ss:Type=\"Number\">" . number_format($invoice->total, 2, '.', '') . "</Data></Cell>
            <Cell><Data ss:Type=\"Number\">" . number_format($invoice->paid_amount, 2, '.', '') . "</Data></Cell>
            <Cell><Data ss:Type=\"Number\">" . number_format($remaining, 2, '.', '') . "</Data></Cell>";

            if ($user->system_type !== "delivery") {
                $spreadsheet .= "<Cell><Data ss:Type=\"Number\">" . number_format($invoice->total_profit, 2, '.', '') . "</Data></Cell>";
            }

            $spreadsheet .= "
            <Cell><Data ss:Type=\"String\">" . $this->getStatusArabic($invoice->status) . "</Data></Cell>
            <Cell><Data ss:Type=\"Number\">{$itemsCount}</Data></Cell>
            <Cell><Data ss:Type=\"String\">" . $invoice->created_at->format('Y-m-d') . "</Data></Cell>
        </Row>";
        }

        $spreadsheet .= "
        <Row>
            <Cell><Data ss:Type=\"String\"></Data></Cell>
            <Cell><Data ss:Type=\"String\"></Data></Cell>
            <Cell><Data ss:Type=\"String\"><B>الإجماليات</B></Data></Cell>
            <Cell><Data ss:Type=\"Number\">" . number_format($totalSum, 2, '.', '') . "</Data></Cell>
            <Cell><Data ss:Type=\"Number\">" . number_format($totalPaid, 2, '.', '') . "</Data></Cell>
            <Cell><Data ss:Type=\"Number\">" . number_format($totalSum - $totalPaid, 2, '.', '') . "</Data></Cell>";

        if ($user->system_type !== "delivery") {
            $spreadsheet .= "<Cell><Data ss:Type=\"Number\">" . number_format($totalProfit, 2, '.', '') . "</Data></Cell>";
        } else {
            $spreadsheet .= "<Cell><Data ss:Type=\"String\"></Data></Cell>";
        }

        $spreadsheet .= "
            <Cell><Data ss:Type=\"String\"></Data></Cell>
            <Cell><Data ss:Type=\"Number\">{$totalInvoices}</Data></Cell>
            <Cell><Data ss:Type=\"String\"></Data></Cell>
        </Row>";

        $averageTotal = $totalInvoices > 0 ? $totalSum / $totalInvoices : 0;
        $spreadsheet .= "
        <Row>
            <Cell><Data ss:Type=\"String\"></Data></Cell>
            <Cell><Data ss:Type=\"String\"></Data></Cell>
            <Cell><Data ss:Type=\"String\"><B>المتوسطات</B></Data></Cell>
            <Cell><Data ss:Type=\"Number\">" . number_format($averageTotal, 2, '.', '') . "</Data></Cell>
            <Cell><Data ss:Type=\"Number\">" . number_format($totalPaid / max($totalInvoices, 1), 2, '.', '') . "</Data></Cell>
            <Cell><Data ss:Type=\"Number\">" . number_format(($totalSum - $totalPaid) / max($totalInvoices, 1), 2, '.', '') . "</Data></Cell>";

        if ($user->system_type !== "delivery") {
            $averageProfit = $totalInvoices > 0 ? $totalProfit / $totalInvoices : 0;
            $spreadsheet .= "<Cell><Data ss:Type=\"Number\">" . number_format($averageProfit, 2, '.', '') . "</Data></Cell>";
        } else {
            $spreadsheet .= "<Cell><Data ss:Type=\"String\"></Data></Cell>";
        }

        $spreadsheet .= "
            <Cell><Data ss:Type=\"String\"></Data></Cell>
            <Cell><Data ss:Type=\"String\"></Data></Cell>
            <Cell><Data ss:Type=\"String\"></Data></Cell>
        </Row>";

        $spreadsheet .= "
    </Table>
    </Worksheet>";

        $spreadsheet .= "
    <Worksheet ss:Name=\"الإحصائيات\">
    <Table>
    <Row>
        <Cell><Data ss:Type=\"String\"><B>إحصائيات الفواتير</B></Data></Cell>
        <Cell><Data ss:Type=\"String\"><B>العدد</B></Data></Cell>
        <Cell><Data ss:Type=\"String\"><B>النسبة</B></Data></Cell>
    </Row>";

        $statusCounts = [
            'pending' => 0,
            'partial' => 0,
            'paid' => 0
        ];

        foreach ($invoices as $invoice) {
            $statusCounts[$invoice->status]++;
        }

        foreach ($statusCounts as $status => $count) {
            $percentage = $totalInvoices > 0 ? ($count / $totalInvoices) * 100 : 0;
            $spreadsheet .= "
        <Row>
            <Cell><Data ss:Type=\"String\">" . $this->getStatusArabic($status) . "</Data></Cell>
            <Cell><Data ss:Type=\"Number\">{$count}</Data></Cell>
            <Cell><Data ss:Type=\"Number\">" . number_format($percentage, 1, '.', '') . "%</Data></Cell>
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



    public function exportSingleInvoicePDF($id)
    {
        $invoice = InvoiceRetailFlow::with('customer', 'items.product')
            ->where('company_id', Auth::user()->company_id)
            ->where('id', $id)
            ->firstOrFail();

        $user = Auth::user();
        $pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);

        $pdf->SetCreator('نظام إدارة الفواتير');
        $pdf->SetAuthor('النظام');

        $systemTitles = [
            "retail" => "فاتورة مبيعات",
            "services" => "فاتورة خدمات",
            "education" => "فاتورة دورات",
            "realEstate" => "فاتورة عقارات",
            "delivery" => "فاتورة توصيل",
            "travels" => "فاتورة رحلات"
        ];

        $title = ($systemTitles[$user->system_type] ?? "فاتورة") ;
        $pdf->SetTitle($title);
        $pdf->SetSubject($title);

        $pdf->AddPage();
        $pdf->SetFont('dejavusans', '', 12);

        $customerColumnTitle = ($user->system_type === "delivery") ? "السائق" : "العميل";

        $html = '<h1 style="text-align:center; font-family:dejavusans;">' . $title . '</h1>';

        $html .= '<div style="text-align:right; direction:rtl; margin-bottom:20px;">';
        $html .= '<p><strong>تاريخ الفاتورة:</strong> ' . $invoice->created_at->format('Y-m-d') . '</p>';
        $html .= '<p><strong>' . $customerColumnTitle . ':</strong> ' . ($invoice->customer->name ?? 'نقدي') . '</p>';
        $html .= '<p><strong>حالة الفاتورة:</strong> ' . $this->getStatusArabic($invoice->status) . '</p>';
        $html .= '</div>';

        $html .= '<table border="1" cellpadding="5" style="width:100%; border-collapse:collapse; direction:rtl; text-align:center; font-family:dejavusans;">';
        $html .= '<thead>
                    <tr style="background-color:#f2f2f2; font-weight:bold;">
                        <th width="40%">اسم المنتج/الخدمة</th>
                        <th width="15%">الكمية</th>
                        <th width="20%">سعر الوحدة</th>
                        <th width="25%">المجموع</th>
                    </tr>
                </thead>';
        $html .= '<tbody>';

        $total = 0;
        foreach ($invoice->items as $item) {
            $itemTotal = $item->price * $item->quantity;
            $total += $itemTotal;

            $html .= '<tr>
                        <td>' . ($item->product->name ?? 'غير محدد') . '</td>
                        <td>' . $item->quantity . '</td>
                        <td>' . number_format($item->price, 2) . '</td>
                        <td>' . number_format($itemTotal, 2) . '</td>
                    </tr>';
        }

        $html .= '</tbody>';
        $html .= '<tfoot>
                    <tr>
                        <td colspan="3" style="text-align:left; font-weight:bold;">الإجمالي:</td>
                        <td style="font-weight:bold;">' . number_format($total, 2) . '</td>
                    </tr>
                    <tr>
                        <td colspan="3" style="text-align:left; font-weight:bold;">المدفوع:</td>
                        <td style="font-weight:bold;">' . number_format($invoice->paid_amount, 2) . '</td>
                    </tr>
                    <tr>
                        <td colspan="3" style="text-align:left; font-weight:bold;">المتبقي:</td>
                        <td style="font-weight:bold;">' . number_format($total - $invoice->paid_amount, 2) . '</td>
                    </tr>
                </tfoot>';
        $html .= '</table>';

        $html .= '<div style="margin-top: 30px; text-align:center; direction:rtl;">';
        $html .= '<p>شكراً لتعاملكم معنا</p>';
        $html .= '</div>';

        $pdf->writeHTML($html, true, false, true, false, '');

        $fileName = 'Invoice_' . $invoice->id . '_' . date('Y-m-d') . '.pdf';
        $pdf->Output($fileName, 'D');

        exit;
    }

}
