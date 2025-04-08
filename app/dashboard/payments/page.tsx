import { Suspense } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { PaymentsList } from '@/components/payments/payments-list';
import { PaymentSummary } from '@/components/payments/payment-summary';
import { SupportedNetworks } from '@/components/payments/supported-networks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getInvoices } from '@/lib/actions/invoice-actions';
import { getTransactions } from '@/lib/actions/transaction-actions';
import { Invoice, InvoiceStatus } from '@/types';

export default function PaymentsPage() {
    return (
        <div className="space-y-6">
            <DashboardHeader
                title="Payments"
                description="Manage and track payments for your invoices."
            />

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="pending">Pending Payments</TabsTrigger>
                    <TabsTrigger value="completed">Completed Payments</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Suspense fallback={<StatCardsSkeleton />}>
                            <PaymentSummaryContent />
                        </Suspense>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Supported Networks</CardTitle>
                            <CardDescription>
                                Blockchain networks supported for payments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SupportedNetworks />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pending" className="space-y-6">
                    <Suspense fallback={<PaymentsListSkeleton />}>
                        <PendingPaymentsContent />
                    </Suspense>
                </TabsContent>

                <TabsContent value="completed" className="space-y-6">
                    <Suspense fallback={<PaymentsListSkeleton />}>
                        <CompletedPaymentsContent />
                    </Suspense>
                </TabsContent>
            </Tabs>
        </div>
    );
}

async function PaymentSummaryContent() {
    // Get all invoices
    const { success: invoiceSuccess, invoices } = await getInvoices();

    // Get all transactions
    const { success: transactionSuccess, transactions } = await getTransactions();

    if (!invoiceSuccess || !invoices || !transactionSuccess || !transactions) {
        return <div>Failed to load payment data</div>;
    }

    // Calculate payment stats
    const pendingInvoices = invoices.filter(invoice => invoice.status === InvoiceStatus.PENDING);
    const paidInvoices = invoices.filter(invoice => invoice.status === InvoiceStatus.PAID);

    const pendingAmount = pendingInvoices.reduce((total, invoice) => total + invoice.totalAmount, 0);
    const paidAmount = paidInvoices.reduce((total, invoice) => total + invoice.totalAmount, 0);
    const totalTransactionAmount = transactions.reduce((total, tx) => total + tx.amount, 0);

    return (
        <PaymentSummary
            pendingCount={pendingInvoices.length}
            pendingAmount={pendingAmount}
            paidCount={paidInvoices.length}
            paidAmount={paidAmount}
            transactionCount={transactions.length}
            transactionAmount={totalTransactionAmount}
        />
    );
}

async function PendingPaymentsContent() {
    // Get pending invoices
    const { success, invoices } = await getInvoices();

    if (!success || !invoices) {
        return <div>Failed to load pending payments</div>;
    }

    const pendingInvoices = invoices.filter(
        invoice => invoice.status === InvoiceStatus.PENDING
    );

    return <PaymentsList invoices={pendingInvoices as unknown as Invoice[]} isPending={true} />;
}

async function CompletedPaymentsContent() {
    // Get paid invoices
    const { success, invoices } = await getInvoices();

    if (!success || !invoices) {
        return <div>Failed to load completed payments</div>;
    }

    const paidInvoices = invoices.filter(
        invoice => invoice.status === InvoiceStatus.PAID
    );

    return <PaymentsList invoices={paidInvoices as unknown as Invoice[]} isPending={false} />;
}

function StatCardsSkeleton() {
    return (
        <>
            {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="col-span-1">
                    <CardHeader className="pb-2">
                        <Skeleton className="h-4 w-36" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </>
    );
}

function PaymentsListSkeleton() {
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