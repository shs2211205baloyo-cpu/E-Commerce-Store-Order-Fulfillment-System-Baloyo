<?php

use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\OrderHistoryController;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/orders/create')->name('home');

Route::get('/dashboard', function () {
    return Inertia::render('dashboard', [
        'stats' => [
            'totalOrders' => Order::count(),
            'pendingOrders' => Order::whereIn('order_status', ['pending', 'processing'])->count(),
            'deliveredSales' => Order::where('order_status', 'delivered')->sum('grand_total'),
            'lowStockProducts' => Product::where('stock_quantity', '<=', 5)->count(),
        ],
        'recentOrders' => Order::with('customer')
            ->withCount('orderItems')
            ->latest('order_date')
            ->limit(5)
            ->get([
                'id',
                'customer_id',
                'order_date',
                'grand_total',
                'order_status',
            ]),
        'lowStockItems' => Product::query()
            ->where('stock_quantity', '<=', 5)
            ->orderBy('stock_quantity')
            ->orderBy('item_name')
            ->limit(5)
            ->get(['id', 'item_name', 'item_sku', 'stock_quantity']),
    ]);
})->middleware('auth')->name('dashboard');

Route::resource('products', ProductController::class)
    ->only(['index', 'create', 'store', 'update']);

Route::middleware('auth')->group(function () {
    Route::get('history', [OrderHistoryController::class, 'index'])
        ->name('history.index');

    Route::resource('orders', OrderController::class)
        ->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);

    Route::post('orders/customers', [CustomerController::class, 'storeForOrder'])
        ->name('orders.customers.store');
    Route::post('orders/products', [ProductController::class, 'storeForOrder'])
        ->name('orders.products.store');
});

require __DIR__.'/auth.php';
require __DIR__.'/settings.php';
