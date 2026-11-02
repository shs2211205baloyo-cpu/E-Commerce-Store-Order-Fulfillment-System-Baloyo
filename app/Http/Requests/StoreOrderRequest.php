<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'shipping_address' => ['required', 'string', 'max:1000'],
            'tax_amount' => ['sometimes', 'numeric', 'min:0', 'decimal:0,2'],
            'items' => ['required', 'array', 'min:1'],
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
            'shipping_address.required' => 'A shipping address is required.',
            'items.min' => 'An order must contain at least one product.',
            'items.*.product_id.distinct' => 'Each product may only appear once per order.',
            'items.*.quantity_ordered.min' => 'Order quantity must be at least one.',
        ];
    }
}