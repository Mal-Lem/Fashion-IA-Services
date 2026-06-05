"use client";

import { useState } from "react";
import Link from "next/link";;
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  LayoutDashboard,
  User,
  Calendar,
  MessageCircle,
  BarChart2,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Upload,
  Plus,
  TrendingUp,
  Euro,
  Eye,
  Users,
} from "lucide-react";
import { COUTURIERES, MESSAGES } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";

const REQUESTS = [
  {
    id: "req1",
    client: "Sophie M.",
    design: "Robe de soirée romantique",
    designImg: COUTURIERES[0].portfolio[0],
    date: "2024-01-20",
    status: "Nouveau",
    message: "Bonjour, j'aimerais faire réaliser cette robe pour un mariage en mai...",
    budget: "250-400 €",
  },
  {
    id: "req2",
    client: "Amina K.",
    design: "Blazer minimaliste",
    designImg: COUTURIERES[0].portfolio[4],
    date: "2024-01-18",
    status: "Acceptée",
    message: "Je souhaite un blazer ajusté pour mon travail...",
    budget: "150-200 €",
  },
  {
    id: "req3",
    client: "Clara D.",
    design: "Combinaison élégante",
    designImg: COUTURIERES[0].portfolio[1],
    date: "2024-01-15",
    status: "En cours",
    message: "Combinaison blanche pour une soirée en juillet...",
    budget: "180-300 €",
  },
  {
    id: "req4",
    client: "Juliette R.",
    design: "Robe bohème",
    designImg: COUTURIERES[0].portfolio[3],
    date: "2024-01-10",
    status: "Terminée",
    message: "Robe légère pour l'été...",
    budget: "80-120 €",
  },
];

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  Nouveau: { bg: "#EDE7FF", text: "#5E35B1", label: "Nouvelle" },
  Acceptée: { bg: "#E3F2FD", text: "#1565C0", label: "Acceptée" },
  "En cours": { bg: "#FFF3E0", text: "#E65100", label: "En cours" },
  Terminée: { bg: "#E8F5E9", text: "#2E7D32", label: "Terminée" },
  Refusée: { bg: "#FFEBEE", text: "#C62828", label: "Refusée" },
};

const STATS = [
  { label: "Revenus du mois", value: "1 240 €", icon: Euro, color: "#5E35B1", bg: "#EDE7FF", trend: "+12%" },
  { label: "Commandes actives", value: "3", icon: Clock, color: "#EC407A", bg: "#FCE4EC", trend: "+2 cette sem." },
  { label: "Visites profil", value: "87", icon: Eye, color: "#00BCD4", bg: "#E0F7FA", trend: "+24% ce mois" },
  { label: "Note moyenne", value: "4.9 ⭐", icon: Star, color: "#F57F17", bg: "#FFF8E1", trend: "127 avis" },
];

export default function EspaceProPage() {
  const { user } = useAuth();
  const couturiere = COUTURIERES[0]; // Mock: use first couturière as current user
  const [activeTab, setActiveTab] = useState<"dashboard" | "profil" | "agenda" | "demandes" | "stats">("dashboard");
  const [requests, setRequests] = useState(REQUESTS);
  const [bio, setBio] = useState(couturiere.bio);
  const [saving, setSaving] = useState(false);

  const handleAccept = (id: string) => {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "Acceptée" } : r));
    toast.success("Demande acceptée ! Le client a été notifié.");
  };

  const handleRefuse = (id: string) => {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "Refusée" } : r));
    toast.error("Demande refusée.");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    toast.success("Profil professionnel mis à jour !");
  };

  const tabs = [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "profil", label: "Mon profil", icon: User },
    { id: "demandes", label: "Demandes", icon: MessageCircle, badge: requests.filter((r) => r.status === "Nouveau").length },
    { id: "agenda", label: "Agenda", icon: Calendar },
    { id: "stats", label: "Statistiques", icon: BarChart2 },
  ] as const;

  return (
    <div className="min-h-screen" style={{ background: "#FAFAFA", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Header />

      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Pro header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl mb-8 p-6 flex items-center gap-5"
            style={{ background: "linear-gradient(135deg, #1a0533, #2d1057)" }}
          >
            <img src={couturiere.image} alt={couturiere.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/30 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.375rem", fontWeight: 700, color: "white" }}>
                  {couturiere.name}
                </h1>
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white" style={{ background: "#5E35B1" }}>
                  ✓ Certifiée Pro
                </span>
              </div>
              <p className="text-white/60 text-sm mt-1">{couturiere.specialty} · {couturiere.location}</p>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <div className="text-center">
                <p className="text-white font-bold text-lg">{couturiere.rating}</p>
                <p className="text-white/50 text-xs">Note</p>
              </div>
              <div className="w-px h-8 bg-white/20" aria-hidden="true" />
              <div className="text-center">
                <p className="text-white font-bold text-lg">{couturiere.reviewCount}</p>
                <p className="text-white/50 text-xs">Avis</p>
              </div>
              <div className="w-px h-8 bg-white/20" aria-hidden="true" />
              <div className="text-center">
                <p className="text-white font-bold text-lg">{couturiere.completionRate}%</p>
                <p className="text-white/50 text-xs">Satisfaction</p>
              </div>
            </div>
            <Link
              href={`/couturieres/${couturiere.id}`}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-white/20 text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <Eye className="w-4 h-4" aria-hidden="true" />
              Voir mon profil
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <nav aria-label="Navigation espace pro" className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {tabs.map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#5E35B1] ${
                        activeTab === tab.id
                          ? "bg-[#EDE7FF] text-[#5E35B1] font-semibold border-l-2 border-[#5E35B1]"
                          : "text-[#424242] hover:bg-gray-50"
                      }`}
                      aria-current={activeTab === tab.id ? "page" : undefined}
                    >
                      <TabIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                      <span className="flex-1 text-left">{tab.label}</span>
                      {"badge" in tab && tab.badge && tab.badge > 0 && (
                        <span className="w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center" style={{ background: "#EC407A" }}>
                          {tab.badge}
                        </span>
                      )}
                      {activeTab !== tab.id && <ChevronRight className="w-3.5 h-3.5 text-[#BDBDBD]" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Dashboard */}
              {activeTab === "dashboard" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {/* Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {STATS.map((stat, i) => {
                      const StatIcon = stat.icon;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-white rounded-2xl border border-gray-100 p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: stat.bg }}>
                              <StatIcon className="w-4 h-4" style={{ color: stat.color }} aria-hidden="true" />
                            </div>
                            <span className="text-xs font-medium" style={{ color: "#2E7D32" }}>{stat.trend}</span>
                          </div>
                          <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.375rem", color: "#212121" }}>
                            {stat.value}
                          </p>
                          <p className="text-xs text-[#9E9E9E] mt-0.5">{stat.label}</p>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Recent requests */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="font-semibold text-[#212121]" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.125rem" }}>
                        Dernières demandes
                      </h2>
                      <button
                        onClick={() => setActiveTab("demandes")}
                        className="text-sm font-medium flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-[#5E35B1] rounded"
                        style={{ color: "#5E35B1" }}
                      >
                        Tout voir <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {requests.slice(0, 3).map((req) => {
                        const s = STATUS_CONFIG[req.status] || STATUS_CONFIG["Nouveau"];
                        return (
                          <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                            <img src={req.designImg} alt={req.design} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-[#212121] text-sm truncate">{req.design}</p>
                              <p className="text-xs text-[#9E9E9E]">{req.client} · {req.date}</p>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0" style={{ background: s.bg, color: s.text }}>
                              {s.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recent messages */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="font-semibold text-[#212121]" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.125rem" }}>
                        Messages récents
                      </h2>
                      <Link href="/messages" className="text-sm font-medium flex items-center gap-1" style={{ color: "#5E35B1" }}>
                        Ouvrir messagerie <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                    {MESSAGES.map((msg) => (
                      <Link
                        key={msg.id}
                        href="/messages"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors block focus:outline-none focus:ring-2 focus:ring-[#5E35B1]"
                      >
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0" style={{ background: "#5E35B1" }}>
                          {msg.couturiere.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#212121] text-sm">Cliente</p>
                          <p className="text-xs text-[#9E9E9E] truncate">{msg.lastMessage}</p>
                        </div>
                        <span className="text-xs text-[#9E9E9E]">{msg.timestamp}</span>
                        {msg.unread > 0 && (
                          <span className="w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center" style={{ background: "#5E35B1" }}>
                            {msg.unread}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Profile Edit */}
              {activeTab === "profil" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="font-semibold text-[#212121] mb-6" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem" }}>
                      Modifier mon profil professionnel
                    </h2>
                    <form onSubmit={handleSaveProfile} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="pro-name" className="block text-sm font-medium text-[#212121] mb-1.5">Nom complet</label>
                          <input
                            id="pro-name"
                            type="text"
                            defaultValue={couturiere.name}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#212121] focus:outline-none focus:ring-2 focus:border-[#5E35B1]"
                          />
                        </div>
                        <div>
                          <label htmlFor="pro-specialty" className="block text-sm font-medium text-[#212121] mb-1.5">Spécialité principale</label>
                          <input
                            id="pro-specialty"
                            type="text"
                            defaultValue={couturiere.specialty}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#212121] focus:outline-none focus:ring-2 focus:border-[#5E35B1]"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="pro-bio" className="block text-sm font-medium text-[#212121] mb-1.5">Biographie</label>
                        <textarea
                          id="pro-bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#212121] placeholder-[#9E9E9E] focus:outline-none focus:ring-2 focus:border-[#5E35B1] resize-none"
                        />
                        <p className="text-xs text-[#9E9E9E] mt-1">{bio.length}/500 caractères</p>
                      </div>

                      {/* Portfolio upload area */}
                      <div>
                        <label className="block text-sm font-medium text-[#212121] mb-2">Portfolio (photos)</label>
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          {couturiere.portfolio.map((img, i) => (
                            <div key={i} className="relative group rounded-xl overflow-hidden" style={{ height: "100px" }}>
                              <img src={img} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button type="button" className="text-xs text-white font-medium focus:outline-none">Supprimer</button>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => toast.success("Fonctionnalité disponible prochainement")}
                            className="rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-[#9E9E9E] hover:border-[#5E35B1] hover:text-[#5E35B1] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5E35B1]"
                            style={{ height: "100px" }}
                          >
                            <Upload className="w-5 h-5" aria-hidden="true" />
                            <span className="text-xs">Ajouter</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={saving}
                          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-[#5E35B1]/30"
                          style={{ background: "#5E35B1" }}
                        >
                          {saving ? (
                            <>
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                              Sauvegarde...
                            </>
                          ) : (
                            "Sauvegarder le profil"
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* Requests */}
              {activeTab === "demandes" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="font-semibold text-[#212121] mb-5" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem" }}>
                      Demandes reçues
                    </h2>
                    <div className="space-y-4">
                      {requests.map((req) => {
                        const s = STATUS_CONFIG[req.status] || STATUS_CONFIG["Nouveau"];
                        return (
                          <div key={req.id} className="border border-gray-100 rounded-2xl p-5">
                            <div className="flex items-start gap-4">
                              <img src={req.designImg} alt={req.design} className="w-20 h-24 rounded-xl object-cover flex-shrink-0" />
                              <div className="flex-1">
                                <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                                  <div>
                                    <h3 className="font-semibold text-[#212121]">{req.design}</h3>
                                    <p className="text-sm text-[#9E9E9E]">De {req.client} · {req.date}</p>
                                  </div>
                                  <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: s.bg, color: s.text }}>
                                    {s.label}
                                  </span>
                                </div>
                                <p className="text-sm text-[#616161] mb-3 italic">"{req.message}"</p>
                                <div className="flex items-center gap-3 flex-wrap">
                                  <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: "#EDE7FF", color: "#5E35B1" }}>
                                    Budget : {req.budget}
                                  </span>
                                  {req.status === "Nouveau" && (
                                    <>
                                      <button
                                        onClick={() => handleAccept(req.id)}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#5E35B1]"
                                        style={{ background: "#5E35B1" }}
                                      >
                                        <CheckCircle className="w-4 h-4" aria-hidden="true" />
                                        Accepter
                                      </button>
                                      <button
                                        onClick={() => handleRefuse(req.id)}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-[#C62828] hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                                      >
                                        <XCircle className="w-4 h-4" aria-hidden="true" />
                                        Refuser
                                      </button>
                                    </>
                                  )}
                                  {req.status !== "Nouveau" && (
                                    <Link
                                      href="/messages"
                                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-[#424242] hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5E35B1]"
                                    >
                                      <MessageCircle className="w-4 h-4" aria-hidden="true" />
                                      Messagerie
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Calendar */}
              {activeTab === "agenda" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="font-semibold text-[#212121] mb-5" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem" }}>
                      Mes disponibilités
                    </h2>
                    <div className="p-4 rounded-xl mb-4" style={{ background: "#E8F5E9" }}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ background: "#2E7D32" }} aria-hidden="true" />
                        <span className="text-sm font-semibold" style={{ color: "#2E7D32" }}>Statut actuel : Disponible</span>
                      </div>
                      <p className="text-xs" style={{ color: "#2E7D32" }}>Vous acceptez de nouvelles commandes</p>
                    </div>
                    <div className="space-y-3 mb-5">
                      {["Disponible", "Sous 2 semaines", "Occupée"].map((status) => (
                        <button
                          key={status}
                          onClick={() => toast.success(`Statut mis à jour : ${status}`)}
                          className="w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#5E35B1]"
                          style={{ borderColor: status === "Disponible" ? "#5E35B1" : "#E0E0E0" }}
                        >
                          <span className="text-sm font-medium text-[#212121]">{status}</span>
                          {status === "Disponible" && <CheckCircle className="w-5 h-5" style={{ color: "#5E35B1" }} aria-hidden="true" />}
                        </button>
                      ))}
                    </div>
                    <div className="p-4 rounded-xl border border-gray-100" style={{ background: "#F8F9FA" }}>
                      <p className="text-sm font-medium text-[#212121] mb-2">Prochains créneaux</p>
                      {["Lun 22 Jan", "Mar 23 Jan", "Ven 26 Jan"].map((day) => (
                        <div key={day} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                          <span className="text-sm text-[#424242]">{day}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#E8F5E9", color: "#2E7D32" }}>Libre</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Stats */}
              {activeTab === "stats" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="font-semibold text-[#212121] mb-5" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem" }}>
                      Statistiques d'activité
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: "Profil vu", value: "87", change: "+24%", icon: Eye, color: "#5E35B1" },
                        { label: "Demandes reçues", value: "12", change: "+8%", icon: Users, color: "#EC407A" },
                        { label: "Taux d'acceptation", value: "83%", change: "+5%", icon: CheckCircle, color: "#00BCD4" },
                        { label: "Score ML", value: `${couturiere.mlScore}%`, change: "Top 10%", icon: TrendingUp, color: "#F57F17" },
                      ].map((stat, i) => {
                        const StatIcon = stat.icon;
                        return (
                          <div key={i} className="p-4 rounded-2xl border border-gray-100">
                            <StatIcon className="w-5 h-5 mb-2" style={{ color: stat.color }} aria-hidden="true" />
                            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 700, color: "#212121" }}>
                              {stat.value}
                            </p>
                            <p className="text-xs text-[#9E9E9E]">{stat.label}</p>
                            <p className="text-xs font-medium mt-1" style={{ color: "#2E7D32" }}>{stat.change}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h3 className="font-semibold text-[#212121] mb-4">Revenus mensuels</h3>
                    <div className="space-y-3">
                      {[
                        { month: "Janvier 2024", amount: "1 240 €", orders: 4 },
                        { month: "Décembre 2023", amount: "980 €", orders: 3 },
                        { month: "Novembre 2023", amount: "1 560 €", orders: 5 },
                      ].map((row, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                          <div>
                            <p className="font-medium text-[#212121] text-sm">{row.month}</p>
                            <p className="text-xs text-[#9E9E9E]">{row.orders} commandes</p>
                          </div>
                          <p className="font-semibold" style={{ color: "#5E35B1" }}>{row.amount}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
