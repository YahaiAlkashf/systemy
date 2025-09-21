<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsappMessage extends Model
{
    protected $fillable = [
     'company_id',
       'to',
       'message',
       'status',
       'message_id',
       'sent_at'
    ];
    public function compeny()
    {
        return $this->belongsTo('Company');
    }
}
