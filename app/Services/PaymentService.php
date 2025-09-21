<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Stripe\StripeClient;

class PaymentService
{
    protected $stripe;
    protected $user;

    public function __construct(User $user = null)
    {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
        $this->user = $user ?? Auth::user();
    }

    // Stripe Payment
    public function createStripePayment($plan, $amount)
    {
        try {
            $session = $this->stripe->checkout->sessions->create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'egp',
                        'product_data' => [
                            'name' => $this->getPlanName($plan),
                        ],
                        'unit_amount' => $amount * 100,
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => route('payment.success', ['gateway' => 'stripe', 'plan' => $plan]),
                'cancel_url' => route('payment.cancel'),
                'customer_email' => $this->user->email,
                'metadata' => [
                    'user_id' => $this->user->id,
                    'plan' => $plan
                ]
            ]);

            return [
                'success' => true,
                'session_id' => $session->id,
                'url' => $session->url
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    // Paymob Payment
    public function createPaymobPayment($plan, $amount)
    {
        try {

            $authResponse = Http::post('https://accept.paymobsolutions.com/api/auth/tokens', [
                'api_key' => env('PAYMOB_API_KEY')
            ]);

            if (!$authResponse->successful()) {
                throw new \Exception('Failed to get auth token from Paymob');
            }

            $authToken = $authResponse->json('token');


            $orderResponse = Http::withToken($authToken)->post('https://accept.paymobsolutions.com/api/ecommerce/orders', [
                'delivery_needed' => false,
                'merchant_id' => env('PAYMOB_MERCHANT_ID'),
                'amount_cents' => $amount * 100,
                'currency' => 'EGP',
                'items' => []
            ]);

            if (!$orderResponse->successful()) {
                throw new \Exception('Failed to create order in Paymob');
            }

            $orderId = $orderResponse->json('id');


            $paymentKeyResponse = Http::withToken($authToken)->post('https://accept.paymobsolutions.com/api/acceptance/payment_keys', [
                'amount_cents' => $amount * 100,
                'expiration' => 3600,
                'order_id' => $orderId,
                'billing_data' => [
                    'apartment' => 'N/A',
                    'email' => $this->user->email,
                    'floor' => 'N/A',
                    'first_name' => explode(' ', $this->user->name)[0],
                    'street' => 'N/A',
                    'building' => 'N/A',
                    'phone_number' => '01000000000',
                    'shipping_method' => 'N/A',
                    'postal_code' => 'N/A',
                    'city' => 'N/A',
                    'country' => 'EG',
                    'last_name' => explode(' ', $this->user->name)[1] ?? '',
                    'state' => 'N/A'
                ],
                'currency' => 'EGP',
                'integration_id' => env('PAYMOB_INTEGRATION_ID')
            ]);

            if (!$paymentKeyResponse->successful()) {
                throw new \Exception('Failed to create payment key in Paymob');
            }

            $paymentKey = $paymentKeyResponse->json('token');

            return [
                'success' => true,
                'payment_key' => $paymentKey,
                'iframe_id' => env('PAYMOB_IFRAME_ID'),
                'order_id' => $orderId
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

  
    public function createFawryPayment($plan, $amount)
    {
        try {
            $merchantCode = env('FAWRY_MERCHANT_CODE');
            $secretKey = env('FAWRY_SECRET_KEY');

            $merchantRefNum = 'SUB_' . $this->user->id . '_' . time();


            $signatureString = $merchantCode .
                              $merchantRefNum .
                              'subscription' .
                              $plan .
                              $amount .
                              $secretKey;

            $signature = hash('sha256', $signatureString);

            return [
                'success' => true,
                'merchant_code' => $merchantCode,
                'merchant_ref_num' => $merchantRefNum,
                'amount' => $amount,
                'signature' => $signature,
                'customer_name' => $this->user->name,
                'customer_email' => $this->user->email,
                'plan' => $plan
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }


    public function verifyPaymobPayment($request)
    {
        $hmac = $request->hmac;
        $data = $request->except('hmac');

        $calculatedHmac = hash_hmac('sha512', implode('', $data), env('PAYMOB_HMAC_SECRET'));

        return $hmac === $calculatedHmac && $request->success === 'true';
    }

    private function getPlanName($planKey)
    {
        $plans = [
            'basic' => 'الباقة الأساسية',
            'advanced' => 'الباقة المتقدمة',
            'premium' => 'الباقة المميزة'
        ];

        return $plans[$planKey] ?? 'Unknown Plan';
    }
}
