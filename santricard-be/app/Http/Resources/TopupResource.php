<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TopUpResource extends JsonResource
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
            'student' => $this->whenLoaded('student', function () {
                return [
                    'id' => $this->student->id,
                    'nama' => $this->student->nama,
                    'nis' => $this->student->nis,
                ];
            }),
        ];
    }
}
