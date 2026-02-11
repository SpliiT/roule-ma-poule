import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { AdminSidebar } from '@/components/layouts/admin-sidebar';
export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();
    if (!user) {
        redirect('/sign-in');
    }
    if (user.role !== 'ADMIN') {
        redirect('/dashboard');
    }
    return (
        <div className="flex min-h-screen dark bg-background text-foreground">
            <AdminSidebar user={user} />
            <main className="flex-1 pl-0 md:pl-64">
                <div className="container mx-auto px-4 py-6 max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
}