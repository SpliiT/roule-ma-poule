import { z } from 'zod';

// ============================================
// ADMIN VALIDATION SCHEMAS
// ============================================

export const forfaitSchema = z.object({
    name: z.string().min(2, 'Nom requis (min. 2 caractères)'),
    description: z.string().min(10, 'Description requise (min. 10 caractères)'),
    duration: z.number().int().min(15, 'Durée minimum 15 minutes').max(480, 'Durée maximum 8h'),
    price: z.number().min(0, 'Le prix doit être positif'),
    isActive: z.boolean().optional().default(true),
});

export const productSchema = z.object({
    name: z.string().min(2, 'Nom requis'),
    description: z.string().optional(),
    price: z.number().min(0, 'Le prix doit être positif'),
    stock: z.number().int().min(0, 'Le stock ne peut pas être négatif'),
    category: z.string().optional(),
    imageUrl: z.string().url('URL invalide').optional().or(z.literal('')),
    isActive: z.boolean().optional().default(true),
});

export const zoneSchema = z.object({
    name: z.string().min(2, 'Nom requis'),
    description: z.string().optional(),
    geometry: z.string().min(10, 'Géométrie requise (format WKT)'),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur hexadécimale invalide'),
    isActive: z.boolean().optional().default(true),
});

export const planningSchema = z.object({
    zoneId: z.string().min(1, 'Zone requise'),
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:MM requis'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:MM requis'),
    isActive: z.boolean().optional().default(true),
}).refine(
    (data) => data.startTime < data.endTime,
    { message: "L'heure de fin doit être après l'heure de début", path: ['endTime'] }
);

export const companyInfoSchema = z.object({
    name: z.string().min(2, 'Nom requis'),
    description: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Email invalide').optional().or(z.literal('')),
    website: z.string().url('URL invalide').optional().or(z.literal('')),
    logo: z.string().optional(),
    siret: z.string().regex(/^\d{14}$/, 'SIRET invalide (14 chiffres)').optional().or(z.literal('')),
});

export type ForfaitFormValues = z.infer<typeof forfaitSchema>;
export type ProductFormValues = z.infer<typeof productSchema>;
export type ZoneFormValues = z.infer<typeof zoneSchema>;
export type PlanningFormValues = z.infer<typeof planningSchema>;
export type CompanyInfoFormValues = z.infer<typeof companyInfoSchema>;
