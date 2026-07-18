<?php

namespace App\Services;

use App\Contracts\TopUpServiceInterface;
use App\Enums\TopUpStatus;
use App\Models\Student;
use App\Models\TopUp;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class TopUpService implements TopUpServiceInterface
{
    /**
     * @inheritDoc
     */
    public function processTopup(string $siswaId, array $data, User $user, $file): array
    {
        DB::beginTransaction();
        try {
            $student = Student::where('id', $siswaId)->lockForUpdate()->firstOrFail();

            $status = TopUpStatus::PENDING->value;
            $path = null;
            $verifiedBy = null;

            if ($user->role === 'admin') {
                $status = TopUpStatus::BERHASIL->value;
                $student->saldo_virtual += $data['nominal'];
                $student->save();
                $verifiedBy = $user->id;
            } else {
                if ($file) {
                    $path = $file->store('bukti_transfer', 'local');
                } else {
                    throw new Exception('Bukti transfer wajib diunggah', 400);
                }
            }

            $topUp = TopUp::create([
                'student_id' => $student->id,
                'nominal' => $data['nominal'],
                'metode' => $data['metode'],
                'catatan' => $data['catatan'] ?? null,
                'status' => $status,
                'bukti_transfer' => $path,
                'verified_by' => $verifiedBy
            ]);

            DB::commit();

            return [
                'topUp' => $topUp,
                'saldo_sekarang' => $student->saldo_virtual,
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
            $topUp = TopUp::where('id', $topupId)->lockForUpdate()->firstOrFail();

            if ($topUp->status !== TopUpStatus::PENDING->value) {
                throw new Exception('Top-up sudah diverifikasi sebelumnya', 400);
            }

            $topUp->status = $status;
            $topUp->verified_by = $adminUser->id;
            $topUp->save();

            $student = Student::where('id', $topUp->student_id)->lockForUpdate()->firstOrFail();

            if ($status === TopupStatus::BERHASIL->value) {
                $student->saldo_virtual += $topUp->nominal;
                $student->save();
            }

            DB::commit();

            return $topUp;
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('TopupService@verifyTopup failed', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            
            $code = $e->getCode() >= 400 && $e->getCode() < 500 ? $e->getCode() : 500;
            $msg = $code === 500 ? 'Gagal memverifikasi. Silakan coba lagi.' : $e->getMessage();
            throw new Exception($msg, $code);
        }
    }
}
