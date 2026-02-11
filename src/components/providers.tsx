'use client';
import { ClerkProvider } from '@clerk/nextjs';
import { frFR } from '@clerk/localizations';
import { dark } from '@clerk/themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';
export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, 
                        retry: 1,
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );
    return (
        <ClerkProvider
            localization={frFR}
            appearance={{
                baseTheme: dark,
                variables: {
                    colorPrimary: '#ffbc00',
                    colorBackground: '#1a1614',
                    colorInputBackground: '#26211e',
                    colorInputText: '#fcfaf9',
                    colorText: '#fcfaf9',
                    borderRadius: '0.75rem',
                },
                elements: {
                    card: 'bg-[#1a1614] border border-[#26211e] shadow-xl',
                    navbar: 'bg-[#1a1614]',
                    headerTitle: 'text-[#fcfaf9] italic font-black uppercase tracking-tighter',
                    headerSubtitle: 'text-[#a1a1aa]',
                }
            }}
        >
            <QueryClientProvider client={queryClient}>
                {children}
                <Toaster
                    position="top-right"
                    richColors
                    closeButton
                    toastOptions={{
                        duration: 4000,
                    }}
                />
            </QueryClientProvider>
        </ClerkProvider>
    );
}