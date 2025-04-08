'use client';

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Trend {
    value: string;
    label: string;
    negative?: boolean;
}

interface StatCardProps {
    title: string;
    value: string;
    description: string;
    icon: React.ReactNode;
    trend?: Trend;
    className?: string;
}

export function StatCard({
    title,
    value,
    description,
    icon,
    trend,
    className
}: StatCardProps) {
    return (
        <div className={cn("rounded-lg border bg-card p-5", className)}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="text-2xl font-bold mt-1">{value}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>

                    {trend && (
                        <div className={cn(
                            "text-xs font-medium flex items-center mt-2",
                            trend.negative ? "text-red-500" : "text-green-500"
                        )}>
                            {trend.negative ? (
                                <ArrowDownRight className="h-3 w-3 mr-1" />
                            ) : (
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                            )}
                            {trend.value}% {trend.label}
                        </div>
                    )}
                </div>

                <div className="rounded-full bg-primary/10 p-3 text-primary">
                    {icon}
                </div>
            </div>
        </div>
    );
}