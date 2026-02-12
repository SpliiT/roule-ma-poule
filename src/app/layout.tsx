import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';
import { NotificationsManager } from '@/components/notifications/notifications-manager';
import './globals.css';
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});
export const metadata: Metadata = {
  title: {
    default: 'Roule Ma Poule — Réparation vélo à domicile',
    template: '%s | Roule Ma Poule',
  },
  description:
    'Réservez une intervention de réparation ou entretien de vélo à domicile à Lyon. 68 ans d\'expertise, maintenant chez vous !',
  keywords: ['vélo', 'réparation', 'entretien', 'domicile', 'Lyon', 'VAE', 'cycliste'],
  authors: [{ name: 'LeCycleLyonnais' }],
  openGraph: {
    title: 'Roule Ma Poule — Réparation vélo à domicile',
    description: 'Réservez une intervention de réparation ou entretien de vélo à domicile à Lyon.',
    type: 'website',
    locale: 'fr_FR',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Roule Ma Poule',
  },
  icons: {
    apple: '/images/logo.png',
  },
  formatDetection: {
    telephone: false,
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased dark`}
        suppressHydrationWarning
      >
        <Providers>
          <NotificationsManager />
          {children}
        </Providers>
      </body>
    </html>
  );
}