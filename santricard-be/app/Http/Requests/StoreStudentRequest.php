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
        'kelas' => 'required|string|exists:school_classes,name',
        'limit_harian' => 'required|numeric|min:0',
    ]; }
}