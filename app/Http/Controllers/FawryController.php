<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Coupon;
use Illuminate\Support\Facades\Auth;

class FawryController extends Controller
{
    protected $merchantCode;
    protected $securityKey;
    protected $baseUrl;

    public function __construct()
    {
        $this->merchantCode = env('FAWRY_MERCHANT_CODE', 'test_merchant_code');
        $this->securityKey = env('FAWRY_SECURITY_KEY', 'test_security_key');
        $this->baseUrl = env('FAWRY_BASE_URL', 'https://www.fawry.com/');
    }

    public function createPayment(Request $request)
    {
        $request->validate([
            'plan' => 'required|in:basic,premium,vip',
            'coupon' => 'nullable|string',
            'price_in_egp' => 'required|numeric'
        ]);

        $plan = $request->plan;
        $customerName = Auth::user()->name;
        $customerMobile = Auth::user()->phone;
        $customerEmail = Auth::user()->email;
        $couponCode = $request->coupon;

        $amount = $request->price_in_egp;

        if ($couponCode) {
            $coupon = Coupon::where('code', $couponCode)
                ->whereHas('plan', function($query) use ($plan) {
                    $query->where('name', $plan);
                })
                ->first();

            if ($coupon) {
                $amount = $coupon->price_in_egp;
            }
        }

        $merchantRefNumber = (string) Str::uuid();

        session([
            'fawry_payment' => [
                'merchant_ref_num' => $merchantRefNumber,
                'plan' => $plan,
                'amount' => $amount,
                'user_id' => Auth::user()->id,
                'coupon' => $couponCode
            ]
        ]);

        $paymentData = [
            'merchantCode' => $this->merchantCode,
            'merchantRefNum' => $merchantRefNumber,
            'customerMobile' => $customerMobile,
            'customerEmail' => $customerEmail,
            'customerName' => $customerName,
            'amount' => $amount,
            'currencyCode' => 'EGP',
            'language' => 'ar-eg',
            'chargeItems' => [
                [
                    'itemId' => '1',
                    'description' => 'اشتراك ' . $this->getPlanName($plan),
                    'price' => $amount,
                    'quantity' => '1'
                ]
            ],
            'paymentMethod' => 'CARD',
            'returnUrl' => url('/fawry/redirect'),
            'authCaptureModePayment' => false
        ];

        $signatureString = $this->merchantCode .
            $paymentData['merchantRefNum'] .
            $paymentData['customerMobile'] .
            $paymentData['customerEmail'] .
            $paymentData['amount'] .
            $this->securityKey;

        $paymentData['signature'] = hash('sha256', $signatureString);

        try {
            $response = Http::post($this->baseUrl . 'ECommerceWeb/Fawry/payments/charge', $paymentData);

            if ($response->successful()) {
                $responseData = $response->json();

                if ($responseData['statusCode'] == 200) {
                    return response()->json([
                        'success' => true,
                        'payment_url' => $responseData['paymentGatewayUrl'],
                        'merchant_ref_num' => $merchantRefNumber,
                        'fawry_ref_number' => $responseData['referenceNumber']
                    ]);
                } else {
                    Log::error('Fawry payment error: ' . $responseData['statusDescription']);
                    return response()->json(['error' => $responseData['statusDescription']], 400);
                }
            } else {
                Log::error('Fawry API error: ' . $response->body());
                return response()->json(['error' => 'خطأ في الاتصال بفوري'], 500);
            }
        } catch (\Exception $e) {
            Log::error('Fawry exception: ' . $e->getMessage());
            return response()->json(['error' => 'حدث خطأ: ' . $e->getMessage()], 500);
        }
    }

    public function handleCallback(Request $request)
    {
        Log::info('Fawry callback received', $request->all());

        $merchantRefNumber = $request->merchantRefNumber;
        $fawryRefNumber = $request->fawryRefNumber;
        $paymentStatus = $request->paymentStatus;
        $paymentAmount = $request->paymentAmount;
        $messageSignature = $request->messageSignature;

        $expectedSignature = hash(
            'sha256',
            $this->merchantCode .
                $merchantRefNumber .
                $fawryRefNumber .
                $paymentAmount .
                $paymentStatus .
                $this->securityKey
        );

        if ($messageSignature !== $expectedSignature) {
            Log::error('Fawry signature verification failed');
            return response()->json(['error' => 'التوقيع غير صحيح'], 400);
        }

        $paymentInfo = session('fawry_payment');

        if ($paymentInfo && $paymentInfo['merchant_ref_num'] === $merchantRefNumber) {
            if ($paymentStatus === 'PAID') {
                $user = User::find($paymentInfo['user_id']);

                if ($user) {
                    $user->subscription = $paymentInfo['plan'];

                    if ($paymentInfo['plan'] === 'basic' && $user->trial_used == false) {
                        $user->trial_used = true;
                        $user->subscription_expires_at = now()->addMonth();
                    } else {
                        $user->subscription_expires_at = now()->addMonth();
                    }

                    $user->save();

                    Log::info("User {$user->id} subscription updated to {$paymentInfo['plan']} via Fawry");
                }

                session()->forget('fawry_payment');

                return response()->json(['success' => true]);
            }

            return response()->json(['error' => 'لم يتم الدفع بعد'], 400);
        }

        return response()->json(['error' => 'طلب غير معروف'], 400);
    }

    public function handleRedirect(Request $request)
    {
        $merchantRefNumber = $request->merchantRefNumber;
        $paymentStatus = $request->paymentStatus;

        $paymentInfo = session('fawry_payment');

        if ($paymentInfo && $paymentInfo['merchant_ref_num'] === $merchantRefNumber) {
            if ($paymentStatus === 'PAID') {
                $user = User::find($paymentInfo['user_id']);

                if ($user) {
                    $user->subscription = $paymentInfo['plan'];
                    if ($paymentInfo['plan'] === 'basic' && $user->trial_used == false) {
                        $user->trial_used = true;
                        $user->subscription_expires_at = now()->addDays(7);
                    } else {
                        $user->subscription_expires_at = now()->addMonth();
                    }

                    $user->save();

                    Log::info("User {$user->id} subscription updated to {$paymentInfo['plan']} via Fawry (Redirect)");
                }

                session()->forget('fawry_payment');

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

                return redirect('/')->with('success', 'تم تفعيل اشتراكك');
            } else {
                return redirect('/allplans')->with('error', 'فشل الدفع عبر فوري: ' . $paymentStatus);
            }
        }

        return redirect('/allplans')->with('error', 'عملية غير معروفة');
    }

    public function checkPaymentStatus($merchantRefNumber)
    {
        $signature = hash('sha256', $this->merchantCode . $merchantRefNumber . $this->securityKey);

        try {
            $response = Http::get($this->baseUrl . 'ECommerceWeb/Fawry/payments/status', [
                'merchantCode' => $this->merchantCode,
                'merchantRefNumber' => $merchantRefNumber,
                'signature' => $signature
            ]);

            if ($response->successful()) {
                return $response->json();
            }
        } catch (\Exception $e) {
            Log::error('Fawry status check error: ' . $e->getMessage());
        }

        return null;
    }

    private function getPlanName($planCode)
    {
        $plans = [
            'basic' => 'الباقة الأساسية',
            'premium' => 'الباقة المتقدمة',
            'vip' => 'الباقة المميزة'
        ];

        return $plans[$planCode] ?? 'باقة غير معروفة';
    }
}
