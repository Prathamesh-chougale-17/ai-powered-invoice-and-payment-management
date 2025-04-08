import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { Separator } from '@/components/ui/separator';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
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
    );
}