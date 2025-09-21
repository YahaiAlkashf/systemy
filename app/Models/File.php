<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class File extends Model
{
    protected $fillable=[
        'name',
        'path',
        'size',
        'extension',
        'folder_id',
        'company_id',
        'uploaded_by'
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function folder()
    {
        return $this->belongsTo(Folder::class);
    }

    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function getSizeInKbAttribute()
    {
        return round($this->size / 1024, 2);
    }

    public function getSizeInMbAttribute()
    {
        return round($this->size / 1048576, 2);
    }
}
