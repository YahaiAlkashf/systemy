<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Rent extends Model
{
    protected $fillable = [
        'company_id',
        'customer_id',
        'start_date',
        'end_date',
        'monthly_rent',
        'paid_this_month',
        'paid_amount',
        'subscription_type'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'paid_this_month' => 'boolean',
        'monthly_rent' => 'float',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(CustomerRetailFlow::class, 'customer_id');
    }
}
