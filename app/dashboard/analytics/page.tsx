import { Suspense } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { RevenueChart } from '@/components/analytics/revenue-chart';
import { StatusDistributionChart } from '@/components/analytics/status-distribution-chart';
import { NetworkDistributionChart } from '@/components/analytics/network-distribution-chart';
import { TopClientsTable } from '@/components/analytics/top-clients-table';
import { StatCard } from '@/components/analytics/stat-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    getInvoiceStats,
    getTransactionStats,
    getMonthlyRevenueData,
    getPaymentStatusDistribution,
    getNetworkDistribution,
    getTopClients
} from '@/lib/services/analytics-service';
import { InvoiceStatus, TransactionStatus } from '@/types';
import { FileText, DollarSign, CreditCard, Activity } from 'lucide-react';

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <DashboardHeader
                title="Analytics Dashboard"
                description="View insights and statistics about your invoices and transactions."
            />

            <Tabs defaultValue="invoices" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="invoices">Invoices</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="clients">Clients</TabsTrigger>
                </TabsList>

                <TabsContent value="invoices" className="space-y-6">
                    <Suspense fallback={<StatCardsSkeleton />}>
                        <InvoiceStats />
                    </Suspense>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Monthly Revenue</CardTitle>
                                <CardDescription>
                                    Revenue from paid invoices by month
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Suspense fallback={<ChartSkeleton />}>
                                    <MonthlyRevenueChart />
                                </Suspense>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Invoice Status Distribution</CardTitle>
                                <CardDescription>
                                    Distribution of invoices by status
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Suspense fallback={<ChartSkeleton />}>
                                    <StatusDistributionComponent />
                                </Suspense>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="transactions" className="space-y-6">
                    <Suspense fallback={<StatCardsSkeleton />}>
                        <TransactionStats />
                    </Suspense>

                    <Card>
                        <CardHeader>
                            <CardTitle>Network Distribution</CardTitle>
                            <CardDescription>
                                Transactions by blockchain network
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Suspense fallback={<ChartSkeleton />}>
                                <NetworkDistributionComponent />
                            </Suspense>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="clients" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Clients by Revenue</CardTitle>
                            <CardDescription>
                                Your highest-paying clients
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Suspense fallback={<TableSkeleton />}>
                                <TopClientsComponent />
                            </Suspense>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Invoice Stats Component
async function InvoiceStats() {
    const { success, counts, amounts } = await getInvoiceStats();

    if (!success || !counts || !amounts) {
        return <div>Failed to load invoice statistics</div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Total Invoices"
                value={counts.total.toString()}
                description="All invoices"
                icon={<FileText className="h-4 w-4" />}
                trend={{
                    value: ((counts[InvoiceStatus.PAID] / counts.total) * 100).toFixed(0),
                    label: `${counts[InvoiceStatus.PAID]} paid`,
                }}
            />
            <StatCard
                title="Pending Revenue"
                value={`$${amounts[InvoiceStatus.PENDING].toFixed(2)}`}
                description="From pending invoices"
                icon={<Activity className="h-4 w-4" />}
                trend={{
                    value: counts[InvoiceStatus.PENDING].toString(),
                    label: "pending invoices",
                }}
            />
            <StatCard
                title="Total Revenue"
                value={`$${amounts[InvoiceStatus.PAID].toFixed(2)}`}
                description="From paid invoices"
                icon={<DollarSign className="h-4 w-4" />}
                trend={{
                    value: counts[InvoiceStatus.PAID].toString(),
                    label: "paid invoices",
                }}
            />
            <StatCard
                title="Overdue Amount"
                value={`$${amounts[InvoiceStatus.OVERDUE].toFixed(2)}`}
                description="From overdue invoices"
                icon={<CreditCard className="h-4 w-4" />}
                trend={{
                    value: counts[InvoiceStatus.OVERDUE].toString(),
                    label: "overdue invoices",
                    negative: true,
                }}
            />
        </div>
    );
}

// Transaction Stats Component
async function TransactionStats() {
    const { success, counts, amounts } = await getTransactionStats();

    if (!success || !counts || !amounts) {
        return <div>Failed to load transaction statistics</div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Total Transactions"
                value={counts.total.toString()}
                description="All transactions"
                icon={<Activity className="h-4 w-4" />}
                trend={{
                    value: ((counts[TransactionStatus.CONFIRMED] / counts.total) * 100).toFixed(0),
                    label: `${counts[TransactionStatus.CONFIRMED]} confirmed`,
                }}
            />
            <StatCard
                title="Processed Amount"
                value={`$${amounts[TransactionStatus.CONFIRMED].toFixed(2)}`}
                description="From confirmed transactions"
                icon={<DollarSign className="h-4 w-4" />}
                trend={{
                    value: counts[TransactionStatus.CONFIRMED].toString(),
                    label: "confirmed transactions",
                }}
            />
            <StatCard
                title="Pending Amount"
                value={`$${amounts[TransactionStatus.PENDING].toFixed(2)}`}
                description="From pending transactions"
                icon={<CreditCard className="h-4 w-4" />}
                trend={{
                    value: counts[TransactionStatus.PENDING].toString(),
                    label: "pending transactions",
                }}
            />
            <StatCard
                title="Failed Amount"
                value={`$${amounts[TransactionStatus.FAILED].toFixed(2)}`}
                description="From failed transactions"
                icon={<FileText className="h-4 w-4" />}
                trend={{
                    value: counts[TransactionStatus.FAILED].toString(),
                    label: "failed transactions",
                    negative: true,
                }}
            />
        </div>
    );
}

// Monthly Revenue Chart Component
async function MonthlyRevenueChart() {
    const { success, data } = await getMonthlyRevenueData(6);

    if (!success || !data) {
        return <div>Failed to load revenue data</div>;
    }

    return <RevenueChart data={data} />;
}

// Status Distribution Chart Component
async function StatusDistributionComponent() {
    const { success, data } = await getPaymentStatusDistribution();

    if (!success || !data) {
        return <div>Failed to load status distribution data</div>;
    }

    return <StatusDistributionChart data={data} />;
}

// Network Distribution Chart Component
async function NetworkDistributionComponent() {
    const { success, data } = await getNetworkDistribution();

    if (!success || !data) {
        return <div>Failed to load network distribution data</div>;
    }

    return <NetworkDistributionChart data={data} />;
}

// Top Clients Component
async function TopClientsComponent() {
    const { success, clients } = await getTopClients(5);

    if (!success || !clients) {
        return <div>Failed to load top clients data</div>;
    }

    return <TopClientsTable clients={clients} />;
}

// Skeleton loading states
function StatCardsSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-7 w-16" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function ChartSkeleton() {
    return (
        <div className="aspect-[4/3] w-full flex items-center justify-center bg-muted/20 rounded-md">
            <Skeleton className="h-[80%] w-[90%]" />
        </div>
    );
}

function TableSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
            ))}
        </div>
    );
}