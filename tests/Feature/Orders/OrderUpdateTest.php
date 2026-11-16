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

class OrderUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_login_for_order_routes(): void
    {
        $this->get(route('orders.index'))->assertRedirect(route('login'));
        $this->get(route('orders.create'))->assertRedirect(route('login'));
        $this->get(route('orders.edit', 1))->assertRedirect(route('login'));
        $this->post(route('orders.store'))->assertRedirect(route('login'));
        $this->put(route('orders.update', 1))->assertRedirect(route('login'));
    }

    public function test_root_redirects_guests_to_login_before_showing_order_creation(): void
    {
        $this->get('/')
            ->assertRedirect(route('orders.create'));

        $this->get(route('orders.create'))
            ->assertRedirect(route('login'));

        $this->post(route('login'), [
            'email' => User::factory()->create()->email,
            'password' => 'password',
        ])->assertRedirect(route('orders.create'));
    }

    public function test_order_edit_page_is_displayed_with_current_order_data(): void
    {
        [$order] = $this->createOrderWithItem();

        $this->actingAs(User::factory()->create())
            ->get(route('orders.edit', $order))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Orders/Edit')
                ->where('order.id', $order->id)
                ->where('order.order_items.0.quantity_ordered', 2)
                ->has('customers', 1)
                ->has('products', 1));
    }

    public function test_order_items_status_and_total_can_be_updated(): void
    {
        [$order, $product] = $this->createOrderWithItem();

        $this->actingAs(User::factory()->create())
            ->put(route('orders.update', $order), [
                'customer_id' => $order->customer_id,
                'shipping_address' => 'Updated shipping address',
                'tax_amount' => '2.00',
                'order_status' => 'processing',
                'items' => [
                    [
                        'product_id' => $product->id,
                        'quantity_ordered' => 3,
                    ],
                ],
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('orders.index'));

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'shipping_address' => 'Updated shipping address',
            'tax_amount' => '2.00',
            'grand_total' => '32.00',
            'order_status' => 'processing',
        ]);
        $this->assertDatabaseHas('order_items', [
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity_ordered' => 3,
            'subtotal_amount' => '30.00',
        ]);
        $this->assertSame(7, $product->fresh()->stock_quantity);
    }

    /**
     * @return array{Order, Product}
     */
    private function createOrderWithItem(): array
    {
        $customer = Customer::create([
            'customer_name' => 'Order Customer',
            'customer_email' => 'order-customer@example.test',
        ]);

        $category = Category::create([
            'category_name' => 'Order Category',
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'item_sku' => 'ORDER-001',
            'item_name' => 'Order Product',
            'unit_price' => '10.00',
            'stock_quantity' => 8,
        ]);

        $order = Order::create([
            'customer_id' => $customer->id,
            'shipping_address' => 'Original shipping address',
            'order_date' => now(),
            'tax_amount' => '0.00',
            'grand_total' => '20.00',
            'order_status' => 'pending',
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
