import { AuthWrapper } from '@/components/layout/auth-wrapper';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Protect all dashboard routes by using the general dashboard path prefix
    const protectedPaths = ['/dashboard'];

    // No exempt paths - all dashboard routes require authentication
    const exemptPaths: string[] = [];
    return (
        <AuthWrapper protectedPaths={protectedPaths} exemptPaths={exemptPaths}>
            <div className="flex min-h-screen flex-col">
                <Header />

                <div className="flex flex-1">
                    <div className="hidden border-r md:block">
                        <Sidebar className="w-64" />
                    </div>

                    <main className="flex-1 p-6 md:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </AuthWrapper>
    );
}