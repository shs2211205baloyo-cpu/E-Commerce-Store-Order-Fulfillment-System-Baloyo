<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Order extends Model
{
    protected $fillable = [
        'customer_id',
        'shipping_address',
        'order_date',
        'tax_amount',
        'grand_total',
        'order_status',
    ];

    protected function casts(): array
    {
        return [
            'order_date' => 'datetime',
            'tax_amount' => 'decimal:2',
            'grand_total' => 'decimal:2',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(
            Product::class,
            'order_items'
        )->withPivot([
            'quantity_ordered',
            'unit_price',
            'subtotal_amount',
        ])->withTimestamps();
    }
}   