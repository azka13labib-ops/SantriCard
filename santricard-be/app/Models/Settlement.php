<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Settlement extends Model
{
    protected $guarded = ['id'];

    public function pedagang()
    {
        return $this->belongsTo(Pedagang::class);
    }
}
