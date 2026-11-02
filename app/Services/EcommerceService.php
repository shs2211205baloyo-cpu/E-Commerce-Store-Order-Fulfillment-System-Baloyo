<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EcommerceService
{
    private function clean(string $value): string
    {
        return trim(strip_tags($value));
    }

    private function money(float|int|string $value): string
    {
        return number_format((float) $value, 2, '.', '');
    }

    public function createProduct(array $data): Product
    {
        $data['item_sku'] = $this->clean($data['item_sku']);
        $data['item_name'] = $this->clean($data['item_name']);
        $data['unit_price'] = $this->money($data['unit_price']);

        return Product::create($data);
    }

    public function updateProduct(Product $product, array $data): Product
    {
        foreach (['item_sku', 'item_name'] as $field) {
            if (isset($data[$field])) {
                $data[$field] = $this->clean($data[$field]);
            }
        }

        if (isset($data['unit_price'])) {
            $data['unit_price'] = $this->money($data['unit_price']);
        }

        $product->update($data);

        return $product->refresh();
    }

    public function createOrder(array $data): Order
    {
        return DB::transaction(function () use ($data) {
            $address = $this->clean($data['shipping_address']);

            if ($address === '') {
                throw ValidationException::withMessages([
                    'shipping_address' => 'Shipping address cannot be empty.',
                ]);
            }

            $items = collect($data['items'])
                ->sortBy('product_id')
                ->values();

            $productIds = $items->pluck('product_id')->all();

            if (count($productIds) !== count(array_unique($productIds))) {
                throw ValidationException::withMessages([
                    'items' => 'Each product may only appear once per order.',
                ]);
            }

            $products = Product::query()
                ->whereIn('id', $productIds)
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            if ($products->count() !== count($productIds)) {
                throw ValidationException::withMessages([
                    'items' => 'One or more selected products no longer exist.',
                ]);
            }

            $subtotal = 0;

            foreach ($items as $item) {
                $product = $products->get($item['product_id']);
                $quantity = (int) $item['quantity_ordered'];

                if ($quantity > $product->stock_quantity) {
                    throw ValidationException::withMessages([
                        'items' => "Insufficient stock for {$product->item_name}.",
                    ]);
                }

                $subtotal += round(
                    (float) $product->unit_price * $quantity,
                    2
                );
            }

            $tax = round((float) ($data['tax_amount'] ?? 0), 2);

            $order = Order::create([
                'customer_id' => $data['customer_id'],
                'shipping_address' => $address,
                'order_date' => now(),
                'tax_amount' => $this->money($tax),
                'grand_total' => $this->money($subtotal + $tax),
                'order_status' => 'pending',
            ]);

            foreach ($items as $item) {
                $product = $products->get($item['product_id']);
                $quantity = (int) $item['quantity_ordered'];
                $price = (float) $product->unit_price;
                $lineSubtotal = round($price * $quantity, 2);

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity_ordered' => $quantity,
                    'unit_price' => $this->money($price),
                    'subtotal_amount' => $this->money($lineSubtotal),
                ]);

                $product->decrement('stock_quantity', $quantity);
            }

            return $order->load([
                'customer',
                'orderItems.product',
            ]);
        }, 3);
    }

    public function updateOrder(Order $order, array $data): Order
    {
        return DB::transaction(function () use ($order, $data) {
            $order = Order::query()
                ->lockForUpdate()
                ->findOrFail($order->id);

            $oldStatus = $order->order_status;
            $newStatus = $data['order_status'] ?? $oldStatus;
            $itemsWereSupplied = array_key_exists('items', $data);

            $address = $data['shipping_address']
                ?? $order->shipping_address;

            $address = $this->clean($address);

            if ($address === '') {
                throw ValidationException::withMessages([
                    'shipping_address' => 'Shipping address cannot be empty.',
                ]);
            }

            // Stock is reserved for active orders, not cancelled orders.
            if ($itemsWereSupplied || (
                $oldStatus !== 'cancelled' && $newStatus === 'cancelled'
            ) || (
                $oldStatus === 'cancelled' && $newStatus !== 'cancelled'
            )) {
                $oldItems = $order->orderItems()->get();

                $oldQuantities = $oldItems
                    ->groupBy('product_id')
                    ->map(fn ($rows) => $rows->sum('quantity_ordered'));

                $newItems = collect(
                    $data['items'] ?? $oldItems->map(fn ($item) => [
                        'product_id' => $item->product_id,
                        'quantity_ordered' => $item->quantity_ordered,
                    ])->all()
                )->sortBy('product_id')->values();

                $newIds = $newItems->pluck('product_id')->all();

                if (count($newIds) !== count(array_unique($newIds))) {
                    throw ValidationException::withMessages([
                        'items' => 'Each product may only appear once per order.',
                    ]);
                }

                $ids = array_values(array_unique(array_merge(
                    $oldQuantities->keys()->all(),
                    $newIds
                )));

                sort($ids);

                $products = Product::query()
                    ->whereIn('id', $ids)
                    ->orderBy('id')
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                // Return the old reservation to stock first.
                if ($oldStatus !== 'cancelled') {
                    foreach ($oldQuantities as $productId => $quantity) {
                        $products->get($productId)
                            ->increment('stock_quantity', $quantity);
                    }
                }

                // Reserve inventory again if the resulting order is active.
                if ($newStatus !== 'cancelled') {
                    foreach ($newItems as $item) {
                        $product = $products->get($item['product_id']);
                        $quantity = (int) $item['quantity_ordered'];

                        if (!$product || $quantity > $product->stock_quantity) {
                            throw ValidationException::withMessages([
                                'items' => 'A requested product has insufficient stock.',
                            ]);
                        }
                    }

                    foreach ($newItems as $item) {
                        $products->get($item['product_id'])
                            ->decrement(
                                'stock_quantity',
                                (int) $item['quantity_ordered']
                            );
                    }
                }

                if ($itemsWereSupplied) {
                    $order->orderItems()->delete();

                    foreach ($newItems as $item) {
                        $product = $products->get($item['product_id']);
                        $quantity = (int) $item['quantity_ordered'];
                        $price = (float) $product->unit_price;

                        OrderItem::create([
                            'order_id' => $order->id,
                            'product_id' => $product->id,
                            'quantity_ordered' => $quantity,
                            'unit_price' => $this->money($price),
                            'subtotal_amount' => $this->money(
                                $price * $quantity
                            ),
                        ]);
                    }
                }
            }

            $order->shipping_address = $address;
            $order->order_status = $newStatus;

            if (isset($data['customer_id'])) {
                $order->customer_id = $data['customer_id'];
            }

            if (isset($data['tax_amount'])) {
                $order->tax_amount = $this->money($data['tax_amount']);
            }

            $subtotal = $itemsWereSupplied
                ? $order->orderItems()->sum('subtotal_amount')
                : $order->orderItems()->sum('subtotal_amount');

            $order->grand_total = $this->money(
                (float) $subtotal + (float) $order->tax_amount
            );

            $order->save();

            return $order->load(['customer', 'orderItems.product']);
        }, 3);
    }
}