<?php

namespace App\Http\Controllers\RetailFlow;

use App\Http\Controllers\Controller;
use App\Models\CustomerRetailFlow;
use Elibyy\TCPDF\TCPDF;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
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

        if ($user->system_type === "delivery") {
            $nameTitle = "اسم السائق";
            $addressTitle = "رقم السيارة";
            $fileName = "تقرير_السائقين_" . date('Y-m-d') . '.xlsx';
        } else {
            $nameTitle = "اسم العميل";
            $addressTitle = "العنوان";
            $fileName = "تقرير_العملاء_" . date('Y-m-d') . '.xlsx';
        }

        $spreadsheet = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>
            <Workbook xmlns=\"urn:schemas-microsoft-com:office:spreadsheet\"
                    xmlns:x=\"urn:schemas-microsoft-com:office:excel\"
                    xmlns:ss=\"urn:schemas-microsoft-com:office:spreadsheet\"
                    xmlns:html=\"http://www.w3.org/TR/REC-html40\">
            <Worksheet ss:Name=\"" . ($user->system_type === "delivery" ? "السائقين" : "العملاء") . "\">
            <Table>
            <Row>
                <Cell><Data ss:Type=\"String\">#</Data></Cell>
                <Cell><Data ss:Type=\"String\">{$nameTitle}</Data></Cell>
                <Cell><Data ss:Type=\"String\">رقم الهاتف</Data></Cell>
                <Cell><Data ss:Type=\"String\">البريد الإلكتروني</Data></Cell>
                <Cell><Data ss:Type=\"String\">{$addressTitle}</Data></Cell>
                <Cell><Data ss:Type=\"String\">تاريخ الإنشاء</Data></Cell>
            </Row>";

        foreach ($customers as $index => $customer) {
            $spreadsheet .= "
            <Row>
                <Cell><Data ss:Type=\"Number\">" . ($index + 1) . "</Data></Cell>
                <Cell><Data ss:Type=\"String\">{$customer->name}</Data></Cell>
                <Cell><Data ss:Type=\"String\">{$customer->phone}</Data></Cell>
                <Cell><Data ss:Type=\"String\">{$customer->email}</Data></Cell>
                <Cell><Data ss:Type=\"String\">{$customer->address}</Data></Cell>
                <Cell><Data ss:Type=\"String\">{$customer->created_at->format('Y-m-d')}</Data></Cell>
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
}
