<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'role', 'aktif'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'aktif' => 'boolean',
        ];
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'parent_id');
    }

    public function merchant()
    {
        return $this->hasOne(Merchant::class);
    }

    /**
     * Mengembalikan jumlah siswa aktif yang terhubung ke orang tua ini (integer).
     * Memperbaiki bug di mana field ini mengembalikan relasi/objek, bukan angka.
     */
    public function getJumlahAnakAttribute(): int
    {
        return $this->students()->where('aktif', true)->count();
    }
}
