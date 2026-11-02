import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Check, Plus, Trash2 } from 'lucide-react';
import { FormEventHandler } from 'react';

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

type ExistingOrderItem = {
    product_id: number;
    quantity_ordered: number;
};

type Order = {
    id: number;
    customer_id: number;
    shipping_address: string;
    tax_amount: string;
    grand_total: string;
    order_status: string;
    order_items: ExistingOrderItem[];
};

type OrderItemInput = {
    product_id: string;
    quantity_ordered: number;
};

type OrderFormData = {
    customer_id: string;
    shipping_address: string;
    tax_amount: string;
    order_status: string;
    items: OrderItemInput[];
};

type EditOrderProps = {
    order: Order;
    customers: Customer[];
    products: Product[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Orders', href: '/orders' },
    { title: 'Edit order', href: '#' },
];

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const currency = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
});

export default function EditOrder({ order, customers, products }: EditOrderProps) {
    const { data, setData, put, processing, errors } = useForm<OrderFormData>({
        customer_id: String(order.customer_id),
        shipping_address: order.shipping_address,
        tax_amount: order.tax_amount,
        order_status: order.order_status,
        items: order.order_items.map((item) => ({
            product_id: String(item.product_id),
            quantity_ordered: item.quantity_ordered,
        })),
    });

    const subtotal = data.items.reduce((total, item) => {
        const product = products.find((candidate) => String(candidate.id) === item.product_id);
        return total + (product ? Number(product.unit_price) * item.quantity_ordered : 0);
    }, 0);
    const total = subtotal + (Number(data.tax_amount) || 0);

    const itemError = (index: number, field: 'product_id' | 'quantity_ordered') => {
        const key = `items.${index}.${field}`;
        return Object.entries(errors).find(([errorKey]) => errorKey === key)?.[1];
    };

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        put(`/orders/${order.id}`);
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
            <Head title={`Edit order #${order.id}`} />
            <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <Button variant="outline" size="icon" asChild aria-label="Back to orders">
                            <Link href="/orders">
                                <ArrowLeft />
                            </Link>
                        </Button>
                        <div>
                            <p className="text-sm text-muted-foreground">Orders / Edit</p>
                            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Edit order #{order.id}</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Update the customer, delivery, items, or order status.
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="flex flex-col gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Order details</CardTitle>
                                <CardDescription>Update who the order is for and its delivery details.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-5">
                                <div className="grid gap-2">
                                    <label htmlFor="customer" className="text-sm font-medium">
                                        Customer
                                    </label>
                                    <Select
                                        value={data.customer_id}
                                        onValueChange={(value) => setData('customer_id', value)}
                                    >
                                        <SelectTrigger id="customer">
                                            <SelectValue placeholder="Select a customer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers.map((customer) => (
                                                <SelectItem key={customer.id} value={String(customer.id)}>
                                                    {customer.customer_name} · {customer.customer_email}
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
                                        className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    />
                                    <InputError message={errors.shipping_address} />
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="order_status" className="text-sm font-medium">
                                        Status
                                    </label>
                                    <Select
                                        value={data.order_status}
                                        onValueChange={(value) => setData('order_status', value)}
                                    >
                                        <SelectTrigger id="order_status">
                                            <SelectValue placeholder="Select order status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statuses.map((status) => (
                                                <SelectItem key={status} value={status}>
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.order_status} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex-row items-center justify-between space-y-0">
                                <div>
                                    <CardTitle className="text-lg">Products</CardTitle>
                                    <CardDescription className="mt-1.5">
                                        Update products and quantities. Stock is checked when you save.
                                    </CardDescription>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addItem}
                                    disabled={data.items.length >= products.length}
                                >
                                    <Plus />
                                    Add item
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {data.items.map((item, index) => {
                                    const selectedProduct = products.find(
                                        (product) => String(product.id) === item.product_id,
                                    );
                                    const selectedIds = data.items
                                        .filter((_, itemIndex) => itemIndex !== index)
                                        .map((otherItem) => otherItem.product_id);
                                    const previouslyReserved = order.order_status === 'cancelled'
                                        ? 0
                                        : order.order_items.find(
                                              (orderItem) => String(orderItem.product_id) === item.product_id,
                                          )?.quantity_ordered ?? 0;
                                    const maxQuantity = selectedProduct
                                        ? selectedProduct.stock_quantity + previouslyReserved
                                        : undefined;

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
                                                                    {product.item_name} ·{' '}
                                                                    {currency.format(Number(product.unit_price))}
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
                                                        · up to {maxQuantity} available for this order
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
                                                    max={maxQuantity}
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
                                                    Line total:{' '}
                                                    {currency.format(
                                                        Number(selectedProduct.unit_price) * item.quantity_ordered,
                                                    )}
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
                                <CardDescription>Review charges before saving.</CardDescription>
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
                                    Original total: {currency.format(Number(order.grand_total))}
                                </p>
                            </CardContent>
                        </Card>
                        <div className="flex flex-col-reverse gap-3 sm:flex-row lg:flex-col">
                            <Button type="submit" disabled={processing || !customers.length || !products.length}>
                                <Check />
                                {processing ? 'Saving changes…' : 'Save changes'}
                            </Button>
                            <Button type="button" variant="outline" asChild>
                                <Link href="/orders">Cancel</Link>
                            </Button>
                        </div>
                    </aside>
                </form>
            </main>
        </AppLayout>
    );
}
