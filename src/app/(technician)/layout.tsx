import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { TechnicianSidebar } from '@/components/layouts/technician-sidebar';
export default async function TechnicianLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();
    if (!user) {
        redirect('/sign-in');
    }
    if (user.role !== 'TECHNICIEN' && user.role !== 'ADMIN') {
        redirect('/dashboard');
    }
    return (
        <div className="flex min-h-screen">
            <TechnicianSidebar user={user} />
            <main className="flex-1 pl-0 md:pl-64 pb-24 md:pb-0">
                <div className="container mx-auto px-4 py-6 max-w-6xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
