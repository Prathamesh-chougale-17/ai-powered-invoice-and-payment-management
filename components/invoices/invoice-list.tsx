'use client';
import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
    FileText,
    Clock,
    CheckCircle,
    AlertTriangle,
    XCircle,
    ChevronRight,
    Search
} from 'lucide-react';
import { Invoice, InvoiceStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface InvoiceListProps {
    invoices: Invoice[];
}

export function InvoiceList({ invoices }: InvoiceListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Filter invoices based on search and status
    const filteredInvoices = invoices.filter((invoice) => {
        const matchesSearch =
            invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.clientEmail.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' ||
            invoice.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Status badge component
    const StatusBadge = ({ status }: { status: InvoiceStatus }) => {
        const variants = {
            [InvoiceStatus.DRAFT]: {
                icon: <FileText className="h-4 w-4" />,
                className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
            },
            [InvoiceStatus.PENDING]: {
                icon: <Clock className="h-4 w-4" />,
                className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            },
            [InvoiceStatus.PAID]: {
                icon: <CheckCircle className="h-4 w-4" />,
                className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            },
            [InvoiceStatus.OVERDUE]: {
                icon: <AlertTriangle className="h-4 w-4" />,
                className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
            },
            [InvoiceStatus.CANCELLED]: {
                icon: <XCircle className="h-4 w-4" />,
                className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
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
                        placeholder="Search invoices..."
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
                                <SelectItem value={InvoiceStatus.DRAFT}>Draft</SelectItem>
                                <SelectItem value={InvoiceStatus.PENDING}>Pending</SelectItem>
                                <SelectItem value={InvoiceStatus.PAID}>Paid</SelectItem>
                                <SelectItem value={InvoiceStatus.OVERDUE}>Overdue</SelectItem>
                                <SelectItem value={InvoiceStatus.CANCELLED}>Cancelled</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Invoice list */}
            <div className="rounded-lg border">
                {filteredInvoices.length === 0 ? (
                    <div className="p-8 text-center">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-2 text-lg font-semibold">No invoices found</h3>
                        <p className="text-sm text-muted-foreground">
                            {searchQuery || statusFilter !== 'all'
                                ? 'Try changing your search or filter'
                                : 'Create your first invoice to get started'}
                        </p>
                        {!searchQuery && statusFilter === 'all' && (
                            <Button className="mt-4" asChild>
                                <Link href="/dashboard/invoices/new">Create Invoice</Link>
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y">
                        {filteredInvoices.map((invoice) => (
                            <Link
                                key={invoice.id}
                                href={`/dashboard/invoices/${invoice.id}`}
                                className="block transition-colors hover:bg-muted/50"
                            >
                                <div className="flex items-center justify-between p-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-4">
                                            <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                                <FileText className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm sm:text-base truncate">
                                                    Invoice {invoice.number}
                                                </p>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {invoice.clientName}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="hidden md:block ml-4">
                                        <p className="text-sm font-medium">${invoice.totalAmount.toFixed(2)}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Due {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        <StatusBadge status={invoice.status} />
                                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}