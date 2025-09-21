<?php

namespace App\Models;
use App\Models\Company;
use App\Models\EventAttendance;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable =[
        'title',
        'description',
        'date',
        'company_id',
        'option'
    ];

    public function attendances (){
        return $this->hasMany(EventAttendance::class);
    }
    public function company(){
        return $this->belongsTo(Company::class);
    }
}
