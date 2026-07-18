<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Settlement extends Model
{
    protected $fillable = [
        'merchant_id',
        'nominal',
        'catatan',
        'status',
        'processed_by',
    ];

    public function merchant()
    {
        return $this->belongsTo(Merchant::class);
    }
}
