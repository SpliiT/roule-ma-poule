import { z } from 'zod';

// ============================================
// BOOKING VALIDATION SCHEMAS
// ============================================

export const addressSchema = z.object({
    street: z.string().min(3, 'Adresse requise (min. 3 caractères)'),
    addressComplement: z.string().optional(),
    postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide (5 chiffres)'),
    city: z.string().min(2, 'Ville requise'),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
});

export const bookingSchema = z.object({
    address: z.string().min(3, 'Adresse requise'),
    addressComplement: z.string().optional(),
    postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
    city: z.string().min(2, 'Ville requise'),
    latitude: z.number(),
    longitude: z.number(),
    bikeId: z.string().min(1, 'Veuillez sélectionner un vélo'),
    forfaitId: z.string().min(1, 'Veuillez sélectionner un forfait'),
    scheduledAt: z.string().min(1, 'Veuillez choisir un créneau'),
    clientNotes: z.string().max(1000, 'Notes trop longues (max 1000 caractères)').optional(),
    productIds: z.array(z.string()).optional(),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
export type AddressFormValues = z.infer<typeof addressSchema>;
