<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Stripe\StripeClient;
use App\Models\Coupon;
use App\Models\Plan;

class StripeController extends Controller
{
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

            Stripe::setApiKey(env('STRIPE_SECRET'));

            $planName = $request->plan;
            $country = $request->country;
            $couponCode = $request->coupon;

            $priceInEgp = $request->price_in_egp;
            $priceOutsideEgp = $request->price_outside_egp;

            if ($couponCode) {
                $coupon = Coupon::where('code', $couponCode)
                    ->whereHas('plan', function($query) use ($planName) {
                        $query->where('name', $planName);
                    })
                    ->first();

                if ($coupon) {
                    $priceInEgp = $coupon->price_in_egp;
                    $priceOutsideEgp = $coupon->price_outside_egp;
                }
            }

            $prices = $this->calculatePrices($planName, $country, $priceInEgp, $priceOutsideEgp);

            $session = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => $prices['currency'],
                        'product_data' => [
                            'name' => "اشتراك: " . $planName,
                        ],
                        'unit_amount' => $prices['amount'],
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => route('stripe.success') . '?session_id={CHECKOUT_SESSION_ID}&plan=' . $planName . '&coupon=' . ($couponCode ?? ''),
                'cancel_url' => route('stripe.cancel'),
                'customer_email' => Auth::user()->email,
                'metadata' => [
                    'plan' => $planName,
                    'user_id' => Auth::id(),
                    'coupon' => $couponCode ?? '',
                    'country' => $country
                ]
            ]);

            Log::info('Stripe session created', [
                'session_id' => $session->id,
                'user_id' => Auth::id(),
                'plan' => $planName
            ]);

            return response()->json(['id' => $session->id]);

        } catch (\Exception $e) {
            Log::error('Stripe checkout error: ' . $e->getMessage());
            return response()->json(['error' => 'فشل في إنشاء جلسة الدفع'], 500);
        }
    }

    public function applyCoupon(Request $request)
    {
        try {
            $validator = validator($request->all(), [
                'code' => 'required|string',
                'planName' => 'required|in:' . implode(',', $this->validPlans)
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 400);
            }

            $coupon = Coupon::where('code', $request->code)
                ->whereHas('plan', function($query) use ($request) {
                    $query->where('name', $request->planName);
                })
                ->first();

            if (!$coupon) {
                return response()->json([
                    'success' => false,
                    'errors' => ['code' => ['كود الخصم غير صالح لهذه الباقة']]
                ], 404);
            }

            return response()->json([
                'success' => true,
                'coupon' => [
                    'price_in_egp' => $coupon->price_in_egp,
                    'price_outside_egp' => $coupon->price_outside_egp
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Coupon application error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'errors' => ['code' => ['حدث خطأ أثناء التحقق من الكوبون']]
            ], 500);
        }
    }

    public function success(Request $request)
    {
        try {
            $user = Auth::user();
            $plan = $request->plan;
            $sessionId = $request->session_id;
            $couponCode = $request->coupon;

            if (!in_array($plan, $this->validPlans) || !$sessionId) {
                Log::error('Invalid plan or session ID', ['plan' => $plan, 'session_id' => $sessionId]);
                return redirect()->route('stripe.cancel')->with('error', 'بيانات غير صالحة');
            }

            $client = new StripeClient(env('STRIPE_SECRET'));
            $session = $client->checkout->sessions->retrieve($sessionId, [
                'expand' => ['customer_details', 'payment_intent']
            ]);

            if ($session->payment_status !== 'paid') {
                Log::warning('Payment not completed', [
                    'session_id' => $sessionId,
                    'payment_status' => $session->payment_status
                ]);
                return redirect()->route('stripe.cancel')->with('error', 'عملية الدفع لم تكتمل');
            }

            if (!isset($session->customer_details->email) ||
                $session->customer_details->email !== $user->email) {
                Log::error('Email mismatch', [
                    'session_email' => $session->customer_details->email ?? 'null',
                    'user_email' => $user->email
                ]);
                return redirect()->route('stripe.cancel')->with('error', 'عملية الدفع غير صالحة');
            }

            // تحقق من تطابق metadata
            if ($session->metadata->plan !== $plan || $session->metadata->user_id != $user->id) {
                Log::error('Metadata mismatch', [
                    'session_plan' => $session->metadata->plan,
                    'request_plan' => $plan,
                    'session_user_id' => $session->metadata->user_id,
                    'auth_user_id' => $user->id
                ]);
                return redirect()->route('stripe.cancel')->with('error', 'بيانات الجلسة غير متطابقة');
            }

            $user->subscription = $plan;

            if ($plan === 'basic' && $user->trial_used == false) {
                $user->trial_used = true;
                $user->subscription_expires_at = now()->addDays(7);
            } else {
                $user->subscription_expires_at = now()->addMonth();
            }



            $user->save();

            Log::info('تم تفعيل الاشتراك بنجاح', [
                'user_id' => $user->id,
                'plan' => $plan,
                'coupon' => $couponCode ?? 'لا يوجد'
            ]);

            return $this->redirectBasedOnSystemType($user);

        } catch (\Exception $e) {
            Log::error('Stripe success error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->route('stripe.cancel')->with('error', 'حدث خطأ أثناء تفعيل الاشتراك');
        }
    }

    public function cancel()
    {
        return redirect('/allplans')->with('error', 'تم إلغاء عملية الدفع');
    }

    private function calculatePrices($plan, $country, $priceInEgp, $priceOutsideEgp)
    {
        if ($country === 'Egypt') {
            return [
                'amount' => $priceInEgp * 100,
                'currency' => 'egp'
            ];
        } else {
            return [
                'amount' => $priceOutsideEgp * 100,
                'currency' => 'usd'
            ];
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
            ->with('error', 'تم تفعيل الاشتراك ولكن نظامك غير معروف: ' . $user->system_type);
    }
}
