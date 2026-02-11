'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarPlus, Home, Zap, CheckCircle, Wrench, MapPin, Shield, LayoutDashboard, Star } from 'lucide-react';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <Image
              src="/images/logo.png"
              alt="Roule Ma Poule Logo"
              width={64}
              height={64}
              className="object-contain"
            />
            <span className="text-2xl font-black tracking-tighter text-foreground uppercase italic px-1">
              Roule <span className="text-primary">Ma</span> Poule
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <SignedOut>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">
                  Se connecter
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Tableau de bord
                </Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <Link href="/bookings/new">
              <Button size="sm" className="font-bold">
                <CalendarPlus className="h-4 w-4 mr-1" />
                Réserver
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,188,0,0.15),transparent_50%)]" />
        <div className="relative container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="max-w-2xl animate-fade-in">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-bold text-accent border border-accent/20">
                <Wrench className="h-4 w-4" />
                68 ans d&#39;expertise vélo — Lyon
              </div>
              <h1 className="text-5xl font-black tracking-tighter text-foreground sm:text-6xl lg:text-7xl leading-[0.9]">
                VOTRE VÉLO <br />
                <span className="text-primary italic">RÉPARÉ</span> <br />
                <span className="relative">
                  CHEZ VOUS
                  <div className="absolute -bottom-2 left-0 h-3 w-full bg-primary/30 -z-10 -rotate-1" />
                </span>
              </h1>
              <p className="mt-8 text-xl text-muted-foreground md:text-2xl font-medium leading-relaxed">
                Plus besoin de porter votre vélo à l&#39;atelier.
                <span className="text-foreground font-bold"> On vient à vous </span>
                avec tout le matos pour que vous puissiez rouler l&#39;esprit libre.
              </p>
              <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row">
                <Link href="/bookings/new">
                  <Button size="lg" className="h-14 px-8 text-lg font-black shadow-xl shadow-primary/30 hover:scale-105 transition-transform uppercase italic">
                    Réserver maintenant
                  </Button>
                </Link>
                <div className="flex items-center gap-2 px-4 py-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted overflow-hidden">
                        <Image src={`https://i.pravatar.cc/100?u=${i}`} alt="avatar" width={32} height={32} />
                      </div>
                    ))}
                  </div>
                  <div className="text-xs font-bold text-muted-foreground">
                    <div className="flex items-center text-accent">
                      <Star className="h-3 w-3 fill-current" />
                      <Star className="h-3 w-3 fill-current" />
                      <Star className="h-3 w-3 fill-current" />
                      <Star className="h-3 w-3 fill-current" />
                      <Star className="h-3 w-3 fill-current" />
                    </div>
                    +500 clients satisfaits
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[500px] animate-float">
                <div className="absolute -inset-4 rounded-full bg-primary/20 blur-3xl opacity-50" />
                <Image
                  src="/images/mascotte.png"
                  alt="La mascotte Roule Ma Poule"
                  width={600}
                  height={600}
                  priority
                  className="relative drop-shadow-[0_20px_50px_rgba(0,0,0,0.2)] mx-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - How it works */}
      <section className="bg-muted/30 py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-4xl font-black tracking-tight uppercase italic">
              Simple comme <span className="text-primary italic underline underline-offset-8">Roulez</span> !
            </h2>
            <p className="mt-4 text-xl text-muted-foreground font-medium">
              3 étapes pour remettre votre bolide sur pied
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: CalendarPlus, title: "1. Réservez", desc: "Choisissez votre créneau et votre forfait en 2 minutes chrono.", color: "bg-primary/20 text-primary" },
              { icon: Wrench, title: "2. On arrive", desc: "Le tech débarque chez vous avec l'atelier complet mobile.", color: "bg-accent/20 text-accent" },
              { icon: CheckCircle, title: "3. Profitez", desc: "Votre vélo est prêt, payez sur place et repartez direct !", color: "bg-green-500/20 text-green-600" }
            ].map((step, idx) => (
              <Card key={idx} className="border-2 border-border/50 bg-card hover:border-primary/50 transition-colors shadow-none rounded-2xl overflow-hidden group">
                <CardContent className="p-8">
                  <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${step.color} group-hover:scale-110 transition-transform`}>
                    <step.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-black mb-3">{step.title}</h3>
                  <p className="text-muted-foreground font-medium">
                    {step.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Home, title: "Sans bouger", sub: "À domicile ou au bureau", color: "text-primary" },
              { icon: Zap, title: "Express", sub: "Intervention sous 48h", color: "text-accent" },
              { icon: Shield, title: "Garanti", sub: "Expertise certifiée", color: "text-primary" },
              { icon: MapPin, title: "Local", sub: "Partout dans le Grand Lyon", color: "text-green-500" }
            ].map((benefit, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-6 rounded-2xl border-2 border-transparent hover:border-border transition-all">
                <div className={`mb-4 rounded-2xl bg-muted p-4 ${benefit.color}`}>
                  <benefit.icon className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-black mb-1 leading-tight">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">
                  {benefit.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <Image src="/images/logo.png" alt="Logo" width={50} height={50} className="grayscale opacity-50" />
          </div>
          <p className="text-muted-foreground font-bold">
            © {new Date().getFullYear()} — Roule Ma Poule • Le Cycle Lyonnais
          </p>
          <div className="mt-4 flex justify-center gap-6 text-sm text-muted-foreground font-medium">
            <Link href="/terms" className="hover:text-primary transition-colors">CGU</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Confidentialité</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
