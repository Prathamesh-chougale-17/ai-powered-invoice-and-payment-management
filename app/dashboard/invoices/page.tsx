import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Suspense } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { InvoiceList } from '@/components/invoices/invoice-list';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getInvoices } from '@/lib/actions/invoice-actions';
import { Invoice } from '@/types';

export default function InvoicesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <DashboardHeader
                    title="Invoices"
                    description="Manage and track all your invoices."
                />
                <Button asChild>
                    <Link href="/dashboard/invoices/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Invoice
                    </Link>
                </Button>
            </div>

            <Suspense fallback={<InvoiceListSkeleton />}>
                <InvoiceListContent />
            </Suspense>
        </div>
    );
}

async function InvoiceListContent() {
    const { success, invoices } = await getInvoices();

    if (!success || !invoices) {
        return <div>Failed to load invoices</div>;
    }

    return <InvoiceList invoices={invoices as unknown as Invoice[]} />;
}

function InvoiceListSkeleton() {
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
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-24 mt-2" />
                                </div>
                                <Skeleton className="h-8 w-20 rounded-full" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}