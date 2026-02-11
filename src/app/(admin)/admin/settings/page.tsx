'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Settings,
    Bell,
    Shield,
    Zap,
    Mail,
    Smartphone,
    Globe
} from 'lucide-react';
export default function AdminSettingsPage() {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Paramètres Généraux</h1>
                <p className="text-muted-foreground">Configurez le comportement global de la plateforme.</p>
            </div>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary" />
                        <CardTitle>Notifications & Alertes</CardTitle>
                    </div>
                    <CardDescription>Configurez comment le système communique avec vous et vos techniciens.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                            <Label>Alertes nouvelles réservations</Label>
                            <p className="text-xs text-muted-foreground">Recevoir un e-mail à chaque nouvelle réservation client.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                            <Label>Notifications SMS Techniciens</Label>
                            <p className="text-xs text-muted-foreground">Envoyer un SMS automatique au technicien lors d'une assignation.</p>
                        </div>
                        <Switch />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        <CardTitle>Comportement Client</CardTitle>
                    </div>
                    <CardDescription>Règles de réservation et d'interaction client.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                            <Label>Réservation instantanée</Label>
                            <p className="text-xs text-muted-foreground">Autoriser les clients à réserver sans validation manuelle préalable.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                            <Label>Annulation autonome</Label>
                            <p className="text-xs text-muted-foreground">Permettre aux clients d'annuler jusqu'à 24h avant l'intervention.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-primary" />
                        <CardTitle>Maintenance & Système</CardTitle>
                    </div>
                    <CardDescription>Actions critiques et état du système.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="font-bold text-destructive">Mode Maintenance</p>
                            <p className="text-xs text-muted-foreground">Désactive l'accès public à l'application pour les tests.</p>
                        </div>
                        <Button variant="destructive" size="sm">Activer</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}