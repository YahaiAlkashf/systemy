<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Task extends Model
{


    protected $fillable = [
        'title',
        'description',
        'assigned_by',
        'assigned_to',
        'due_date',
        'status',
        'company_id',
        'task_id'
    ];

   public $timestamps = false;

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
    public function assigner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
    public function files()
    {
        return $this->hasMany(TaskFile::class);
    }
    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
