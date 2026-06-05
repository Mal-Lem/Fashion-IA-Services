"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { Mail, Phone, Send, CheckCircle, MessageSquare, Clock } from "lucide-react";
import { toast } from "sonner";

const SUBJECTS = [
  "Question générale",
  "Problème technique",
  "Devenir couturière partenaire",
  "Partenariat / Presse",
  "Facturation / Abonnement",
  "Signaler un problème",
  "Autre",
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!form.name || !form.email || !form.subject || !form.message) {
    toast.error("Veuillez remplir tous les champs obligatoires");
    return;
  }

  setSending(true);
  try {
    const emailjs = await import('@emailjs/browser');
    
    await emailjs.send(
      'service_fashionIA_messag',   
      'template_aqcy5m2oui',   
      {
        name: form.name,
        email: form.email,
        phone: form.phone || "Non renseigné",
        subject: form.subject,
        message: form.message,
      },
      'BGB1GtPmBBT9Zh0zD'      
    );

    setSent(true);
    toast.success("Message envoyé avec succès !");
  } catch (error) {
    toast.error("Erreur lors de l'envoi. Contactez-nous directement au 07 44 59 83 47");
  } finally {
    setSending(false);
  }
};

  return (
    <div className="min-h-screen" style={{ background: "#FAFAFA", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Header />

      <main className="pt-16">

        {/* Hero */}
        <section className="py-16 px-4 text-center" style={{ background: "linear-gradient(135deg, #1a0533, #2d1057)" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.1)" }}>
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.75rem, 4vw, 3rem)", fontWeight: 700, color: "white", marginBottom: "1rem" }}>
              Contactez-nous
            </h1>
            <p className="text-white/70 max-w-xl mx-auto">
              Une question, une idée, un partenariat ? Nous sommes à votre écoute. 
              L'équipe Mallem vous répond dans les plus brefs délais.
            </p>
          </motion.div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Infos de contact */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h2 className="font-semibold text-[#212121] mb-6" style={{ fontSize: "1.25rem" }}>
                  Nos coordonnées
                </h2>

                {[
                  {
                    icon: Mail,
                    label: "Email",
                    value: "amelguerah.pro@gmail.com",
                    href: "mailto:amelguerah.pro@gmail.com",
                  },
                  {
                    icon: Phone,
                    label: "Téléphone",
                    value: "07 44 59 83 47",
                    href: "tel:+33744598347",
                  },
                  {
                    icon: Clock,
                    label: "Disponibilité",
                    value: "Lun - Ven, 9h - 18h",
                    href: null,
                  },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#EDE7FF" }}>
                      <Icon className="w-5 h-5" style={{ color: "#5E35B1" }} />
                    </div>
                    <div>
                      <p className="text-xs text-[#9E9E9E] mb-0.5">{label}</p>
                      {href ? (
                        <a href={href} className="text-sm font-medium text-[#212121] hover:text-[#5E35B1] transition-colors">
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-[#212121]">{value}</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Citation */}
                <div className="p-5 rounded-2xl mt-4" style={{ background: "linear-gradient(135deg, #EDE7FF, #FCE4EC)" }}>
                  <p className="text-sm text-[#616161] italic leading-relaxed">
                    "Mallem est née de l'amour de deux femmes courageuses. Votre message sera lu avec la même attention qu'elles m'ont accordée."
                  </p>
                  <p className="text-xs font-semibold mt-2" style={{ color: "#5E35B1" }}>— La Fondatrice</p>
                </div>
              </motion.div>
            </div>

            {/* Formulaire */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              {sent ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ background: "#E8F5E9" }}
                  >
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </motion.div>
                  <h3 className="font-semibold text-[#212121] mb-2" style={{ fontSize: "1.25rem" }}>
                    Message envoyé !
                  </h3>
                  <p className="text-[#616161] mb-6">
                    Merci pour votre message. Nous vous répondrons dans les plus brefs délais à l'adresse <strong>{form.email}</strong>.
                  </p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                    className="px-6 py-2.5 rounded-xl text-sm font-medium text-white"
                    style={{ background: "#5E35B1" }}
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-8 space-y-5">
                  <h2 className="font-semibold text-[#212121] mb-2" style={{ fontSize: "1.25rem" }}>
                    Envoyer un message
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#212121] mb-1.5">
                        Nom complet <span style={{ color: "#EC407A" }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Votre nom et prénom"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#212121] focus:outline-none focus:ring-2 focus:border-[#5E35B1]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#212121] mb-1.5">
                        Email <span style={{ color: "#EC407A" }}>*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="votre@email.com"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#212121] focus:outline-none focus:ring-2 focus:border-[#5E35B1]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-1.5">
                      Numéro de téléphone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="06 XX XX XX XX"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#212121] focus:outline-none focus:ring-2 focus:border-[#5E35B1]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-1.5">
                      Objet <span style={{ color: "#EC407A" }}>*</span>
                    </label>
                    <select
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#212121] focus:outline-none focus:ring-2 focus:border-[#5E35B1]"
                    >
                      <option value="">Sélectionnez un objet</option>
                      {SUBJECTS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-1.5">
                      Message <span style={{ color: "#EC407A" }}>*</span>
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Décrivez votre demande en détail..."
                      required
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#212121] focus:outline-none focus:ring-2 focus:border-[#5E35B1] resize-none"
                    />
                    <p className="text-xs text-[#9E9E9E] mt-1 text-right">{form.message.length}/1000</p>
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white disabled:opacity-50 transition-all"
                    style={{ background: "linear-gradient(135deg, #5E35B1, #EC407A)" }}
                  >
                    {sending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Envoyer le message
                      </>
                    )}
                  </button>

                  <p className="text-xs text-center text-[#9E9E9E]">
                    Les champs marqués <span style={{ color: "#EC407A" }}>*</span> sont obligatoires.
                    Vos données sont traitées de manière confidentielle.
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}