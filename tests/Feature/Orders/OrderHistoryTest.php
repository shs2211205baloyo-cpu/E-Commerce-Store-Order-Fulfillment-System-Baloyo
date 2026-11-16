<?php

namespace Tests\Feature\Orders;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class OrderHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_login_from_history(): void
    {
        $this->get(route('history.index'))
            ->assertRedirect(route('login'));
    }

    public function test_history_lists_delivered_transactions_and_deleted_orders(): void
    {
        [$customer, $product] = $this->createCustomerAndProduct();
        $deliveredOrder = $this->createOrder($customer, $product, 'delivered');
        $this->createOrder($customer, $product, 'pending');
        $deletedOrder = $this->createOrder($customer, $product, 'cancelled');

        $this->actingAs(User::factory()->create())
            ->delete(route('orders.destroy', $deletedOrder))
            ->assertRedirect(route('orders.index'));

        $this->actingAs(User::factory()->create())
            ->get(route('history.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('History/Index')
                ->where('transactions.data.0.id', $deliveredOrder->id)
                ->where('transactions.total', 1)
                ->where('deletedOrders.data.0.original_order_id', $deletedOrder->id)
                ->where('deletedOrders.data.0.customer_name', $customer->customer_name)
                ->where('deletedOrders.total', 1));
    }

    /**
     * @return array{Customer, Product}
     */
    private function createCustomerAndProduct(): array
    {
        $customer = Customer::create([
            'customer_name' => 'History Customer',
            'customer_email' => 'history-customer@example.test',
        ]);

        $category = Category::create([
            'category_name' => 'History Category',
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'item_sku' => 'HISTORY-001',
            'item_name' => 'History Product',
            'unit_price' => '10.00',
            'stock_quantity' => 8,
        ]);

        return [$customer, $product];
    }

    private function createOrder(Customer $customer, Product $product, string $status): Order
    {
        $order = Order::create([
            'customer_id' => $customer->id,
            'shipping_address' => 'History shipping address',
            'order_date' => now(),
            'tax_amount' => '0.00',
            'grand_total' => '10.00',
            'order_status' => $status,
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity_ordered' => 1,
            'unit_price' => '10.00',
            'subtotal_amount' => '10.00',
        ]);

        return $order;
    }
}
