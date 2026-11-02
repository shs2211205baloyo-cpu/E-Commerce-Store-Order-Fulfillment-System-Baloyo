<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Category;
use App\Models\Product;
use App\Services\EcommerceService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(
        private EcommerceService $service
    ) {}

    public function index(): Response
    {
        return Inertia::render('Products/Index', [
            'products' => Product::with('category')
                ->latest()
                ->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Products/Create', [
            'categories' => Category::orderBy('category_name')->get(),
        ]);
    }

    public function store(
        StoreProductRequest $request
    ): RedirectResponse {
        $this->service->createProduct($request->validated());

        return to_route('products.index')
            ->with('success', 'Product created successfully.');
    }

    public function update(
        UpdateProductRequest $request,
        string $id
    ): RedirectResponse {
        $product = Product::findOrFail($id);

        $this->service->updateProduct(
            $product,
            $request->validated()
        );

        return to_route('products.index')
            ->with('success', 'Product updated successfully.');
    }
}