<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStudentRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array {
        $id = $this->route('id');
        return [
            'nis' => 'sometimes|string|unique:students,nis,' . $id,
            'nama' => 'sometimes|string',
            'kelas' => 'sometimes|string|in:VII-1,VII-2,VII-3,VIII-1,VIII-2,VIII-3,IX-1,IX-2,IX-3',
            'limit_harian' => 'sometimes|numeric|min:0',
            'aktif' => 'sometimes|boolean',
            'parent_id' => 'sometimes|exists:users,id',
        ];
    }
}