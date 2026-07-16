<?php

namespace App\Http\Controllers;

use App\Contracts\TopupServiceInterface;
use App\Http\Requests\StoreTopupRequest;
use App\Http\Requests\VerifyTopupRequest;
use App\Http\Resources\TopupResource;
use App\Models\Topup;
use App\Traits\ApiResponse;
use Exception;
use Illuminate\Http\JsonResponse;

class TopupController extends Controller
{
    use ApiResponse;

    protected TopupServiceInterface $topupService;

    public function __construct(TopupServiceInterface $topupService)
    {
        $this->topupService = $topupService;
    }

    /**
     * Get paginated topups.
     */
    public function index(): JsonResponse
    {
        $topups = Topup::with('siswa:id,nama,nis')->orderBy('created_at', 'desc')->paginate(25);
        return response()->json($topups); // Bisa menggunakan return TopupResource::collection($topups) nantinya.
    }

    /**
     * Get topup history for a specific siswa.
     */
    public function history(string $siswa_id): JsonResponse
    {
        $topups = Topup::where('siswa_id', $siswa_id)->orderBy('created_at', 'desc')->get();
        return response()->json($topups);
    }

    /**
     * Store a new topup request.
     */
    public function store(StoreTopupRequest $request, string $siswa_id): JsonResponse
    {
        try {
            $result = $this->topupService->processTopup(
                $siswa_id,
                $request->validated(),
                $request->user(),
                $request->file('bukti_transfer')
            );

            $message = $result['status'] === 'berhasil' 
                ? 'Top-up berhasil' 
                : 'Pengajuan top-up berhasil, menunggu verifikasi Admin.';

            return $this->successResponse([
                'topup' => new TopupResource($result['topup']),
                'saldo_sekarang' => $result['saldo_sekarang']
            ], $message, 201);

        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * ADMIN: Verifikasi topup pending
     */
    public function verifikasi(VerifyTopupRequest $request, string $id): JsonResponse
    {
        try {
            $topup = $this->topupService->verifyTopup(
                $id,
                $request->validated('status'),
                $request->user()
            );

            return $this->successResponse(
                new TopupResource($topup), 
                'Verifikasi top-up tersimpan'
            );

        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }
}
