<?php

namespace App\Enums;

enum TopupStatus: string
{
    case PENDING = 'pending';
    case BERHASIL = 'berhasil';
    case GAGAL = 'gagal';
}
