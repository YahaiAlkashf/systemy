<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CustomerRetailFlow extends Model
{
use HasFactory;

    protected $fillable = [
        'company_id',
        'name',
        'phone',
        'email',
        'address',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function invoices()
    {
        return $this->hasMany(InvoiceRetailFlow::class, 'customer_id');
    }
}
