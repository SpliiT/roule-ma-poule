import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useTechnicians = () => {
    return useQuery<any[]>({
        queryKey: ['admin-technicians'],
        queryFn: async () => {
            const { data } = await axios.get('/api/admin/users');
            return (data.data || []).filter((u: any) => u.role === 'TECHNICIEN');
        },
    });
};
