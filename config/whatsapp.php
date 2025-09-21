<?php

return [
    'from_phone_number_id' => env('WHATSAPP_FROM_PHONE_NUMBER_ID'),
    'access_token' => env('WHATSAPP_ACCESS_TOKEN'),
    'business_account_id' => env('WHATSAPP_BUSINESS_ACCOUNT_ID'),
    'api_version' => env('WHATSAPP_API_VERSION', 'v18.0'),
    'verify_token' => env('WHATSAPP_VERIFY_TOKEN', 'my_verify_token'),
];
