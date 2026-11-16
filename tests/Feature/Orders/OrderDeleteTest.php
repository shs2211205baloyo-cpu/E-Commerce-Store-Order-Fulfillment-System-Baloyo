<?php

namespace Tests\Feature\Orders;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderDeleteTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_delete_orders(): void
    {
        $this->delete(route('orders.destroy', 1))
            ->assertRedirect(route('login'));
    }

    public function test_deleting_an_active_order_restores_reserved_stock(): void
    {
        [$order, $product] = $this->createOrderWithItem();

        $this->actingAs(User::factory()->create())
            ->delete(route('orders.destroy', $order))
            ->assertRedirect(route('orders.index'))
            ->assertSessionHas('success', 'Order deleted successfully.');

        $this->assertDatabaseMissing('orders', ['id' => $order->id]);
        $this->assertDatabaseMissing('order_items', ['order_id' => $order->id]);
        $this->assertSame(10, $product->fresh()->stock_quantity);
    }

    public function test_deleting_a_cancelled_order_does_not_restore_stock_again(): void
    {
        [$order, $product] = $this->createOrderWithItem('cancelled');

        $this->actingAs(User::factory()->create())
            ->delete(route('orders.destroy', $order))
            ->assertRedirect(route('orders.index'));

        $this->assertDatabaseMissing('orders', ['id' => $order->id]);
        $this->assertSame(8, $product->fresh()->stock_quantity);
    }

    /**
     * @return array{Order, Product}
     */
    private function createOrderWithItem(string $status = 'pending'): array
    {
        $customer = Customer::create([
            'customer_name' => 'Delete Test Customer',
            'customer_email' => 'delete-test@example.test',
        ]);

        $category = Category::create([
            'category_name' => 'Delete Test Category',
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'item_sku' => 'DELETE-001',
            'item_name' => 'Delete Test Product',
            'unit_price' => '10.00',
            'stock_quantity' => 8,
        ]);

        $order = Order::create([
            'customer_id' => $customer->id,
            'shipping_address' => 'Delete test address',
            'order_date' => now(),
            'tax_amount' => '0.00',
            'grand_total' => '20.00',
            'order_status' => $status,
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity_ordered' => 2,
            'unit_price' => '10.00',
            'subtotal_amount' => '20.00',
        ]);

        return [$order, $product];
    }
}
