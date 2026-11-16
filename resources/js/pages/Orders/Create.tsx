import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type Customer = {
    id: number;
    customer_name: string;
    customer_email: string;
};

type Product = {
    id: number;
    item_sku: string;
    item_name: string;
    unit_price: string;
    stock_quantity: number;
    category: { category_name: string } | null;
};

type Category = {
    id: number;
    category_name: string;
};

type OrderItemInput = {
    product_id: string;
    quantity_ordered: number;
};

type OrderFormData = {
    customer_id: string;
    shipping_address: string;
    tax_amount: string;
    items: OrderItemInput[];
};

type CustomerFormData = {
    customer_name: string;
    customer_email: string;
};

type ProductFormData = {
    category_id: string;
    item_sku: string;
    item_name: string;
    unit_price: string;
    stock_quantity: string;
};

type CreateOrderProps = {
    customers: Customer[];
    products: Product[];
    categories: Category[];
};

function CustomerOption({ name, email }: { name: string; email: string }) {
    return (
        <div className="flex flex-col">
            <span>{name}</span>
            <span className="text-xs text-muted-foreground">{email}</span>
        </div>
    );
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Orders', href: '/orders' },
    { title: 'New order', href: '/orders/create' },
];

const currency = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
});

export default function CreateOrder({ customers, products, categories }: CreateOrderProps) {
    const { data, setData, post, processing, errors } = useForm<OrderFormData>({
        customer_id: '',
        shipping_address: '',
        tax_amount: '0',
        items: [{ product_id: '', quantity_ordered: 1 }],
    });
    const customerForm = useForm<CustomerFormData>({
        customer_name: '',
        customer_email: '',
    });
    const productForm = useForm<ProductFormData>({
        category_id: '',
        item_sku: '',
        item_name: '',
        unit_price: '',
        stock_quantity: '1',
    });
    const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
    const [productDialogOpen, setProductDialogOpen] = useState(false);

    const subtotal = data.items.reduce((total, item) => {
        const product = products.find((candidate) => String(candidate.id) === item.product_id);
        return total + (product ? Number(product.unit_price) * item.quantity_ordered : 0);
    }, 0);
    const tax = Number(data.tax_amount) || 0;
    const total = subtotal + tax;

    const itemError = (index: number, field: 'product_id' | 'quantity_ordered') => {
        const key = `items.${index}.${field}`;
        return Object.entries(errors).find(([errorKey]) => errorKey === key)?.[1];
    };

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post('/orders');
    };

    const submitCustomer: FormEventHandler = (event) => {
        event.preventDefault();
        customerForm.post(route('orders.customers.store'), {
            preserveScroll: true,
            onSuccess: (page) => {
                const customerId = page.props.flash?.created_customer_id;
                if (customerId) {
                    setData('customer_id', String(customerId));
                }
                customerForm.reset();
                setCustomerDialogOpen(false);
            },
        });
    };

    const submitProduct: FormEventHandler = (event) => {
        event.preventDefault();
        productForm.post(route('orders.products.store'), {
            preserveScroll: true,
            onSuccess: (page) => {
                const productId = page.props.flash?.created_product_id;
                if (productId) {
                    const emptyItemIndex = data.items.findIndex((item) => !item.product_id);
                    if (emptyItemIndex >= 0) {
                        updateItem(emptyItemIndex, { product_id: String(productId) });
                    } else {
                        setData('items', [...data.items, { product_id: String(productId), quantity_ordered: 1 }]);
                    }
                }
                productForm.reset();
                productForm.setData('stock_quantity', '1');
                setProductDialogOpen(false);
            },
        });
    };

    const updateItem = (index: number, patch: Partial<OrderItemInput>) => {
        setData(
            'items',
            data.items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
        );
    };

    const addItem = () => {
        setData('items', [...data.items, { product_id: '', quantity_ordered: 1 }]);
    };

    const removeItem = (index: number) => {
        setData('items', data.items.filter((_, itemIndex) => itemIndex !== index));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create order" />
            <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <Button variant="outline" size="icon" asChild aria-label="Back to orders">
                            <Link href="/orders">
                                <ArrowLeft />
                            </Link>
                        </Button>
                        <div>
                            <p className="text-sm text-muted-foreground">Orders / New order</p>
                            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Create order</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Add a customer, shipping details, and the products in this order.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-sm text-muted-foreground">
                        <span className="size-2 rounded-full bg-amber-500" />
                        Pending
                    </div>
                </div>

                {(!customers.length || !products.length) && (
                    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                        {customers.length === 0 && products.length === 0
                            ? 'Add a customer and an in-stock product before creating an order.'
                            : customers.length === 0
                              ? 'Add a customer before creating an order.'
                              : 'Add an in-stock product before creating an order.'}
                    </div>
                )}

                <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="flex flex-col gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Customer details</CardTitle>
                                <CardDescription>Choose who this order is for and where it should be delivered.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-5">
                                <div className="grid gap-2">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="customer" className="text-sm font-medium">
                                            Customer
                                        </label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCustomerDialogOpen(true)}
                                        >
                                            <Plus />
                                            Add customer
                                        </Button>
                                    </div>
                                    <Select
                                        value={data.customer_id}
                                        onValueChange={(value) => setData('customer_id', value)}
                                    >
                                        <SelectTrigger id="customer">
                                            <SelectValue placeholder="Select a customer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers.map((customer) => (
                                                <SelectItem
                                                    key={customer.id}
                                                    value={String(customer.id)}
                                                    textValue={customer.customer_name}
                                                >
                                                    <CustomerOption
                                                        name={customer.customer_name}
                                                        email={customer.customer_email}
                                                    />
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.customer_id} />
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="shipping_address" className="text-sm font-medium">
                                        Shipping address
                                    </label>
                                    <textarea
                                        id="shipping_address"
                                        rows={3}
                                        value={data.shipping_address}
                                        onChange={(event) => setData('shipping_address', event.target.value)}
                                        placeholder="Street address, city, region, postal code"
                                        className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    />
                                    <InputError message={errors.shipping_address} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex-row items-center justify-between space-y-0">
                                <div>
                                    <CardTitle className="text-lg">Products</CardTitle>
                                    <CardDescription className="mt-1.5">
                                        Add catalog products or extra order line items.
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setProductDialogOpen(true)}
                                        disabled={!categories.length}
                                        title="Create a new product in the catalog"
                                    >
                                        <Plus />
                                        New product
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addItem}
                                        disabled={data.items.length >= products.length}
                                        title="Add another product row to this order"
                                    >
                                        <Plus />
                                        Add line item
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {data.items.map((item, index) => {
                                    const selectedProduct = products.find(
                                        (product) => String(product.id) === item.product_id,
                                    );
                                    const selectedIds = data.items
                                        .filter((_, itemIndex) => itemIndex !== index)
                                        .map((otherItem) => otherItem.product_id);

                                    return (
                                        <div
                                            key={index}
                                            className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[minmax(0,1fr)_120px_40px]"
                                        >
                                            <div className="grid gap-2">
                                                <label htmlFor={`product-${index}`} className="text-sm font-medium">
                                                    Product
                                                </label>
                                                <Select
                                                    value={item.product_id}
                                                    onValueChange={(value) => updateItem(index, { product_id: value })}
                                                >
                                                    <SelectTrigger id={`product-${index}`}>
                                                        <SelectValue placeholder="Select a product" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {products
                                                            .filter(
                                                                (product) =>
                                                                    !selectedIds.includes(String(product.id)),
                                                            )
                                                            .map((product) => (
                                                                <SelectItem
                                                                    key={product.id}
                                                                    value={String(product.id)}
                                                                >
                                                                    {product.item_name} · {currency.format(Number(product.unit_price))}
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                                {selectedProduct && (
                                                    <p className="text-xs text-muted-foreground">
                                                        SKU {selectedProduct.item_sku}
                                                        {selectedProduct.category
                                                            ? ` · ${selectedProduct.category.category_name}`
                                                            : ''}{' '}
                                                        · {selectedProduct.stock_quantity} in stock
                                                    </p>
                                                )}
                                                <InputError message={itemError(index, 'product_id')} />
                                            </div>
                                            <div className="grid content-start gap-2">
                                                <label htmlFor={`quantity-${index}`} className="text-sm font-medium">
                                                    Quantity
                                                </label>
                                                <Input
                                                    id={`quantity-${index}`}
                                                    type="number"
                                                    min={1}
                                                    max={selectedProduct?.stock_quantity}
                                                    value={item.quantity_ordered}
                                                    onChange={(event) =>
                                                        updateItem(index, {
                                                            quantity_ordered: Number(event.target.value),
                                                        })
                                                    }
                                                />
                                                <InputError message={itemError(index, 'quantity_ordered')} />
                                            </div>
                                            <div className="flex items-end justify-end">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label="Remove product"
                                                    disabled={data.items.length === 1}
                                                    onClick={() => removeItem(index)}
                                                >
                                                    <Trash2 className="text-muted-foreground" />
                                                </Button>
                                            </div>
                                            {selectedProduct && (
                                                <p className="text-sm font-medium sm:col-span-3 sm:text-right">
                                                    Line total: {currency.format(Number(selectedProduct.unit_price) * item.quantity_ordered)}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                                <InputError message={errors.items} />
                            </CardContent>
                        </Card>
                    </div>

                    <aside className="flex flex-col gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Order summary</CardTitle>
                                <CardDescription>Review charges before placing the order.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{currency.format(subtotal)}</span>
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="tax_amount" className="text-sm font-medium">
                                        Tax
                                    </label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                            ₱
                                        </span>
                                        <Input
                                            id="tax_amount"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.tax_amount}
                                            onChange={(event) => setData('tax_amount', event.target.value)}
                                            className="pl-7"
                                        />
                                    </div>
                                    <InputError message={errors.tax_amount} />
                                </div>
                                <div className="flex items-center justify-between border-t pt-4 font-semibold">
                                    <span>Total</span>
                                    <span>{currency.format(total)}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Product prices and available stock are verified when the order is submitted.
                                </p>
                            </CardContent>
                        </Card>
                        <div className="flex flex-col-reverse gap-3 sm:flex-row lg:flex-col">
                            <Button type="submit" disabled={processing || !customers.length || !products.length}>
                                <ShoppingBag />
                                {processing ? 'Creating order…' : 'Create order'}
                            </Button>
                            <Button type="button" variant="outline" asChild>
                                <Link href="/orders">Cancel</Link>
                            </Button>
                        </div>
                    </aside>
                </form>

                <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add customer</DialogTitle>
                            <DialogDescription>
                                Create a customer and select them for this order.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submitCustomer} className="grid gap-4">
                            <div className="grid gap-2">
                                <label htmlFor="new-customer-name" className="text-sm font-medium">
                                    Name
                                </label>
                                <Input
                                    id="new-customer-name"
                                    value={customerForm.data.customer_name}
                                    onChange={(event) => customerForm.setData('customer_name', event.target.value)}
                                    required
                                />
                                <InputError message={customerForm.errors.customer_name} />
                            </div>
                            <div className="grid gap-2">
                                <label htmlFor="new-customer-email" className="text-sm font-medium">
                                    Email
                                </label>
                                <Input
                                    id="new-customer-email"
                                    type="email"
                                    value={customerForm.data.customer_email}
                                    onChange={(event) => customerForm.setData('customer_email', event.target.value)}
                                    required
                                />
                                <InputError message={customerForm.errors.customer_email} />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={customerForm.processing}>
                                    {customerForm.processing ? 'Saving…' : 'Save customer'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create product</DialogTitle>
                            <DialogDescription>
                                Add a new product to the catalog and include it in this order.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submitProduct} className="grid gap-4">
                            <div className="grid gap-2">
                                <label htmlFor="new-product-category" className="text-sm font-medium">
                                    Category
                                </label>
                                <Select
                                    value={productForm.data.category_id}
                                    onValueChange={(value) => productForm.setData('category_id', value)}
                                >
                                    <SelectTrigger id="new-product-category">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={String(category.id)}>
                                                {category.category_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={productForm.errors.category_id} />
                            </div>
                            <div className="grid gap-2">
                                <label htmlFor="new-product-sku" className="text-sm font-medium">
                                    SKU
                                </label>
                                <Input
                                    id="new-product-sku"
                                    value={productForm.data.item_sku}
                                    onChange={(event) => productForm.setData('item_sku', event.target.value)}
                                    required
                                />
                                <InputError message={productForm.errors.item_sku} />
                            </div>
                            <div className="grid gap-2">
                                <label htmlFor="new-product-name" className="text-sm font-medium">
                                    Product name
                                </label>
                                <Input
                                    id="new-product-name"
                                    value={productForm.data.item_name}
                                    onChange={(event) => productForm.setData('item_name', event.target.value)}
                                    required
                                />
                                <InputError message={productForm.errors.item_name} />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <label htmlFor="new-product-price" className="text-sm font-medium">
                                        Unit price
                                    </label>
                                    <Input
                                        id="new-product-price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={productForm.data.unit_price}
                                        onChange={(event) => productForm.setData('unit_price', event.target.value)}
                                        required
                                    />
                                    <InputError message={productForm.errors.unit_price} />
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="new-product-stock" className="text-sm font-medium">
                                        Stock quantity
                                    </label>
                                    <Input
                                        id="new-product-stock"
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={productForm.data.stock_quantity}
                                        onChange={(event) =>
                                            productForm.setData('stock_quantity', event.target.value)
                                        }
                                        required
                                    />
                                    <InputError message={productForm.errors.stock_quantity} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={productForm.processing || !categories.length}>
                                    {productForm.processing ? 'Saving…' : 'Save and add product'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </main>
        </AppLayout>
    );
}
