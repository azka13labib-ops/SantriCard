<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    protected $guarded = ['id'];
    // Catatan: 'sisa_limit_hari_ini' TIDAK dimasukkan ke $appends untuk menghindari
    // N+1 query saat endpoint index() dipanggil. Accessor ini digunakan secara eksplisit
    // hanya di endpoint saldo() dan saat transaction diproses.

    public function parent()
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function card()
    {
        return $this->hasOne(Card::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function top_ups()
    {
        return $this->hasMany(TopUp::class);
    }

    public function getSisaLimitHariIniAttribute()
    {
        $terpakaiHariIni = $this->transactions()
            ->whereDate('created_at', today())
            ->where('status', 'berhasil')
            ->sum('nominal');

        return max(0, $this->limit_harian - $terpakaiHariIni);
    }
}
