<?php

namespace App\Http\Controllers;

use App\Models\DeletedOrderHistory;
use App\Models\Order;
use Inertia\Inertia;
use Inertia\Response;

class OrderHistoryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('History/Index', [
            'transactions' => Order::with('customer')
                ->withCount('orderItems')
                ->where('order_status', 'delivered')
                ->latest('order_date')
                ->paginate(10, ['*'], 'transactions_page'),
            'deletedOrders' => DeletedOrderHistory::query()
                ->latest('deleted_at')
                ->paginate(10, ['*'], 'deleted_page'),
        ]);
    }
}
