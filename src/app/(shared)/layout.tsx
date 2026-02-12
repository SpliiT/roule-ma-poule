import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { AdminSidebar } from '@/components/layouts/admin-sidebar';
import { TechnicianSidebar } from '@/components/layouts/technician-sidebar';
import { ClientSidebar } from '@/components/layouts/client-sidebar';

export default async function SharedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/sign-in');
    }

    const renderSidebar = () => {
        switch (user.role) {
            case 'ADMIN':
                return <AdminSidebar user={user as any} />;
            case 'TECHNICIEN':
                return <TechnicianSidebar user={user as any} />;
            default:
                return <ClientSidebar user={user as any} />;
        }
    };

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {renderSidebar()}
            <main className="flex-1 pl-0 md:pl-64 pb-24 md:pb-0">
                <div className="container mx-auto px-4 py-6 max-w-6xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
