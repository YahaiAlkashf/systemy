<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyWhatsappSetting extends Model
{
    protected $fillable = [
        'company_id',
        'phone_number_id',
        'business_account_id',
        'access_token',
        'is_connected'
    ];
}
