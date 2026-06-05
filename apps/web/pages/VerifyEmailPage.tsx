"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Mail, RefreshCw, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!user) router.push("/login");
    inputs.current[0]?.focus();
  }, [user, router]);

  const handleChange = (idx: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Chiffres uniquement
    const newCode = [...code];
    newCode[idx] = value.slice(-1);
    setCode(newCode);
    setError("");

    // Auto-focus suivant
    if (value && idx < 5) {
      inputs.current[idx + 1]?.focus();
    }

    // Auto-submit si complet
    if (value && idx === 5) {
      const fullCode = [...newCode].join("");
      if (fullCode.length === 6) handleVerify(fullCode);
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      handleVerify(pasted);
    }
  };

  const handleVerify = async (fullCode?: string) => {
    const codeToVerify = fullCode || code.join("");
    if (codeToVerify.length !== 6) {
      setError("Entrez les 6 chiffres du code");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:3001/v1/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: codeToVerify }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = typeof data.message === "object" ? data.message.message : data.message;
        throw new Error(msg || "Code invalide");
      }

      setSuccess(true);
      toast.success("Email vérifié avec succès !");
      setTimeout(() => router.push("/bienvenue"), 2000);
    } catch (err: any) {
      setError(err.message || "Code invalide ou expiré");
      setCode(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const token = localStorage.getItem("access_token");
      await fetch("http://localhost:3001/v1/auth/resend-verification", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Nouveau code envoyé !");
      setCode(["", "", "", "", "", ""]);
      setError("");
      inputs.current[0]?.focus();
    } catch {
      toast.error("Erreur lors du renvoi");
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#FAFAFA" }}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "#E8F5E9" }}>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="font-semibold text-[#212121] mb-2" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem" }}>
            Email vérifié !
          </h2>
          <p className="text-[#616161]">Redirection en cours...</p>
        </motion.div>
      </div>
    );
  }

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
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#EDE7FF" }}>
              <Mail className="w-8 h-8" style={{ color: "#5E35B1" }} />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 700, color: "#212121", marginBottom: "0.5rem" }}>
              Vérifiez votre email
            </h2>
            <p className="text-sm text-[#616161]">
              Nous avons envoyé un code à 6 chiffres à<br />
              <strong className="text-[#212121]">{user?.email}</strong>
            </p>
          </div>

          {/* Code input */}
          <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 focus:outline-none transition-all"
                style={{
                  borderColor: error ? "#C62828" : digit ? "#5E35B1" : "#E0E0E0",
                  background: digit ? "#EDE7FF" : "white",
                  color: "#212121",
                }}
              />
            ))}
          </div>

          {/* Erreur */}
          {error && (
            <p className="text-center text-sm mb-4" style={{ color: "#C62828" }}>
              {error}
            </p>
          )}

          {/* Bouton vérifier */}
          <button
            onClick={() => handleVerify()}
            disabled={loading || code.join("").length !== 6}
            className="w-full py-3.5 rounded-xl font-semibold text-white disabled:opacity-50 transition-all mb-4"
            style={{ background: "linear-gradient(135deg, #5E35B1, #EC407A)" }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Vérification...
              </span>
            ) : (
              "Vérifier mon email"
            )}
          </button>

          {/* Renvoyer le code */}
          <div className="text-center">
            <p className="text-sm text-[#9E9E9E] mb-2">Vous n'avez pas reçu le code ?</p>
            <button
              onClick={handleResend}
              disabled={resending}
              className="flex items-center gap-2 mx-auto text-sm font-medium transition-colors disabled:opacity-50"
              style={{ color: "#5E35B1" }}
            >
              <RefreshCw className={`w-4 h-4 ${resending ? "animate-spin" : ""}`} />
              {resending ? "Envoi en cours..." : "Renvoyer le code"}
            </button>
          </div>
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