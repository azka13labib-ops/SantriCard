<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreParentRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array { return [
        'name' => 'required|string',
        'email' => 'required|email|unique:users'
    ]; }
}