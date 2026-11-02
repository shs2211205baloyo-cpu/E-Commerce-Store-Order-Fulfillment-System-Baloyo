import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';
import { type SharedData } from '@/types';

type Order = {
    id: number;
    customer: { customer_name: string };
    order_date: string;
    order_status: string;
    grand_total: string;
    order_items: { id: number }[];
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type OrderIndexProps = {
    orders: {
        data: Order[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Orders', href: '/orders' }];

const currency = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
});

const paginationLabel = (label: string) => label.replace(/&laquo;/g, '«').replace(/&raquo;/g, '»');

export default function OrdersIndex({ orders }: OrderIndexProps) {
    const { flash } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders" />
            <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">Store management</p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Orders</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Review recent orders and create new ones.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/orders/create">
                            <Plus />
                            Create order
                        </Link>
                    </Button>
                </div>

                {flash?.success && (
                    <div
                        role="status"
                        className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100"
                    >
                        {flash.success}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">All orders</CardTitle>
                        <CardDescription>
                            {orders.total} {orders.total === 1 ? 'order' : 'orders'} in total
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {orders.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-14 text-center">
                                <div className="rounded-full bg-muted p-3 text-muted-foreground">
                                    <Plus className="size-5" />
                                </div>
                                <div>
                                    <h2 className="font-medium">No orders yet</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Create your first order to see it listed here.
                                    </p>
                                </div>
                                <Button variant="outline" asChild>
                                    <Link href="/orders/create">Create your first order</Link>
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[640px] text-left text-sm">
                                        <thead>
                                            <tr className="border-b text-xs uppercase text-muted-foreground">
                                                <th className="px-3 py-3 font-medium">Order</th>
                                                <th className="px-3 py-3 font-medium">Customer</th>
                                                <th className="px-3 py-3 font-medium">Date</th>
                                                <th className="px-3 py-3 font-medium">Items</th>
                                                <th className="px-3 py-3 text-right font-medium">Total</th>
                                                <th className="px-3 py-3 text-right font-medium">Status</th>
                                                <th className="px-3 py-3 text-right font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.data.map((order) => (
                                                <tr key={order.id} className="border-b last:border-0">
                                                    <td className="px-3 py-4 font-medium">#{order.id}</td>
                                                    <td className="px-3 py-4">{order.customer.customer_name}</td>
                                                    <td className="px-3 py-4 text-muted-foreground">
                                                        {new Date(order.order_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-3 py-4">{order.order_items.length}</td>
                                                    <td className="px-3 py-4 text-right font-medium">
                                                        {currency.format(Number(order.grand_total))}
                                                    </td>
                                                    <td className="px-3 py-4 text-right">
                                                        <Badge variant={order.order_status === 'cancelled' ? 'destructive' : 'secondary'}>
                                                            {order.order_status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-3 py-4 text-right">
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/orders/${order.id}/edit`}>
                                                                <Pencil />
                                                                Edit
                                                            </Link>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {orders.from ?? 0}–{orders.to ?? 0} of {orders.total}
                                    </p>
                                    <nav className="flex flex-wrap gap-1" aria-label="Pagination">
                                        {orders.links.map((link, index) => (
                                            <Button
                                                key={`${link.label}-${index}`}
                                                variant={link.active ? 'default' : 'outline'}
                                                size="sm"
                                                asChild={Boolean(link.url)}
                                                disabled={!link.url}
                                            >
                                                {link.url ? (
                                                    <Link href={link.url}>{paginationLabel(link.label)}</Link>
                                                ) : (
                                                    <span>{paginationLabel(link.label)}</span>
                                                )}
                                            </Button>
                                        ))}
                                    </nav>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </main>
        </AppLayout>
    );
}
