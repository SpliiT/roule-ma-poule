'use client';
import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import type { User } from '@prisma/client';
import type { ApiResponse } from '@/types';
async function fetchCurrentUser(): Promise<User> {
    const response = await fetch('/api/users/me');
    if (!response.ok) {
        throw new Error('Erreur lors de la récupération du profil');
    }
    const data: ApiResponse<User> = await response.json();
    if (!data.success || !data.data) {
        throw new Error(data.error || 'Erreur inconnue');
    }
    return data.data;
}
export function useCurrentUser() {
    const { isSignedIn, isLoaded: isClerkLoaded } = useUser();
    const {
        data: dbUser,
        isLoading: isDbLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['currentUser'],
        queryFn: fetchCurrentUser,
        enabled: isClerkLoaded && isSignedIn,
        staleTime: 5 * 60 * 1000, 
    });
    return {
        user: dbUser ?? null,
        isLoading: !isClerkLoaded || (isSignedIn && isDbLoading),
        isSignedIn: isSignedIn ?? false,
        error,
        refetch,
    };
}