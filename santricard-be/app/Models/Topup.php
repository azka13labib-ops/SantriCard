<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TopUp extends Model
{
    protected $fillable = [
        'student_id',
        'nominal',
        'metode',
        'catatan',
        'status',
        'bukti_transfer',
        'verified_by',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
