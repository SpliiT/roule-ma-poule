'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { Bike } from '@prisma/client';
import type { ApiResponse } from '@/types';
import { toast } from 'sonner';
export function useBikes() {
    const queryClient = useQueryClient();
    const { data: bikes = [], isLoading } = useQuery<Bike[]>({
        queryKey: ['bikes'],
        queryFn: async () => {
            const { data } = await axios.get<ApiResponse<Bike[]>>('/api/bikes');
            return data.data || [];
        },
    });
    const createBikeMutation = useMutation({
        mutationFn: async (newBike: any) => {
            const { data } = await axios.post<ApiResponse<Bike>>('/api/bikes', newBike);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bikes'] });
            toast.success('Vélo ajouté avec succès !');
        },
        onError: () => {
            toast.error("Erreur lors de l'ajout du vélo");
        },
    });
    const deleteBikeMutation = useMutation({
        mutationFn: async (id: string) => {
            await axios.delete(`/api/bikes/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bikes'] });
            toast.success('Vélo supprimé');
        },
        onError: () => {
            toast.error('Erreur lors de la suppression');
        },
    });
    return {
        bikes,
        isLoading,
        createBike: createBikeMutation.mutateAsync,
        isCreating: createBikeMutation.isPending,
        deleteBike: deleteBikeMutation.mutateAsync,
        isDeleting: deleteBikeMutation.isPending,
    };
}