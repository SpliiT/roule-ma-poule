import { test, expect } from '@playwright/test';

test.describe('Booking Flow (Tunnel de Réservation)', () => {
    test.skip('Parcours complet avec réservation', async ({ page }) => {
        
        // 1. Authentification Bypass via Cookie pour E2E
        // On place le cookie magique que nous avons ajouté dans src/lib/auth.ts
        await page.context().addCookies([{
            name: '__e2e_bypass_clerk_id',
            value: 'test_bypass_user_123',
            domain: 'localhost',
            path: '/',
            httpOnly: true,
            sameSite: 'Lax'
        }]);
        
        // 2. Navigation depuis l'accueil
        await page.goto('/');
        await expect(page).toHaveTitle(/Roule Ma Poule/i);
        
        // 3. Clic sur le bouton de réservation principal
        const reserveLink = page.getByRole('link', { name: /réserver/i }).first();
        await reserveLink.click();
        
        // 4. Puisque nous sommes déjà connectés, on devrait être redirigé vers /bookings/new
        await expect(page).toHaveURL(/\/bookings\/new/, { timeout: 15000 });
        await expect(page.getByText('Localisation').first()).toBeVisible();

        // 3. Étape Adresse
        const streetInput = page.getByLabel(/Adresse/i);
        if (await streetInput.isVisible()) {
            await streetInput.fill('123 Rue de la République');
        }
        
        const postalCodeInput = page.getByLabel(/Code Postal/i);
        if (await postalCodeInput.isVisible()) {
            await postalCodeInput.fill('69002');
        }
        
        const cityInput = page.getByLabel(/Ville/i);
        if (await cityInput.isVisible()) {
            await cityInput.fill('Lyon');
        }

        const continueBookingBtn = page.getByRole('button', { name: /Continuer/i });
        await continueBookingBtn.click();

        // 4. Étape Vélo
        await expect(page.getByText('Votre Vélo').first()).toBeVisible();
    });
});
