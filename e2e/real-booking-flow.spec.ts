import { test, expect } from '@playwright/test';
import { prisma } from '../src/lib/prisma';

test.describe('Booking Flow End-to-End', () => {
    test.afterAll(async () => {
        const username = process.env.E2E_USERNAME;
        if (username) {
            console.log(`Nettoyage : suppression des interventions de ${username}`);
            try {
                const user = await prisma.user.findUnique({
                    where: { email: username }
                });
                if (user) {
                    const result = await prisma.intervention.deleteMany({
                        where: { clientId: user.id }
                    });
                    console.log(`${result.count} intervention(s) supprimée(s).`);
                }
            } catch (err) {
                console.error('Erreur lors du nettoyage des interventions :', err);
            }
        }
    });

    test('Parcours complet de réservation avec connexion UI', async ({ page }) => {
        test.setTimeout(60000);
        
        // 1. Navigation vers l'accueil puis connexion
        await page.goto('/');
        await page.goto('/sign-in'); // Si Clerk redirige directement
        
        // 2. Remplir le nom d'utilisateur et continuer
        const usernameInput = page.locator('input[name="identifier"], input[type="text"]').first();
        await usernameInput.fill(process.env.E2E_USERNAME || '');
        await page.getByRole('button', { name: /continuer/i }).click();
        
        // 3. Remplir le mot de passe et se connecter
        const passwordInput = page.locator('input[name="password"]');
        await passwordInput.waitFor({ state: 'visible' });
        await passwordInput.fill(process.env.E2E_PASSWORD || '');
        await page.getByRole('button', { name: /continuer/i }).click();
        
        // 4. Attendre la redirection post-connexion
        await page.waitForURL('**/dashboard');
        
        // 5. Lancer la réservation
        await page.goto('/bookings/new');
        
        // --- ETAPE 1: LOCALISATION ---
        await expect(page.getByText('Localisation').first()).toBeVisible();
        const addressSearch = page.getByRole('textbox').first();
        await addressSearch.fill('1 Rue de la République');
        // Cliquer sur le résultat de l'autocomplétion Mapbox/Geocoder
        await page.getByText(/1 Rue de la République, Lyon/i).first().click();
        
        // La validation du formulaire (React Hook Form) peut prendre un instant ou nécessiter
        // que les champs adresse/code postal/ville soient correctement remplis et "touchés".
        await page.waitForTimeout(1000); // Laisser le temps à l'état de se mettre à jour
        
        // Assurer que le code postal et la ville sont remplis manuellement si l'autocomplétion n'a pas suffi
        const postalCodeInput = page.getByPlaceholder(/69/);
        if (await postalCodeInput.isVisible()) {
             await postalCodeInput.fill('69001');
        }
        const cityInput = page.locator('input[name="city"], input[placeholder="Lyon, Villeurbanne..."]');
        if (await cityInput.isVisible()) {
             await cityInput.fill('Lyon');
        }
        
        await page.getByRole('button', { name: /Continuer/i }).click();
        
        // --- ETAPE 2: VÉLO ---
        await expect(page.getByText('Votre Vélo').first()).toBeVisible();
        
        // Attendre que la requête de vélos soit terminée (le bouton apparait)
        await page.getByRole('link', { name: /Ajouter un vélo/i }).first().waitFor({ state: 'visible' });

        // Le vélo a déjà été ajouté lors du précédent test manuel, donc on le sélectionne s'il est là
        // On cherche un vélo de manière plus générique, au cas où l'utilisateur a créé un autre vélo
        const bikeCardList = page.locator('.grid.sm\\:grid-cols-2 > div');
        if (await bikeCardList.count() > 0 && await bikeCardList.first().isVisible()) {
             await bikeCardList.first().click();
        } else {
             await page.getByRole('link', { name: /Ajouter un vélo/i }).first().click();
             
             // Le champ de recherche est un combobox, il faut cliquer dessus pour l'ouvrir
             await page.getByRole('combobox').filter({ hasText: /Rechercher mon vélo/i }).first().click();
             
             // Le champ de recherche s'ouvre dans une boîte de dialogue (un Command/Combobox)
             // Il n'a pas forcément le placeholder attendu, donc on cible le combobox dans le dialog
             const searchInput = page.getByRole('dialog').getByRole('combobox').first();
             await searchInput.fill('Specialized Sirrus');
             await page.getByText(/Specialized Sirrus x 2.0/i).first().click();
             await page.getByRole('button', { name: /Enregistrer/i }).click();
             await page.waitForURL('**/bookings/new**');
             await page.locator('.grid.sm\\:grid-cols-2 > div').first().click();
        }
        
        // --- ETAPE 3: FORFAIT ---
        await expect(page.getByRole('heading', { name: /forfait/i })).toBeVisible({ timeout: 15000 });
        await page.getByRole('heading', { name: /Révision basique/i }).click();
        
        // --- ETAPE 4: DATE ET HEURE ---
        await expect(page.getByText('Date').first()).toBeVisible();
        
        // Sélectionner une date au hasard (le 10, le 15, ou autre jour visible dans le calendrier)
        // on cherche un jour actif non désactivé
        const dayBtn = page.locator('button[name="day"]:not([disabled])').last();
        await dayBtn.click();
        
        // Sélectionner une heure
        const timeSlot = page.locator('button').filter({ hasText: /:\d\d/ }).first();
        await timeSlot.click();
        
        await page.getByRole('button', { name: /Suivant/i }).click();
        
        // --- ETAPE 5: UTILISATEUR & PRODUITS (Passer) ---
        const skipButton = page.getByRole('button', { name: /Passer cette étape/i });
        if (await skipButton.isVisible()) {
             await skipButton.click();
        }
        
        // --- ETAPE 6: CONFIRMATION ---
        const confirmButton = page.getByRole('button', { name: /Confirmer la réservation/i });
        await confirmButton.waitFor({ state: 'visible' });
        await confirmButton.click();
        
        // 6. Vérification du succès (redirection vers dashboard et affichage)
        await page.waitForURL('**/dashboard', { timeout: 15000 });
        await expect(page.getByText(/En attente|En préparation/i).first()).toBeVisible();
    });
});
