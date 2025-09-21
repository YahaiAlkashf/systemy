<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use App\Models\Coupon;

class PaymobController extends Controller
{
    protected $apiUrl = 'https://accept.paymob.com/api';
    private $validPlans = ['basic', 'premium', 'vip'];

    public function checkout(Request $request)
    {
        try {
            $validator = validator($request->all(), [
                'plan' => 'required|in:' . implode(',', $this->validPlans),
                'country' => 'required|string',
                'coupon' => 'nullable|string',
                'price_in_egp' => 'required|numeric',
                'price_outside_egp' => 'required|numeric'
            ]);

            if ($validator->fails()) {
                return response()->json(['error' => 'بيانات غير صالحة'], 400);
            }

            $plan = $request->plan;
            $country = $request->country;
            $couponCode = $request->coupon;
            $user = Auth::user();

            if (!$user) {
                return response()->json(['error' => 'User not authenticated'], 401);
            }

            $priceInEgp = $request->price_in_egp;
            $priceOutsideEgp = $request->price_outside_egp;

            // تطبيق الكوبون إذا كان موجوداً
            if ($couponCode) {
                $coupon = Coupon::where('code', $couponCode)
                    ->whereHas('plan', function($query) use ($plan) {
                        $query->where('name', $plan);
                    })
                    ->first();

                if ($coupon) {
                    $priceInEgp = $coupon->price_in_egp;
                    $priceOutsideEgp = $coupon->price_outside_egp;
                }
            }

            if ($country === 'Egypt') {
                $amount_cents = $priceInEgp * 100;
                $currency = 'EGP';
            } else {
                $amount_cents = $priceOutsideEgp * 100;
                $currency = 'USD';
            }

            // الحصول على token من Paymob
            $authResp = Http::post("{$this->apiUrl}/auth/tokens", [
                'api_key' => env('PAYMOB_API_KEY'),
            ]);

            if (!$authResp->successful()) {
                Log::error('Paymob auth failed', $authResp->json());
                return response()->json(['error' => 'Paymob authentication failed'], 500);
            }

            $authToken = $authResp->json()['token'];

            // إنشاء طلب
            $merchantOrderId = $user->id . '_' . $plan . '_' . uniqid() . '_' . ($couponCode ?: 'nocoupon');
            $orderResp = Http::withToken($authToken)->post("{$this->apiUrl}/ecommerce/orders", [
                'merchant_order_id' => $merchantOrderId,
                'amount_cents' => $amount_cents,
                'currency' => $currency,
                'delivery_needed' => false,
                'items' => [],
            ]);

            if (!$orderResp->successful()) {
                Log::error('Paymob create order failed', $orderResp->json());
                return response()->json(['error' => 'Paymob order creation failed'], 500);
            }

            $orderId = $orderResp->json()['id'];

            // إنشاء مفتاح الدفع
            $integrationId = env('PAYMOB_INTEGRATION_ID');
            $billingData = [
                'apartment' => '1',
                'email' => $user->email ?? 'guest@example.com',
                'floor' => '1',
                'first_name' => $user->name ?? 'Guest',
                'street' => 'Unknown Street',
                'building' => '1',
                'phone_number' => $user->phone ?? '+201234567890',
                'shipping_method' => 'NA',
                'postal_code' => '0000',
                'city' => 'Cairo',
                'country' => $country,
                'last_name' => $user->name ?? 'User',
            ];

            $paymentKeyResp = Http::withToken($authToken)->post("{$this->apiUrl}/acceptance/payment_keys", [
                'amount_cents' => $amount_cents,
                'currency' => $currency,
                'order_id' => $orderId,
                'billing_data' => $billingData,
                'integration_id' => (int) $integrationId,
                'expiration' => 3600,
            ]);

            if (!$paymentKeyResp->successful()) {
                Log::error('Paymob payment key failed', $paymentKeyResp->json());
                return response()->json(['error' => 'Paymob payment key generation failed'], 500);
            }

            $paymentToken = $paymentKeyResp->json()['token'];

            // إنشاء رابط الدفع
            $iframeId = env('PAYMOB_IFRAME_ID');
            $payUrl = "https://accept.paymob.com/api/acceptance/iframes/{$iframeId}?payment_token={$paymentToken}";

            Log::info('Paymob payment session created', [
                'user_id' => $user->id,
                'plan' => $plan,
                'merchant_order_id' => $merchantOrderId,
                'amount_cents' => $amount_cents,
                'currency' => $currency
            ]);

            return response()->json(['redirect_url' => $payUrl]);

        } catch (\Exception $e) {
            Log::error('Paymob exception: ' . $e->getMessage());
            return response()->json(['error' => 'Server error: ' . $e->getMessage()], 500);
        }
    }

    public function callback(Request $request)
    {
        try {
            $data = $request->all();
            Log::info('Paymob callback received', $data);

            // التحقق من HMAC
            if (isset($data['hmac'])) {
                $hmac = $data['hmac'];
                $calculatedHmac = hash_hmac(
                    'sha512',
                    $data['amount_cents'] . $data['created_at'] . $data['currency'] .
                    $data['error_occured'] . $data['has_parent_transaction'] .
                    $data['id'] . $data['integration_id'] . $data['is_3d_secure'] .
                    $data['is_auth'] . $data['is_capture'] . $data['is_refunded'] .
                    $data['is_standalone_payment'] . $data['is_voided'] . $data['order'] .
                    $data['owner'] . $data['pending'] . $data['source_data_pan'] .
                    $data['source_data_sub_type'] . $data['source_data_type'],
                    env('PAYMOB_HMAC_SECRET')
                );

                if ($hmac !== $calculatedHmac) {
                    Log::error('HMAC verification failed', $data);
                    return response()->json(['error' => 'HMAC verification failed'], 400);
                }
            }

            // التحقق من نجاح الدفع
            if (isset($data['success']) && $data['success'] === 'true' &&
                isset($data['error_occured']) && $data['error_occured'] === 'false') {

                // استخراج المعلومات من merchant_order_id
                $merchantOrderId = $data['merchant_order_id'];
                $parts = explode('_', $merchantOrderId);

                if (count($parts) < 3) {
                    Log::error('Invalid merchant_order_id format', ['merchant_order_id' => $merchantOrderId]);
                    return response()->json(['error' => 'Invalid order ID format'], 400);
                }

                $userId = $parts[0];
                $plan = $parts[1];
                $couponCode = count($parts) > 3 ? $parts[3] : null;

                // العثور على المستخدم
                $user = User::find($userId);
                if (!$user) {
                    Log::error('User not found', ['user_id' => $userId]);
                    return response()->json(['error' => 'User not found'], 404);
                }

                $user->subscription = $plan;

                if ($plan === 'basic' && $user->trial_used == false) {
                    $user->trial_used = true;
                    $user->subscription_expires_at = now()->addDays(7);
                } else {
                    $user->subscription_expires_at = now()->addMonth();
                }

                $user->save();

                Log::info('تم تفعيل الاشتراك بنجاح عبر Paymob', [
                    'user_id' => $user->id,
                    'plan' => $plan,
                    'coupon' => $couponCode ?? 'لا يوجد',
                    'transaction_id' => $data['id'] ?? 'unknown'
                ]);

                return $this->redirectBasedOnSystemType($user);

            } else {
                Log::error('Paymob payment failed', $data);
                return redirect('/allplans')->with('error', 'فشل عملية الدفع. يرجى المحاولة مرة أخرى.');
            }

        } catch (\Exception $e) {
            Log::error('Paymob callback error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return redirect('/allplans')->with('error', 'حدث خطأ أثناء معالجة الدفع');
        }
    }

    private function redirectBasedOnSystemType($user)
    {
        $routes = [
            'clubs' => '/clubs',
            'manager' => '/admin',
            'retail' => '/retailFlow',
            'services' => '/retailFlow',
            'education' => '/retailFlow',
            'realEstate' => '/retailFlow',
            'delivery' => '/retailFlow',
            'travels' => '/retailFlow',
            'gym' => '/retailFlow',
            'hotel' => '/retailFlow',
        ];

        if (isset($routes[$user->system_type])) {
            return redirect($routes[$user->system_type])
                ->with('success', 'تم تفعيل اشتراكك في باقة ' . $user->subscription);
        }

        Log::warning('نظام غير معروف للتحويل: ' . $user->system_type);
        return redirect('/')
            ->with('success', 'تم تفعيل اشتراكك في باقة ' . $user->subscription);
    }
}
