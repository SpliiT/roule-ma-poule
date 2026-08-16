"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  ShieldCheck,
  MapPin,
  Database,
  Code2,
  Terminal,
  CheckCircle2,
  Sparkles,
  UserCheck,
  Smartphone,
  LayoutDashboard,
  Calendar,
  Layers,
  Activity,
  GitBranch,
  Play,
  Lightbulb,
  ExternalLink,
  Lock,
  KeyRound,
  ArrowRight,
  AlertCircle,
  X,
  ZoomIn,
} from "lucide-react";

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackIcon: React.ReactNode;
  fallbackTitle: string;
  fallbackSubtitle?: string;
  onZoom?: (src: string, alt: string) => void;
}

function SmartImage({
  src,
  alt,
  className = "w-full h-full object-contain rounded-xl cursor-zoom-in hover:scale-[1.02] transition-transform",
  fallbackIcon,
  fallbackTitle,
  fallbackSubtitle,
  onZoom,
}: SmartImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center h-full w-full">
        {fallbackIcon}
        <span className="text-base text-neutral-200 font-bold mt-2">{fallbackTitle}</span>
        {fallbackSubtitle && <span className="text-xs text-neutral-500 mt-1">{fallbackSubtitle}</span>}
      </div>
    );
  }

  return (
    <div
      className="relative group w-full h-full flex items-center justify-center cursor-zoom-in"
      onClick={() => onZoom && onZoom(src, alt)}
      title="Cliquer pour agrandir"
    >
      <img
        src={src}
        alt={alt}
        className={className}
        onError={() => setHasError(true)}
      />
      <div className="absolute inset-0 bg-[#FACC15]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center pointer-events-none">
        <div className="px-3 py-1.5 rounded-full bg-black/80 border border-[#FACC15]/40 text-[#FACC15] text-xs font-bold flex items-center gap-1.5 shadow-xl">
          <ZoomIn size={14} /> Zoom
        </div>
      </div>
    </div>
  );
}

export default function PresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Passcode Protection System
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modal Image Zoom State
  const [zoomImage, setZoomImage] = useState<{ src: string; title: string } | null>(null);

  const totalSlides = 8;
  const expectedCode = process.env.NEXT_PUBLIC_PRESENTATION_CODE || "1985";

  useEffect(() => {
    const savedUnlock = sessionStorage.getItem("presentation_unlocked");
    if (savedUnlock === "true") {
      setIsUnlocked(true);
    }
    setIsLoading(false);

    // Auto-update Service Worker to clear stale Next.js static chunk caches after deployments
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.update();
        }
      });
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === expectedCode) {
      setIsUnlocked(true);
      sessionStorage.setItem("presentation_unlocked", "true");
      setErrorMsg("");
    } else {
      setErrorMsg("Code d'accès incorrect. Veuillez réessayer.");
      setPasscode("");
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    if (!isUnlocked) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setZoomImage(null);
        return;
      }
      if (zoomImage) return; // Disable slide navigation if modal is open

      if (e.key === "ArrowRight" || e.key === "Space") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide, isUnlocked, zoomImage]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0908] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#FACC15] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Passcode Lock Screen Render
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#0A0908] text-neutral-100 font-sans flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FACC15]/10 rounded-full blur-[180px] pointer-events-none" />

        <div className="max-w-md w-full bg-neutral-900/90 border border-neutral-800 backdrop-blur-xl p-8 md:p-10 rounded-3xl space-y-8 shadow-2xl z-10 text-center relative">
          <div className="w-20 h-20 rounded-3xl bg-[#FACC15]/10 border border-[#FACC15]/40 text-[#FACC15] flex items-center justify-center mx-auto shadow-lg shadow-[#FACC15]/20">
            <Lock size={38} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-black text-white">Présentation Protégée</h1>
            <p className="text-sm text-neutral-400">
              Veuillez saisir votre code secret pour accéder au diapositive de soutenance.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-5">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500">
                <KeyRound size={20} />
              </div>
              <input
                type="password"
                maxLength={10}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Code secret..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-neutral-950 border border-neutral-800 focus:border-[#FACC15] text-center text-xl font-mono tracking-widest text-white placeholder:text-neutral-600 focus:outline-none transition-all"
                autoFocus
              />
            </div>

            {errorMsg && (
              <div className="flex items-center justify-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 py-2.5 px-4 rounded-xl font-medium">
                <AlertCircle size={15} /> {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-[#FACC15] text-black font-extrabold text-base hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#FACC15]/20"
            >
              Déverrouiller <ArrowRight size={18} />
            </button>
          </form>

          <div className="pt-4 border-t border-neutral-800/80 text-[11px] text-neutral-500 font-mono">
            Roule Ma Poule | Tao SCHIRO (CDA IA 2026)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#0A0908] text-neutral-100 font-sans flex flex-col justify-between selection:bg-[#FACC15] selection:text-black overflow-hidden relative">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-[#FACC15]/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-[#EAB308]/10 rounded-full blur-[200px] pointer-events-none" />

      {/* LIGHTBOX MODAL */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-8 animate-fade-in"
          onClick={() => setZoomImage(null)}
        >
          <div
            className="relative max-w-7xl max-h-[90vh] w-full flex flex-col items-center justify-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between px-2">
              <span className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                <ZoomIn size={18} className="text-[#FACC15]" /> {zoomImage.title}
              </span>
              <button
                onClick={() => setZoomImage(null)}
                className="p-2.5 rounded-full bg-neutral-900 border border-neutral-700 hover:border-[#FACC15] text-white hover:text-[#FACC15] transition-all"
                title="Fermer"
              >
                <X size={22} />
              </button>
            </div>

            <div className="relative w-full h-[80vh] flex items-center justify-center bg-neutral-950/80 rounded-2xl border border-neutral-800 p-4 shadow-2xl overflow-hidden">
              <img
                src={zoomImage.src}
                alt={zoomImage.title}
                className="max-w-full max-h-full object-contain rounded-xl"
              />
            </div>

            <div className="text-xs text-neutral-400 font-mono">
              Appuie sur <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-200">Echap</kbd> ou clique n'importe où pour fermer
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="w-full z-20 px-8 py-4 flex items-center justify-between border-b border-neutral-800/80 bg-[#0A0908]/90 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-4">
          <img
            src="/images/logo.png"
            alt="Logo Roule Ma Poule"
            className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(250,204,21,0.4)]"
          />
          <div>
            <h1 className="font-extrabold text-base tracking-wide text-white flex items-center gap-2">
              Roule Ma Poule <span className="text-[#FACC15] font-mono text-xs px-2 py-0.5 rounded bg-[#FACC15]/10 border border-[#FACC15]/30">CDA IA</span>
            </h1>
            <p className="text-xs text-neutral-400 font-medium">Tao SCHIRO | Soutenance Professionnelle</p>
          </div>
        </div>

        {/* Slide Progress Indicator */}
        <div className="flex items-center gap-4 bg-neutral-900/90 px-5 py-1.5 rounded-full border border-neutral-800 shadow-inner">
          <div className="w-40 h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FACC15] to-amber-500 transition-all duration-300 ease-out"
              style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-neutral-200">
            {currentSlide + 1} / {totalSlides}
          </span>
        </div>

        {/* Controls Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-[#FACC15]/60 text-neutral-300 hover:text-[#FACC15] transition-all shadow-md"
            title="Mode plein écran"
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </header>

      {/* Main Slide Content Area */}
      <main className="flex-1 z-10 flex items-center justify-center px-6 py-4 md:px-12 relative overflow-hidden">
        {/* SLIDE 1 : TITRE & PRESENTATION */}
        {currentSlide === 0 && (
          <div className="max-w-5xl w-full text-center space-y-5 animate-fade-in my-auto">
            <div className="flex items-center justify-center gap-3">
              <img
                src="/images/logo.png"
                alt="Logo Roule Ma Poule"
                className="w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-[0_0_25px_rgba(250,204,21,0.4)]"
              />
            </div>
            <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-[#FACC15]/10 border border-[#FACC15]/40 text-[#FACC15] text-xs font-bold uppercase tracking-widest">
              <Sparkles size={16} /> Titre Professionnel CDA | Option IA
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
              Roule Ma Poule
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FACC15] via-amber-300 to-amber-500 mt-2">
                Réparation de Vélos à Domicile
              </span>
            </h1>

            <p className="text-neutral-300 text-base md:text-xl max-w-3xl mx-auto font-medium leading-relaxed">
              La plateforme complète de service de réparation de vélos à domicile, conçue et développée en Progressive Web App par <strong className="text-[#FACC15] font-bold">Tao SCHIRO</strong>.
            </p>

            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
              <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 shadow-xl">
                <div className="text-[#FACC15] font-bold text-xs uppercase tracking-widest mb-1">Candidat</div>
                <div className="text-white font-bold text-base md:text-lg">Tao SCHIRO</div>
              </div>
              <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 shadow-xl">
                <div className="text-[#FACC15] font-bold text-xs uppercase tracking-widest mb-1">Jury d'évaluation</div>
                <div className="text-white font-bold text-sm md:text-base leading-snug">BODRERO Sébastien<br/>FILLON Bertrand</div>
              </div>
              <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 shadow-xl">
                <div className="text-[#FACC15] font-bold text-xs uppercase tracking-widest mb-1">Format Soutenance</div>
                <div className="text-white font-bold text-base md:text-lg">20 min démo + 25 min Q&A</div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 2 : LE BESOIN ET LES 3 PROFILS */}
        {currentSlide === 1 && (
          <div className="max-w-6xl w-full space-y-6 animate-fade-in my-auto">
            <div className="text-center space-y-2">
              <span className="text-[#FACC15] text-xs font-mono font-bold tracking-widest uppercase">01. Cadrage Fonctionnel</span>
              <h2 className="text-3xl md:text-5xl font-black text-white">Le Besoin Métier & Les 3 Profils</h2>
              <p className="text-neutral-400 text-base max-w-2xl mx-auto">Une expérience utilisateur dédiée pour chaque acteur du service d'intervention.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Profile Client */}
              <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-[#FACC15]/60 transition-all group space-y-4 shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                  <UserCheck size={30} />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white group-hover:text-[#FACC15] transition-colors">Client</h3>
                <ul className="space-y-2.5 text-xs md:text-sm text-neutral-300">
                  <li className="flex items-center gap-2.5"><CheckCircle2 size={16} className="text-blue-400 flex-shrink-0" /> Tunnel de réservation fluide</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 size={16} className="text-blue-400 flex-shrink-0" /> Autocomplétion Google Maps</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 size={16} className="text-blue-400 flex-shrink-0" /> Suivi d'intervention en direct</li>
                </ul>
              </div>

              {/* Profile Technicien */}
              <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-[#FACC15]/60 transition-all group space-y-4 relative overflow-hidden shadow-xl">
                <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-[#FACC15]/20 text-[#FACC15] text-[10px] font-extrabold uppercase">Mobile-First</div>
                <div className="w-14 h-14 rounded-2xl bg-[#FACC15]/10 border border-[#FACC15]/30 text-[#FACC15] flex items-center justify-center">
                  <Smartphone size={30} />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white group-hover:text-[#FACC15] transition-colors">Technicien Terrain</h3>
                <ul className="space-y-2.5 text-xs md:text-sm text-neutral-300">
                  <li className="flex items-center gap-2.5"><CheckCircle2 size={16} className="text-[#FACC15] flex-shrink-0" /> Interface smartphone responsive</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 size={16} className="text-[#FACC15] flex-shrink-0" /> Guidage itinéraire MapTiler</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 size={16} className="text-[#FACC15] flex-shrink-0" /> Clôture d'intervention & photos</li>
                </ul>
              </div>

              {/* Profile Admin */}
              <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-[#FACC15]/60 transition-all group space-y-4 shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                  <LayoutDashboard size={30} />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white group-hover:text-[#FACC15] transition-colors">Administrateur</h3>
                <ul className="space-y-2.5 text-xs md:text-sm text-neutral-300">
                  <li className="flex items-center gap-2.5"><CheckCircle2 size={16} className="text-purple-400 flex-shrink-0" /> Tracé de zones sur carte interactive</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 size={16} className="text-purple-400 flex-shrink-0" /> Affectation par barycentre géométrique</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 size={16} className="text-purple-400 flex-shrink-0" /> Supervision globale de l'activité</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 3 : GESTION DE PROJET AGILE & FIGMA UI */}
        {currentSlide === 2 && (
          <div className="max-w-6xl w-full space-y-5 animate-fade-in my-auto">
            <div className="text-center space-y-1.5">
              <span className="text-[#FACC15] text-xs font-mono font-bold tracking-widest uppercase">02. Méthodologie & UX</span>
              <h2 className="text-3xl md:text-4xl font-black text-white">Gestion de Projet Agile (Jira) & Design System (Figma)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Backlog Jira */}
              <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3 shadow-xl flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <span className="font-bold text-base text-white flex items-center gap-2">
                      <Calendar size={18} className="text-[#FACC15]" /> Backlog Jira (76 tickets)
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300">
                    Découpage méthodique en Epics majeurs (Authentification, Zones Spatiales, Réservation, Dashboard Admin).
                  </p>
                </div>

                <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 h-52 md:h-64 flex items-center justify-center p-2">
                  <SmartImage
                    src="/images/jira-board.png"
                    alt="Backlog Jira"
                    className="w-full h-full object-contain rounded-lg cursor-zoom-in"
                    fallbackIcon={<Calendar size={40} className="text-[#FACC15]/40" />}
                    fallbackTitle="Backlog Jira (76 tickets)"
                    fallbackSubtitle="Image : /images/jira-board.png"
                    onZoom={(src, alt) => setZoomImage({ src, title: alt })}
                  />
                </div>
              </div>

              {/* Direction Artistique Figma */}
              <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3 shadow-xl flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <span className="font-bold text-base text-white flex items-center gap-2">
                      <Layers size={18} className="text-[#FACC15]" /> Maquettes UI/UX (Figma)
                    </span>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-[#FACC15]/20 text-[#FACC15] font-bold">Mobile-First</span>
                  </div>
                  <p className="text-xs text-neutral-300">
                    Parti pris visuel : Thème sombre moderne, accents ambre/or, pour offrir un rendu haut de gamme et épuré.
                  </p>
                </div>

                <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 h-52 md:h-64 flex items-center justify-center p-2">
                  <SmartImage
                    src="/images/figma-mockups.png"
                    alt="Maquettes Figma"
                    className="w-full h-full object-contain rounded-lg cursor-zoom-in"
                    fallbackIcon={<Layers size={40} className="text-[#FACC15]/40" />}
                    fallbackTitle="Maquettes Figma (Mobile & Desktop)"
                    fallbackSubtitle="Image : /images/figma-mockups.png"
                    onZoom={(src, alt) => setZoomImage({ src, title: alt })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 4 : DATABASE & SPATIAL POSTGIS ARCHITECTURE */}
        {currentSlide === 3 && (
          <div className="max-w-6xl w-full space-y-5 animate-fade-in my-auto">
            <div className="text-center space-y-1.5">
              <span className="text-[#FACC15] text-xs font-mono font-bold tracking-widest uppercase">03. Architecture des Données</span>
              <h2 className="text-3xl md:text-4xl font-black text-white">Modélisation PostgreSQL & Extension PostGIS</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Spatial queries card */}
              <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-4 shadow-xl flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">Requêtes Spatiales</h3>
                      <p className="text-[11px] text-neutral-400">PostGIS + GeoJSON</p>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Validation instantanée pour déterminer si les coordonnées GPS d'une adresse client tombent exactement dans le polygone d'une zone géographique active.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-emerald-400 font-bold overflow-x-auto">
                  ST_Contains(zone.geometry, ST_MakePoint(lng, lat))
                </div>
              </div>

              {/* Visual Prisma Schema */}
              <div className="md:col-span-2 p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="font-bold text-base text-white flex items-center gap-2">
                    <Database size={18} className="text-[#FACC15]" /> Schéma de Base de Données (Prisma Schema)
                  </span>
                  <span className="text-xs font-mono text-neutral-400 font-bold">PostgreSQL / Neon</span>
                </div>

                <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 h-64 md:h-72 flex items-center justify-center p-2">
                  <SmartImage
                    src="/images/prisma-schema.svg"
                    alt="Schéma de Base de Données Prisma"
                    className="w-full h-full object-contain rounded-lg cursor-zoom-in"
                    fallbackIcon={<Database size={44} className="text-[#FACC15]/40" />}
                    fallbackTitle="Schéma de BDD Prisma"
                    fallbackSubtitle="Image : /images/prisma-schema.svg"
                    onZoom={(src, alt) => setZoomImage({ src, title: alt })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 5 : STACK TECHNIQUE & R&D BIKEINDEX */}
        {currentSlide === 4 && (
          <div className="max-w-6xl w-full space-y-6 animate-fade-in my-auto">
            <div className="text-center space-y-2">
              <span className="text-[#FACC15] text-xs font-mono font-bold tracking-widest uppercase">04. Développement Logiciel</span>
              <h2 className="text-3xl md:text-5xl font-black text-white">Stack Full-TypeScript & Intégration R&D</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-center space-y-2 shadow-lg">
                <Code2 className="mx-auto text-[#FACC15]" size={32} />
                <h4 className="font-bold text-base text-white">Next.js 16</h4>
                <p className="text-xs text-neutral-400">App Router & Server Actions</p>
              </div>
              <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-center space-y-2 shadow-lg">
                <ShieldCheck className="mx-auto text-blue-400" size={32} />
                <h4 className="font-bold text-base text-white">Clerk Auth</h4>
                <p className="text-xs text-neutral-400">Sécurité & Rôles (RBAC)</p>
              </div>
              <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-center space-y-2 shadow-lg">
                <Database className="mx-auto text-emerald-400" size={32} />
                <h4 className="font-bold text-base text-white">Prisma ORM</h4>
                <p className="text-xs text-neutral-400">Singleton & PostgresPg</p>
              </div>
              <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-center space-y-2 shadow-lg">
                <Terminal className="mx-auto text-amber-400" size={32} />
                <h4 className="font-bold text-base text-white">Zod Validation</h4>
                <p className="text-xs text-neutral-400">Validation stricte API</p>
              </div>
            </div>

            {/* Focus R&D BikeIndex */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/40 border border-[#FACC15]/40 space-y-3 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-lg bg-[#FACC15] text-black font-black text-xs uppercase tracking-wider">R&D</div>
                <h3 className="text-xl font-bold text-white">Défi Majeur : Intégration de l'API externe BikeIndex</h3>
              </div>
              <p className="text-xs md:text-sm text-neutral-300 leading-relaxed">
                Le plus gros défi technique du projet a consisté à rechercher, étudier et intégrer l'API internationale <strong>BikeIndex</strong> afin de pouvoir qualifier automatiquement la marque, le modèle et les caractéristiques des vélos enregistrés par les clients.
              </p>
            </div>
          </div>
        )}

        {/* SLIDE 6 : DEVOPS & QUALITE DE CODE (PLAYWRIGHT & JEST) */}
        {currentSlide === 5 && (
          <div className="max-w-6xl w-full space-y-6 animate-fade-in my-auto">
            <div className="text-center space-y-2">
              <span className="text-[#FACC15] text-xs font-mono font-bold tracking-widest uppercase">05. Assurance Qualité & CI/CD</span>
              <h2 className="text-3xl md:text-5xl font-black text-white">DevOps, Pipeline CI/CD & Couverture de Tests</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pipeline CI/CD */}
              <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-5 shadow-xl">
                <div className="flex items-center gap-3 border-b border-neutral-800 pb-3">
                  <GitBranch size={24} className="text-purple-400" />
                  <h3 className="font-bold text-lg text-white">Pipeline GitHub Actions & Hébergement</h3>
                </div>
                <ul className="space-y-3 text-xs md:text-sm text-neutral-300">
                  <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" /> Base de données Serverless sur <strong>Neon</strong></li>
                  <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" /> Déploiements automatisés sur <strong>Vercel</strong></li>
                  <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" /> Linters & builds validés à chaque push</li>
                </ul>
              </div>

              {/* Test Coverage Focus */}
              <div className="p-6 rounded-2xl bg-neutral-900/90 border border-[#FACC15]/50 space-y-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3 gap-2">
                  <div className="flex items-center gap-3">
                    <Activity size={24} className="text-[#FACC15]" />
                    <h3 className="font-bold text-base md:text-lg text-white">Stratégie de Test</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-extrabold flex-shrink-0">
                    100% Coverage Booking
                  </span>
                </div>
                <div className="space-y-3 text-xs md:text-sm">
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                    <span className="font-bold text-white block mb-1 text-sm">Tests Unitaires (Jest)</span>
                    <p className="text-neutral-400 text-xs">Validation isolée des calculs de distance, prix de forfaits et utilitaires.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                    <span className="font-bold text-white block mb-1 text-sm">Tests End-to-End (Playwright)</span>
                    <p className="text-neutral-400 text-xs">Couverture complète du tunnel critique de réservation (`real-booking-flow.spec.ts`).</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 7 : LIVE DEMO TRANSITION */}
        {currentSlide === 6 && (
          <div className="max-w-4xl w-full text-center space-y-8 animate-fade-in my-auto py-6">
            <div className="w-20 h-20 rounded-3xl bg-[#FACC15]/10 border-2 border-[#FACC15] text-[#FACC15] flex items-center justify-center mx-auto shadow-2xl shadow-[#FACC15]/40">
              <Play size={40} className="ml-1" />
            </div>

            <div className="space-y-3">
              <span className="text-[#FACC15] text-xs font-mono font-bold tracking-widest uppercase">06. Démonstration en Direct</span>
              <h2 className="text-4xl md:text-6xl font-black text-white">Passage à la Démo Live</h2>
              <p className="text-neutral-300 text-base md:text-lg max-w-xl mx-auto">
                Démonstration concrète du workflow complet : Administrateur, Client et Technicien Mobile.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="px-8 py-3.5 rounded-2xl bg-[#FACC15] text-black font-extrabold text-base hover:bg-amber-400 transition-all flex items-center gap-3 shadow-xl shadow-[#FACC15]/30"
              >
                Lancer l'Application Live <ExternalLink size={18} />
              </a>
            </div>
          </div>
        )}

        {/* SLIDE 8 : CONCLUSION & PERSPECTIVES IA */}
        {currentSlide === 7 && (
          <div className="max-w-6xl w-full space-y-6 animate-fade-in my-auto">
            <div className="text-center space-y-2">
              <span className="text-[#FACC15] text-xs font-mono font-semibold tracking-widest uppercase">07. Bilan & Avenir</span>
              <h2 className="text-3xl md:text-5xl font-black text-white">Bilan du Projet & Perspectives IA</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bilan */}
              <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-4 shadow-xl">
                <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2.5">
                  <CheckCircle2 className="text-emerald-400" size={22} /> Compétences Métier Validées
                </h3>
                <ul className="space-y-2.5 text-xs md:text-sm text-neutral-300">
                  <li className="flex items-start gap-2.5"><span className="text-[#FACC15] font-bold">•</span> Architecture applicative autonome Next.js 16 / PostgreSQL</li>
                  <li className="flex items-start gap-2.5"><span className="text-[#FACC15] font-bold">•</span> Maîtrise des données géospatiales complexes (PostGIS)</li>
                  <li className="flex items-start gap-2.5"><span className="text-[#FACC15] font-bold">•</span> Rigueur de développement avec 100% de coverage E2E sur le parcours critique</li>
                </ul>
              </div>

              {/* IA Roadmap */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-amber-950/50 border border-[#FACC15]/50 space-y-4 shadow-xl">
                <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2.5">
                  <Lightbulb className="text-[#FACC15]" size={22} /> Perspectives & Fonctionnalités IA
                </h3>
                <div className="space-y-3 text-xs md:text-sm">
                  <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
                    <span className="font-bold text-white block mb-0.5 text-sm">1. Pre-diagnostic par Computer Vision</span>
                    <p className="text-neutral-400 text-xs">Analyse de la photo de la panne envoyée par le client pour suggérer automatiquement le forfait d'entretien adapté.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
                    <span className="font-bold text-white block mb-0.5 text-sm">2. Optimisation IA des Itinéraires</span>
                    <p className="text-neutral-400 text-xs">Algorithme croisant la météo et le trafic en temps réel pour lisser les plannings des techniciens.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center pt-4 border-t border-neutral-800/80">
              <p className="text-neutral-200 font-bold text-base md:text-lg">Merci pour votre attention. Je suis à votre entière disposition pour vos questions !</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer Navigation Bar */}
      <footer className="w-full z-20 px-8 py-4 border-t border-neutral-800/80 bg-[#0A0908]/95 backdrop-blur-md flex items-center justify-between flex-shrink-0">
        <div className="text-xs md:text-sm text-neutral-400 font-mono font-medium">
          Roule Ma Poule | Tao SCHIRO (CDA IA 2026)
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="px-5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-[#FACC15]/60 disabled:opacity-30 text-white font-bold text-xs md:text-sm transition-all flex items-center gap-2 shadow-md"
          >
            <ChevronLeft size={16} /> Précédent
          </button>

          <button
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
            className="px-6 py-2 rounded-xl bg-[#FACC15] text-black hover:bg-amber-400 disabled:opacity-30 font-extrabold text-xs md:text-sm transition-all flex items-center gap-2 shadow-lg shadow-[#FACC15]/20"
          >
            Suivant <ChevronRight size={16} />
          </button>
        </div>
      </footer>
    </div>
  );
}
