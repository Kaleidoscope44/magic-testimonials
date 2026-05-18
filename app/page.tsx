"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  LayoutGrid,
  ShieldCheck,
  ArrowRight,
  Star,
  CheckCircle,
  Menu,
  X,
  Zap,
} from "lucide-react";

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

const FEATURES = [
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "Lien de collecte magique",
    desc: "Envoyez un lien unique et ultra-intuitif à vos clients. Ils vous laissent un avis précieux en 30 secondes, sans friction.",
    accent: "#a78bfa",
  },
  {
    icon: <LayoutGrid className="w-5 h-5" />,
    title: "Wall of Love sur-mesure",
    desc: "Affichez une magnifique grille de témoignages sur votre site. Un simple copier-coller suffit pour impressionner vos visiteurs.",
    accent: "#34d399",
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Modération en un clic",
    desc: "Gardez le contrôle total sur votre image. Approuvez, masquez ou organisez vos retours depuis un espace ultra-fluide.",
    accent: "#f472b6",
  },
];

const STEPS = [
  {
    number: "01",
    verb: "Créez votre espace",
    desc: "Configurez votre compte gratuitement en quelques secondes, sans compétences techniques nécessaires.",
  },
  {
    number: "02",
    verb: "Récoltez les sourires",
    desc: "Partagez votre lien de collecte personnalisé par email, SMS ou sur vos réseaux sociaux.",
  },
  {
    number: "03",
    verb: "Boostez vos ventes",
    desc: "Intégrez votre mur d'avis élégant et regardez la confiance de vos visiteurs se transformer en clients.",
  },
];

const AVATARS = [
  { initials: "SB", color: "#a78bfa" },
  { initials: "MK", color: "#34d399" },
  { initials: "CL", color: "#f472b6" },
  { initials: "AJ", color: "#60a5fa" },
];

function CornerBorders() {
  return (
    <>
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-violet-500/30 pointer-events-none group-hover:border-violet-400/60 transition-colors" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-violet-500/30 pointer-events-none group-hover:border-violet-400/60 transition-colors" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-violet-500/30 pointer-events-none group-hover:border-violet-400/60 transition-colors" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-violet-500/30 pointer-events-none group-hover:border-violet-400/60 transition-colors" />
    </>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.03] border border-white/10 text-[11px] font-medium tracking-wide text-violet-300 rounded-sm">
      <span className="w-1 h-1 bg-violet-400 rounded-full inline-block animate-pulse" />
      {children}
    </span>
  );
}

function CustomButton({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: "primary" | "secondary" }) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold transition-all duration-200 rounded-sm active:scale-[0.98]",
        variant === "primary" 
          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/10 hover:from-violet-500 hover:to-indigo-500" 
          : "border border-white/10 bg-white/[0.02] text-slate-300 hover:text-white hover:bg-white/[0.06] hover:border-white/20"
      )}
    >
      {children}
      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
    </Link>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 inset-x-0 z-50 transition-all duration-300",
      scrolled ? "bg-[#09090f]/90 backdrop-blur-md border-b border-white/5" : "bg-transparent"
    )}>
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center transform rotate-45">
            <Star className="w-4 h-4 text-white fill-white transform -rotate-45" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">
            Testi<span className="text-violet-400">Wall</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
          <a href="#how" className="hover:text-white transition-colors">Comment ça marche</a>
        </nav>

        <div className="hidden md:flex items-center gap-5">
          <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">Connexion</Link>
          <CustomButton href="/login">Essai gratuit</CustomButton>
        </div>

        <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className={cn("md:hidden overflow-hidden transition-all duration-300", open ? "max-h-64 bg-[#09090f] border-b border-white/10 px-6 py-6" : "max-h-0")}>
        <div className="flex flex-col gap-4 text-sm">
          <a href="#features" onClick={() => setOpen(false)} className="text-slate-300 hover:text-white">Fonctionnalités</a>
          <a href="#how" onClick={() => setOpen(false)} className="text-slate-300 hover:text-white">Comment ça marche</a>
          <div className="flex items-center gap-5 pt-4 border-t border-white/5">
            <Link href="/login" className="text-slate-400">Connexion</Link>
            <CustomButton href="/login">Essai gratuit</CustomButton>
          </div>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const { ref, inView } = useInView(0.05);
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-left px-6 pt-32 pb-20 overflow-hidden border-b border-white/5">
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "45px 45px" }} />
      <div className="absolute left-1/4 top-0 bottom-0 w-px bg-white/[0.02] hidden lg:block" />
      <div className="absolute right-1/4 top-0 bottom-0 w-px bg-white/[0.02] hidden lg:block" />

      <div ref={ref} className={cn(
        "relative z-10 max-w-5xl w-full mx-auto grid lg:grid-cols-12 gap-12 items-center",
        "opacity-0 translate-y-4 transition-all duration-1000",
        inView && "opacity-100 translate-y-0"
      )}>
        <div className="lg:col-span-7 flex flex-col items-start gap-6">
          <Badge>Le secret des sites qui convertissent</Badge>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
            Transformez vos retours clients en un{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400">
              aimant à prospects.
            </span>
          </h1>

          <p className="max-w-xl text-base text-slate-400 leading-relaxed border-l-2 border-violet-500 pl-4 my-1">
            Collectez de superbes témoignages en un clin d'œil et affichez-les fièrement sur votre site grâce à notre mur d'avis au design moderne et épuré.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mt-2">
            <CustomButton href="/login">Créer mon mur d'avis</CustomButton>
            <a href="#how" className="text-sm font-medium text-slate-400 hover:text-white transition-colors text-center py-3">
              Découvrir la méthode →
            </a>
          </div>
        </div>

        <div className="lg:col-span-5 relative w-full flex flex-col gap-4">
          <div className="p-6 bg-white/[0.01] border border-white/10 relative group rounded-sm">
            <CornerBorders />
            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">"L'installation s'est faite en deux minutes. Mes visiteurs adorent la clarté visuelle et cela a un impact direct sur mes ventes."</p>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-400">Clara L. · Créatrice</span>
              <span className="text-emerald-400 flex items-center gap-1">✨ Avis vérifié</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-violet-950/20 to-transparent border border-violet-500/20 relative rounded-sm">
              <span className="block text-2xl font-bold text-white leading-none mb-1">4.9/5</span>
              <span className="block text-xs text-slate-500">Satisfaction globale</span>
            </div>
            <div className="p-4 bg-white/[0.01] border border-white/5 relative flex flex-col justify-center rounded-sm">
              <span className="block text-2xl font-bold text-slate-300 leading-none mb-1">+100</span>
              <span className="block text-xs text-slate-500">Utilisateurs actifs</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialProof() {
  const { ref, inView } = useInView();
  return (
    <section ref={ref} className={cn(
      "py-6 bg-[#0c0c14] border-b border-white/5 opacity-0 transition-opacity duration-700",
      inView && "opacity-100"
    )}>
      <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-1.5">
            {AVATARS.map((a, i) => (
              <div key={i} className="w-7 h-7 border border-[#09090f] rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: a.color }}>
                {a.initials}
              </div>
            ))}
          </div>
          <span>Rejoint par de nombreux indépendants, freelances et créateurs</span>
        </div>
        <div className="flex items-center gap-2 text-violet-400">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
          <span className="text-slate-400">Plateforme active et disponible</span>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="py-28 px-6 relative border-b border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge>Simplicité Radicale</Badge>
          <h2 className="mt-4 text-3xl font-bold text-white tracking-tight">
            Tout le nécessaire pour rassurer vos clients
          </h2>
          <p className="mt-3 text-slate-400 text-sm max-w-lg mx-auto">
            TestiWall fait une seule chose, mais il la fait à la perfection : collecter vos avis sans effort et les afficher magnifiquement.
          </p>
        </div>

        <div className="grid md:grid-cols-3 border border-white/10 bg-white/[0.01]">
          {FEATURES.map((f, i) => {
            const { ref, inView } = useInView();
            return (
              <div
                key={i}
                ref={ref}
                className={cn(
                  "p-8 relative group border-b md:border-b-0 md:border-r border-white/10 transition-all duration-300 hover:bg-white/[0.02]",
                  i === 2 && "md:border-r-0",
                  "opacity-0 translate-y-4",
                  inView && "opacity-100 translate-y-0"
                )}
              >
                <div className="w-10 h-10 border border-white/10 flex items-center justify-center mb-6 text-violet-400 group-hover:border-violet-500 transition-colors bg-black rounded-sm">
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-white tracking-tight mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-light text-[13px]">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="py-28 px-6 bg-[#07070d]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col items-center gap-3">
          <Badge>Trois petites étapes</Badge>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Prêt à l'emploi en moins de 5 minutes
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {STEPS.map((s, i) => {
            const { ref, inView } = useInView();
            return (
              <div
                key={i}
                ref={ref}
                className={cn(
                  "p-6 border border-white/5 bg-white/[0.01] relative flex flex-col gap-3 group rounded-sm",
                  "opacity-0 translate-y-4 transition-all duration-700",
                  inView && "opacity-100 translate-y-0"
                )}
              >
                <CornerBorders />
                <span className="text-xs font-bold text-violet-400 tracking-wider">Étape {s.number}</span>
                <h3 className="text-base font-bold text-white tracking-tight">{s.verb}</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-light text-[13px]">{s.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 flex flex-col items-center justify-center gap-4">
          <CustomButton href="/login">Essayer TestiWall gratuitement</CustomButton>
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-500" /> Sans carte bancaire · Totalement gratuit jusqu'à 10 avis
          </span>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-6 bg-[#040408]">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-white flex items-center justify-center transform rotate-45">
              <Star className="w-3 h-3 text-black fill-black transform -rotate-45" />
            </div>
            <span className="font-bold text-white tracking-tight text-sm">TestiWall</span>
          </div>

          <div className="flex gap-6 text-xs text-slate-500">
            {["Mentions légales", "Confidentialité", "CGU"].map((l) => (
              <Link key={l} href="#" className="hover:text-violet-400 transition-colors">{l}</Link>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-600">
          <span>© {new Date().getFullYear()} TestiWall. Tous droits réservés.</span>
          <span>Fait avec passion pour booster vos projets.</span>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen text-white antialiased bg-[#09090f] selection:bg-violet-500/30">
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <Features />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}