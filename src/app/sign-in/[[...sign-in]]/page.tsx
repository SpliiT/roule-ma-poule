import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10">
            <div className="w-full max-w-md animate-fade-in">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-foreground">
                        🚴 Roule Ma Poule
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Connectez-vous pour accéder à votre espace
                    </p>
                </div>
                <SignIn
                    appearance={{
                        elements: {
                            rootBox: 'mx-auto',
                            card: 'shadow-lg border border-border',
                        },
                    }}
                />
            </div>
        </main>
    );
}
