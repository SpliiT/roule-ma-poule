import { test, expect } from '@playwright/test';

test.describe('Booking Flow (Tunnel de Réservation)', () => {
    test('Parcours complet avec inscription et réservation', async ({ page }) => {
        // 1. Navigation depuis l'accueil
        await page.goto('/');
        await expect(page).toHaveTitle(/Roule Ma Poule/i);
        
        // Clic sur le bouton de réservation principal
        const reserveLink = page.getByRole('link', { name: /réserver/i }).first();
        await reserveLink.click();
        
        // L'application doit nous rediriger vers Clerk pour nous connecter
        await expect(page).toHaveURL(/.*sign-in.*/);
        
        // 2. Inscription (Sign Up)
        const signUpLink = page.getByRole('link', { name: /S'inscrire/i });
        await signUpLink.click();
        await expect(page).toHaveURL(/.*sign-up.*/);
        
        // Saisie des informations
        const emailInput = page.getByLabel(/Adresse e-mail/i);
        const uniqueId = Date.now();
        const uniqueEmail = `test-e2e-${uniqueId}@example.com`;
        await emailInput.fill(uniqueEmail);

        const usernameInput = page.getByLabel(/Nom d'utilisateur/i);
        await usernameInput.fill(`user${uniqueId}`);
        
        const passwordInput = page.getByLabel(/Mot de passe/i);
        await passwordInput.fill('RouleMaPoule2026!');
        
        const continueAuthBtn = page.getByRole('button', { name: /Continuer/i });
        await continueAuthBtn.click();
        
        // 3. Validation OTP
        // L'étape de vérification reste sur l'URL /sign-up
        // Le texte exact peut varier ("Vérifiez votre e-mail", etc.), on attend simplement qu'un champ input pour le code apparaisse
        try {
            // Cherche le premier champ de code (souvent les inputs ont un nom ou un aria-label lié au code)
            const otpInput = page.locator('input[type="text"], input[type="tel"]').first();
            await otpInput.waitFor({ state: 'visible', timeout: 5000 });
            // Clerk focus généralement le premier champ, on peut taper directement
            await page.keyboard.type('424242'); 
        } catch (e) {
            console.log("Impossible de trouver le champ OTP ou étape ignorée.");
        }

        // 4. Redirection vers la page de réservation après authentification
        await expect(page).toHaveURL(/\/bookings\/new/, { timeout: 15000 });
        await expect(page.getByText('Localisation').first()).toBeVisible();

        // 5. Étape Adresse
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

        // 6. Étape Vélo
        await expect(page.getByText('Votre Vélo').first()).toBeVisible();
    });
});
