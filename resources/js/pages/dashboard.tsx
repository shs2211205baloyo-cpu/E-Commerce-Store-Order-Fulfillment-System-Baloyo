import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, ClipboardList, Clock3, Package, TriangleAlert } from 'lucide-react';

type DashboardStats = {
    totalOrders: number;
    pendingOrders: number;
    deliveredSales: number | string;
    lowStockProducts: number;
};

type RecentOrder = {
    id: number;
    customer: { customer_name: string };
    order_date: string;
    grand_total: string;
    order_status: string;
    order_items_count: number;
};

type LowStockItem = {
    id: number;
    item_name: string;
    item_sku: string;
    stock_quantity: number;
};

type DashboardProps = {
    stats: DashboardStats;
    recentOrders: RecentOrder[];
    lowStockItems: LowStockItem[];
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

const currency = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
});

export default function Dashboard({ stats, recentOrders, lowStockItems }: DashboardProps) {
    const summaryCards = [
        {
            title: 'Total orders',
            value: stats.totalOrders.toLocaleString(),
            detail: 'All orders in the system',
            icon: ClipboardList,
        },
        {
            title: 'Awaiting fulfillment',
            value: stats.pendingOrders.toLocaleString(),
            detail: 'Pending or processing',
            icon: Clock3,
        },
        {
            title: 'Delivered sales',
            value: currency.format(Number(stats.deliveredSales)),
            detail: 'Total value of delivered orders',
            icon: Package,
        },
        {
            title: 'Low stock',
            value: stats.lowStockProducts.toLocaleString(),
            detail: 'Products with 5 or fewer units',
            icon: TriangleAlert,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">Store overview</p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Dashboard</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            A quick look at your orders and inventory.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/orders/create">
                            Create order
                            <ArrowRight />
                        </Link>
                    </Button>
                </div>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Store metrics">
                    {summaryCards.map(({ title, value, detail, icon: Icon }) => (
                        <Card key={title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardDescription>{title}</CardDescription>
                                <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-semibold tracking-tight">{value}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
                            </CardContent>
                        </Card>
                    ))}
                </section>

                <section className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-start justify-between gap-4">
                            <div>
                                <CardTitle>Recent orders</CardTitle>
                                <CardDescription className="mt-1">The latest orders placed in your store.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/orders">View all</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {recentOrders.length === 0 ? (
                                <div className="rounded-lg border border-dashed px-4 py-10 text-center">
                                    <p className="font-medium">No orders yet</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Create an order to see activity here.
                                    </p>
                                    <Button className="mt-4" size="sm" asChild>
                                        <Link href="/orders/create">Create your first order</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[540px] text-left text-sm">
                                        <thead>
                                            <tr className="border-b text-xs uppercase text-muted-foreground">
                                                <th className="px-3 py-3 font-medium">Order</th>
                                                <th className="px-3 py-3 font-medium">Customer</th>
                                                <th className="px-3 py-3 font-medium">Date</th>
                                                <th className="px-3 py-3 text-right font-medium">Total</th>
                                                <th className="px-3 py-3 text-right font-medium">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentOrders.map((order) => (
                                                <tr key={order.id} className="border-b last:border-0">
                                                    <td className="px-3 py-3 font-medium">
                                                        <Link
                                                            className="hover:underline"
                                                            href={`/orders/${order.id}/edit`}
                                                        >
                                                            #{order.id}
                                                        </Link>
                                                    </td>
                                                    <td className="px-3 py-3">{order.customer.customer_name}</td>
                                                    <td className="px-3 py-3 text-muted-foreground">
                                                        {new Date(order.order_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-3 py-3 text-right font-medium">
                                                        {currency.format(Number(order.grand_total))}
                                                    </td>
                                                    <td className="px-3 py-3 text-right">
                                                        <Badge
                                                            variant={
                                                                order.order_status === 'cancelled'
                                                                    ? 'destructive'
                                                                    : 'secondary'
                                                            }
                                                        >
                                                            {order.order_status}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Low stock</CardTitle>
                            <CardDescription>Products with 5 or fewer units remaining.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {lowStockItems.length === 0 ? (
                                <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                                    No products need restocking.
                                </p>
                            ) : (
                                <ul className="divide-y">
                                    {lowStockItems.map((product) => (
                                        <li
                                            key={product.id}
                                            className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">{product.item_name}</p>
                                                <p className="text-xs text-muted-foreground">{product.item_sku}</p>
                                            </div>
                                            <Badge variant={product.stock_quantity === 0 ? 'destructive' : 'outline'}>
                                                {product.stock_quantity} left
                                            </Badge>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </section>
            </main>
        </AppLayout>
    );
}
