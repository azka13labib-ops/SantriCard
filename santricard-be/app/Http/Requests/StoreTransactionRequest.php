<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array { return [
        'kode_kartu' => 'required|string',
        'nominal' => 'required|numeric|min:500|max:20000',
        'idempotency_key' => 'nullable|string|max:50',
    ]; }
}