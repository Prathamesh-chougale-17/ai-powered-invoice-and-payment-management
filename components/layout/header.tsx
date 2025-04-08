'use client';

import Link from 'next/link';
import {
    Menu,
    X,
    FileText,
    Wallet,
    LayoutDashboard,
} from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '../ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ConnectWalletButton } from '../ui/connect-wallet-button';

const navItems = [
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        name: 'Invoices',
        href: '/dashboard/invoices',
        icon: FileText,
    },
    {
        name: 'Transactions',
        href: '/dashboard/transactions',
        icon: Wallet,
    },
];

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        className="md:hidden"
                        size="icon"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </Button>

                    <Link href="/" className="flex items-center space-x-2">
                        <Wallet className="h-6 w-6" />
                        <span className="font-bold inline-block">AI Finance</span>
                    </Link>

                    <nav className="hidden md:flex md:gap-6 md:ml-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="group flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                            >
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.name}
                                <span className="h-0.5 w-0 bg-primary transition-all group-hover:w-full absolute bottom-0 left-0" />
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <ConnectWalletButton />
                </div>
            </div>

            {/* Mobile navigation */}
            <div
                className={cn(
                    "md:hidden fixed inset-x-0 top-16 z-50 h-screen bg-background border-r transition-transform duration-300 ease-in-out",
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="py-4 px-6 space-y-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center py-2 text-base font-medium hover:text-primary"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <item.icon className="mr-3 h-5 w-5" />
                            {item.name}
                        </Link>
                    ))}
                </div>
            </div>
        </header>
    );
}