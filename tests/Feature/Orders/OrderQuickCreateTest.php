<?php

namespace Tests\Feature\Orders;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderQuickCreateTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_be_created_from_the_order_form(): void
    {
        $this->actingAs(User::factory()->create())
            ->post(route('orders.customers.store'), [
                'customer_name' => 'New Order Customer',
                'customer_email' => 'new-order-customer@example.test',
            ])
            ->assertRedirect(route('orders.create'))
            ->assertSessionHas('created_customer_id');

        $this->assertDatabaseHas('customers', [
            'customer_name' => 'New Order Customer',
            'customer_email' => 'new-order-customer@example.test',
        ]);
    }

    public function test_product_can_be_created_from_the_order_form(): void
    {
        $category = Category::create([
            'category_name' => 'Quick Order Category',
        ]);

        $this->actingAs(User::factory()->create())
            ->post(route('orders.products.store'), [
                'category_id' => $category->id,
                'item_sku' => 'QUICK-001',
                'item_name' => 'Quick Order Product',
                'unit_price' => '12.50',
                'stock_quantity' => 3,
            ])
            ->assertRedirect(route('orders.create'))
            ->assertSessionHas('created_product_id');

        $this->assertDatabaseHas('products', [
            'category_id' => $category->id,
            'item_sku' => 'QUICK-001',
            'item_name' => 'Quick Order Product',
            'unit_price' => '12.50',
            'stock_quantity' => 3,
        ]);
    }

    public function test_guests_cannot_create_customers_or_products_from_the_order_form(): void
    {
        $this->post(route('orders.customers.store'), [])
            ->assertRedirect(route('login'));
        $this->post(route('orders.products.store'), [])
            ->assertRedirect(route('login'));
    }
}
