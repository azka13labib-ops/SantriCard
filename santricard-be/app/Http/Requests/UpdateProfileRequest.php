<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array {
        $userId = $this->user()->id;
        return [
            'email' => 'required|email|unique:users,email,' . $userId,
            'current_password' => 'required',
            'password' => 'nullable|min:6',
        ];
    }
}