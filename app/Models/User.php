<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Laravel\Cashier\Billable;
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable ,HasApiTokens,Billable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'company_id',
        'is_company_owner',
        'email_verified_at',
        'remember_token',
        'role',
        'created_at',
        'updated_at',
        'logo',
        'system_type',
        'country',
        'access',
        'subscription',
        'subscription_expires_at',
        'trial_used'
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function member()
    {
        return $this->hasOne(Member::class, 'user_id');
    }

    public function attendances () {
          return $this->hasMany(EventAttendance::class);
    }

    public function announcements()
    {
        return $this->hasMany(Announcement::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }


        protected $casts = [
            'access' => 'array',
        ];
    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
