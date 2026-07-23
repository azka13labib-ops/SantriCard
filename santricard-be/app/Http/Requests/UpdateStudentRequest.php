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
            'kelas' => 'sometimes|string|exists:school_classes,name',
            'limit_harian' => 'sometimes|numeric|min:0',
            'aktif' => 'sometimes|boolean',
            'parent_id' => 'sometimes|exists:users,id',
        ];
    }
}