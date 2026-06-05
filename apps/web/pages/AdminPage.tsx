"use client";

import { useState } from "react";
import Link from "next/link";;
import { Header } from "@/components/shared/Header";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users,
  Scissors,
  Shield,
  Flag,
  BarChart2,
  TrendingUp,
  Eye,
  Check,
  X,
  Search,
  ChevronRight,
  AlertTriangle,
  Crown,
  Sparkles,
} from "lucide-react";
import { COUTURIERES, STATS } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";

const PENDING_COUTURIERES = [
  { id: "p1", name: "Yasmine Karim", specialty: "Haute couture", location: "Toulouse", date: "2024-01-20", siret: "12345678901234" },
  { id: "p2", name: "Nathalie Moreau", specialty: "Maille & tricot", location: "Nice", date: "2024-01-19", siret: "98765432109876" },
  { id: "p3", name: "Laetitia Brun", specialty: "Prêt-à-porter", location: "Strasbourg", date: "2024-01-18", siret: "45678901234567" },
];

const REPORTS = [
  { id: "r1", type: "Profil incorrect", target: "Marie Dupont", reporter: "Client A.", date: "2024-01-20", status: "En attente" },
  { id: "r2", type: "Message inapproprié", target: "Fatima Benali", reporter: "Client B.", date: "2024-01-18", status: "Résolu" },
  { id: "r3", type: "Faux avis", target: "Isabelle Martin", reporter: "Client C.", date: "2024-01-15", status: "En attente" },
];

const KPI_CARDS = [
  { label: "Utilisateurs totaux", value: "3 420", icon: Users, color: "#5E35B1", bg: "#EDE7FF", change: "+8.2%" },
  { label: "Couturières actives", value: String(STATS.couturieres), icon: Scissors, color: "#EC407A", bg: "#FCE4EC", change: "+12%" },
  { label: "Designs générés", value: STATS.designs.toLocaleString("fr-FR"), icon: Sparkles, color: "#00BCD4", bg: "#E0F7FA", change: "+23%" },
  { label: "Commandes ce mois", value: "248", icon: TrendingUp, color: "#F57F17", bg: "#FFF8E1", change: "+15%" },
  { label: "Revenus plateforme", value: "12 480 €", icon: Crown, color: "#2E7D32", bg: "#E8F5E9", change: "+18%" },
  { label: "Signalements actifs", value: "3", icon: Flag, color: "#C62828", bg: "#FFEBEE", change: "-2 vs sem." },
];

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "couturieres" | "signalements" | "stats">("dashboard");
  const [pendingCouturieres, setPendingCouturieres] = useState(PENDING_COUTURIERES);
  const [allCouturieres, setAllCouturieres] = useState(COUTURIERES);
  const [search, setSearch] = useState("");
  const [reports, setReports] = useState(REPORTS);

  const handleCertify = (id: string, name: string) => {
    setPendingCouturieres((prev) => prev.filter((c) => c.id !== id));
    toast.success(`${name} a été certifiée avec succès !`);
  };

  const handleRejectCertif = (id: string, name: string) => {
    setPendingCouturieres((prev) => prev.filter((c) => c.id !== id));
    toast.error(`Dossier de ${name} refusé.`);
  };

  const handleResolveReport = (id: string) => {
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: "Résolu" } : r));
    toast.success("Signalement marqué comme résolu");
  };

  const filteredCouturieres = allCouturieres.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.specialty.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "users", label: "Utilisateurs", icon: Users },
    { id: "couturieres", label: "Couturières", icon: Scissors, badge: pendingCouturieres.length },
    { id: "signalements", label: "Signalements", icon: Flag, badge: reports.filter((r) => r.status === "En attente").length },
    { id: "stats", label: "KPIs", icon: BarChart2 },
  ] as const;

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAFA" }}>
        <Header />
        <div className="text-center mt-16">
          <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: "#9E9E9E" }} aria-hidden="true" />
          <h1 className="text-xl font-semibold text-[#212121] mb-2">Accès restreint</h1>
          <p className="text-[#616161] mb-4">Vous n'avez pas les droits pour accéder à cette page.</p>
          <Link href="/" className="px-5 py-2.5 rounded-xl font-medium text-white" style={{ background: "#5E35B1" }}>
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#FAFAFA", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Header />

      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Admin header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl mb-8 p-6 flex items-center justify-between"
            style={{ background: "linear-gradient(135deg, #1a0533, #2d1057)" }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#5E35B1" }}>
                <Shield className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.375rem", fontWeight: 700, color: "white" }}>
                  Administration
                </h1>
                <p className="text-white/60 text-sm">Connecté en tant que {user?.name}</p>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold text-white" style={{ background: "#EC407A" }}>
              Admin
            </span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <nav aria-label="Navigation admin" className="lg:col-span-1">
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    {KPI_CARDS.map((kpi, i) => {
                      const KpiIcon = kpi.icon;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="bg-white rounded-2xl border border-gray-100 p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: kpi.bg }}>
                              <KpiIcon className="w-4 h-4" style={{ color: kpi.color }} aria-hidden="true" />
                            </div>
                            <span className="text-xs font-medium" style={{ color: kpi.change.startsWith("-") ? "#C62828" : "#2E7D32" }}>
                              {kpi.change}
                            </span>
                          </div>
                          <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.375rem", color: "#212121" }}>
                            {kpi.value}
                          </p>
                          <p className="text-xs text-[#9E9E9E]">{kpi.label}</p>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Pending certifications alert */}
                  {pendingCouturieres.length > 0 && (
                    <div className="p-4 rounded-2xl flex items-center gap-3" style={{ background: "#FFF3E0" }}>
                      <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: "#E65100" }} aria-hidden="true" />
                      <div className="flex-1">
                        <p className="font-medium text-sm" style={{ color: "#E65100" }}>
                          {pendingCouturieres.length} demande{pendingCouturieres.length > 1 ? "s" : ""} de certification en attente
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab("couturieres")}
                        className="text-xs font-medium flex items-center gap-1 focus:outline-none"
                        style={{ color: "#E65100" }}
                      >
                        Voir <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Users */}
              {activeTab === "users" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="font-semibold text-[#212121] mb-5" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem" }}>
                      Gestion des utilisateurs
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left py-3 px-2 text-xs font-semibold text-[#9E9E9E] uppercase tracking-wide">Utilisateur</th>
                            <th className="text-left py-3 px-2 text-xs font-semibold text-[#9E9E9E] uppercase tracking-wide">Rôle</th>
                            <th className="text-left py-3 px-2 text-xs font-semibold text-[#9E9E9E] uppercase tracking-wide">Plan</th>
                            <th className="text-left py-3 px-2 text-xs font-semibold text-[#9E9E9E] uppercase tracking-wide">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { name: "Sophie Moreau", email: "client@test.com", role: "Client", plan: "Gratuit", active: true },
                            { name: "Marie Dupont", email: "pro@test.com", role: "Couturière", plan: "Pro", active: true },
                            { name: "Admin Platform", email: "admin@test.com", role: "Admin", plan: "–", active: true },
                            { name: "Amina Khalil", email: "amina@test.com", role: "Client", plan: "Premium", active: false },
                          ].map((u, i) => (
                            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                              <td className="py-3 px-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: "#5E35B1" }}>
                                    {u.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-medium text-[#212121]">{u.name}</p>
                                    <p className="text-xs text-[#9E9E9E]">{u.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-2 text-[#424242]">{u.role}</td>
                              <td className="py-3 px-2">
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{
                                  background: u.plan === "Premium" ? "#EDE7FF" : u.plan === "Pro" ? "#FCE4EC" : "#F5F5F5",
                                  color: u.plan === "Premium" ? "#5E35B1" : u.plan === "Pro" ? "#EC407A" : "#757575"
                                }}>
                                  {u.plan}
                                </span>
                              </td>
                              <td className="py-3 px-2">
                                <button
                                  onClick={() => toast.success(`Action effectuée sur ${u.name}`)}
                                  className="text-xs font-medium text-[#5E35B1] hover:underline focus:outline-none"
                                >
                                  {u.active ? "Suspendre" : "Réactiver"}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Couturieres management */}
              {activeTab === "couturieres" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  {/* Pending */}
                  {pendingCouturieres.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                      <h2 className="font-semibold text-[#212121] mb-4" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.125rem" }}>
                        Demandes de certification ({pendingCouturieres.length})
                      </h2>
                      <div className="space-y-4">
                        {pendingCouturieres.map((c) => (
                          <div key={c.id} className="flex items-center gap-4 p-4 rounded-xl border border-orange-100" style={{ background: "#FFFBF0" }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: "#5E35B1" }}>
                              {c.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-[#212121]">{c.name}</p>
                              <p className="text-xs text-[#9E9E9E]">{c.specialty} · {c.location} · SIRET: {c.siret}</p>
                              <p className="text-xs text-[#9E9E9E]">Demande du {c.date}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleCertify(c.id, c.name)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#5E35B1]"
                                style={{ background: "#5E35B1" }}
                              >
                                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                                Certifier
                              </button>
                              <button
                                onClick={() => handleRejectCertif(c.id, c.name)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-red-200 text-[#C62828] hover:bg-red-50 focus:outline-none"
                              >
                                <X className="w-3.5 h-3.5" aria-hidden="true" />
                                Refuser
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certified */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="font-semibold text-[#212121]" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.125rem" }}>
                        Couturières certifiées
                      </h2>
                      <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9E9E9E]" aria-hidden="true" />
                        <input
                          type="search"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Rechercher..."
                          className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-[#212121] focus:outline-none focus:ring-2 focus:border-[#5E35B1]"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      {filteredCouturieres.map((c) => (
                        <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                          <img src={c.image} alt={c.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-[#212121] text-sm">{c.name}</p>
                              {c.certified && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ background: "#5E35B1" }}>✓</span>
                              )}
                            </div>
                            <p className="text-xs text-[#9E9E9E]">{c.specialty} · {c.location}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-[#424242]">⭐ {c.rating}</span>
                            <Link
                              href={`/couturieres/${c.id}`}
                              className="p-1.5 rounded-lg text-[#9E9E9E] hover:text-[#5E35B1] hover:bg-[#EDE7FF] transition-colors focus:outline-none"
                              aria-label={`Voir profil de ${c.name}`}
                            >
                              <Eye className="w-4 h-4" aria-hidden="true" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Reports */}
              {activeTab === "signalements" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="font-semibold text-[#212121] mb-5" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem" }}>
                      Signalements
                    </h2>
                    <div className="space-y-4">
                      {reports.map((report) => (
                        <div
                          key={report.id}
                          className="flex items-start gap-4 p-4 rounded-xl border"
                          style={{ borderColor: report.status === "En attente" ? "#FFB74D" : "#E0E0E0", background: report.status === "En attente" ? "#FFFBF0" : "#FAFAFA" }}
                        >
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: report.status === "En attente" ? "#FFF3E0" : "#F5F5F5" }}>
                            <Flag className="w-4 h-4" style={{ color: report.status === "En attente" ? "#E65100" : "#9E9E9E" }} aria-hidden="true" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                              <p className="font-semibold text-[#212121] text-sm">{report.type}</p>
                              <span
                                className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                                style={{ background: report.status === "En attente" ? "#FFF3E0" : "#E8F5E9", color: report.status === "En attente" ? "#E65100" : "#2E7D32" }}
                              >
                                {report.status}
                              </span>
                            </div>
                            <p className="text-xs text-[#9E9E9E]">Signalé par {report.reporter} contre {report.target} · {report.date}</p>
                            {report.status === "En attente" && (
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => handleResolveReport(report.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#5E35B1]"
                                  style={{ background: "#5E35B1" }}
                                >
                                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                                  Résoudre
                                </button>
                                <button
                                  onClick={() => toast.success("Utilisateur averti")}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-[#424242] hover:bg-gray-50 focus:outline-none"
                                >
                                  Avertir
                                </button>
                              </div>
                            )}
                          </div>
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
                      Indicateurs clés de performance
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { label: "Taux de conversion inscription → commande", value: "18.4%", trend: "+2.1%" },
                        { label: "Temps moyen avant 1ère commande", value: "4.2 jours", trend: "-1.3j" },
                        { label: "Taux de satisfaction couturières", value: "94.2%", trend: "+0.8%" },
                        { label: "NPS (Net Promoter Score)", value: "72", trend: "+5 pts" },
                        { label: "Rétention mensuelle utilisateurs", value: "76%", trend: "+3.2%" },
                        { label: "Revenu mensuel récurrent (MRR)", value: "8 920 €", trend: "+12%" },
                      ].map((kpi, i) => (
                        <div key={i} className="p-4 rounded-xl border border-gray-100">
                          <p className="text-sm text-[#616161] mb-1">{kpi.label}</p>
                          <div className="flex items-end gap-3">
                            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 700, color: "#212121" }}>
                              {kpi.value}
                            </p>
                            <p className="text-xs font-medium mb-1" style={{ color: "#2E7D32" }}>{kpi.trend}</p>
                          </div>
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
    </div>
  );
}
