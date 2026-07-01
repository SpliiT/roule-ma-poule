import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

export const useZones = () => {
    return useQuery<any[]>({
        queryKey: ['admin-zones'],
        queryFn: async () => {
            const { data } = await axios.get('/api/admin/zones');
            return data.data;
        },
    });
};

export const useSaveZone = (mode: 'idle' | 'create' | 'edit', onSuccessCallback?: () => void) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: any) => {
            if (payload.id) {
                return axios.patch(`/api/admin/zones/${payload.id}`, payload);
            }
            return axios.post('/api/admin/zones', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-zones'] });
            toast.success(mode === 'edit' ? 'Zone mise à jour' : 'Zone créée');
            if (onSuccessCallback) onSuccessCallback();
        },
        onError: () => toast.error('Erreur lors de la sauvegarde'),
    });
};

export const useDeleteZone = (onSuccessCallback?: () => void) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => axios.delete(`/api/admin/zones/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-zones'] });
            toast.success('Zone supprimée');
            if (onSuccessCallback) onSuccessCallback();
        },
        onError: () => toast.error('Erreur lors de la suppression'),
    });
};
