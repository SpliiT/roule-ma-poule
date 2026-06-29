import { test, expect } from '@playwright/test';

test.describe('Navigation Publique', () => {
    test('La page d\'accueil s\'affiche correctement', async ({ page }) => {
        // Naviguer sur la page d'accueil
        await page.goto('/');

        // Vérifier que le titre de l'application est présent (Roule Ma Poule)
        await expect(page).toHaveTitle(/Roule Ma Poule/i);

        // Vérifier la présence du header
        await expect(page.locator('header')).toBeVisible();

        // Vérifier la présence d'un bouton de connexion ou du lien réserver
        const ctaButton = page.getByRole('link', { name: /réserver/i }).first();
        await expect(ctaButton).toBeVisible();
    });

    test('Le bouton Réserver pointe vers la bonne page', async ({ page }) => {
        await page.goto('/');
        
        // Trouver le premier bouton/lien Réserver
        const reserveLink = page.getByRole('link', { name: /réserver/i }).first();
        
        // S'assurer qu'il a bien l'attribut href vers /bookings/new
        await expect(reserveLink).toHaveAttribute('href', '/bookings/new');
    });
});
