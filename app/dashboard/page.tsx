import Link from 'next/link';
import { Suspense } from 'react';
import { Plus, ArrowRight } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { RecentInvoices } from '@/components/dashboard/recent-invoices';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getInvoices } from '@/lib/actions/invoice-actions';
import { getTransactions } from '@/lib/actions/transaction-actions';
import { Invoice, Transaction } from '@/types';

export default async function DashboardPage() {
    return (
        <div className="space-y-8">
            <DashboardHeader
                title="Dashboard"
                description="Overview of your financial activity."
            />

            <DashboardStats />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Invoices</CardTitle>
                            <CardDescription>
                                Your most recent invoices
                            </CardDescription>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/dashboard/invoices">
                                View All
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Suspense fallback={<InvoicesSkeleton />}>
                            <RecentInvoicesContent />
                        </Suspense>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full">
                            <Link href="/dashboard/invoices/new">
                                <Plus className="mr-2 h-4 w-4" />
                                New Invoice
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>
                                Your most recent wallet transactions
                            </CardDescription>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/dashboard/transactions">
                                View All
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Suspense fallback={<TransactionsSkeleton />}>
                            <RecentTransactionsContent />
                        </Suspense>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

async function RecentInvoicesContent() {
    const { success, invoices } = await getInvoices();

    if (!success || !invoices) {
        return <div>Failed to load invoices</div>;
    }

    // Get only the 5 most recent invoices
    const recentInvoices = invoices.slice(0, 5);



    return <RecentInvoices invoices={recentInvoices as unknown as Invoice[]} />;
}

async function RecentTransactionsContent() {
    const { success, transactions } = await getTransactions();

    if (!success || !transactions) {
        return <div>Failed to load transactions</div>;
    }

    // Get only the 5 most recent transactions
    const recentTransactions = transactions.slice(0, 5);

    return <RecentTransactions transactions={recentTransactions as unknown as Transaction[]} />;
}

function InvoicesSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function TransactionsSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
            ))}
        </div>
    );
}