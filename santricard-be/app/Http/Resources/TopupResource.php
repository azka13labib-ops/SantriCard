<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TopupResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nominal' => (float) $this->nominal,
            'metode' => $this->metode,
            'catatan' => $this->catatan,
            'status' => $this->status,
            'bukti_transfer_url' => $this->bukti_transfer ? asset('storage/' . $this->bukti_transfer) : null,
            'verified_by' => $this->verified_by,
            'created_at' => $this->created_at,
            'siswa' => $this->whenLoaded('siswa', function () {
                return [
                    'id' => $this->siswa->id,
                    'nama' => $this->siswa->nama,
                    'nis' => $this->siswa->nis,
                ];
            }),
        ];
    }
}
