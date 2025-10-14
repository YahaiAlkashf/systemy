<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Coupon;
class Plan extends Model
{
    protected $fillable = [
        'name',
        'price_in_egp',
        'price_outside_egp',
        'price_year_in_egp',
        'price_year_outside_egp',
    ];
    public function coupons()
    {
        return $this->hasMany(Coupon::class);
    }

}
