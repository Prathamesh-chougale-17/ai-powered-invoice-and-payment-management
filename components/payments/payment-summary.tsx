'use client';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    Clock,
    CheckCircle,
    CreditCard
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PaymentSummaryProps {
    pendingCount: number;
    pendingAmount: number;
    paidCount: number;
    paidAmount: number;
    transactionCount: number;
    transactionAmount: number;
}

export function PaymentSummary({
    pendingCount,
    pendingAmount,
    paidCount,
    paidAmount,
    transactionCount,
    transactionAmount
}: PaymentSummaryProps) {
    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Pending Payments
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{pendingCount}</div>
                    <p className="text-xs text-muted-foreground">
                        {formatCurrency(pendingAmount)} awaiting payment
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Completed Payments
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{paidCount}</div>
                    <p className="text-xs text-muted-foreground">
                        {formatCurrency(paidAmount)} received
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Transactions
                    </CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{transactionCount}</div>
                    <p className="text-xs text-muted-foreground">
                        {formatCurrency(transactionAmount)} processed
                    </p>
                </CardContent>
            </Card>
        </>
    );
}