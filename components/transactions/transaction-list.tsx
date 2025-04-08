'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
    ArrowUpRight,
    ArrowDownLeft,
    CheckCircle,
    Clock,
    XCircle,
    Search,
    ExternalLink
} from 'lucide-react';
import { Transaction, TransactionStatus } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface TransactionListProps {
    transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Helper function to truncate address
    const truncateAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    // Helper function to get chain name from chain ID
    const getChainName = (networkId: number) => {
        const chains: Record<number, string> = {
            1: 'Ethereum',
            137: 'Polygon',
            10: 'Optimism',
            42161: 'Arbitrum',
            8453: 'Base',
            11155111: 'Sepolia',
        };

        return chains[networkId] || `Chain ID ${networkId}`;
    };

    // Helper function to get etherscan/blockexplorer URL
    const getExplorerUrl = (hash: string, networkId: number) => {
        const explorers: Record<number, string> = {
            1: 'https://etherscan.io/tx/',
            137: 'https://polygonscan.com/tx/',
            10: 'https://optimistic.etherscan.io/tx/',
            42161: 'https://arbiscan.io/tx/',
            8453: 'https://basescan.org/tx/',
            11155111: 'https://sepolia.etherscan.io/tx/',
        };

        const baseUrl = explorers[networkId] || 'https://etherscan.io/tx/';
        return `${baseUrl}${hash}`;
    };

    // Filter transactions based on search and status
    const filteredTransactions = transactions.filter((tx) => {
        const matchesSearch =
            tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.fromAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.toAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (tx.description && tx.description.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus =
            statusFilter === 'all' ||
            tx.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Status badge component
    const StatusBadge = ({ status }: { status: TransactionStatus }) => {
        const variants = {
            [TransactionStatus.PENDING]: {
                icon: <Clock className="h-4 w-4" />,
                className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            },
            [TransactionStatus.CONFIRMED]: {
                icon: <CheckCircle className="h-4 w-4" />,
                className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            },
            [TransactionStatus.FAILED]: {
                icon: <XCircle className="h-4 w-4" />,
                className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
            },
        };

        const variant = variants[status];

        return (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${variant.className}`}>
                {variant.icon}
                <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <div>
                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger className="w-full md:w-40">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value={TransactionStatus.PENDING}>Pending</SelectItem>
                                <SelectItem value={TransactionStatus.CONFIRMED}>Confirmed</SelectItem>
                                <SelectItem value={TransactionStatus.FAILED}>Failed</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Transaction list */}
            <div className="rounded-lg border">
                {filteredTransactions.length === 0 ? (
                    <div className="p-8 text-center">
                        <ArrowUpRight className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-2 text-lg font-semibold">No transactions found</h3>
                        <p className="text-sm text-muted-foreground">
                            {searchQuery || statusFilter !== 'all'
                                ? 'Try changing your search or filter'
                                : 'Connect your wallet to see your transactions'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {filteredTransactions.map((tx) => (
                            <div key={tx.id} className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
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
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {tx.description || `Transaction on ${getChainName(tx.networkId)}`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="hidden md:block ml-4 text-right">
                                        <p className="text-sm font-medium">
                                            From: {truncateAddress(tx.fromAddress)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            To: {truncateAddress(tx.toAddress)}
                                        </p>
                                    </div>

                                    <div className="ml-4 text-right">
                                        <p className="text-sm font-medium">
                                            {format(new Date(tx.createdAt), 'MMM d, yyyy')}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {format(new Date(tx.createdAt), 'HH:mm')}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        <StatusBadge status={tx.status} />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            asChild
                                        >
                                            <a
                                                href={getExplorerUrl(tx.hash, tx.networkId)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}