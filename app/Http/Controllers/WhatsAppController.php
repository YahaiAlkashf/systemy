<?php
// app/Http/Controllers/Company/WhatsAppController.php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\WhatsAppService;
use App\Models\CompanyWhatsappSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;

class WhatsAppController extends Controller
{


    public function saveSettings(Request $request)
    {
        $validated = $request->validate([
            'phone_number_id' => 'required|string',
            'business_account_id' => 'required|string',
            'access_token' => 'required|string'
        ], [
            'phone_number_id.required' => 'معرّف رقم الهاتف مطلوب',
            'phone_number_id.string' => 'معرّف رقم الهاتف يجب أن يكون نصًا',

            'business_account_id.required' => 'معرّف الحساب التجاري مطلوب',
            'business_account_id.string' => 'معرّف الحساب التجاري يجب أن يكون نصًا',

            'access_token.required' => 'رمز الوصول مطلوب',
            'access_token.string' => 'رمز الوصول يجب أن يكون نصًا',
        ]);


        CompanyWhatsappSetting::updateOrCreate(
            ['company_id' => Auth::user()->company_id],
            [
                'phone_number_id' => $validated['phone_number_id'],
                'business_account_id' => $validated['business_account_id'],
                'access_token' => Crypt::encryptString($validated['access_token']),
                'is_connected' => true
            ]
        );

        return redirect()->back()->with('success', 'تم حفظ إعدادات واتساب بنجاح');
    }

    public function sendMessage(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required',
            'message' => 'required'
        ], [
            'phone.required' => 'رقم الهاتف مطلوب',
            'message.required' => 'الرسالة مطلوبة',
        ]);


        try {
            $phone = preg_replace('/[^0-9]/', '', $validated['phone']);
            $whatsappService = new WhatsAppService(Auth::user()->company_id);
            $response = $whatsappService->sendMessage(
                $phone,
                $validated['message']
            );

            return response()->json([
                'success' => true,
                'data' => $response,
                'message' => 'تم إرسال الرسالة بنجاح'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل إرسال الرسالة: ' . $e->getMessage()
            ], 400);
        }
    }

    public function testConnection(Request $request)
    {
        try {
            $accessToken = $request->input('access_token');
            $phoneNumberId = $request->input('phone_number_id');
            $businessAccountId = $request->input('business_account_id');

            $client = new \GuzzleHttp\Client();
            $response = $client->get("https://graph.facebook.com/v19.0/{$phoneNumberId}", [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                ]
            ]);

            return response()->json([
                'success' => true,
                'message' => 'الاتصال ناجح',
                'data' => json_decode($response->getBody(), true)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل الاتصال: ' . $e->getMessage()
            ], 400);
        }
    }
}
