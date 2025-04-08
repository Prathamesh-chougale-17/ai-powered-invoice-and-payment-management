'use client';

import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';
import { Transaction, TransactionStatus } from '@/types';

interface RecentTransactionsProps {
    transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
    // Helper function to truncate address
    const truncateAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    // Status badge component
    const StatusBadge = ({ status }: { status: TransactionStatus }) => {
        const variants = {
            [TransactionStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            [TransactionStatus.CONFIRMED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            [TransactionStatus.FAILED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        };

        return (
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${variants[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
        );
    };

    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <Wallet className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-semibold">No transactions yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Connect your wallet to see transactions
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {transactions.map((tx) => (
                <div
                    key={tx.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 transition-colors hover:bg-muted/50 -mx-3 px-3 py-2 rounded-md"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-primary/10">
                            {tx.fromAddress.toLowerCase() === tx.toAddress.toLowerCase() ? (
                                <ArrowUpRight className="h-5 w-5 text-primary" />
                            ) : (
                                <ArrowDownLeft className="h-5 w-5 text-primary" />
                            )}
                        </div>
                        <div>
                            <p className="font-medium">
                                {tx.amount} {tx.tokenType}
                            </p>
                            <p className="text-sm text-muted-foreground truncate max-w-[150px]">
                                {truncateAddress(tx.fromAddress)} → {truncateAddress(tx.toAddress)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-right">
                            <p className="text-sm font-medium">
                                {format(new Date(tx.createdAt), 'MMM d')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {format(new Date(tx.createdAt), 'HH:mm')}
                            </p>
                        </div>
                        <StatusBadge status={tx.status} />
                    </div>
                </div>
            ))}
        </div>
    );
}