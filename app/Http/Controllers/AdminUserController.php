<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Coupon;
use App\Models\User;
use App\Models\Cycle;
use App\Models\Member;
use App\Models\Plan;
use Elibyy\TCPDF\TCPDF;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
class AdminUserController extends Controller
{

    public function users()
    {
        $users = User::with('company')->where('role', 'superadmin')->get();
        return response()->json(['users' => $users]);
    }

    public function customers()
    {
        $customers = User::whereHas('company', function ($query) {
            $query->whereIn('subscription', ['basic', 'premium', 'vip']);
        })->where('role', 'superadmin')->with('company')->get();

        return response()->json([
            'customers' => $customers
        ]);
    }


    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'company_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'logo' => 'nullable|max:2048',
            'system_type' => 'required',
            'country' => 'required'
        ], [
            'name.required' => 'حقل الاسم مطلوب',
            'name.string' => 'الاسم يجب أن يكون نصاً',
            'name.max' => 'الاسم يجب ألا يتجاوز 255 حرفاً',
            'email.required' => 'حقل البريد الإلكتروني مطلوب',
            'email.string' => 'البريد الإلكتروني يجب أن يكون نصاً',
            'email.lowercase' => 'البريد الإلكتروني يجب أن يكون بأحرف صغيرة',
            'email.email' => 'صيغة البريد الإلكتروني غير صحيحة',
            'email.max' => 'البريد الإلكتروني يجب ألا يتجاوز 255 حرفاً',
            'email.unique' => 'البريد الإلكتروني مسجل مسبقاً',
            'password.required' => 'حقل كلمة المرور مطلوب',
            'password.confirmed' => 'تأكيد كلمة المرور غير متطابق',
            'company_name.required' => 'حقل اسم الشركة مطلوب',
            'company_name.string' => 'اسم الشركة يجب أن يكون نصاً',
            'company_name.max' => 'اسم الشركة يجب ألا يتجاوز 255 حرفاً',
            'phone.string' => 'رقم الهاتف يجب أن يكون نصاً',
            'phone.max' => 'رقم الهاتف يجب ألا يتجاوز 255 حرفاً',
            'address.string' => 'العنوان يجب أن يكون نصاً',
            'address.max' => 'العنوان يجب ألا يتجاوز 255 حرفاً',
            'logo.max' => 'حجم الشعار يجب ألا يتجاوز 2 ميجابايت',
            'system_type.required' => 'حقل نوع النظام مطلوب',
            'country.required' => 'حقل الدولة مطلوب',
        ]);

        $logo = null;
        if ($request->hasFile('logo') && $request->file('logo')->isValid()) {
            $logo = $request->file('logo')->store('companies_logo', 'public');
        }

        $company = Company::create([
            'company_name' => $request->company_name,
            'phone' => $request->phone,
            'address' => $request->address,
            'logo' => $logo,

        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'company_id' => $company->id,
            'system_type' => $request->system_type,
            'role' => 'superadmin',
            'country' => $request->country
        ]);

        if ($request->system_type === 'clubs') {
            $cycle = Cycle::firstOrCreate(
                ['name' => 'manager', 'company_id' => $company->id],
                ['name' => 'manager', 'company_id' => $company->id]
            );

            $existingMember = Member::where('user_id', $user->id)->first();
            if (!$existingMember) {
                Member::create([
                    'name' => $request->name,
                    'phone' => $request->phone,
                    'cycle_id' => $cycle->id,
                    'role' => 'manager',
                    'rating' => 5,
                    'user_id' => $user->id,
                    'company_id' => $user->company_id
                ]);
            }
        }

        event(new Registered($user));
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class . ',email,' . $user->id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'company_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'logo' => 'nullable|image|max:2048',
            'system_type' => 'required',
            'country' => 'required',
        ], [
            'name.required' => 'حقل الاسم مطلوب',
            'name.string' => 'الاسم يجب أن يكون نصاً',
            'name.max' => 'الاسم يجب ألا يتجاوز 255 حرفاً',

            'email.required' => 'حقل البريد الإلكتروني مطلوب',
            'email.string' => 'البريد الإلكتروني يجب أن يكون نصاً',
            'email.lowercase' => 'البريد الإلكتروني يجب أن يكون بأحرف صغيرة',
            'email.email' => 'صيغة البريد الإلكتروني غير صحيحة',
            'email.max' => 'البريد الإلكتروني يجب ألا يتجاوز 255 حرفاً',
            'email.unique' => 'البريد الإلكتروني مسجل مسبقاً',

            'password.confirmed' => 'تأكيد كلمة المرور غير متطابق',

            'company_name.required' => 'حقل اسم الشركة مطلوب',
            'company_name.string' => 'اسم الشركة يجب أن يكون نصاً',
            'company_name.max' => 'اسم الشركة يجب ألا يتجاوز 255 حرفاً',

            'phone.string' => 'رقم الهاتف يجب أن يكون نصاً',
            'phone.max' => 'رقم الهاتف يجب ألا يتجاوز 255 حرفاً',

            'address.string' => 'العنوان يجب أن يكون نصاً',
            'address.max' => 'العنوان يجب ألا يتجاوز 255 حرفاً',

            'logo.image' => 'الملف المرفوع يجب أن يكون صورة',
            'logo.max' => 'حجم الشعار يجب ألا يتجاوز 2 ميجابايت',

            'system_type.required' => 'حقل نوع النظام مطلوب',
            'country.required' => 'حقل الدولة مطلوب',
        ]);

        $company = Company::findOrFail($user->company_id);

        $companyData = [
            'company_name' => $request->company_name,
            'phone' => $request->phone,
            'address' => $request->address,
        ];

        if ($request->hasFile('logo') && $request->file('logo')->isValid()) {
            if ($company->logo) {
                Storage::disk('public')->delete($company->logo);
            }
            $companyData['logo'] = $request->file('logo')->store('companies_logo', 'public');
        }

        $company->update($companyData);

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'system_type' => $request->system_type,
            'country' => $request->country,
        ];

        if ($request->filled('password')) {
            $userData['password'] = Hash::make($request->password);
        }

        $user->update($userData);

        if ($request->system_type === 'clubs') {
            $member = Member::firstOrNew(['user_id' => $user->id]);

            if (!$member->exists) {
                $cycle = Cycle::firstOrCreate(
                    ['name' => 'manager', 'company_id' => $user->company_id],
                    ['name' => 'manager', 'company_id' => $user->company_id]
                );

                $member->fill([
                    'name' => $request->name,
                    'phone' => $request->phone,
                    'cycle_id' => $cycle->id,
                    'role' => 'manager',
                    'rating' => 5,
                    'user_id' => $user->id,
                    'company_id' => $user->company_id // إضافة company_id الناقصة
                ])->save();
            } else {
                $member->update([
                    'name' => $request->name,
                    'phone' => $request->phone,
                ]);
            }
        } else {
            Member::where('user_id', $user->id)->delete();
        }
    }

    public function destroy($id)
    {
        $user = User::find($id);

        // Company::where('id', $user->company_id)->delete();

        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }

    public function addSubscription(Request $request, $id)
    {
        $company = Company::findOrFail($id);

        $request->validate([
            'subscription' => 'nullable',

        ]);
        if ($request->plan === "monthly") {
            $company->update([
                'subscription' => $request->subscription,
                'subscription_expires_at' => now()->addMonth()
            ]);
        } else {
            $company->update([
                'subscription' => $request->subscription,
                'subscription_expires_at' => now()->addYear(),
            ]);
        }
    }

    public function exportUsersPDF()
    {
        $users = User::with('company')->where('role', 'superadmin')->where('system_type', '!=', 'manager')->get();

        $pdf = new TCPDF('L', 'mm', 'A4', true, 'UTF-8', false);

        $pdf->SetCreator('Your System');
        $pdf->SetAuthor('Your Name');
        $pdf->SetTitle('تقرير المستخدمين');
        $pdf->SetSubject('تقرير المستخدمين');

        $pdf->AddPage();
        $pdf->SetFont('dejavusans', '', 10);

        $html = '<h1 style="text-align:center; font-family:dejavusans;">تقرير المستخدمين</h1>';
        $html .= '<p style="text-align:center;">تاريخ التقرير: ' . date('Y-m-d') . '</p>';

        $html .= '<table dir="rtl" border="1" cellpadding="5" style="width:100%; border-collapse:collapse; direction:rtl; text-align:right; font-family:dejavusans;">';
        $html .= "<thead><tr>
                <th>#</th>
                <th>الاسم</th>
                <th>الرتبة</th>
                <th>البريد الإلكتروني</th>
                <th>الهاتف</th>
                <th>نوع النظام</th>
                <th>الدولة</th>
                <th>اسم الشركة</th>
                <th>العنوان</th>
                <th>نوع الباقة</th>
                <th>تاريخ الإنشاء</th>
                </tr></thead>";

        $html .= '<tbody>';

        foreach ($users as $index => $user) {
            $html .= '<tr>
                    <td>' . ($index + 1) . '</td>
                    <td>' . $user->name . '</td>
                    <td>' . $user->role . '</td>
                    <td>' . $user->email . '</td>
                    <td>' . ($user->company->phone ?? 'غير محدد') . '</td>
                    <td>' . $user->system_type . '</td>
                    <td>' . $user->country . '</td>
                    <td>' . ($user->company->company_name ?? 'غير محدد') . '</td>
                    <td>' . ($user->company->address ?? 'غير محدد') . '</td>
                    <td>' . $user->company->subscription . '</td>
                    <td>' . $user->created_at->format('Y-m-d') . '</td>
                    </tr>';
        }

        $html .= '</tbody></table>';

        $pdf->writeHTML($html, true, false, true, false, '');

        $fileName = 'تقرير_المستخدمين_' . date('Y-m-d') . '.pdf';
        $pdf->Output($fileName, 'D');

        exit;
    }

public function exportUsersExcel()
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

    // إضافة الرؤوس يدوياً بدلاً من fromArray
    $col = 'A';
    foreach ($headers as $header) {
        $sheet->setCellValue($col . '1', $header);
        $col++;
    }

    // تنسيق الرؤوس
    $headerStyle = [
        'font' => [
            'bold' => true,
            'size' => 12,
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
            ]
        ]
    ];

    // تحديد العمود الأخير بناءً على عدد الرؤوس
    $lastHeaderColumn = chr(64 + count($headers));
    $sheet->getStyle('A1:' . $lastHeaderColumn . '1')->applyFromArray($headerStyle);

    // إضافة البيانات
    $row = 2;
    foreach ($users as $index => $user) {
        $sheet->setCellValue('A' . $row, $index + 1);
        $sheet->setCellValue('B' . $row, $user->name ?? '');
        $sheet->setCellValue('C' . $row, $user->role ?? '');
        $sheet->setCellValue('D' . $row, $user->email ?? '');
        $sheet->setCellValue('E' . $row, $user->company->phone ?? 'غير محدد');
        $sheet->setCellValue('F' . $row, $user->system_type ?? '');
        $sheet->setCellValue('G' . $row, $user->country ?? '');
        $sheet->setCellValue('H' . $row, $user->company->company_name ?? 'غير محدد');
        $sheet->setCellValue('I' . $row, $user->company->address ?? 'غير محدد');
        $sheet->setCellValue('J' . $row, $user->company->subscription ?? 'غير محدد');
        $sheet->setCellValue('K' . $row, $user->created_at ? $user->created_at->format('Y-m-d') : '');

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

    // إنشاء الكاتب
    $writer = new Xlsx($spreadsheet);

    // إرجاع الملف مع الـ headers الصحيحة
    return response()->streamDownload(function () use ($writer) {
        $writer->save('php://output');
    }, $fileName, [
        'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
    ]);
}





    public function subscriptionBasic(Request $request)
    {

        $user = Auth::user();
        $user->company->update([
            'subscription' => 'basic',
            // 'trial_used' => true,
            'subscription_expires_at' => now()->addDays(7)
        ]);
        $user->save();

        return response()->json(['success' => true]);
    }

    public function subscriptioncoupons(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code'     => 'required|exists:coupons,code',
            'planName' => 'required|exists:plans,name',
            'plan' => 'required'
        ], [
            'code.required' => 'كود الخصم مطلوب',
            'code.exists' => 'كود الخصم غير موجود',
            'planName.required' => 'الباقة مطلوبة',
            'planName.exists' => 'الباقة غير موجودة',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        $coupon = Coupon::where('code', $request->code)->where('plan', $request->planName)
            ->with('plan')
            ->first();

        $requestedPlan = Plan::where('name', $request->planName)->first();

        if (!$coupon || $coupon->plan_id !== $requestedPlan->id) {
            return response()->json([
                'success' => false,
                'errors' => ['code' => ['كود الخصم غير صالح لهذه الباقة']]
            ], 422);
        }
        if ($request->plan === 'monthly') {
            if ($coupon->price_in_egp === 0 || $coupon->price_outside_egp === 0) {
                $company = Company::findOrFail($user->company_id);
                $company->update([
                    'subscription' => $request->planName,
                    'subscription_expires_at' => now()->addMonth()
                ]);
                $user->save();
                return response()->json([
                    'success' => true,
                    'free_subscription' => true,
                    'redirect_url' => $this->getRedirectUrl($user->system_type),
                    'message' => 'تم تفعيل الاشتراك المجاني بنجاح'
                ]);
            }
        }else{
        if ($coupon->price_in_egp === 0 || $coupon->price_outside_egp === 0) {
                $company = Company::findOrFail($user->company_id);
                $company->update([
                    'subscription' => $request->planName,
                    'subscription_expires_at' => now()->addYear()
                ]);
                $user->save();

                return response()->json([
                    'success' => true,
                    'free_subscription' => true,
                    'redirect_url' => $this->getRedirectUrl($user->system_type),
                    'message' => 'تم تفعيل الاشتراك المجاني بنجاح'
                ]);
            }
        }


        return response()->json([
            'success' => true,
            'free_subscription' => false,
            'coupon' => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'price_in_egp' => $coupon->price_in_egp,
                'price_outside_egp' => $coupon->price_outside_egp,
                'original_price_in_egp' => $requestedPlan->price_in_egp,
                'original_price_outside_egp' => $requestedPlan->price_outside_egp,
                'plan_id' => $coupon->plan_id
            ]
        ]);
    }

    private function getRedirectUrl($systemType)
    {
        switch ($systemType) {
            case 'clubs':
                return '/clubs';
            case 'manager':
                return '/admin';
            case 'retail':
            case 'services':
            case 'education':
            case 'realEstate':
            case 'delivery':
            case 'travels':
            case 'gym':
            case 'hotel':
                return '/retailFlow';
            default:
                return '/';
        }
    }
    public function activateFreeSubscription(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'plan' => 'required|exists:plans,name',
            'coupon_code' => 'required|exists:coupons,code',
            'type'=> 'required'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة'
            ], 422);
        }

        try {
            $user = Auth::user();
            $plan = Plan::where('name', $request->plan)->first();
            $coupon = Coupon::where('code', $request->coupon_code)->first();

            if ($coupon->plan_id !== $plan->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'كود الخصم غير صالح لهذه الباقة'
                ], 422);
            }

            $company = Company::findOrFail($user->company_id);
            if($request->type === 'monthly'){

            $company->update([
                'subscription' => $request->plan,
                'subscription_expires_at' => now()->addMonth(),
                'trial_used' => true
            ]);
        }else{
            $company->update([
                'subscription' => $request->plan,
                'subscription_expires_at' => now()->addYear(),
                'trial_used' => true
            ]);
        }

            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'تم تفعيل الاشتراك بنجاح',
                'subscription' => $request->plan,
                'expires_at' => $company->subscription_expires_at
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء تفعيل الاشتراك'
            ], 500);
        }
    }
}
