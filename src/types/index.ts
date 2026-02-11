// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}

// ============================================
// USER TYPES
// ============================================

export type UserRole = 'CLIENT' | 'TECHNICIEN' | 'ADMIN';

export interface User {
    id: string;
    clerkId: string;
    email: string;
    name?: string | null;
    phone?: string | null;
    role: UserRole;
    isActive: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
}


export type InterventionStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED';

export type BikeType =
    | 'CITY'
    | 'VTT'
    | 'ROAD'
    | 'GRAVEL'
    | 'BMX'
    | 'CARGO'
    | 'FOLDING'
    | 'OTHER';

// ============================================
// UI TYPES
// ============================================

export interface NavItem {
    label: string;
    href: string;
    icon?: string;
    badge?: number;
}

export interface SelectOption {
    label: string;
    value: string;
}

// ============================================
// MAP TYPES
// ============================================

export interface LatLng {
    latitude: number;
    longitude: number;
}

export interface GeoJsonPolygon {
    type: 'Polygon';
    coordinates: number[][][];
}

// ============================================
// BOOKING TYPES
// ============================================

export interface BookingSlot {
    date: string;
    startTime: string;
    endTime: string;
    available: boolean;
}

export interface BookingFormData {
    address: string;
    addressComplement?: string;
    postalCode: string;
    city: string;
    latitude: number;
    longitude: number;
    bikeId: string;
    forfaitId: string;
    scheduledAt: string;
    clientNotes?: string;
    productIds?: string[];
}

// ============================================
// STATUS LABELS & COLORS
// ============================================

export const STATUS_CONFIG: Record<InterventionStatus, { label: string; color: string }> = {
    PENDING: { label: 'En attente', color: 'warning' },
    CONFIRMED: { label: 'Confirmée', color: 'primary' },
    IN_PROGRESS: { label: 'En cours', color: 'accent' },
    COMPLETED: { label: 'Terminée', color: 'success' },
    CANCELLED: { label: 'Annulée', color: 'destructive' },
};

export const BIKE_TYPE_LABELS: Record<BikeType, string> = {
    CITY: 'Ville',
    VTT: 'VTT',
    ROAD: 'Route',
    GRAVEL: 'Gravel',
    BMX: 'BMX',
    CARGO: 'Cargo',
    FOLDING: 'Pliant',
    OTHER: 'Autre',
};

export const ROLE_LABELS: Record<UserRole, string> = {
    CLIENT: 'Client',
    TECHNICIEN: 'Technicien',
    ADMIN: 'Administrateur',
};

export const DAYS_OF_WEEK = [
    'Dimanche',
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
] as const;
