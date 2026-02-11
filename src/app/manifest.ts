import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Roule Ma Poule',
        short_name: 'RouleMaPoule',
        description: 'Réservez une intervention de réparation ou entretien de vélo à domicile à Lyon.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#fab72b', // Based on --primary: 43 96% 58%
        icons: [
            {
                src: '/images/favicon.png',
                sizes: 'any',
                type: 'image/png',
            },
            {
                src: '/images/mascotte.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/images/logo.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
