import { GET, PATCH } from '../route';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';

jest.mock('@/lib/prisma', () => ({
    prisma: {
        companyInfo: {
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
    },
}));

jest.mock('@/lib/auth', () => ({
    requireRole: jest.fn(),
}));

describe('Admin Company API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/admin/company', () => {
        it('should return company info if it exists', async () => {
            const mockCompany = { id: 'c-1', name: 'Roule Ma Poule', address: '123 Rue de Paris' };
            (prisma.companyInfo.findFirst as jest.Mock).mockResolvedValue(mockCompany);

            const res = await GET();
            expect(res.status).toBe(200);
            
            const json = await res.json();
            expect(json).toEqual(mockCompany);
        });

        it('should return a default empty object if no company info exists', async () => {
            (prisma.companyInfo.findFirst as jest.Mock).mockResolvedValue(null);

            const res = await GET();
            expect(res.status).toBe(200);
            
            const json = await res.json();
            expect(json).toEqual({});
        });
    });

    describe('PATCH /api/admin/company', () => {
        it('should block non-admins from updating company info', async () => {
            (requireRole as jest.Mock).mockRejectedValue(new Error('Accès non autorisé'));
            
            const req = new NextRequest('http://localhost/api/admin/company', {
                method: 'PATCH',
                body: JSON.stringify({ name: 'Hacked' })
            });

            await expect(PATCH(req)).rejects.toThrow('Accès non autorisé');
        });

        it('should update company info if admin and info exists', async () => {
            (requireRole as jest.Mock).mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
            (prisma.companyInfo.findFirst as jest.Mock).mockResolvedValue({ id: 'c-1' });
            
            const updatePayload = { name: 'New Name', address: '456 Avenue' };
            const updatedCompany = { id: 'c-1', ...updatePayload };
            (prisma.companyInfo.update as jest.Mock).mockResolvedValue(updatedCompany);

            const req = new NextRequest('http://localhost/api/admin/company', {
                method: 'PATCH',
                body: JSON.stringify(updatePayload)
            });

            const res = await PATCH(req);
            expect(res.status).toBe(200);
            
            const json = await res.json();
            expect(json).toEqual(updatedCompany);
            expect(prisma.companyInfo.update).toHaveBeenCalledWith({
                where: { id: 'c-1' },
                data: updatePayload
            });
        });

        it('should create company info if admin but no info exists yet', async () => {
            (requireRole as jest.Mock).mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
            (prisma.companyInfo.findFirst as jest.Mock).mockResolvedValue(null);
            
            const createPayload = { name: 'First Name', address: '123 Street' };
            const createdCompany = { id: 'c-new', ...createPayload };
            (prisma.companyInfo.create as jest.Mock).mockResolvedValue(createdCompany);

            const req = new NextRequest('http://localhost/api/admin/company', {
                method: 'PATCH',
                body: JSON.stringify(createPayload)
            });

            const res = await PATCH(req);
            expect(res.status).toBe(200);
            
            expect(prisma.companyInfo.create).toHaveBeenCalledWith({
                data: createPayload
            });
        });
    });
});
