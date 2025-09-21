<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InvoiceRetailFlow extends Model
{
use HasFactory;
    protected $fillable = [
        'company_id',
        'customer_id',
        'total',
        'status',
        'paid_amount',
        'total_profit'
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function customer()
    {
        return $this->belongsTo(CustomerRetailFlow::class, 'customer_id');
    }

    public function items()
    {
        return $this->hasMany(InvoiceItemRetailFlow::class, 'invoice_id');
    }
}
