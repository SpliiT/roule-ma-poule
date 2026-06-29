import { test, expect } from '@playwright/test';

test.describe('Prise de rendez-vous (Booking)', () => {
    // Note: L'application utilise Clerk pour l'authentification. 
    // Il faut utiliser un token ou bypasser l'authentification pour un vrai test E2E.
    // Dans cet exemple, on s'assure que la page de dashboard redirige bien vers le login si non authentifié.
    
    test('La page Dashboard requiert une authentification', async ({ page }) => {
        const response = await page.goto('/dashboard');
        
        // Si Clerk est actif, on s'attend à être redirigé vers sign-in
        const url = page.url();
        expect(url).toContain('sign-in');
    });
});
