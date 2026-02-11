import { z } from 'zod';
import { bikeSchema } from '@/lib/validations/auth';
export type BikeType = 'CITY' | 'VTT' | 'ROAD' | 'GRAVEL' | 'BMX' | 'CARGO' | 'FOLDING' | 'OTHER';
export type BikeFormData = z.infer<typeof bikeSchema>;
export interface Bike {
    id: string;
    userId: string;
    brand: string;
    model: string;
    year: number | null;
    type: BikeType;
    isElectric: boolean;
    photoUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export const BIKE_TYPES: { value: BikeType; label: string }[] = [
    { value: 'CITY', label: 'Ville / Urbain' },
    { value: 'VTT', label: 'VTT / Tout-terrain' },
    { value: 'ROAD', label: 'Route / Course' },
    { value: 'GRAVEL', label: 'Gravel' },
    { value: 'BMX', label: 'BMX' },
    { value: 'CARGO', label: 'Cargo' },
    { value: 'FOLDING', label: 'Pliant' },
    { value: 'OTHER', label: 'Autre' },
];