import { test, expect } from '@playwright/test';

test.describe('Gestion des Zones (Admin)', () => {
    test('La page admin nécessite une authentification admin', async ({ page }) => {
        await page.goto('/admin');
        
        // Comme pour le Dashboard, l'accès admin doit être sécurisé
        const url = page.url();
        expect(url).toContain('sign-in');
    });
});
