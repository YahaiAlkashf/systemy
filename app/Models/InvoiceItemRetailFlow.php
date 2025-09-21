<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InvoiceItemRetailFlow extends Model
{
use HasFactory;

    protected $fillable = [
        'invoice_id',
        'product_id',
        'quantity',
        'price',
    ];

    public function invoice()
    {
        return $this->belongsTo(InvoiceRetailFlow::class, 'invoice_id');
    }

    public function product()
    {
        return $this->belongsTo(ProductRetailFlow::class, 'product_id');
    }
}
