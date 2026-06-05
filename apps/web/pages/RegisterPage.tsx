"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";;
import { Eye, EyeOff, Sparkles, Check, User, Scissors } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { IMAGES } from "@/data/mockData";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8 caractères minimum", ok: password.length >= 8 },
    { label: "Une majuscule", ok: /[A-Z]/.test(password) },
    { label: "Un chiffre", ok: /[0-9]/.test(password) },
    { label: "Un caractère spécial", ok: /[^a-zA-Z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const levels = ["", "Faible", "Moyen", "Fort", "Très fort"];
  const colors = ["", "#C62828", "#E65100", "#2E7D32", "#1B5E20"];

  if (!password) return null;

  return (
    <div className="mt-2" role="status" aria-live="polite">
      <div className="flex gap-1 mb-1" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-1 h-1.5 rounded-full transition-all duration-300"
            style={{ background: i <= score ? colors[score] : "#E0E0E0" }}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color: colors[score] }}>
        Force : {levels[score]}
      </p>
      <ul className="mt-2 space-y-1">
        {checks.map((check) => (
          <li key={check.label} className={`flex items-center gap-1.5 text-xs ${check.ok ? "text-[#2E7D32]" : "text-[#9E9E9E]"}`}>
            <Check className="w-3 h-3" aria-hidden="true" />
            {check.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

const STYLE_OPTIONS = ["Casual", "Formel", "Bohème", "Sportswear", "Élégant", "Vintage", "Minimaliste"];
const SPECIALTIES = ["Robes", "Tailleurs", "Vêtements de soirée", "Mariage", "Mode africaine", "Sportswear", "Maille", "Cuir"];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [acceptCgu, setAcceptCgu] = useState(false);
  const [role, setRole] = useState<"client" | "couturiere" | null>(null);
  const [styles, setStyles] = useState<string[]>([]);
  const [specs, setSpecs] = useState<string[]>([]);
  const [atelierName, setAtelierName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register } = useAuth();
  const router = useRouter();

  const toggleStyle = (s: string) =>
    setStyles((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  const toggleSpec = (s: string) =>
    setSpecs((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!role) return;
  setLoading(true);
  setError("");
  try {
  const parts = name.trim().split(" ");
  const firstName = parts[0] || "Prénom";
  const lastName = parts.slice(1).join(" ") || "Nom";
  await register({ firstName, lastName, email, password, role });
  router.push("/verify-email"); 
  // router.push(role === "couturiere" ? "/espace-pro" : "/create");
} catch (error: any) {
  const message = error?.message || "Une erreur est survenue. Réessayez.";
  if (message === "Cet email est déjà associé à un compte") {
    setError("Cet email est déjà utilisé. Connectez-vous ou utilisez un autre email.");
  } else if (message.includes("lastName must be longer")) {
    setError("Veuillez entrer votre nom et prénom complets.");
  } else if (message.includes("password")) {
    setError("Le mot de passe ne respecte pas les critères requis.");
  } else {
    setError(message);
  }
} finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex" style={{ background: "#FAFAFA", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Left branding */}
      <div
        className="hidden lg:flex flex-col items-center justify-center relative w-2/5"
        style={{ background: "linear-gradient(135deg, #1a0533, #2d1057)" }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/3 left-1/4 w-48 h-48 rounded-full" style={{ background: "#5E35B1", filter: "blur(60px)" }} />
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full" style={{ background: "#EC407A", filter: "blur(80px)" }} />
        </div>
        <div className="relative z-10 text-center px-12">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: "#5E35B1" }}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 700, color: "white", marginBottom: "1rem" }}>
            Rejoignez-nous
          </h1>
          <img src={IMAGES.colorfulFabric} alt="Mode" className="rounded-2xl mb-6 w-full object-cover" style={{ height: "220px" }} />
          <div className="space-y-3 text-left">
            {["5 générations d'images IA gratuites", "Recommandations personnalisées", "Accès à 340+ couturières certifiées"].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: "#EC407A" }}>
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-white/80 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#5E35B1" }}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: "1.1rem", color: "#212121" }}>Fashion AI</span>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-4 mb-8" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={2}>
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all"
                style={{
                  background: step >= s ? "#5E35B1" : "#E0E0E0",
                  color: step >= s ? "white" : "#9E9E9E",
                }}
                aria-current={step === s ? "step" : undefined}
              >
                {step > s ? <Check className="w-4 h-4" aria-hidden="true" /> : s}
              </div>
              <span className="text-sm" style={{ color: step >= s ? "#5E35B1" : "#9E9E9E", fontWeight: step >= s ? 600 : 400 }}>
                {s === 1 ? "Compte" : "Profil"}
              </span>
              {s < 2 && <div className="w-12 h-px" style={{ background: step > s ? "#5E35B1" : "#E0E0E0" }} aria-hidden="true" />}
            </div>
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {step === 1 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 700, color: "#212121", marginBottom: "0.5rem" }}>
                Créer votre compte gratuitement
              </h2>
              <p className="text-[#616161] text-sm mb-6">Commencez votre aventure mode en quelques secondes</p>

              {error && (
                <div className="p-3 rounded-xl mb-4 text-sm" style={{ background: "#FFEBEE", color: "#C62828" }} role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleStep1} noValidate className="space-y-4">
                <div>
                  <label htmlFor="reg-name" className="block text-sm font-medium text-[#212121] mb-1.5">Nom Complet</label>
                  <input
                    id="reg-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Votre nom et prénom"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#212121] placeholder-[#9E9E9E] focus:outline-none focus:ring-2 focus:border-[#5E35B1]"
                    style={{ fontSize: "0.9375rem" }}
                  />
                </div>
                <div>
                  <label htmlFor="reg-email" className="block text-sm font-medium text-[#212121] mb-1.5">Adresse email</label>
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#212121] placeholder-[#9E9E9E] focus:outline-none focus:ring-2 focus:border-[#5E35B1]"
                    style={{ fontSize: "0.9375rem" }}
                  />
                </div>
                <div>
                  <label htmlFor="reg-password" className="block text-sm font-medium text-[#212121] mb-1.5">Mot de passe</label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 caractères"
                      required
                      autoComplete="new-password"
                      className="w-full pr-12 px-4 py-3 rounded-xl border border-gray-200 text-[#212121] placeholder-[#9E9E9E] focus:outline-none focus:ring-2 focus:border-[#5E35B1]"
                      style={{ fontSize: "0.9375rem" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 focus:outline-none focus:ring-2 focus:ring-[#5E35B1] rounded"
                      aria-label={showPass ? "Masquer" : "Afficher"}
                    >
                      {showPass ? <EyeOff className="w-4 h-4 text-[#9E9E9E]" /> : <Eye className="w-4 h-4 text-[#9E9E9E]" />}
                    </button>
                  </div>
                  <PasswordStrength password={password} />
                </div>
                <div>
                  <label htmlFor="reg-confirm" className="block text-sm font-medium text-[#212121] mb-1.5">Confirmer le mot de passe</label>
                  <input
                    id="reg-confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    className="w-full px-4 py-3 rounded-xl border text-[#212121] placeholder-[#9E9E9E] focus:outline-none focus:ring-2 focus:border-[#5E35B1]"
                    style={{
                      fontSize: "0.9375rem",
                      borderColor: confirmPassword && confirmPassword !== password ? "#C62828" : "#E0E0E0"
                    }}
                  />
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-xs mt-1" style={{ color: "#C62828" }}>Les mots de passe ne correspondent pas</p>
                  )}
                </div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptCgu}
                    onChange={(e) => setAcceptCgu(e.target.checked)}
                    required
                    className="mt-0.5 accent-[#5E35B1]"
                  />
                  <span className="text-sm text-[#616161]">
                    J'accepte les{" "}
                    <Link href="/" className="underline" style={{ color: "#5E35B1" }}>Conditions Générales d'Utilisation</Link>
                    {" "}et la{" "}
                    <Link href="/" className="underline" style={{ color: "#5E35B1" }}>Politique de confidentialité</Link>
                  </span>
                </label>
                <button
                  type="submit"
                  disabled={!name || !email || !password || !confirmPassword || password !== confirmPassword || !acceptCgu}
                  className="w-full py-3.5 rounded-xl font-semibold text-white transition-all focus:outline-none focus:ring-4 focus:ring-[#5E35B1]/30 disabled:opacity-50"
                  style={{ background: "#5E35B1", fontSize: "0.9375rem" }}
                >
                  Continuer →
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 700, color: "#212121", marginBottom: "0.5rem" }}>
                Quel est votre profil ?
              </h2>
              <p className="text-[#616161] text-sm mb-6">Choisissez votre type de compte pour personnaliser votre expérience</p>

              <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {[
                    {
                      value: "client" as const,
                      label: "Je cherche une couturière",
                      icon: User,
                      benefits: ["5 générations IA gratuites", "Recommandations personnalisées", "Messagerie intégrée"],
                    },
                    {
                      value: "couturiere" as const,
                      label: "Je suis couturière",
                      icon: Scissors,
                      benefits: ["Profil professionnel", "Gestion des commandes", "Tableau de bord analytics"],
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRole(option.value)}
                      className="text-left p-5 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#5E35B1]"
                      style={{
                        borderColor: role === option.value ? "#5E35B1" : "#E0E0E0",
                        background: role === option.value ? "#EDE7FF" : "white",
                      }}
                      aria-pressed={role === option.value}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: role === option.value ? "#5E35B1" : "#F5F5F5" }}>
                          <option.icon className="w-5 h-5" style={{ color: role === option.value ? "white" : "#616161" }} aria-hidden="true" />
                        </div>
                        <span className="font-semibold text-sm text-[#212121]">{option.label}</span>
                      </div>
                      <ul className="space-y-1.5">
                        {option.benefits.map((b) => (
                          <li key={b} className="flex items-center gap-2 text-xs text-[#616161]">
                            <Check className="w-3 h-3 flex-shrink-0" style={{ color: "#5E35B1" }} aria-hidden="true" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>

                {role === "client" && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-[#212121] mb-2">Styles préférés <span className="font-normal text-[#9E9E9E]">(optionnel)</span></label>
                      <div className="flex flex-wrap gap-2" role="group" aria-label="Sélection des styles">
                        {STYLE_OPTIONS.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => toggleStyle(s)}
                            className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-[#5E35B1]"
                            style={{
                              borderColor: styles.includes(s) ? "#5E35B1" : "#E0E0E0",
                              background: styles.includes(s) ? "#EDE7FF" : "white",
                              color: styles.includes(s) ? "#5E35B1" : "#616161",
                            }}
                            aria-pressed={styles.includes(s)}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="client-location" className="block text-sm font-medium text-[#212121] mb-1.5">Localisation <span className="font-normal text-[#9E9E9E]">(optionnel)</span></label>
                      <input
                        id="client-location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Code postal ou ville"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-[#5E35B1] text-[#212121]"
                      />
                    </div>
                  </div>
                )}

                {role === "couturiere" && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label htmlFor="atelier-name" className="block text-sm font-medium text-[#212121] mb-1.5">Nom de l'atelier</label>
                      <input
                        id="atelier-name"
                        type="text"
                        value={atelierName}
                        onChange={(e) => setAtelierName(e.target.value)}
                        placeholder="Mon Atelier de Couture"
                        required={role === "couturiere"}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-[#5E35B1] text-[#212121]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#212121] mb-2">Spécialités</label>
                      <div className="flex flex-wrap gap-2" role="group" aria-label="Sélection des spécialités">
                        {SPECIALTIES.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => toggleSpec(s)}
                            className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-[#5E35B1]"
                            style={{
                              borderColor: specs.includes(s) ? "#5E35B1" : "#E0E0E0",
                              background: specs.includes(s) ? "#EDE7FF" : "white",
                              color: specs.includes(s) ? "#5E35B1" : "#616161",
                            }}
                            aria-pressed={specs.includes(s)}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="pro-location" className="block text-sm font-medium text-[#212121] mb-1.5">Localisation</label>
                      <input
                        id="pro-location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Ville, département"
                        required={role === "couturiere"}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-[#5E35B1] text-[#212121]"
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 rounded-xl mb-4 text-sm" style={{ background: "#FFEBEE", color: "#C62828" }} role="alert">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-3.5 rounded-xl font-medium border border-gray-200 text-[#424242] hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5E35B1]"
                  >
                    ← Retour
                  </button>
                  <button
                    type="submit"
                    disabled={!role || loading}
                    className="flex-1 py-3.5 rounded-xl font-semibold text-white transition-all focus:outline-none focus:ring-4 focus:ring-[#5E35B1]/30 disabled:opacity-50"
                    style={{ background: "#5E35B1", fontSize: "0.9375rem" }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                        Création...
                      </span>
                    ) : (
                      "Créer mon compte"
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          <p className="text-center mt-6 text-sm text-[#616161]">
            Déjà un compte ?{" "}
            <Link href="/login" className="font-semibold focus:outline-none focus:ring-2 focus:ring-[#5E35B1] rounded" style={{ color: "#5E35B1" }}>
              Se connecter
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
