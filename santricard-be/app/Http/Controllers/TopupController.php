<?php

namespace App\Http\Controllers;

use App\Contracts\TopUpServiceInterface;
use App\Http\Requests\StoreTopUpRequest;
use App\Http\Requests\VerifyTopUpRequest;
use App\Http\Resources\TopUpResource;
use App\Models\TopUp;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Exception;
use Illuminate\Http\JsonResponse;

class TopUpController extends Controller
{
    use ApiResponse;

    protected TopUpServiceInterface $topupService;

    public function __construct(TopUpServiceInterface $topupService)
    {
        $this->topupService = $topupService;
    }

    /**
     * Get paginated top_ups.
     */
    public function index(Request $request): JsonResponse
    {
        $query = TopUp::with('student:id,nama,nis,kelas', 'user:id,name');

        if ($request->user()->role === 'parent') {
            $query->whereHas('student', function ($q) use ($request) {
                $q->where('parent_id', $request->user()->id);
            });
        }

        $topups = $query->orderBy('created_at', 'desc')->paginate(15);
        
        return response()->json($topups);
    }

    /**
     * Get topUp history for a specific student.
     */
    public function history(string $student_id): JsonResponse
    {
        $user = request()->user();

        // Pastikan parent hanya bisa melihat riwayat topup anaknya sendiri
        if ($user->role === 'parent') {
            $student = \App\Models\Student::where('id', $student_id)
                ->where('parent_id', $user->id)
                ->first();

            if (!$student) {
                return response()->json(['message' => 'Akses ditolak. Siswa tidak ditemukan atau bukan anak Anda.'], 403);
            }
        }

        $top_ups = TopUp::where('student_id', $student_id)->orderBy('created_at', 'desc')->get();
        return response()->json($top_ups);
    }

    /**
     * Store a new topUp request.
     */
    public function store(StoreTopUpRequest $request, string $student_id): JsonResponse
    {
        // Pastikan parent hanya bisa topup untuk anaknya sendiri
        if ($request->user()->role === 'parent') {
            $student = \App\Models\Student::where('id', $student_id)
                ->where('parent_id', $request->user()->id)
                ->first();

            if (!$student) {
                return response()->json(['message' => 'Akses ditolak. Siswa tidak ditemukan atau bukan anak Anda.'], 403);
            }
        }

        try {
            $result = $this->topupService->processTopup(
                $student_id,
                $request->validated(),
                $request->user(),
                $request->file('bukti_transfer')
            );
            
            return response()->json([
                'message' => 'Topup berhasil diajukan. Menunggu verifikasi.',
                'data' => $result['topup']
            ], 201);

        } catch (Exception $e) {
            return response()->json([
                'message' => 'Gagal memproses topup: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * ADMIN: Verifikasi topUp pending
     */
    public function verifikasi(VerifyTopUpRequest $request, string $id): JsonResponse
    {
        try {
            $topUp = $this->topupService->verifyTopup(
                $id,
                $request->validated('status'),
                $request->user()
            );

            return response()->json([
                'message' => 'Status topup berhasil diupdate',
                'data' => $topUp
            ]);

        } catch (Exception $e) {
            return response()->json([
                'message' => 'Gagal memverifikasi topup: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Download bukti transfer dari private storage (SEC-07).
     * Hanya admin atau parent pemilik siswa yang boleh mengakses.
     */
    public function downloadBukti(string $id): mixed
    {
        $topUp = TopUp::with('student')->findOrFail($id);
        $user = request()->user();

        // Periksa otorisasi: admin atau parent pemilik siswa
        if ($user->role === 'parent') {
            if (!$topUp->student || $topUp->student->parent_id !== $user->id) {
                return response()->json(['message' => 'Akses ditolak.'], 403);
            }
        } elseif ($user->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        if (!$topUp->bukti_transfer || !Storage::disk('local')->exists($topUp->bukti_transfer)) {
            return response()->json(['message' => 'Bukti transfer tidak ditemukan.'], 404);
        }

        $fullPath = storage_path('app/' . $topUp->bukti_transfer);
        return response()->file($fullPath);
    }
}
