'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    FileText,
    Wallet,
    CreditCard,
    Settings,
    Users,
    LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();

    const routes = [
        {
            href: '/dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            active: pathname === '/dashboard',
        },
        {
            href: '/dashboard/invoices',
            label: 'Invoices',
            icon: FileText,
            active: pathname.includes('/dashboard/invoices'),
        },
        {
            href: '/dashboard/transactions',
            label: 'Transactions',
            icon: Wallet,
            active: pathname.includes('/dashboard/transactions'),
        },
        {
            href: '/dashboard/payments',
            label: 'Payments',
            icon: CreditCard,
            active: pathname.includes('/dashboard/payments'),
        },
        {
            href: '/dashboard/settings',
            label: 'Settings',
            icon: Settings,
            active: pathname.includes('/dashboard/settings'),
        },
    ];

    return (
        <div className={cn('py-4 flex flex-col h-full bg-background', className)}>
            <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold">Navigation</h2>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Button
                            key={route.href}
                            variant={route.active ? 'secondary' : 'ghost'}
                            className={cn(
                                'w-full justify-start',
                                route.active ? 'bg-secondary' : 'hover:bg-secondary/80'
                            )}
                            asChild
                        >
                            <Link href={route.href}>
                                <route.icon className="mr-2 h-4 w-4" />
                                {route.label}
                            </Link>
                        </Button>
                    ))}
                </div>
            </div>

            <Separator className="my-4" />

            <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold">Profile</h2>
                <div className="space-y-1">
                    <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link href="/dashboard/profile">
                            <Users className="mr-2 h-4 w-4" />
                            Your Profile
                        </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-500/10">
                        <LogOut className="mr-2 h-4 w-4" />
                        Log Out
                    </Button>
                </div>
            </div>

            <div className="mt-auto p-4">
                <div className="rounded-lg bg-secondary p-4">
                    <h3 className="font-medium">Need Help?</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Check our documentation or contact support for assistance.
                    </p>
                    <Button className="mt-3 w-full" size="sm" variant="default">
                        View Documentation
                    </Button>
                </div>
            </div>
        </div>
    );
}