"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";;
import { Eye, EyeOff, Lock, Mail, Sparkles, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { IMAGES } from "@/data/mockData";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      router.push("/bienvenue");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Email ou mot de passe incorrect");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!resetEmail) return;
  setLoading(true);
  try {
    const res = await fetch("http://localhost:3001/v1/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: resetEmail }),
    });
    const data = await res.json();
    setResetSent(true);
  } catch {
    setResetSent(true); // Toujours afficher le succès pour la sécurité
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex" style={{ background: "#FAFAFA", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Left - Branding */}
      <div
        className="hidden lg:flex flex-col items-center justify-center relative w-2/5 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a0533 0%, #2d1057 100%)" }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full" style={{ background: "#5E35B1", filter: "blur(60px)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full" style={{ background: "#EC407A", filter: "blur(80px)" }} />
        </div>
        <div className="relative z-10 text-center px-12">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: "#5E35B1" }}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 700, color: "white", marginBottom: "1rem" }}>
            Fashion AI Platform
          </h1>
          <div className="rounded-2xl overflow-hidden mb-6 shadow-2xl">
            <img src={IMAGES.heroDress} alt="Design IA" className="w-full h-64 object-cover" />
          </div>
          <blockquote className="text-white/70 italic text-sm leading-relaxed">
            "Grâce à Fashion AI, j'ai enfin pu visualiser ma robe de rêve avant de la commander. Incroyable !"
          </blockquote>
          <p className="text-white/50 text-xs mt-2">— Sophie K., Paris</p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#5E35B1" }}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: "1.1rem", color: "#212121" }}>Fashion AI</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.75rem", fontWeight: 700, color: "#212121", marginBottom: "0.5rem" }}>
              Bon retour !
            </h2>
            <p className="text-[#616161] text-sm mb-8">Connectez-vous pour accéder à vos designs</p>

            {/* Demo credentials */}
            <div className="mb-6 p-3 rounded-xl text-xs" style={{ background: "#E3F2FD", border: "1px solid #1565C0" }}>
              <p className="font-semibold text-[#1565C0] mb-1">Comptes de démonstration :</p>
              <p className="text-[#1565C0]">Client : <code>client@test.com</code> (n'importe quel mdp)</p>
              <p className="text-[#1565C0]">Couturière : <code>pro@test.com</code></p>
              <p className="text-[#1565C0]">Admin : <code>admin@test.com</code></p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl mb-6" style={{ background: "#FFEBEE", border: "1px solid #C62828" }} role="alert">
                <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#C62828" }} aria-hidden="true" />
                <p className="text-sm" style={{ color: "#C62828" }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="mb-4">
                <label htmlFor="login-email" className="block text-sm font-medium text-[#212121] mb-1.5">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9E9E]" aria-hidden="true" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    autoFocus
                    autoComplete="email"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border text-[#212121] placeholder-[#9E9E9E] transition-colors focus:outline-none focus:ring-2 disabled:opacity-60"
                    style={{ borderColor: "#E0E0E0", fontSize: "0.9375rem" }}
                    onFocus={(e) => (e.target.style.borderColor = "#5E35B1")}
                    onBlur={(e) => (e.target.style.borderColor = "#E0E0E0")}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-4">
                <label htmlFor="login-password" className="block text-sm font-medium text-[#212121] mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9E9E]" aria-hidden="true" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border text-[#212121] placeholder-[#9E9E9E] transition-colors focus:outline-none focus:ring-2 disabled:opacity-60"
                    style={{ borderColor: "#E0E0E0", fontSize: "0.9375rem" }}
                    onFocus={(e) => (e.target.style.borderColor = "#5E35B1")}
                    onBlur={(e) => (e.target.style.borderColor = "#E0E0E0")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded focus:outline-none focus:ring-2 focus:ring-[#5E35B1]"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-[#9E9E9E]" aria-hidden="true" /> : <Eye className="w-4 h-4 text-[#9E9E9E]" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#5E35B1]"
                  />
                  <span className="text-sm text-[#616161]">Se souvenir de moi</span>
                </label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#5E35B1] rounded"
                  style={{ color: "#5E35B1" }}
                >
                  Mot de passe oublié ?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full py-3.5 rounded-xl font-semibold text-white transition-all focus:outline-none focus:ring-4 focus:ring-[#5E35B1]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#5E35B1", fontSize: "0.9375rem" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                    Connexion...
                  </span>
                ) : (
                  "Se connecter"
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-gray-200" aria-hidden="true" />
                <span className="text-xs text-[#9E9E9E]">ou</span>
                <div className="flex-1 h-px bg-gray-200" aria-hidden="true" />
              </div>

              {/* OAuth */}
              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-200 text-[#424242] text-sm font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5E35B1]"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuer avec Google
                </button>
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#5E35B1]"
                  style={{ background: "#1877F2" }}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continuer avec Facebook
                </button>
              </div>
            </form>

            {/* Security note */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <Lock className="w-3.5 h-3.5 text-[#757575]" aria-hidden="true" />
              <p className="text-xs text-[#757575]">Connexion sécurisée — vos données sont chiffrées</p>
            </div>
          </div>

          <p className="text-center mt-6 text-sm text-[#616161]">
            Pas encore de compte ?{" "}
            <Link href="/register" className="font-semibold focus:outline-none focus:ring-2 focus:ring-[#5E35B1] rounded" style={{ color: "#5E35B1" }}>
              S'inscrire gratuitement
            </Link>
          </p>

          <div className="flex justify-center gap-4 mt-4">
            <Link href="/" className="text-xs text-[#9E9E9E] hover:text-[#616161] transition-colors">Confidentialité</Link>
            <Link href="/" className="text-xs text-[#9E9E9E] hover:text-[#616161] transition-colors">CGU</Link>
          </div>
        </motion.div>
      </div>

      {/* Forgot password modal */}
      {forgotOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl"
          >
            <h3 id="forgot-title" className="font-semibold text-[#212121] mb-2" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem" }}>
              Réinitialiser votre mot de passe
            </h3>
            {resetSent ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "#E8F5E9" }}>
                  <span className="text-2xl">✓</span>
                </div>
                <p className="text-[#616161] text-sm mb-6">
                  Un email de réinitialisation a été envoyé à <strong>{resetEmail}</strong>
                </p>
                <button
                  onClick={() => { setForgotOpen(false); setResetSent(false); }}
                  className="w-full py-3 rounded-xl font-medium text-white"
                  style={{ background: "#5E35B1" }}
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit}>
                <p className="text-sm text-[#616161] mb-4">Entrez votre adresse email pour recevoir un lien de réinitialisation.</p>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-4 focus:outline-none focus:ring-2 focus:ring-[#5E35B1] text-[#212121]"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setForgotOpen(false)}
                    className="flex-1 py-3 rounded-xl font-medium border border-gray-200 text-[#424242] hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl font-medium text-white"
                    style={{ background: "#5E35B1" }}
                  >
                    Envoyer
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
