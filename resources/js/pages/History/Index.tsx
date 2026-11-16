import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

type HistoryOrder = {
    id?: number;
    original_order_id?: number;
    customer?: { customer_name: string };
    customer_name?: string;
    order_date: string;
    order_status: string;
    grand_total: string;
    order_items_count?: number;
    item_count?: number;
    deleted_at?: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedOrders = {
    data: HistoryOrder[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type HistoryProps = {
    transactions: PaginatedOrders;
    deletedOrders: PaginatedOrders;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'History', href: '/history' }];

const currency = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
});

const paginationLabel = (label: string) => label.replace(/&laquo;/g, '«').replace(/&raquo;/g, '»');

function OrderHistoryTable({ orders, deleted = false }: { orders: PaginatedOrders; deleted?: boolean }) {
    return (
        <>
            {orders.data.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">{deleted ? 'No deleted orders.' : 'No completed transactions.'}</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-sm">
                        <thead>
                            <tr className="text-muted-foreground border-b text-xs uppercase">
                                <th className="px-3 py-3 font-medium">Order</th>
                                <th className="px-3 py-3 font-medium">Customer</th>
                                <th className="px-3 py-3 font-medium">{deleted ? 'Deleted' : 'Order date'}</th>
                                <th className="px-3 py-3 font-medium">Items</th>
                                <th className="px-3 py-3 text-right font-medium">Total</th>
                                <th className="px-3 py-3 text-right font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.data.map((order) => (
                                <tr key={order.id ?? order.original_order_id} className="border-b last:border-0">
                                    <td className="px-3 py-4 font-medium">#{order.original_order_id ?? order.id}</td>
                                    <td className="px-3 py-4">{order.customer?.customer_name ?? order.customer_name}</td>
                                    <td className="text-muted-foreground px-3 py-4">
                                        {new Date(deleted ? order.deleted_at! : order.order_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-3 py-4">{order.item_count ?? order.order_items_count}</td>
                                    <td className="px-3 py-4 text-right font-medium">{currency.format(Number(order.grand_total))}</td>
                                    <td className="px-3 py-4 text-right">
                                        <Badge variant={deleted ? 'destructive' : 'secondary'}>{deleted ? 'deleted' : order.order_status}</Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {orders.total > 0 && (
                <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-muted-foreground text-sm">
                        Showing {orders.from ?? 0}–{orders.to ?? 0} of {orders.total}
                    </p>
                    <nav className="flex flex-wrap gap-1" aria-label="History pagination">
                        {orders.links.map((link, index) => (
                            <Button
                                key={`${link.label}-${index}`}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                asChild={Boolean(link.url)}
                                disabled={!link.url}
                            >
                                {link.url ? <Link href={link.url}>{paginationLabel(link.label)}</Link> : <span>{paginationLabel(link.label)}</span>}
                            </Button>
                        ))}
                    </nav>
                </div>
            )}
        </>
    );
}

export default function HistoryIndex({ transactions, deletedOrders }: HistoryProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="History" />
            <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-8">
                <div>
                    <p className="text-muted-foreground text-sm">Store management</p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight">History</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Review completed transactions and deleted orders.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Completed transactions</CardTitle>
                        <CardDescription>
                            {transactions.total} {transactions.total === 1 ? 'transaction' : 'transactions'} marked delivered
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <OrderHistoryTable orders={transactions} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Deleted orders</CardTitle>
                        <CardDescription>
                            {deletedOrders.total} {deletedOrders.total === 1 ? 'deleted order' : 'deleted orders'} · View only
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <OrderHistoryTable orders={deletedOrders} deleted />
                    </CardContent>
                </Card>
            </main>
        </AppLayout>
    );
}
