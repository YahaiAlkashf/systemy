<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Company extends Model
{
    use HasFactory;
    protected $fillable = [
        'company_name',
        'phone',
        'address',
        'logo',
        'subscription',
        'subscription_expires_at',
        'trial_used',
        'plan'
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }
    public function superAdmins()
    {
        return $this->hasMany(User::class)->where('role', 'superadmin');
    }
}
