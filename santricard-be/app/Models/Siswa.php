<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Siswa extends Model
{
    protected $guarded = ['id'];
    protected $appends = ['sisa_limit_hari_ini'];

    public function ortu()
    {
        return $this->belongsTo(User::class, 'ortu_id');
    }

    public function kartu()
    {
        return $this->hasOne(Kartu::class);
    }

    public function transaksis()
    {
        return $this->hasMany(Transaksi::class);
    }

    public function topups()
    {
        return $this->hasMany(Topup::class);
    }

    public function getSisaLimitHariIniAttribute()
    {
        $terpakaiHariIni = $this->transaksis()
            ->whereDate('created_at', today())
            ->where('status', 'berhasil')
            ->sum('nominal');

        return max(0, $this->limit_harian - $terpakaiHariIni);
    }
}
