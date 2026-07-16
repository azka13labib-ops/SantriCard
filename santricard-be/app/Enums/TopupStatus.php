<?php

namespace App\Enums;

enum TopUpStatus: string
{
    case PENDING = 'pending';
    case BERHASIL = 'berhasil';
    case GAGAL = 'gagal';
}
