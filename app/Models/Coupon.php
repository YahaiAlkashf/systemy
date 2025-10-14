<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'code',
        'price_in_egp',
        'price_outside_egp',
        'plan_id',
        'plan'
    ];

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }
}
