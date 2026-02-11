'use client';

import { UserProfile } from '@clerk/nextjs';

export default function ProfilePage() {
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
            </div>
        </div>
    );
}
