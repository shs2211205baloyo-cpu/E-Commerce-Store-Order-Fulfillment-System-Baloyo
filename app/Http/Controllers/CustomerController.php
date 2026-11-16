<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Models\Customer;
use Illuminate\Http\RedirectResponse;

class CustomerController extends Controller
{
    public function storeForOrder(StoreCustomerRequest $request): RedirectResponse
    {
        $customer = Customer::create($request->validated());

        return to_route('orders.create')
            ->with('created_customer_id', $customer->id);
    }
}
