'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { FileText } from 'lucide-react';
import { Invoice, InvoiceStatus } from '@/types';

interface RecentInvoicesProps {
    invoices: Invoice[];
}

export function RecentInvoices({ invoices }: RecentInvoicesProps) {
    // Status badge component
    const StatusBadge = ({ status }: { status: InvoiceStatus }) => {
        const variants = {
            [InvoiceStatus.DRAFT]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
            [InvoiceStatus.PENDING]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            [InvoiceStatus.PAID]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            [InvoiceStatus.OVERDUE]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
            [InvoiceStatus.CANCELLED]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        };

        return (
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${variants[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
        );
    };

    if (invoices.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-semibold">No invoices yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Create your first invoice to get started
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {invoices.map((invoice) => (
                <Link
                    key={invoice.id}
                    href={`/dashboard/invoices/${invoice.id}`}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 transition-colors hover:bg-muted/50 -mx-3 px-3 py-2 rounded-md"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">{invoice.clientName}</p>
                            <p className="text-sm text-muted-foreground">
                                {invoice.number}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-right">
                            <p className="font-medium">${invoice.totalAmount.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">
                                Due {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                            </p>
                        </div>
                        <StatusBadge status={invoice.status} />
                    </div>
                </Link>
            ))}
        </div>
    );
}