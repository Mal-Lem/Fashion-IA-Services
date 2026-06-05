"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Scissors, Wand2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const FASHION_QUOTES = [
  { quote: "La mode est une armure pour affronter la vie quotidienne.", author: "Mary Quant" },
  { quote: "La mode, c'est ce qui se démode.", author: "Coco Chanel" },
  { quote: "Un vêtement bien choisi est une lettre d'introduction silencieuse.", author: "Virginia Woolf" },
  { quote: "La mode n'est pas quelque chose qui existe seulement dans les robes. La mode est dans le ciel, dans la rue, la mode a à voir avec les idées, la façon dont nous vivons.", author: "Coco Chanel" },
  { quote: "S'habiller, c'est raconter son histoire sans prononcer un seul mot.", author: "Rachel Zoe" },
  { quote: "Le style est une façon de dire qui vous êtes sans avoir à parler.", author: "Rachel Zoe" },
  { quote: "La mode passe, le style reste.", author: "Yves Saint Laurent" },
  { quote: "Donnez à une fille les bons souliers et elle pourra conquérir le monde.", author: "Marilyn Monroe" },
  { quote: "La beauté commence au moment où vous décidez d'être vous-même.", author: "Coco Chanel" },
  { quote: "Le vêtement est un langage universel que tout le monde comprend.", author: "Karl Lagerfeld" },
];

export default function WelcomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [quote, setQuote] = useState(FASHION_QUOTES[0]);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Choisir une quote aléatoire du jour (basée sur la date)
    const dayIndex = new Date().getDate() % FASHION_QUOTES.length;
    setQuote(FASHION_QUOTES[dayIndex]);
  }, []);

  useEffect(() => {
  if (!user) return;
  const timer = setInterval(() => {
    setCountdown(prev => {
      if (prev <= 1) {
        clearInterval(timer);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
  return () => clearInterval(timer);
}, [user]);

useEffect(() => {
  if (countdown === 0 && user) {
    handleRedirect();
  }
}, [countdown, user]);



  const handleRedirect = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role === "couturiere") {
      router.push("/espace-pro");
    } else if (user.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/create");
    }
  };

  const getDestinationLabel = () => {
    if (!user) return "Connexion";
    if (user.role === "couturiere") return "Mon espace pro";
    if (user.role === "admin") return "Administration";
    return "Créer mon design";
  };

  const getDestinationHref = () => {
    if (!user) return "/login";
    if (user.role === "couturiere") return "/espace-pro";
    if (user.role === "admin") return "/admin";
    return "/create";
  };

  const firstName = user?.firstName || "là";
  const isCouturiere = user?.role === "couturiere";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1a0533 0%, #2d1057 50%, #1a0533 100%)", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Décoration background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20"
          style={{ background: "#5E35B1", filter: "blur(80px)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-20"
          style={{ background: "#EC407A", filter: "blur(100px)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10"
          style={{ background: "#7C3AED", filter: "blur(120px)" }} />
      </div>

      {/* Particules décoratives */}
      {[...Array(6)].map((_, i) => (
        <motion.div key={i}
          className="absolute w-1 h-1 rounded-full bg-white/30"
          style={{
            top: `${15 + i * 14}%`,
            left: `${10 + i * 15}%`,
          }}
          animate={{ y: [-10, 10, -10], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-2xl w-full"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #5E35B1, #EC407A)" }}>
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-bold text-2xl"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Mallem
          </span>
        </motion.div>

        {/* Message de bienvenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <p className="text-white/60 text-sm uppercase tracking-widest mb-2">
            {isCouturiere ? "Espace couturière" : "Bienvenue sur Mallem"}
          </p>
          <h1 className="text-white font-bold mb-3"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 6vw, 3.5rem)", lineHeight: 1.2 }}>
            Bonjour,<br />
            <span style={{ background: "linear-gradient(135deg, #C084FC, #EC407A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {firstName} ✨
            </span>
          </h1>
          <p className="text-white/70 text-lg">
            {isCouturiere
              ? "Votre espace de travail vous attend pour gérer vos créations et commandes."
              : "Prête à donner vie à vos créations de mode avec l'intelligence artificielle ?"}
          </p>
        </motion.div>

        {/* Quote du jour */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl p-6 mb-8 relative"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}
        >
          <div className="absolute -top-3 left-6 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #5E35B1, #EC407A)" }}>
            <span className="text-white text-xs font-bold">✦</span>
          </div>
          <p className="text-white/90 italic text-lg leading-relaxed mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            "{quote.quote}"
          </p>
          <p className="text-white/50 text-sm">— {quote.author}</p>
        </motion.div>

        {/* Bouton CTA + countdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-4"
        >
          <Link href={getDestinationHref()}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-white text-lg transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #5E35B1, #EC407A)", boxShadow: "0 8px 32px rgba(94, 53, 177, 0.4)" }}>
            {isCouturiere ? <Scissors className="w-5 h-5" /> : <Wand2 className="w-5 h-5" />}
            {getDestinationLabel()}
            <ArrowRight className="w-5 h-5" />
          </Link>

         <p className="text-white/40 text-sm">
  Cliquez pour accéder à votre espace
</p>
        </motion.div>

        {/* Liens rapides */}
        {!isCouturiere && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex items-center justify-center gap-6 mt-8"
          >
            {[
              { label: "Mes designs", href: "/mes-designs" },
              { label: "Couturières", href: "/couturieres" },
              { label: "Mon profil", href: "/profil" },
            ].map(link => (
              <Link key={link.href} href={link.href}
                className="text-white/50 hover:text-white/90 text-sm transition-colors">
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}