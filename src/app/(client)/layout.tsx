import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getCurrentUser } from '@/lib/auth';
import { ClientSidebar } from '@/components/layouts/client-sidebar';
export default async function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId: clerkId } = await auth();
    const user = await getCurrentUser();
    if (!clerkId) {
        redirect('/sign-in');
    }
    if (!user) {
        redirect('/onboarding');
    }
    if (user.role === 'ADMIN') {
        redirect('/admin');
    }
    if (user.role === 'TECHNICIEN') {
        redirect('/technician');
    }
    return (
        <div className="flex min-h-screen">
            <ClientSidebar user={user} />
            <main className="flex-1 pl-0 md:pl-64">
                <div className="container mx-auto px-4 py-6 max-w-6xl">
                    {children}
                </div>
            </main>
        </div>
    );
}