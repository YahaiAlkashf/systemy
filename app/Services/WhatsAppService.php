<?php

namespace App\Services;

use GuzzleHttp\Client;
use App\Models\CompanyWhatsappSetting;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected $client;
    protected $token;
    protected $phoneNumberId;
    protected $businessAccountId; 
    protected $companyId;
    protected $isConnected = false;

    public function __construct($companyId)
    {
        $this->companyId = $companyId;
        $settings = CompanyWhatsappSetting::where('company_id', $companyId)->first();

        if ($settings && $settings->is_connected) {
            $this->token = Crypt::decryptString($settings->access_token);
            $this->phoneNumberId = $settings->phone_number_id;
            $this->businessAccountId = $settings->business_account_id; // حفظ الـ business account
            $this->isConnected = true;

            $this->client = new Client([
                'base_uri' => 'https://graph.facebook.com/v19.0/',
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->token,
                    'Content-Type' => 'application/json',
                ]
            ]);
        }
    }

    public function sendMessage($to, $message)
    {
        if (!$this->isConnected) {
            throw new \Exception('إعدادات واتساب غير متوفرة لهذه الشركة');
        }

        try {
            $to = $this->cleanPhoneNumber($to);

            $response = $this->client->post($this->phoneNumberId . '/messages', [
                'json' => [
                    'messaging_product' => 'whatsapp',
                    'to' => $to,
                    'type' => 'text',
                    'text' => ['body' => $message]
                ]
            ]);

            $responseData = json_decode($response->getBody(), true);

            \App\Models\WhatsappMessage::create([
                'company_id' => $this->companyId,
                'to' => $to,
                'message' => $message,
                'status' => 'sent',
                'message_id' => $responseData['messages'][0]['id'] ?? null,
                'sent_at' => now(),
            ]);

            return $responseData;
        } catch (\Exception $e) {
            \App\Models\WhatsappMessage::create([
                'company_id' => $this->companyId,
                'to' => $to,
                'message' => $message,
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'sent_at' => now(),
            ]);

            throw $e;
        }
    }

    public function getTemplates()
    {
        if (!$this->isConnected) {
            throw new \Exception('إعدادات واتساب غير متوفرة لهذه الشركة');
        }

        $response = $this->client->get($this->businessAccountId . '/message_templates');
        return json_decode($response->getBody(), true);
    }

    protected function cleanPhoneNumber($phone)
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);

        if (substr($phone, 0, 1) === '0') {
            $phone = '20' . substr($phone, 1);
        }

        return $phone;
    }
}
