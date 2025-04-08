'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { LockKeyhole, Wallet, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface AuthWrapperProps {
    children: ReactNode;
    /**
     * Paths that should be protected and require authentication
     * e.g. ['/dashboard', '/dashboard/invoices']
     */
    protectedPaths: string[];
    /**
     * Paths that are exempt from authentication even if they match a protected path
     * e.g. ['/dashboard/public']
     */
    exemptPaths?: string[];
    /**
     * Where to redirect after successful authentication (default: current path)
     */
    redirectTo?: string;
}

export function AuthWrapper({
    children,
    protectedPaths,
    exemptPaths = [],
}: AuthWrapperProps) {
    const { isConnected } = useAccount();
    const { openConnectModal } = useConnectModal();
    const router = useRouter();
    const pathname = usePathname();

    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isBlurred, setIsBlurred] = useState(false);

    // Check if the current path requires authentication
    const isProtectedPath = () => {
        // Check exemptions first
        if (exemptPaths.some(path => pathname.startsWith(path))) {
            return false;
        }

        // Then check if it's a protected path
        return protectedPaths.some(path => pathname.startsWith(path));
    };

    useEffect(() => {
        const requiresAuth = isProtectedPath();

        if (requiresAuth && !isConnected) {
            setShowAuthModal(true);
            setIsBlurred(true);
        } else {
            setShowAuthModal(false);
            setIsBlurred(false);
        }
    }, [isConnected, pathname]);

    // Handle connect button click
    const handleConnect = () => {
        if (openConnectModal) {
            openConnectModal();
        }
    };

    // Prevent closing the modal if on a protected page
    const handleModalClose = () => {
        if (isProtectedPath() && !isConnected) {
            // If on a protected page and not connected, redirect to home
            router.push('/');
        } else {
            setShowAuthModal(false);
            setIsBlurred(false);
        }
    };

    return (
        <>
            <div className={isBlurred ? 'blur-sm pointer-events-none' : ''}>
                {children}
            </div>

            <Dialog open={showAuthModal} onOpenChange={handleModalClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                            <LockKeyhole className="h-8 w-8 text-primary" />
                        </div>
                        <DialogTitle className="text-center text-xl">Authentication Required</DialogTitle>
                        <DialogDescription className="text-center">
                            Please connect your wallet to access this page
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col items-center gap-6 py-4">
                        <div className="rounded-lg border bg-muted/50 p-4 text-sm">
                            <div className="flex items-center gap-2 font-medium mb-2">
                                <Shield className="h-4 w-4 text-primary" />
                                <span>Why do I need to connect?</span>
                            </div>
                            <p className="text-muted-foreground">
                                Connecting your wallet allows you to securely access your invoices,
                                make payments, and manage your transactions in the dashboard.
                            </p>
                        </div>

                        <Button
                            size="lg"
                            className="w-full flex items-center justify-center gap-2"
                            onClick={handleConnect}
                        >
                            <Wallet className="h-5 w-5" />
                            Connect Wallet
                        </Button>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row sm:justify-center gap-2">
                        <Button variant="outline" onClick={() => router.push('/')}>
                            Return to Home
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}