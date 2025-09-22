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

class AdminUserController extends Controller
{

    public function users()
    {
        $users = User::with('company')->get();
        return response()->json(['users' => $users]);
    }

    public function customers()
    {
        $customers = User::whereHas('company', function ($query) {
            $query->whereIn('subscription', ['basic', 'premium', 'vip']);
        })->where('role','superadmin')->with('company')->get();

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
        $company=Company::findOrFail($id);

        $request->validate([
            'subscription' => 'required'
        ],[
            'subscription.required' => 'حقل نوع الاشتراك مطلوب'
        ]);
        $company->update([
            'subscription' => $request->subscription,
            'subscription_expires_at' => now()->addMonth()
        ]);
    }

    public function exportUsersPDF()
    {
        $users = User::with('company')->where('system_type', '!=', 'manager')->get();

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
                    <td>' . $user->subscription . '</td>
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
        $users = User::with('company')->where('system_type', '!=', 'manager')->get();

        $fileName = 'المستخدمين_' . date('Y-m-d') . '.xlsx';

        $spreadsheet = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>
            <Workbook xmlns=\"urn:schemas-microsoft-com:office:spreadsheet\"
                    xmlns:x=\"urn:schemas-microsoft-com:office:excel\"
                    xmlns:ss=\"urn:schemas-microsoft-com:office:spreadsheet\"
                    xmlns:html=\"http://www.w3.org/TR/REC-html40\">
            <Worksheet ss:Name=\"المستخدمين\">
            <Table>
            <Row>
                <Cell><Data ss:Type=\"String\">#</Data></Cell>
                <Cell><Data ss:Type=\"String\">الاسم</Data></Cell>
                <Cell><Data ss:Type=\"String\">الرتبة</Data></Cell>
                <Cell><Data ss:Type=\"String\">البريد الإلكتروني</Data></Cell>
                <Cell><Data ss:Type=\"String\">الهاتف</Data></Cell>
                <Cell><Data ss:Type=\"String\">نوع النظام</Data></Cell>
                <Cell><Data ss:Type=\"String\">الدولة</Data></Cell>
                <Cell><Data ss:Type=\"String\">اسم الشركة</Data></Cell>
                <Cell><Data ss:Type=\"String\">العنوان</Data></Cell>
                <Cell><Data ss:Type=\"String\">نوع الباقة</Data></Cell>
                <Cell><Data ss:Type=\"String\">تاريخ الإنشاء</Data></Cell>
            </Row>";

        foreach ($users as $index => $user) {
            $spreadsheet .= "
            <Row>
                <Cell><Data ss:Type=\"Number\">" . ($index + 1) . "</Data></Cell>
                <Cell><Data ss:Type=\"String\">{$user->name}</Data></Cell>
                <Cell><Data ss:Type=\"String\">{$user->role}</Data></Cell>
                <Cell><Data ss:Type=\"String\">{$user->email}</Data></Cell>
                <Cell><Data ss:Type=\"String\">" . ($user->company->phone ?? 'غير محدد') . "</Data></Cell>
                <Cell><Data ss:Type=\"String\">{$user->system_type}</Data></Cell>
                <Cell><Data ss:Type=\"String\">{$user->country}</Data></Cell>
                <Cell><Data ss:Type=\"String\">" . ($user->company->company_name ?? 'غير محدد') . "</Data></Cell>
                <Cell><Data ss:Type=\"String\">" . ($user->company->address ?? 'غير محدد') . "</Data></Cell>
                <Cell><Data ss:Type=\"String\">{$user->subscription}</Data></Cell>
                <Cell><Data ss:Type=\"String\">{$user->created_at->format('Y-m-d')}</Data></Cell>
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





    public function subscriptionBasic(Request $request)
    {

        $user = Auth::user();
        $user->update([
            'subscription' => 'basic',
            'trial_used' => true,
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

            $coupon = Coupon::where('code', $request->code)
                ->with('plan')
                ->first();

            $requestedPlan = Plan::where('name', $request->planName)->first();

            if (!$coupon || $coupon->plan_id !== $requestedPlan->id) {
                return response()->json([
                    'success' => false,
                    'errors' => ['code' => ['كود الخصم غير صالح لهذه الباقة']]
                ], 422);
            }

            return response()->json([
                'success' => true,
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
}
