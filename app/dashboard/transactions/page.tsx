import { Suspense } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { TransactionList } from '@/components/transactions/transaction-list';
import { Skeleton } from '@/components/ui/skeleton';
import { getTransactions } from '@/lib/actions/transaction-actions';
import { Transaction } from '@/types';

export default function TransactionsPage() {
    return (
        <div className="space-y-6">
            <DashboardHeader
                title="Transactions"
                description="Track and monitor your blockchain transactions."
            />

            <Suspense fallback={<TransactionListSkeleton />}>
                <TransactionListContent />
            </Suspense>
        </div>
    );
}

async function TransactionListContent() {
    const { success, transactions } = await getTransactions();

    if (!success || !transactions) {
        return <div>Failed to load transactions</div>;
    }

    return <TransactionList transactions={transactions as unknown as Transaction[]} />;
}

function TransactionListSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>

            <div className="rounded-lg border">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="p-4 border-b last:border-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-36" />
                                    <Skeleton className="h-4 w-48" />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-12 mt-2" />
                                </div>
                                <Skeleton className="h-8 w-20 rounded-full" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}