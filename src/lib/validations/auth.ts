import { z } from 'zod';

// ============================================
// USER / AUTH VALIDATION SCHEMAS
// ============================================

export const updateUserSchema = z.object({
    name: z.string().min(2, 'Nom requis (min. 2 caractères)').optional(),
    phone: z.string()
        .regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone français invalide')
        .optional()
        .or(z.literal('')),
    role: z.enum(['CLIENT', 'TECHNICIEN', 'ADMIN']).optional(),
    isActive: z.boolean().optional(),
});

export const bikeSchema = z.object({
    brand: z.string().min(1, 'Marque requise'),
    model: z.string().min(1, 'Modèle requis'),
    year: z.number().int().min(1950).max(new Date().getFullYear() + 1).optional().nullable(),
    type: z.enum(['CITY', 'VTT', 'ROAD', 'GRAVEL', 'BMX', 'CARGO', 'FOLDING', 'OTHER']),
    isElectric: z.boolean(),
    photoUrl: z.string().url('URL invalide').optional().or(z.literal('')),
});

export const addressFormSchema = z.object({
    label: z.string().optional(),
    street: z.string().min(3, 'Adresse requise'),
    addressComplement: z.string().optional(),
    postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
    city: z.string().min(2, 'Ville requise'),
    latitude: z.number(),
    longitude: z.number(),
    isDefault: z.boolean(),
});

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
export type BikeFormValues = z.infer<typeof bikeSchema>;
export type AddressFormFormValues = z.infer<typeof addressFormSchema>;
