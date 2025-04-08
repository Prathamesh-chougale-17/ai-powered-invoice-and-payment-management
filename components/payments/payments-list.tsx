'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Invoice, InvoiceStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConnectWalletButton } from '@/components/ui/connect-wallet-button';
import { PayNowButton } from '@/components/payments/pay-now-button';
import { useAccount } from 'wagmi';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { Search, ArrowRight, Clock, Ban, CheckCircle, FileText } from 'lucide-react';

interface PaymentsListProps {
    invoices: Invoice[];
    isPending: boolean;
}

export function PaymentsList({ invoices, isPending }: PaymentsListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const { isConnected } = useAccount();
    const router = useRouter();

    // Filter invoices based on search
    const filteredInvoices = invoices.filter(invoice =>
        invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.clientEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // If no wallet connected and there are pending invoices, show connect first
    if (isPending && !isConnected && invoices.length > 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Connect Wallet to Pay</CardTitle>
                    <CardDescription>
                        You need to connect your wallet to view and pay pending invoices
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-10 gap-6">
                    <div className="flex flex-col items-center text-center max-w-md">
                        <Clock className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Wallet Connection Required</h3>
                        <p className="text-muted-foreground mb-6">
                            Connect your wallet to view your pending invoice payments and make transactions.
                        </p>
                    </div>
                    <ConnectWalletButton size="lg" />
                </CardContent>
            </Card>
        );
    }

    // Show empty state if no invoices
    if (filteredInvoices.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{isPending ? 'Pending Payments' : 'Completed Payments'}</CardTitle>
                    <CardDescription>
                        {isPending
                            ? 'No pending invoices awaiting payment'
                            : 'No completed payments found'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-10 gap-4">
                    {isPending ? (
                        <div className="flex flex-col items-center text-center max-w-md">
                            <CheckCircle className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
                            <p className="text-muted-foreground mb-6">
                                You don&apos;t have any pending invoices to pay at the moment.
                            </p>
                            <Button variant="outline" asChild>
                                <Link href="/dashboard/invoices">
                                    View All Invoices
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-center max-w-md">
                            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No Payments Yet</h3>
                            <p className="text-muted-foreground mb-6">
                                You haven&apos;t made any payments yet. Pay an invoice to see it here.
                            </p>
                            <Button variant="outline" asChild>
                                <Link href="/dashboard/invoices">
                                    View All Invoices
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search invoices..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Button variant="outline" asChild>
                    <Link href="/dashboard/invoices">
                        View All Invoices
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredInvoices.map(invoice => (
                    <Card key={invoice.id} className="overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x">
                            <div className="p-4 md:col-span-2">
                                <div className="flex gap-4 items-start">
                                    <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                        <FileText className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium truncate">
                                                    Invoice {invoice.number}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {invoice.clientName}
                                                </p>
                                            </div>
                                            <StatusBadge status={invoice.status} />
                                        </div>
                                        <Separator className="my-3" />
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Amount</p>
                                                <p className="font-medium">{formatCurrency(invoice.totalAmount)}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Due Date</p>
                                                <p className="font-medium">{format(new Date(invoice.dueDate), 'MMM d, yyyy')}</p>
                                            </div>
                                            {invoice.paidAt && (
                                                <div>
                                                    <p className="text-muted-foreground">Paid On</p>
                                                    <p className="font-medium">{format(new Date(invoice.paidAt), 'MMM d, yyyy')}</p>
                                                </div>
                                            )}
                                            {invoice.transactionHash && (
                                                <div>
                                                    <p className="text-muted-foreground">Transaction</p>
                                                    <p className="font-medium truncate">{invoice.transactionHash.substring(0, 10)}...</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 md:col-span-2 flex items-center justify-between md:justify-end">
                                <div className="md:text-right md:mr-6">
                                    <p className="text-muted-foreground">Token Type</p>
                                    <p className="font-medium">{invoice.paymentTokenType || 'ETH'}</p>
                                    <p className="text-xs text-muted-foreground mt-1 truncate max-w-48">
                                        {invoice.paymentAddress || 'No payment address specified'}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/dashboard/invoices/${invoice.id}`}>
                                            View
                                        </Link>
                                    </Button>

                                    {isPending && (
                                        <PayNowButton
                                            invoice={invoice}
                                            onPaymentComplete={() => router.refresh()}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

interface StatusBadgeProps {
    status: InvoiceStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
    let icon = null;

    switch (status) {
        case InvoiceStatus.PAID:
            variant = 'default';
            icon = <CheckCircle className="mr-1 h-3 w-3" />;
            break;
        case InvoiceStatus.PENDING:
            variant = 'secondary';
            icon = <Clock className="mr-1 h-3 w-3" />;
            break;
        case InvoiceStatus.OVERDUE:
            variant = 'destructive';
            icon = <Ban className="mr-1 h-3 w-3" />;
            break;
        default:
            variant = 'outline';
    }

    return (
        <Badge variant={variant} className="flex items-center">
            {icon}
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
}