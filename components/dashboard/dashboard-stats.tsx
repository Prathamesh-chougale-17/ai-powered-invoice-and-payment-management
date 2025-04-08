'use client';

import {
    ArrowUpRight,
    ArrowDownRight,
    FileText,
    Wallet,
    DollarSign,
    Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
    title: string;
    value: string;
    description: string;
    icon: React.ReactNode;
    change?: {
        value: number;
        positive: boolean;
    };
    loading?: boolean;
}

function StatsCard({
    title,
    value,
    description,
    icon,
    change,
    loading = false
}: StatsCardProps) {
    return (
        <div className="rounded-lg border bg-card p-5 transition-shadow hover:shadow-md">
            <div className="flex justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <div className="flex items-baseline gap-2">
                        {loading ? (
                            <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
                        ) : (
                            <h3 className="text-2xl font-bold">{value}</h3>
                        )}

                        {change && (
                            <p className={cn(
                                "text-xs font-medium flex items-center",
                                change.positive ? "text-green-500" : "text-red-500"
                            )}>
                                {change.positive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                                {change.value}%
                            </p>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                </div>
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                    {icon}
                </div>
            </div>
        </div>
    );
}

export function DashboardStats() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
                title="Total Invoices"
                value="32"
                description="All time invoices"
                icon={<FileText className="h-4 w-4" />}
                change={{ value: 12, positive: true }}
            />
            <StatsCard
                title="Pending Invoices"
                value="8"
                description="Awaiting payment"
                icon={<Clock className="h-4 w-4" />}
            />
            <StatsCard
                title="Transactions"
                value="126"
                description="All time transactions"
                icon={<Wallet className="h-4 w-4" />}
                change={{ value: 5, positive: true }}
            />
            <StatsCard
                title="Total Revenue"
                value="$24,512"
                description="All time revenue"
                icon={<DollarSign className="h-4 w-4" />}
                change={{ value: 2, positive: false }}
            />
        </div>
    );
}