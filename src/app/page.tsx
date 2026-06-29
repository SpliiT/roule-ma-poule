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
      { }
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="object-contain md:w-16 md:h-16"
            />
            <span className="text-lg md:text-2xl font-black tracking-tighter text-foreground uppercase italic px-1">
              Roule <span className="text-primary">Ma</span> <span className="xs:inline">Poule</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-3">
              <SignedOut>
                <Link href="/sign-in">
                  <Button variant="ghost" className="bg-accent" size="sm">
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
                <UserButton />
              </SignedIn>
            </div>
            <Link href="/bookings/new">
              <Button size="sm" className="font-bold text-xs md:text-sm h-10 px-4 md:h-11 md:px-6">
                <CalendarPlus className="h-4 w-4 mr-1" />
                <span>Réserver</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
        {/* Modern background gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,188,0,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,188,255,0.05),transparent_40%)]" />

        <div className="relative container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="max-w-2xl animate-fade-in">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary border border-primary/20 backdrop-blur-sm">
                <Wrench className="h-4 w-4" />
                68 ans d&#39;expertise vélo — Lyon
              </div>
              <h1 className="text-4xl xs:text-5xl font-black tracking-tighter text-foreground sm:text-6xl lg:text-7xl leading-[0.9]">
                VOTRE VÉLO <br />
                <span className="text-primary italic drop-shadow-sm">RÉPARÉ</span> <br />
                <span className="relative">
                  CHEZ VOUS
                  <div className="absolute -bottom-1 md:-bottom-2 left-0 h-2 md:h-3 w-full bg-primary/30 -z-10 -rotate-1 rounded-full" />
                </span>
              </h1>
              <p className="mt-6 md:mt-8 text-lg md:text-2xl text-muted-foreground font-medium leading-relaxed max-w-xl">
                Plus besoin de porter votre vélo à l&#39;atelier.
                <span className="text-foreground font-bold"> On vient à vous </span>
                avec tout le matos pour rouler l&#39;esprit libre.
              </p>
              <div className="mt-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                <Link href="/bookings/new">
                  <Button size="lg" className="h-16 px-10 text-xl font-black shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all uppercase italic rounded-2xl">
                    Réserver maintenant
                  </Button>
                </Link>
                <div className="flex items-center gap-3 px-4 py-2 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50">
                  <div className="flex -space-x-3">
                    <div className="h-10 w-10 rounded-full border-2 border-background ring-2 ring-primary/10 overflow-hidden bg-muted">
                      <Image src="/images/avatars/user-1.jpg" alt="Client satisfait" width={40} height={40} className="object-cover" />
                    </div>
                    <div className="h-10 w-10 rounded-full border-2 border-background ring-2 ring-primary/10 overflow-hidden bg-muted">
                      <Image src="/images/avatars/user-2.jpg" alt="Client satisfait" width={40} height={40} className="object-cover" />
                    </div>
                    <div className="h-10 w-10 rounded-full border-2 border-background ring-2 ring-primary/10 overflow-hidden bg-muted">
                      <Image src="/images/avatars/user-3.jpg" alt="Client satisfait" width={40} height={40} className="object-cover" />
                    </div>
                    <div className="h-10 w-10 rounded-full border-2 border-background ring-2 ring-primary/10 overflow-hidden bg-muted flex items-center justify-center bg-primary text-primary-foreground text-xs font-bold">
                      +500
                    </div>
                  </div>
                  <div className="text-xs font-bold leading-tight">
                    <div className="flex items-center text-primary mb-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                    <span className="text-muted-foreground">+500 avis positifs</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[550px] animate-float">
                <div className="absolute -inset-10 rounded-full bg-primary/20 blur-[100px] opacity-60 animate-pulse" />
                <Image
                  src="/images/mascotte.png"
                  alt="La mascotte Roule Ma Poule"
                  width={600}
                  height={600}
                  priority
                  className="relative drop-shadow-[0_25px_60px_rgba(0,0,0,0.3)] mx-auto select-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="bg-muted/30 py-32 relative overflow-hidden border-y border-border/50">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-20 text-foreground">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase italic mb-6">
              Simple comme <span className="text-primary italic relative">
                Roulez
                <div className="absolute -bottom-2 left-0 h-1.5 w-full bg-primary rounded-full" />
              </span> !
            </h2>
            <p className="text-xl text-muted-foreground font-medium">
              3 étapes pour remettre votre bolide sur pied sans effort
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: CalendarPlus, title: "1. Réservez", desc: "Choisissez votre forfait et votre créneau en 2 min chrono.", color: "text-primary", bg: "bg-primary/10" },
              { icon: Wrench, title: "2. On arrive", desc: "Le technicien se déplace avec son atelier mobile complet.", color: "text-accent", bg: "bg-accent/10" },
              { icon: CheckCircle, title: "3. Profitez", desc: "Votre vélo est prêt ! Payez sur place et repartez direct.", color: "text-success", bg: "bg-success/10" }
            ].map((step, idx) => (
              <Card key={idx} className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all shadow-xl shadow-transparent hover:shadow-primary/5 rounded-[2.5rem] overflow-hidden group">
                <CardContent className="p-10 text-foreground">
                  <div className={`mb-8 flex h-20 w-20 items-center justify-center rounded-3xl ${step.bg} ${step.color} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                    <step.icon className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-black mb-4 uppercase italic">{step.title}</h3>
                  <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                    {step.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Home, title: "Zéro déplacement", sub: "À domicile ou au bureau", color: "text-primary" },
              { icon: Zap, title: "Service Express", sub: "Sous 48 heures garanties", color: "text-accent" },
              { icon: Shield, title: "Garanti 100%", sub: "Expertise cycle certifiée", color: "text-primary" },
              { icon: MapPin, title: "100% Lyonnais", sub: "Partout dans le Grand Lyon", color: "text-success" }
            ].map((benefit, idx) => (
              <div key={idx} className="group flex flex-col items-center text-center p-8 rounded-[2rem] border-2 border-transparent hover:border-border/50 hover:bg-muted/10 transition-all duration-300 text-foreground">
                <div className={`mb-6 rounded-2xl bg-muted p-5 ${benefit.color} group-hover:bg-primary/5 transition-colors`}>
                  <benefit.icon className="h-12 w-12" />
                </div>
                <h3 className="text-xl font-black mb-2 leading-tight uppercase italic">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-[0.2em]">
                  {benefit.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-20 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="absolute -inset-4 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Image src="/images/logo.png" alt="Logo" width={60} height={60} className="relative grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all" />
            </div>
          </div>
          <p className="text-muted-foreground font-black uppercase italic tracking-widest mb-6">
            © {new Date().getFullYear()} — Roule Ma Poule • Le Cycle Lyonnais
          </p>
          <div className="flex justify-center gap-10 text-xs text-muted-foreground font-bold uppercase tracking-widest">
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