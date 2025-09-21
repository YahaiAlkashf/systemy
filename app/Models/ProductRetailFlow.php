<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductRetailFlow extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'name',
        'price',
        'quantity',
        'category',
        'additional_costs',
        'wholesale_price',
        'net_profit',
        'barcode'
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function invoiceItems()
    {
        return $this->hasMany(InvoiceItemRetailFlow::class, 'product_id');
    }
}
