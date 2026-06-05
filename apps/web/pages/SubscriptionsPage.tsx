"use client";

import { useState } from "react";
import Link from "next/link";;
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Crown, Shield, Star, CreditCard, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const PLANS = [
  {
    id: "free",
    name: "Gratuit",
    price: 0,
    period: "",
    description: "Découvrez la plateforme sans engagement",
    icon: Sparkles,
    color: "#757575",
    bg: "#F5F5F5",
    features: [
      { text: "5 générations IA par mois", included: true },
      { text: "20 designs sauvegardés", included: true },
      { text: "Accès à toutes les couturières", included: true },
      { text: "Messagerie intégrée", included: true },
      { text: "Générations illimitées", included: false },
      { text: "Stockage illimité", included: false },
      { text: "Priorité dans les recommandations", included: false },
      { text: "Support prioritaire", included: false },
    ],
    cta: "Votre plan actuel",
    popular: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: 9.90,
    period: "/mois",
    description: "Pour les créatrices passionnées",
    icon: Crown,
    color: "#5E35B1",
    bg: "#EDE7FF",
    features: [
      { text: "Générations IA illimitées", included: true },
      { text: "Stockage illimité", included: true },
      { text: "Accès à toutes les couturières", included: true },
      { text: "Messagerie intégrée", included: true },
      { text: "Priorité dans les recommandations", included: true },
      { text: "Téléchargements HD", included: true },
      { text: "Historique complet", included: true },
      { text: "Support prioritaire", included: false },
    ],
    cta: "Commencer l'essai gratuit",
    popular: true,
    trial: "14 jours gratuits",
  },
  {
    id: "pro",
    name: "Pro Couturière",
    price: 29,
    period: "/mois",
    description: "Pour les professionnelles de la couture",
    icon: Zap,
    color: "#EC407A",
    bg: "#FCE4EC",
    features: [
      { text: "Profil professionnel complet", included: true },
      { text: "Mise en avant dans les résultats", included: true },
      { text: "Badge 'Pro' vérifié", included: true },
      { text: "Tableau de bord analytics", included: true },
      { text: "Gestion des commandes", included: true },
      { text: "Accès aux designs clients", included: true },
      { text: "Support prioritaire dédié", included: true },
      { text: "Formation & ressources", included: true },
    ],
    cta: "Devenir Pro",
    popular: false,
  },
];

const FAQS = [
  { q: "Puis-je annuler mon abonnement à tout moment ?", a: "Oui, vous pouvez annuler votre abonnement à tout moment depuis votre espace compte. Votre accès Premium reste actif jusqu'à la fin de la période payée." },
  { q: "Comment fonctionne l'essai gratuit de 14 jours ?", a: "Pendant 14 jours, vous bénéficiez de toutes les fonctionnalités Premium sans frais. Aucune carte bancaire n'est requise pour commencer l'essai." },
  { q: "Est-ce que mes données sont sécurisées ?", a: "Oui. Tous les paiements sont traités via Stripe, certifié PCI-DSS. Nous ne stockons jamais vos données bancaires. Vos informations sont chiffrées et protégées conformément au RGPD." },
  { q: "Puis-je changer de plan en cours de mois ?", a: "Vous pouvez passer à un plan supérieur à tout moment. La différence sera calculée au prorata. Pour passer à un plan inférieur, la modification sera effective à la prochaine période de facturation." },
];

export default function SubscriptionsPage() {
  const { user, isAuthenticated } = useAuth();
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubscribe = async (planId: string) => {
    if (planId === "free") return;
    setCheckoutPlan(planId);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setProcessing(false);
    setCheckoutPlan(null);
    toast.success("Abonnement activé avec succès ! Bienvenue dans Premium 🎉");
  };

  const discount = billing === "annual" ? 0.2 : 0;

  return (
    <div className="min-h-screen" style={{ background: "#FAFAFA", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Header />

      {/* Checkout Modal */}
      {checkoutPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-title"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8"
          >
            <h3 id="checkout-title" className="font-semibold text-[#212121] mb-2" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.375rem" }}>
              Finaliser votre abonnement
            </h3>
            <p className="text-sm text-[#616161] mb-6">
              Plan {PLANS.find((p) => p.id === checkoutPlan)?.name} · {billing === "annual" ? "Annuel" : "Mensuel"}
            </p>

            <div className="flex items-center gap-2 p-3 rounded-xl mb-6" style={{ background: "#E3F2FD" }}>
              <Shield className="w-4 h-4 flex-shrink-0" style={{ color: "#1565C0" }} aria-hidden="true" />
              <p className="text-xs text-[#1565C0]">Paiement sécurisé via Stripe · SSL chiffré</p>
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label htmlFor="card-number" className="block text-sm font-medium text-[#212121] mb-1.5">Numéro de carte</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9E9E]" aria-hidden="true" />
                  <input
                    id="card-number"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-[#212121] placeholder-[#9E9E9E] focus:outline-none focus:ring-2 focus:border-[#5E35B1]"
                    maxLength={19}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="card-expiry" className="block text-sm font-medium text-[#212121] mb-1.5">Expiration</label>
                  <input
                    id="card-expiry"
                    type="text"
                    placeholder="MM/AA"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#212121] placeholder-[#9E9E9E] focus:outline-none focus:ring-2 focus:border-[#5E35B1]"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label htmlFor="card-cvc" className="block text-sm font-medium text-[#212121] mb-1.5">CVC</label>
                  <input
                    id="card-cvc"
                    type="text"
                    placeholder="123"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#212121] placeholder-[#9E9E9E] focus:outline-none focus:ring-2 focus:border-[#5E35B1]"
                    maxLength={4}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCheckoutPlan(null)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-[#424242] font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5E35B1]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-[#5E35B1]/30"
                  style={{ background: "#5E35B1" }}
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                      Traitement...
                    </span>
                  ) : (
                    "Confirmer le paiement"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <main className="pt-20 pb-16">
        {/* Hero */}
        <section className="py-16 text-center" style={{ background: "linear-gradient(135deg, #1a0533 0%, #2d1057 100%)" }} aria-labelledby="pricing-title">
          <div className="max-w-4xl mx-auto px-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 border border-white/20 bg-white/10">
              <Star className="w-3.5 h-3.5 text-[#EC407A]" aria-hidden="true" />
              <span className="text-xs text-white/80">Simple, transparent, sans surprise</span>
            </div>
            <h1
              id="pricing-title"
              className="text-white mb-4"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700 }}
            >
              Choisissez votre plan
            </h1>
            <p className="text-white/70 mb-8" style={{ fontSize: "1.125rem" }}>
              Commencez gratuitement, évoluez selon vos besoins
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-4 p-1.5 rounded-xl" style={{ background: "rgba(255,255,255,0.1)" }}>
              <button
                onClick={() => setBilling("monthly")}
                className="px-5 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
                style={{
                  background: billing === "monthly" ? "white" : "transparent",
                  color: billing === "monthly" ? "#5E35B1" : "rgba(255,255,255,0.7)",
                }}
                aria-pressed={billing === "monthly"}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBilling("annual")}
                className="px-5 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-white/50 flex items-center gap-2"
                style={{
                  background: billing === "annual" ? "white" : "transparent",
                  color: billing === "annual" ? "#5E35B1" : "rgba(255,255,255,0.7)",
                }}
                aria-pressed={billing === "annual"}
              >
                Annuel
                <span className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ background: "#EC407A", color: "white" }}>-20%</span>
              </button>
            </div>
          </div>
        </section>

        {/* Plans */}
        <section className="py-16" aria-label="Plans d'abonnement">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {PLANS.map((plan, i) => {
                const PlanIcon = plan.icon;
                const finalPrice = plan.price > 0 ? plan.price * (1 - discount) : 0;
                const isPremium = plan.id === "premium";
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`relative rounded-2xl p-8 flex flex-col ${plan.popular ? "border-2 shadow-lg" : "border border-gray-100 shadow-sm"} bg-white`}
                    style={{ borderColor: plan.popular ? plan.color : undefined }}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="px-4 py-1.5 rounded-full text-xs font-semibold text-white shadow-md" style={{ background: plan.color }}>
                          ✨ Le plus populaire
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: plan.bg }}>
                        <PlanIcon className="w-5 h-5" style={{ color: plan.color }} aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#212121]">{plan.name}</h3>
                        {"trial" in plan && plan.trial && (
                          <span className="text-xs font-medium" style={{ color: plan.color }}>{plan.trial}</span>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-end gap-1">
                        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", fontWeight: 700, color: "#212121", lineHeight: 1 }}>
                          {finalPrice === 0 ? "Gratuit" : `${finalPrice.toFixed(2).replace(".", ",")} €`}
                        </span>
                        {plan.period && (
                          <span className="text-sm text-[#9E9E9E] mb-1">{plan.period}</span>
                        )}
                      </div>
                      {plan.price > 0 && billing === "annual" && (
                        <p className="text-xs text-[#9E9E9E] mt-1">
                          soit {(finalPrice * 12).toFixed(2).replace(".", ",")} € / an
                        </p>
                      )}
                    </div>

                    <p className="text-sm text-[#616161] mb-6">{plan.description}</p>

                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((feature, fi) => (
                        <li key={fi} className="flex items-start gap-2.5">
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ background: feature.included ? plan.bg : "#F5F5F5" }}
                            aria-hidden="true"
                          >
                            {feature.included
                              ? <Check className="w-3 h-3" style={{ color: plan.color }} />
                              : <span style={{ width: "8px", height: "2px", background: "#BDBDBD", display: "block", borderRadius: "2px" }} />
                            }
                          </span>
                          <span className={`text-sm ${feature.included ? "text-[#424242]" : "text-[#BDBDBD] line-through"}`}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={plan.id === "free" || (isAuthenticated && user?.isPremium && isPremium)}
                      className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all focus:outline-none focus:ring-4 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                      style={
                        plan.popular
                          ? { background: plan.color, color: "white", boxShadow: `0 4px 16px ${plan.color}40` }
                          : { background: plan.bg, color: plan.color }
                      }
                    >
                      {plan.cta}
                      {plan.id !== "free" && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
                    </button>
                  </motion.div>
                );
              })}
            </div>

            <p className="text-center text-sm text-[#9E9E9E] mt-8">
              Tous les prix sont TTC · Annulation à tout moment · Paiement sécurisé via Stripe
            </p>
          </div>
        </section>

        {/* Features comparison */}
        <section className="py-16 bg-white" aria-labelledby="compare-title">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 id="compare-title" className="text-center mb-12" style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 700, color: "#212121" }}>
              Tout ce dont vous avez besoin
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { icon: Sparkles, title: "IA de pointe", desc: "Nos modèles génèrent des visuels de haute qualité qui capturent parfaitement votre vision.", color: "#5E35B1", bg: "#EDE7FF" },
                { icon: Shield, title: "Sécurité garantie", desc: "Vos données et paiements sont chiffrés et protégés. Conforme RGPD.", color: "#00BCD4", bg: "#E0F7FA" },
                { icon: Crown, title: "Support dédié", desc: "Notre équipe vous accompagne à chaque étape de votre parcours créatif.", color: "#EC407A", bg: "#FCE4EC" },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: item.bg }} aria-hidden="true">
                    <item.icon className="w-6 h-6" style={{ color: item.color }} />
                  </div>
                  <h3 className="font-semibold text-[#212121] mb-2">{item.title}</h3>
                  <p className="text-sm text-[#616161]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16" aria-labelledby="faq-title">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 id="faq-title" className="text-center mb-10" style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 700, color: "#212121" }}>
              Questions fréquentes
            </h2>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5E35B1] focus:ring-inset"
                    aria-expanded={openFaq === i}
                  >
                    <span className="font-medium text-[#212121] pr-4">{faq.q}</span>
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-transform"
                      style={{ background: openFaq === i ? "#5E35B1" : "#F5F5F5", transform: openFaq === i ? "rotate(45deg)" : "none" }}
                      aria-hidden="true"
                    >
                      <span className="text-sm" style={{ color: openFaq === i ? "white" : "#424242", fontWeight: 700, lineHeight: 1 }}>+</span>
                    </span>
                  </button>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="px-5 pb-5 text-sm text-[#616161] leading-relaxed"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 mx-4 rounded-3xl" style={{ background: "linear-gradient(135deg, #5E35B1, #EC407A)" }} aria-labelledby="cta-pricing-title">
          <div className="text-center max-w-2xl mx-auto px-4">
            <h2 id="cta-pricing-title" className="text-white mb-4" style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 700 }}>
              Prête à créer ?
            </h2>
            <p className="text-white/70 mb-8">Commencez gratuitement dès aujourd'hui. Aucune carte bancaire requise.</p>
            <Link
              href={isAuthenticated ? "/create" : "/register"}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold bg-white transition-all hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-white/50"
              style={{ color: "#5E35B1" }}
            >
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              {isAuthenticated ? "Créer un design" : "S'inscrire gratuitement"}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
