"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Eye, EyeOff, Check, Lock } from "lucide-react";
import { toast } from "sonner";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Token invalide ou manquant.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:3001/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = typeof data.message === "object" ? data.message.message : data.message;
        throw new Error(msg || "Erreur lors de la réinitialisation");
      }

      setSuccess(true);
      toast.success("Mot de passe modifié avec succès !");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la réinitialisation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#FAFAFA", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#5E35B1" }}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: "1.25rem", color: "#212121" }}>
              Mallem
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#E8F5E9" }}>
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="font-semibold text-[#212121] mb-2" style={{ fontSize: "1.25rem" }}>
                Mot de passe modifié !
              </h2>
              <p className="text-[#616161] mb-4">
                Votre mot de passe a été mis à jour avec succès. Vous allez être redirigé vers la connexion.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white"
                style={{ background: "#5E35B1" }}
              >
                Se connecter
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#EDE7FF" }}>
                  <Lock className="w-5 h-5" style={{ color: "#5E35B1" }} />
                </div>
                <div>
                  <h2 className="font-semibold text-[#212121]">Nouveau mot de passe</h2>
                  <p className="text-xs text-[#9E9E9E]">Choisissez un mot de passe sécurisé</p>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl mb-4 text-sm" style={{ background: "#FFEBEE", color: "#C62828" }}>
                  {error}
                </div>
              )}

              {!token ? (
                <div className="text-center py-4">
                  <p className="text-[#616161] mb-4">Ce lien est invalide ou a expiré.</p>
                  <Link href="/login" className="text-sm font-medium" style={{ color: "#5E35B1" }}>
                    Retour à la connexion
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-1.5">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 8 caractères"
                        required
                        className="w-full pr-12 px-4 py-3 rounded-xl border border-gray-200 text-[#212121] focus:outline-none focus:ring-2 focus:border-[#5E35B1]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                      >
                        {showPass ? <EyeOff className="w-4 h-4 text-[#9E9E9E]" /> : <Eye className="w-4 h-4 text-[#9E9E9E]" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-1.5">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Répétez le mot de passe"
                      required
                      className="w-full px-4 py-3 rounded-xl border text-[#212121] focus:outline-none focus:ring-2 focus:border-[#5E35B1]"
                      style={{
                        borderColor: confirmPassword && confirmPassword !== password ? "#C62828" : "#E0E0E0"
                      }}
                    />
                    {confirmPassword && confirmPassword !== password && (
                      <p className="text-xs mt-1" style={{ color: "#C62828" }}>
                        Les mots de passe ne correspondent pas
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !password || !confirmPassword || password !== confirmPassword}
                    className="w-full py-3.5 rounded-xl font-semibold text-white disabled:opacity-50 transition-all"
                    style={{ background: "linear-gradient(135deg, #5E35B1, #EC407A)" }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Modification...
                      </span>
                    ) : (
                      "Modifier mon mot de passe"
                    )}
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        <p className="text-center mt-4 text-sm text-[#616161]">
          <Link href="/login" className="font-medium" style={{ color: "#5E35B1" }}>
            ← Retour à la connexion
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}