<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cycle extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'company_id'
    ];
    public function members()
    {
        return $this->hasMany(Member::class);
    }
}