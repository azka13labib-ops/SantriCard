<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateParentRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array {
        $id = $this->route('id');
        return [
            'name' => 'sometimes|string',
            'email' => 'sometimes|email|unique:users,email,' . $id
        ];
    }
}