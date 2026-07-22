<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSettlementRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array { return [
        'merchant_id' => 'required|exists:merchants,id',
        'catatan' => 'nullable|string'
    ]; }
}