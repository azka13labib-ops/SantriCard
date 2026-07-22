<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array { return [
        'nis' => 'required|string|unique:students',
        'nama' => 'required|string',
        'kelas' => 'required|string',
        'parent_id' => 'required|exists:users,id',
    ]; }
}