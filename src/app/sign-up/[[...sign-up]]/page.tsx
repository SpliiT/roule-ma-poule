import { SignUp } from '@clerk/nextjs';
import Image from 'next/image';
export default function SignUpPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10">
            <div className="w-full max-w-md animate-fade-in">
                <div className="mb-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                        <Image
                            src="/images/logo.png"
                            alt="Logo"
                            width={64}
                            height={64}
                            className="object-contain"
                        />
                        <h1 className="text-3xl font-bold text-foreground italic uppercase tracking-tighter">
                            Roule Ma Poule
                        </h1>
                    </div>
                    <p className="mt-2 text-muted-foreground">
                        Créez votre compte pour réserver une intervention
                    </p>
                </div>
                <SignUp
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
