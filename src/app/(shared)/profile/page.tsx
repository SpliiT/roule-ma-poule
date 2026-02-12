'use client';
import { UserProfile, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { Bell, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
export default function ProfilePage() {
    const { user: clerkUser, isLoaded } = useUser();
    const queryClient = useQueryClient();
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setNotificationPermission(Notification.permission);
        }

        if (isLoaded && clerkUser) {
            axios.post('/api/users/sync').then(() => {
                queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            }).catch(err => {
                console.error('Erreur sync profil:', err);
            });
        }
    }, [isLoaded, clerkUser, queryClient]);
    return (
        <div className="flex flex-col items-center justify-center py-6">
            <div className="w-full max-w-4xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight text-center md:text-left">Mon Profil</h1>
                    <p className="text-muted-foreground text-center md:text-left">Gérez votre identité et vos paramètres de sécurité.</p>
                </div>
                <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                    <UserProfile
                        appearance={{
                            elements: {
                                rootBox: "w-full",
                                card: "w-full bg-transparent shadow-none border-none mx-auto",
                                navbar: "bg-muted/30 border-r border-border",
                                pageScrollBox: "bg-transparent p-4 md:p-8",
                                headerTitle: "text-foreground",
                                headerSubtitle: "text-muted-foreground",
                                profileSectionTitleText: "text-foreground font-bold",
                                profileSectionContent: "text-muted-foreground",
                                formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
                                formButtonReset: "text-muted-foreground hover:bg-muted",
                            }
                        }}
                    />
                </div>

                {/* Notifications Settings */}
                <div className="mt-8">
                    <Card className="border-2 border-border/50 shadow-md overflow-hidden bg-background">
                        <CardHeader className="bg-muted/30 border-b border-border/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Bell className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-black italic uppercase tracking-tighter">Notifications</CardTitle>
                                    <CardDescription>Recevez des alertes pour vos interventions et messages.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {notificationPermission !== null ? (
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            {notificationPermission === 'granted' ? (
                                                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 font-black uppercase italic text-[10px] tracking-widest">
                                                    <ShieldCheck className="h-3 w-3 mr-1" /> Activé
                                                </Badge>
                                            ) : notificationPermission === 'denied' ? (
                                                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-black uppercase italic text-[10px] tracking-widest">
                                                    <AlertCircle className="h-3 w-3 mr-1" /> Bloqué
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 font-black uppercase italic text-[10px] tracking-widest">
                                                    Non configuré
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground font-medium">
                                            {notificationPermission === 'granted'
                                                ? "Le système est autorisé à vous envoyer des notifications poussées."
                                                : notificationPermission === 'denied'
                                                    ? "Vous avez refusé les notifications. Réinitialisez les réglages de votre navigateur ou téléphone."
                                                    : "Activez les notifications pour ne rien rater de vos interventions."}
                                        </p>
                                    </div>

                                    {notificationPermission === 'default' && (
                                        <Button
                                            className="w-full md:w-auto font-black italic uppercase tracking-widest shadow-lg active:translate-y-1 transition-all"
                                            onClick={async () => {
                                                if (typeof window !== 'undefined' && 'Notification' in window) {
                                                    const permission = await Notification.requestPermission();
                                                    setNotificationPermission(permission);
                                                    if (permission === 'granted') {
                                                        window.dispatchEvent(new CustomEvent('trigger-push-setup'));
                                                    }
                                                }
                                            }}
                                        >
                                            Activer
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">
                                    Les notifications ne sont pas supportées ou en attente d'initialisation sur cet appareil.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
