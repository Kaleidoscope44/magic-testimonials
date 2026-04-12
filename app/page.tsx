"use client";

import React, { useEffect, useRef, useState } from "react"; // Ajout de React ici
import Link from "next/link";
import {
  Sparkles,
  LayoutGrid,
  ShieldCheck,
  ArrowRight,
  Star,
  // Twitter, Linkedin, GitHub ont été supprimés car ils causent l'erreur
  CheckCircle,
  Menu,
  X,
  Zap,
} from "lucide-react";

// ─── Utility: simple cn helper (no extra dep) ────────────────────────────────
function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─── Hook: detect element in viewport ────────────────────────────────────────
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

// ─── Data ─────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "Lien de collecte magique",
    desc: "Envoyez un lien unique à vos clients. Ils laissent un avis en 30 secondes, sans créer de compte.",
    accent: "#a78bfa",
  },
  {
    icon: <LayoutGrid className="w-5 h-5" />,
    title: "Wall of Love personnalisable",
    desc: "Intégrez une belle grille d'avis sur votre site en 2 minutes. Un simple copier-coller suffit.",
    accent: "#34d399",
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Modération facile",
    desc: "Approuvez ou masquez chaque témoignage. Gardez un contrôle total sur ce qui est publié.",
    accent: "#f472b6",
  },
];

const STEPS = [
  {
    number: "01",
    verb: "Créez",
    desc: "Ouvrez un compte en quelques secondes, configurez votre espace en 1 clic.",
  },
  {
    number: "02",
    verb: "Collectez",
    desc: "Partagez votre lien magique par email, WhatsApp ou réseaux sociaux.",
  },
  {
    number: "03",
    verb: "Affichez",
    desc: "Intégrez votre Wall of Love et regardez la confiance monter.",
  },
];

const AVATARS = [
  { initials: "SB", color: "#a78bfa" },
  { initials: "MK", color: "#34d399" },
  { initials: "CL", color: "#f472b6" },
  { initials: "AJ", color: "#60a5fa" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function GlowOrb({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute rounded-full blur-[120px] pointer-events-none",
        className
      )}
    />
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-white/5 border border-white/10 text-violet-300">
      {children}
    </span>
  );
}

function PrimaryButton({
  href,
  children,
  large,
}: {
  href: string;
  children: React.ReactNode;
  large?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex items-center gap-2 font-semibold rounded-2xl transition-all duration-300",
        "bg-gradient-to-br from-violet-500 to-indigo-600",
        "hover:from-violet-400 hover:to-indigo-500 hover:shadow-[0_0_40px_rgba(139,92,246,0.5)]",
        "active:scale-95",
        large ? "px-8 py-4 text-base" : "px-5 py-2.5 text-sm"
      )}
    >
      {children}
      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}

function GhostButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 px-5 py-2.5 text-sm font-medium rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-slate-300 hover:text-white"
    >
      {children}
    </Link>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  accent,
  delay,
}: (typeof FEATURES)[0] & { delay: number }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms`, "--accent": accent } as React.CSSProperties}
      className={cn(
        "group relative p-6 rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm",
        "hover:border-white/15 hover:bg-white/[0.06] transition-all duration-500",
        "opacity-0 translate-y-6",
        inView && "opacity-100 translate-y-0 transition-[opacity,transform] duration-700"
      )}
    >
      {/* Accent glow on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(ellipse at 0% 0%, ${accent}18 0%, transparent 60%)` }}
      />
      <div
        className="inline-flex p-2.5 rounded-xl mb-4 border"
        style={{
          color: accent,
          background: `${accent}15`,
          borderColor: `${accent}30`,
        }}
      >
        {icon}
      </div>
      <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function StepCard({ number, verb, desc, delay }: (typeof STEPS)[0] & { delay: number }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "relative flex flex-col gap-3 opacity-0 translate-y-6",
        inView && "opacity-100 translate-y-0 transition-[opacity,transform] duration-700"
      )}
    >
      <span className="font-mono text-5xl font-black text-white/8 select-none leading-none">
        {number}
      </span>
      <div className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-violet-400 flex-shrink-0" />
        <h3 className="text-base font-semibold text-white">{verb}</h3>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#09090f]/80 backdrop-blur-xl border-b border-white/8 shadow-2xl"
          : "bg-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Star className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <span className="font-bold text-white tracking-tight">
            Testi<span className="text-violet-400">Wall</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
          <a href="#how" className="hover:text-white transition-colors">Comment ça marche</a>
          <a href="#pricing" className="hover:text-white transition-colors">Prix</a>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <GhostButton href="/login">Connexion</GhostButton>
          <GhostButton href="/login">S'inscrire</GhostButton>
          <PrimaryButton href="/login">Essai Gratuit</PrimaryButton>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 border-b border-white/8",
          open ? "max-h-64 bg-[#09090f]/95 backdrop-blur-xl" : "max-h-0"
        )}
      >
        <div className="px-6 py-4 flex flex-col gap-4 text-sm text-slate-300">
          <a href="#features" onClick={() => setOpen(false)} className="hover:text-white">Fonctionnalités</a>
          <a href="#how" onClick={() => setOpen(false)} className="hover:text-white">Comment ça marche</a>
          <a href="#pricing" onClick={() => setOpen(false)} className="hover:text-white">Prix</a>
          <div className="flex gap-3 pt-2">
            <GhostButton href="/login">Connexion</GhostButton>
            <PrimaryButton href="/login">Essai Gratuit</PrimaryButton>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  const { ref, inView } = useInView(0.05);
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 overflow-hidden">
      {/* Background orbs */}
      <GlowOrb className="w-[600px] h-[600px] bg-violet-600/20 -top-40 left-1/2 -translate-x-1/2" />
      <GlowOrb className="w-[400px] h-[400px] bg-indigo-500/15 bottom-0 right-0 translate-x-1/3" />
      <GlowOrb className="w-[300px] h-[300px] bg-pink-500/10 bottom-0 left-0 -translate-x-1/3" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div
        ref={ref}
        className={cn(
          "relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-6",
          "opacity-0 translate-y-8 transition-[opacity,transform] duration-1000",
          inView && "opacity-100 translate-y-0"
        )}
      >
        <Badge>
          <Zap className="w-3 h-3" />
          Nouveau · Collectez des avis en 30 secondes
        </Badge>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.08] tracking-tight">
          Transformez vos clients{" "}
          <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            en ambassadeurs
          </span>
        </h1>

        <p className="max-w-xl text-base sm:text-lg text-slate-400 leading-relaxed">
          TestiWall vous permet de collecter des témoignages authentiques via un simple
          lien, puis de les afficher dans un élégant Wall of Love sur votre site — sans
          coder.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
          <PrimaryButton href="/login" large>
            Démarrer gratuitement
          </PrimaryButton>
          <a
            href="#how"
            className="text-sm text-slate-400 hover:text-white transition-colors underline underline-offset-4"
          >
            Voir comment ça marche
          </a>
        </div>

        <p className="text-xs text-slate-600 flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          Aucune carte bancaire requise · Gratuit jusqu'à 10 avis
        </p>
      </div>

      {/* Floating testimonial preview cards */}
      <div className="relative z-10 mt-16 w-full max-w-4xl mx-auto hidden md:block">
        <div className="flex justify-center gap-4">
          {[
            { name: "Sophie B.", text: "Un outil incroyable, je l'ai configuré en 5 min !", stars: 5, color: "#a78bfa" },
            { name: "Marc K.", text: "Mes clients adorent laisser un avis, c'est si simple.", stars: 5, color: "#34d399" },
            { name: "Clara L.", text: "Mon taux de conversion a augmenté de 30% grâce à TestiWall.", stars: 5, color: "#f472b6" },
          ].map((t, i) => (
            <div
              key={i}
              className="flex-1 max-w-xs p-4 rounded-2xl border border-white/8 bg-white/[0.04] backdrop-blur-sm"
              style={{
                transform: i === 1 ? "translateY(-12px)" : "translateY(0)",
                animationDelay: `${i * 200}ms`,
              }}
            >
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">"{t.text}"</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: t.color }}
                >
                  {t.name[0]}
                </div>
                <span className="text-xs text-slate-500">{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SOCIAL PROOF ─────────────────────────────────────────────────────────────
function SocialProof() {
  const { ref, inView } = useInView();
  return (
    <section
      ref={ref}
      className={cn(
        "py-10 border-y border-white/6 opacity-0 transition-[opacity,transform] duration-700",
        inView && "opacity-100"
      )}
    >
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-4">
        <div className="flex -space-x-2.5">
          {AVATARS.map((a, i) => (
            <div
              key={i}
              className="w-9 h-9 rounded-full border-2 border-[#09090f] flex items-center justify-center text-[11px] font-bold text-white"
              style={{ background: a.color }}
            >
              {a.initials}
            </div>
          ))}
        </div>
        <div className="text-sm text-slate-400 text-center sm:text-left">
          <span className="text-white font-semibold">+100 entrepreneurs</span> — boulangers,
          coachs, freelances — font déjà confiance à TestiWall
        </div>
        <div className="flex gap-0.5 items-center ml-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
          ))}
          <span className="text-xs text-slate-500 ml-1.5">4.9/5</span>
        </div>
      </div>
    </section>
  );
}

// ─── FEATURES ─────────────────────────────────────────────────────────────────
function Features() {
  return (
    <section id="features" className="py-24 px-6 relative overflow-hidden">
      <GlowOrb className="w-[500px] h-[500px] bg-indigo-600/10 top-1/2 -translate-y-1/2 right-0 translate-x-1/2" />
      <div className="max-w-6xl mx-auto relative z-10">
        <SectionHeading
          badge="Fonctionnalités"
          title="Tout ce qu'il vous faut,"
          highlight="sans la complexité"
          subtitle="TestiWall est conçu pour les non-techniciens. Pas de code, pas de configuration interminable."
        />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <FeatureCard key={i} {...f} delay={i * 120} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const { ref, inView } = useInView();
  return (
    <section id="how" className="py-24 px-6 relative overflow-hidden">
      <GlowOrb className="w-[400px] h-[400px] bg-violet-600/10 top-0 left-0 -translate-x-1/3" />
      <div className="max-w-6xl mx-auto relative z-10">
        <SectionHeading
          badge="Comment ça marche"
          title="3 étapes, "
          highlight="c'est tout"
          subtitle="De l'inscription à votre premier Wall of Love en moins de 10 minutes."
        />
        <div
          ref={ref}
          className="mt-12 grid sm:grid-cols-3 gap-10 relative"
        >
          {/* Connector line */}
          <div className="hidden sm:block absolute top-5 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          {STEPS.map((s, i) => (
            <StepCard key={i} {...s} delay={i * 150} />
          ))}
        </div>
        <div
          className={cn(
            "mt-12 flex justify-center opacity-0 translate-y-4 transition-[opacity,transform] duration-700 delay-500",
            inView && "opacity-100 translate-y-0"
          )}
        >
          <PrimaryButton href="/login" large>
            Commencer maintenant
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION HEADING helper ────────────────────────────────────────────────────
function SectionHeading({
  badge,
  title,
  highlight,
  subtitle,
}: {
  badge: string;
  title: string;
  highlight: string;
  subtitle: string;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={cn(
        "text-center max-w-2xl mx-auto opacity-0 translate-y-5 transition-[opacity,transform] duration-700",
        inView && "opacity-100 translate-y-0"
      )}
    >
      <Badge>{badge}</Badge>
      <h2 className="mt-4 text-3xl sm:text-4xl font-black text-white tracking-tight">
        {title}
        <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
          {highlight}
        </span>
      </h2>
      <p className="mt-4 text-slate-400 leading-relaxed">{subtitle}</p>
    </div>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-white/6 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Star className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              <span className="font-bold text-white tracking-tight">
                Testi<span className="text-violet-400">Wall</span>
              </span>
            </Link>
            <p className="text-xs text-slate-600 max-w-xs text-center md:text-left">
              Collectez et affichez des témoignages authentiques pour booster votre crédibilité.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-slate-500">
            {["Mentions légales", "Politique de confidentialité", "CGU"].map((l) => (
              <Link key={l} href="#" className="hover:text-slate-300 transition-colors">
                {l}
              </Link>
            ))}
          </div>

          {/* Socials */}
          <div className="flex items-center gap-3">
            {[
              { icon: <Zap className="w-4 h-4" />, href: "#" }, // Remplacé Twitter
              { icon: <Star className="w-4 h-4" />, href: "#" }, // Remplacé Linkedin
              { icon: <Sparkles className="w-4 h-4" />, href: "#" }, // Remplacé GitHub
            ].map((s, i) => (
              <Link
                key={i}
                href={s.href}
                className="p-2 rounded-xl border border-white/8 bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/15 transition-all duration-200"
              >
                {s.icon}
              </Link>
            ))}
          </div>

        <div className="mt-8 pt-6 border-t border-white/6 text-center text-xs text-slate-700">
          © {new Date().getFullYear()} TestiWall. Fait avec ♥ pour les entrepreneurs.
        </div>
      </div>
      </div>
    </footer>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div
      className="min-h-screen text-white antialiased"
      style={{ background: "#09090f" }}
    >
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