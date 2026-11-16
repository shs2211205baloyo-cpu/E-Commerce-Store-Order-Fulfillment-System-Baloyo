<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeletedOrderHistory extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'original_order_id',
        'customer_name',
        'order_date',
        'order_status',
        'grand_total',
        'item_count',
        'deleted_at',
    ];

    protected function casts(): array
    {
        return [
            'order_date' => 'datetime',
            'grand_total' => 'decimal:2',
            'deleted_at' => 'datetime',
        ];
    }
}
