<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'item_sku' => ['required', 'string', 'max:100', 'unique:products,item_sku'],
            'item_name' => ['required', 'string', 'max:255'],
            'unit_price' => ['required', 'numeric', 'min:0', 'decimal:0,2'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.exists' => 'Please select an existing category.',
            'item_sku.unique' => 'This SKU is already registered.',
            'unit_price.decimal' => 'Price must have no more than two decimal places.',
            'stock_quantity.min' => 'Stock cannot be negative.',
        ];
    }
}