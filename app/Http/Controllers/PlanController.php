<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PlanController extends Controller
{
    public function index()
    {
        $plans = Plan::with(['coupons'])->get();
        return response()->json([
            'plans' => $plans
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'price_outside_egp' => 'required|numeric',
            'price_in_egp' => 'required|numeric',
            'price_year_in_egp'=>'required|numeric',
            'price_year_outside_egp'=>'required|numeric',
        ], [
            'name.required' => 'الاسم مطلوب',
            'name.string' => 'الاسم يجب أن يكون نصًا',
            'price_outside_egp.required' => 'السعر مطلوب',
            'price_outside_egp.numeric' => 'السعر يجب أن يكون رقمًا',
            'price_in_egp.required' => 'السعر مطلوب',
            'price_in_egp.numeric' => 'السعر يجب أن يكون رقمًا',
            'price_year_in_egp.required' => 'السعر سنوي مطلوب',
            'price_year_in_egp.numeric' => 'السعر سنوي يجب أن يكون رقمًا',
            'price_year_outside_egp.required' => 'السعر سنوي مطلوب',
            'price_year_outside_egp.numeric' => 'السعر سنوي يجب أن يكون رقمًا',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $plan = Plan::updateOrCreate(
            ['name' => $request->name],
            [
                'price_outside_egp' => $request->price_outside_egp,
                'price_in_egp' => $request->price_in_egp,
                'price_year_in_egp' => $request->price_year_in_egp,
                'price_year_outside_egp' => $request->price_year_outside_egp,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'تم الحفظ بنجاح',
            'data' => $plan
        ]);
    }

    public function update(Request $request, $id)
    {
        $plan = Plan::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'price_outside_egp' => 'required|numeric',
            'price_in_egp' => 'required|numeric',
            'price_year_in_egp'=>'required|numeric',
            'price_year_outside_egp'=>'required|numeric',
        ], [
            'name.required' => 'الاسم مطلوب',
            'name.string' => 'الاسم يجب أن يكون نصًا',
            'price_outside_egp.required' => 'السعر مطلوب',
            'price_outside_egp.numeric' => 'السعر يجب أن يكون رقمًا',
            'price_in_egp.required' => 'السعر مطلوب',
            'price_in_egp.numeric' => 'السعر يجب أن يكون رقمًا',
            'price_year_in_egp.required' => 'السعر سنوي مطلوب',
            'price_year_in_egp.numeric' => 'السعر سنوي يجب أن يكون رقمًا',
            'price_year_outside_egp.required' => 'السعر سنوي مطلوب',

        ]);

        if($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $plan->update([
            'name' => $request->name,
            'price_outside_egp' => $request->price_outside_egp,
            'price_in_egp' => $request->price_in_egp,
            'price_year_in_egp'=> $request->price_year_in_egp,
            'price_year_outside_egp'=> $request->price_year_outside_egp,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم التحديث بنجاح',
            'data' => $plan
        ]);
    }

    public function destroy($id)
    {
        $plan = Plan::findOrFail($id);
        $plan->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الباقة بنجاح'
        ]);
    }

    public function storeCoupons(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|unique:coupons,code',
            'plan_id' => 'required|exists:plans,id',
            'price_in_egp' => 'required|numeric',
            'price_outside_egp' => 'required|numeric',
            'plan'=>'required'
        ], [
            'code.required' => 'كود الخصم مطلوب',
            'code.unique' => 'كود الخصم مستخدم من قبل',
            'plan_id.required' => 'الباقة مطلوبة',
            'plan_id.exists' => 'الباقة غير موجودة',
            'price_in_egp.required' => 'السعر داخل مصر مطلوب',
            'price_in_egp.numeric' => 'السعر داخل مصر يجب أن يكون رقمًا',
            'price_outside_egp.required' => 'السعر خارج مصر مطلوب',
            'price_outside_egp.numeric' => 'السعر خارج مصر يجب أن يكون رقمًا',
            'plan.required' => 'الباقة مطلوبة'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $coupon = Coupon::create([
            'code' => $request->code,
            'plan_id' => $request->plan_id,
            'price_in_egp' => $request->price_in_egp,
            'price_outside_egp' => $request->price_outside_egp,
            'plan' => $request->plan
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة الكوبون بنجاح',
            'data' => $coupon
        ]);
    }

    public function updateCoupon(Request $request, $id)
    {
        $coupon = Coupon::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'code' => 'required|string|unique:coupons,code,' . $id,
            'plan_id' => 'required|exists:plans,id',
            'price_in_egp' => 'required|numeric',
            'price_outside_egp' => 'required|numeric',
            'plan'=>'required'
        ], [
            'code.required' => 'كود الخصم مطلوب',
            'code.unique' => 'كود الخصم مستخدم من قبل',
            'plan_id.required' => 'الباقة مطلوبة',
            'plan_id.exists' => 'الباقة غير موجودة',
            'price_in_egp.required' => 'السعر داخل مصر مطلوب',
            'price_in_egp.numeric' => 'السعر داخل مصر يجب أن يكون رقمًا',
            'price_outside_egp.required' => 'السعر خارج مصر مطلوب',
            'price_outside_egp.numeric' => 'السعر خارج مصر يجب أن يكون رقمًا',
            'plan.required' => 'الباقة مطلوبة'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $coupon->update([
            'code' => $request->code,
            'plan_id' => $request->plan_id,
            'price_in_egp' => $request->price_in_egp,
            'price_outside_egp' => $request->price_outside_egp,
            'plan' => $request->plan
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الكوبون بنجاح',
            'data' => $coupon
        ]);
    }

    public function deleteCoupon($id)
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الكوبون بنجاح'
        ]);
    }
}
