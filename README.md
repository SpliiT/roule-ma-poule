# 🚴 Roule Ma Poule !

> Réparation et entretien de vélos à domicile — Application de gestion PWA

## Présentation

**Roule Ma Poule !** est une Progressive Web App de réservation et gestion d'interventions à domicile pour l'entretien et la réparation de vélos et VAE, développée pour **LeCycleLyonnais** (68 ans d'expérience).

### Profils utilisateurs

- **Client** : Réservation d'intervention, gestion de vélos, suivi d'historique
- **Technicien** : Planning journalier, mode hors ligne, navigation GPS, clôture d'intervention
- **Administrateur** : Gestion des zones géographiques, plannings, utilisateurs, catalogue

## Stack technique

| Couche | Technologies |
|--------|-------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| **Auth** | Clerk |
| **Base de données** | PostgreSQL + PostGIS, Prisma ORM |
| **Cartographie** | MapLibre GL JS, Google Maps API |
| **Médias** | Cloudinary |
| **Emails** | Nodemailer + React Email |
| **State** | TanStack React Query |
| **Validation** | Zod + React Hook Form |
| **Tests** | Jest, Playwright |

## Prérequis

- **Node.js** >= 18
- **PostgreSQL** >= 14 avec extension **PostGIS**
- Compte **Clerk** (authentification)
- Clé API **Google Maps** (optionnel, pour autocomplétion d'adresses)
- Compte **Cloudinary** (optionnel, pour les photos)

## Installation

```bash
# Cloner le projet
git clone <url-du-repo>
cd roule-ma-poule

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# → Remplir les valeurs dans .env.local

# Appliquer les migrations
npx prisma migrate dev

# Seeder la base de données
npm run db:seed

# Lancer le serveur de développement
npm run dev
```

## Scripts disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | Linting ESLint |
| `npm run db:push` | Push le schéma Prisma |
| `npm run db:migrate` | Créer une migration |
| `npm run db:studio` | Ouvrir Prisma Studio |
| `npm run db:seed` | Seeder la base de données |
| `npm test` | Tests unitaires (Jest) |
| `npm run test:e2e` | Tests E2E (Playwright) |
| `npm run format` | Formater le code (Prettier) |

## Structure du projet

```
src/
├── app/                    # Pages et routes (App Router)
│   ├── (client)/           # Espace client
│   ├── (technician)/       # Espace technicien
│   ├── (admin)/            # Espace admin
│   ├── api/                # API Routes
│   ├── sign-in/            # Page de connexion
│   ├── sign-up/            # Page d'inscription
│   ├── layout.tsx          # Layout racine
│   └── page.tsx            # Homepage
├── components/             # Composants réutilisables
│   └── ui/                 # Composants UI de base
├── hooks/                  # Hooks React custom
├── lib/                    # Utilitaires et config
│   ├── validations/        # Schémas Zod
│   ├── prisma.ts           # Client Prisma
│   └── auth.ts             # Helpers d'authentification
├── types/                  # Types TypeScript partagés
└── utils/                  # Fonctions utilitaires
prisma/
├── schema.prisma           # Schéma de base de données
├── seed.ts                 # Script de seed
└── migrations/             # Migrations SQL
```

## Licence

Projet développé dans le cadre de la formation CDA (Concepteur Développeur d'Applications).
