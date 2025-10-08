<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use  App\Models\Cycle;
use  App\Models\Company;
class Member extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'cycle_id',
        'role',
        'rating',
        'permissions',
        'user_id',
        'member_id',
        'company_id',
        'add_members',
        'add_library',
        'add_events',
        'add_tasks',
        'delete_messege',
        'add_advertisement',
        'jop_title',
    ];

    protected $casts = [
        'permissions' => 'array',
        'rating' => 'integer'
    ];
    public function cycle()
    {
        return $this->belongsTo(Cycle::class, 'cycle_id');
    }
   public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function company(){
        return $this->belongsTo(Company::class,'company_id');
    }
}
