<?php

use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/orders/create')->name('home');

Route::get('/dashboard', function () {
    return Inertia::render('dashboard');
})->middleware('auth')->name('dashboard');

Route::resource('products', ProductController::class)
    ->only(['index', 'create', 'store', 'update']);

Route::resource('orders', OrderController::class)
    ->only(['index', 'create', 'store', 'edit', 'update']);

require __DIR__.'/auth.php';
require __DIR__.'/settings.php';
