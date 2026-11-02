<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['sometimes', 'required', 'integer', 'exists:customers,id'],
            'shipping_address' => ['sometimes', 'required', 'string', 'max:1000'],
            'tax_amount' => ['sometimes', 'numeric', 'min:0', 'decimal:0,2'],
            'order_status' => [
                'sometimes', 'required',
                Rule::in(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
            ],
            'items' => ['sometimes', 'required', 'array', 'min:1'],
            'items.*.product_id' => [
                'required', 'integer', 'distinct', 'exists:products,id',
            ],
            'items.*.quantity_ordered' => [
                'required', 'integer', 'min:1',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'order_status.in' => 'Select a valid order status.',
            'items.*.product_id.distinct' => 'Each product may only appear once per order.',
            'items.*.quantity_ordered.min' => 'Order quantity must be at least one.',
        ];
    }
}