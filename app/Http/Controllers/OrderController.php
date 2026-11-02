<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Services\EcommerceService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(
        private EcommerceService $service
    ) {}

    public function index(): Response
    {
        return Inertia::render('Orders/Index', [
            'orders' => Order::with([
                'customer',
                'orderItems.product.category',
            ])->latest()->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Orders/Create', [
            'customers' => Customer::orderBy('customer_name')->get(),
            'products' => Product::with('category')
                ->where('stock_quantity', '>', 0)
                ->orderBy('item_name')
                ->get(),
            'categories' => Category::orderBy('category_name')->get(),
        ]);
    }

    public function edit(string $id): Response
    {
        $order = Order::with([
            'customer',
            'orderItems.product',
        ])->findOrFail($id);

        $orderProductIds = $order->orderItems->pluck('product_id');

        return Inertia::render('Orders/Edit', [
            'order' => $order,
            'customers' => Customer::orderBy('customer_name')->get(),
            'products' => Product::with('category')
                ->where('stock_quantity', '>', 0)
                ->orWhereIn('id', $orderProductIds)
                ->orderBy('item_name')
                ->get(),
        ]);
    }

    public function store(
        StoreOrderRequest $request
    ): RedirectResponse {
        $this->service->createOrder($request->validated());

        return to_route('orders.index')
            ->with('success', 'Order created and stock updated successfully.');
    }

    public function update(
        UpdateOrderRequest $request,
        string $id
    ): RedirectResponse {
        $order = Order::findOrFail($id);

        $this->service->updateOrder(
            $order,
            $request->validated()
        );

        return to_route('orders.index')
            ->with('success', 'Order updated successfully.');
    }
}