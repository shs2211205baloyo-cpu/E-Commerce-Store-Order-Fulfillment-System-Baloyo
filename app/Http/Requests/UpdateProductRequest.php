<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('product');

        return [
            'category_id' => ['sometimes', 'required', 'integer', 'exists:categories,id'],
            'item_sku' => [
                'sometimes', 'required', 'string', 'max:100',
                Rule::unique('products', 'item_sku')->ignore($productId),
            ],
            'item_name' => ['sometimes', 'required', 'string', 'max:255'],
            'unit_price' => ['sometimes', 'required', 'numeric', 'min:0', 'decimal:0,2'],
            'stock_quantity' => ['sometimes', 'required', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'item_sku.unique' => 'This SKU belongs to another product.',
            'stock_quantity.min' => 'Stock cannot be negative.',
        ];
    }
}