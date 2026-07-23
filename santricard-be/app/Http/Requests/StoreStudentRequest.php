<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array { return [
        'parent_id' => 'required|exists:users,id',
        'nis' => 'required|string|unique:students,nis',
        'nama' => 'required|string',
        'kelas' => 'required|string|in:VII-1,VII-2,VII-3,VIII-1,VIII-2,VIII-3,IX-1,IX-2,IX-3',
        'limit_harian' => 'required|numeric|min:0',
    ]; }
}