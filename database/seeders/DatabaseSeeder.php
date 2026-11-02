<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::query()->firstOrCreate(
            ['email' => 'test@example.com'],
            User::factory()->make([
                'name' => 'Test User',
                'email' => 'test@example.com',
            ])->getAttributes(),
        );

        $category = Category::query()->firstOrCreate([
            'category_name' => 'Demo',
        ]);

        Customer::query()->firstOrCreate(
            ['customer_email' => 'customer@example.test'],
            ['customer_name' => 'Sample Customer'],
        );

        Product::query()->firstOrCreate(
            ['item_sku' => 'DEMO-001'],
            [
                'category_id' => $category->id,
                'item_name' => 'Sample Product',
                'unit_price' => '100.00',
                'stock_quantity' => 10,
            ],
        );
    }
}
