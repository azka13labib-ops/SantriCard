<?php

namespace App\Services;

use App\Contracts\TopupServiceInterface;
use App\Enums\TopupStatus;
use App\Models\Siswa;
use App\Models\Topup;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class TopupService implements TopupServiceInterface
{
    /**
     * @inheritDoc
     */
    public function processTopup(string $siswaId, array $data, User $user, $file): array
    {
        DB::beginTransaction();
        try {
            $siswa = Siswa::where('id', $siswaId)->lockForUpdate()->firstOrFail();

            $status = TopupStatus::PENDING->value;
            $path = null;
            $verifiedBy = null;

            if ($user->role === 'admin') {
                $status = TopupStatus::BERHASIL->value;
                $siswa->saldo_virtual += $data['nominal'];
                $siswa->save();
                $verifiedBy = $user->id;
            } else {
                if ($file) {
                    $path = $file->store('bukti_transfer', 'public');
                } else {
                    throw new Exception('Bukti transfer wajib diunggah', 400);
                }
            }

            $topup = Topup::create([
                'siswa_id' => $siswa->id,
                'nominal' => $data['nominal'],
                'metode' => $data['metode'],
                'catatan' => $data['catatan'] ?? null,
                'status' => $status,
                'bukti_transfer' => $path,
                'verified_by' => $verifiedBy
            ]);

            DB::commit();

            return [
                'topup' => $topup,
                'saldo_sekarang' => $siswa->saldo_virtual,
                'status' => $status
            ];
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('TopupService@processTopup failed', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            
            $code = $e->getCode() >= 400 && $e->getCode() < 500 ? $e->getCode() : 500;
            $msg = $code === 500 ? 'Top-up gagal diproses. Silakan coba lagi.' : $e->getMessage();
            throw new Exception($msg, $code);
        }
    }

    /**
     * @inheritDoc
     */
    public function verifyTopup(string $topupId, string $status, User $adminUser)
    {
        DB::beginTransaction();
        try {
            $topup = Topup::where('id', $topupId)->lockForUpdate()->firstOrFail();

            if ($topup->status !== TopupStatus::PENDING->value) {
                throw new Exception('Top-up sudah diverifikasi sebelumnya', 400);
            }

            $topup->status = $status;
            $topup->verified_by = $adminUser->id;
            $topup->save();

            $siswa = Siswa::where('id', $topup->siswa_id)->lockForUpdate()->firstOrFail();

            if ($status === TopupStatus::BERHASIL->value) {
                $siswa->saldo_virtual += $topup->nominal;
                $siswa->save();
            }

            DB::commit();

            return $topup;
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('TopupService@verifyTopup failed', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            
            $code = $e->getCode() >= 400 && $e->getCode() < 500 ? $e->getCode() : 500;
            $msg = $code === 500 ? 'Gagal memverifikasi. Silakan coba lagi.' : $e->getMessage();
            throw new Exception($msg, $code);
        }
    }
}
