"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { getAccessToken } from "@/lib/api";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  LayoutDashboard, User, Image, ShoppingBag, Settings, Lock,
  Star, TrendingUp, Package, MessageCircle, Camera, Plus, X,
  Eye, EyeOff, Check, Upload, MapPin, Scissors, Clock, Euro,
  ChevronRight, Award
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const SPECIALTIES_OPTIONS = [
  "Robes", "Tailleurs", "Vêtements de soirée", "Mariage", "Mode africaine",
  "Sportswear", "Maille", "Cuir", "Lingerie", "Enfants", "Retouches", "Sur-mesure"
];

const AVAILABILITY_OPTIONS = [
  { value: "available", label: "Disponible", color: "#2E7D32", bg: "#E8F5E9" },
  { value: "busy", label: "Occupée", color: "#E65100", bg: "#FFF3E0" },
  { value: "vacation", label: "En congé", color: "#1565C0", bg: "#E3F2FD" },
];

export default function CouturiereProfilePage() {
  const { user, refreshUser, updateAvatar } = useAuth();
  const [activeTab, setActiveTab] = useState<"dashboard" | "atelier" | "portfolio" | "commandes" | "settings" | "securite">("dashboard");

  // Atelier
  const [atelierName, setAtelierName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [availability, setAvailability] = useState("available");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [savingAtelier, setSavingAtelier] = useState(false);

  // Portfolio
  const [portfolio, setPortfolio] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Commandes
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    avgRating: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });

  // Sécurité
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "commandes") loadOrders();
  }, [activeTab]);

  useEffect(() => {
    // Charger le profil couturière
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    try {
      const token = getAccessToken();
      const res = await fetch("http://localhost:3001/v1/couturieres/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAtelierName(data.atelierName || "");
        setBio(data.bio || "");
        setCity(data.locationCity || "");
        setRegion(data.locationRegion || "");
        setSpecialties(data.specialties || []);
        setAvailability(data.availabilityStatus || "available");
        setMinPrice(data.pricingMin?.toString() || "");
        setMaxPrice(data.pricingMax?.toString() || "");
        setDeliveryTime(data.deliveryTimeDays?.toString() || "");
        setPortfolio(data.portfolioPhotos || []);
        setStats({
          totalOrders: data.reviewCount || 0,
          completedOrders: data.reviewCount || 0,
          avgRating: data.avgRating || 0,
          totalRevenue: 0,
          pendingOrders: 0,
        });
      }
    } catch {}
  };

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const token = getAccessToken();
      const res = await fetch("http://localhost:3001/v1/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.data || []);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSaveAtelier = async (e: React.FormEvent) => {
  e.preventDefault();
  setSavingAtelier(true);
  try {
    const token = getAccessToken(); 
    const res = await fetch("http://localhost:3001/v1/couturieres/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        atelierName,
        bio,
        locationCity: city,
        locationRegion: region,
        specialties,
        availabilityStatus: availability,
        minPriceEur: minPrice ? Number(minPrice) : undefined,
        maxPriceEur: maxPrice ? Number(maxPrice) : undefined,
        deliveryTimeDays: deliveryTime ? Number(deliveryTime) : undefined,
      }),
    });
    if (res.ok) {
      toast.success("Profil atelier mis à jour !");
    } else {
      const data = await res.json();
      toast.error(data.message?.message || "Erreur lors de la sauvegarde");
    }
  } catch {
    toast.error("Erreur lors de la sauvegarde");
  } finally {
    setSavingAtelier(false);
  }
};
const handleSaveSettings = async (e: React.FormEvent) => {
  e.preventDefault();
  setSavingAtelier(true);
  try {
    const token = getAccessToken();
    const res = await fetch("http://localhost:3001/v1/couturieres/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        availabilityStatus: availability,
        minPriceEur: minPrice ? Number(minPrice) : undefined,
        maxPriceEur: maxPrice ? Number(maxPrice) : undefined,
        deliveryTimeDays: deliveryTime ? Number(deliveryTime) : undefined,
      }),
    });
    if (res.ok) {
      toast.success("Disponibilité et tarifs mis à jour !");
    } else {
      const data = await res.json();
      toast.error(data.message?.message || "Erreur lors de la sauvegarde");
    }
  } catch {
    toast.error("Erreur lors de la sauvegarde");
  } finally {
    setSavingAtelier(false);
  }
};
  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) {
    toast.error("Image trop lourde (max 10MB)");
    return;
  }
  setUploadingPhoto(true);
  try {
    const formData = new FormData();
    formData.append("file", file);
    const token = getAccessToken();
    const res = await fetch("http://localhost:3001/v1/users/me/portfolio", {  // ← nouvel endpoint
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      setPortfolio(prev => [...prev, data.url]);
      toast.success("Photo ajoutée au portfolio !");
    } else {
      toast.error("Erreur lors de l'upload");
    }
  } catch {
    toast.error("Erreur lors de l'upload");
  } finally {
    setUploadingPhoto(false);
    e.target.value = ""; 
  }
};

  const handleRemovePortfolioPhoto = (url: string) => {
    setPortfolio(prev => prev.filter(p => p !== url));
    toast.success("Photo supprimée");
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:3001/v1/users/me/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        updateAvatar(data.avatarUrl);
        toast.success("Photo de profil mise à jour !");
      }
    } catch {
      toast.error("Erreur lors de l'upload");
    }
  };

  const toggleSpecialty = (s: string) => {
    setSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const avatarSrc = avatarPreview || user?.avatarUrl || null;

  const tabs = [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "atelier", label: "Mon atelier", icon: User },
    { id: "portfolio", label: "Portfolio", icon: Image },
    { id: "commandes", label: "Commandes", icon: ShoppingBag },
    { id: "settings", label: "Dispo & Tarifs", icon: Settings },
    { id: "securite", label: "Sécurité", icon: Lock },
  ] as const;

  const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
    completed: { bg: "#E8F5E9", text: "#2E7D32" },
    in_progress: { bg: "#FFF3E0", text: "#E65100" },
    accepted: { bg: "#E3F2FD", text: "#1565C0" },
    pending: { bg: "#F5F5F5", text: "#757575" },
    refused: { bg: "#FFEBEE", text: "#C62828" },
  };

  const STATUS_LABELS: Record<string, string> = {
    completed: "Terminée", in_progress: "En cours",
    accepted: "Acceptée", pending: "En attente",
    refused: "Refusée", cancelled: "Annulée",
  };

  const availObj = AVAILABILITY_OPTIONS.find(a => a.value === availability) || AVAILABILITY_OPTIONS[0];

  return (
    <div className="min-h-screen" style={{ background: "#FAFAFA", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Header />
      <main className="pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Profile header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 p-6 mb-8"
            style={{ background: "linear-gradient(135deg, #1a0533 0%, #2d1057 100%)" }}
          >
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-white text-3xl font-bold"
                  style={{ background: "rgba(255,255,255,0.2)" }}>
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover"
                      onError={() => setAvatarPreview(null)} />
                  ) : (
                    user?.firstName?.charAt(0)?.toUpperCase() || "C"
                  )}
                </div>
                <label htmlFor="avatar-upload"
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer shadow-md"
                  style={{ background: "#EC407A" }}>
                  <Camera className="w-3.5 h-3.5 text-white" />
                </label>
                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h1 className="font-bold text-white" style={{ fontSize: "1.25rem" }}>
                    {atelierName || `${user?.firstName} ${user?.lastName}`}
                  </h1>
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: availObj.bg, color: availObj.color }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: availObj.color }} />
                    {availObj.label}
                  </span>
                </div>
                <p className="text-white/70 text-sm">{user?.email}</p>
                {city && (
                  <div className="flex items-center gap-1 mt-1 text-white/60 text-xs">
                    <MapPin className="w-3 h-3" />
                    {city}{region ? `, ${region}` : ""}
                  </div>
                )}
              </div>

              {/* Stats rapides */}
              <div className="hidden sm:flex items-center gap-6 text-center">
                {[
                  { label: "Avis", value: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—", icon: Star },
                  { label: "Commandes", value: stats.totalOrders, icon: Package },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label}>
                    <Icon className="w-4 h-4 mx-auto mb-1 text-white/60" />
                    <p className="font-bold text-white text-lg">{value}</p>
                    <p className="text-white/60 text-xs">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <nav className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left"
                      style={{
                        background: activeTab === tab.id ? "#EDE7FF" : "transparent",
                        color: activeTab === tab.id ? "#5E35B1" : "#616161",
                      }}>
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Content */}
            <div className="lg:col-span-3">
              <motion.div key={activeTab} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl border border-gray-100 p-6">

                {/* TABLEAU DE BORD */}
                {activeTab === "dashboard" && (
                  <div>
                    <h2 className="font-semibold text-[#212121] mb-6">Tableau de bord</h2>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                      {[
                        { label: "Note moyenne", value: stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)}/5` : "—", icon: Star, color: "#F59E0B", bg: "#FFFBEB" },
                        { label: "Commandes", value: stats.totalOrders, icon: Package, color: "#5E35B1", bg: "#EDE7FF" },
                        { label: "En attente", value: stats.pendingOrders, icon: Clock, color: "#E65100", bg: "#FFF3E0" },
                        { label: "Terminées", value: stats.completedOrders, icon: Check, color: "#2E7D32", bg: "#E8F5E9" },
                      ].map(({ label, value, icon: Icon, color, bg }) => (
                        <div key={label} className="p-4 rounded-2xl border border-gray-100 text-center">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: bg }}>
                            <Icon className="w-5 h-5" style={{ color }} />
                          </div>
                          <p className="font-bold text-[#212121] text-xl">{value}</p>
                          <p className="text-xs text-[#9E9E9E] mt-0.5">{label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Actions rapides */}
                    <h3 className="font-semibold text-[#212121] mb-3">Actions rapides</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { label: "Compléter mon profil atelier", icon: User, action: () => setActiveTab("atelier") },
                        { label: "Ajouter des photos au portfolio", icon: Image, action: () => setActiveTab("portfolio") },
                        { label: "Gérer ma disponibilité", icon: Clock, action: () => setActiveTab("settings") },
                        { label: "Voir mes commandes", icon: ShoppingBag, action: () => setActiveTab("commandes") },
                      ].map(({ label, icon: Icon, action }) => (
                        <button key={label} onClick={action}
                          className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors text-left">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#EDE7FF" }}>
                            <Icon className="w-4 h-4" style={{ color: "#5E35B1" }} />
                          </div>
                          <span className="text-sm font-medium text-[#424242]">{label}</span>
                          <ChevronRight className="w-4 h-4 text-[#9E9E9E] ml-auto" />
                        </button>
                      ))}
                    </div>

                    {/* Complétion du profil */}
                    <div className="mt-6 p-4 rounded-2xl" style={{ background: "linear-gradient(135deg, #EDE7FF, #FCE4EC)" }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-[#212121]">Complétion du profil</p>
                        <span className="text-sm font-bold" style={{ color: "#5E35B1" }}>
                          {Math.round(([atelierName, bio, city, specialties.length > 0, portfolio.length > 0, minPrice].filter(Boolean).length / 6) * 100)}%
                        </span>
                      </div>
                      <div className="bg-white/50 rounded-full h-2">
                        <div className="h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.round(([atelierName, bio, city, specialties.length > 0, portfolio.length > 0, minPrice].filter(Boolean).length / 6) * 100)}%`,
                            background: "linear-gradient(90deg, #5E35B1, #EC407A)",
                          }} />
                      </div>
                      <p className="text-xs text-[#616161] mt-2">
                        Un profil complet attire 3x plus de clients
                      </p>
                    </div>
                  </div>
                )}

                {/* ATELIER */}
                {activeTab === "atelier" && (
                  <form onSubmit={handleSaveAtelier}>
                    <h2 className="font-semibold text-[#212121] mb-5">Mon atelier</h2>
                    <div className="space-y-5">

                      <div>
                        <label className="block text-sm font-medium text-[#212121] mb-1.5">Nom de l'atelier</label>
                        <input type="text" value={atelierName} onChange={e => setAtelierName(e.target.value)}
                          placeholder="Ex: Atelier Marie Couture"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#212121] focus:outline-none focus:ring-2 focus:border-[#5E35B1]" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#212121] mb-1.5">Bio / Description</label>
                        <textarea value={bio} onChange={e => setBio(e.target.value)}
                          placeholder="Décrivez votre atelier, votre style, votre expérience..."
                          rows={4}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#212121] focus:outline-none focus:ring-2 focus:border-[#5E35B1] resize-none" />
                        <p className="text-xs text-[#9E9E9E] mt-1 text-right">{bio.length}/500</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#212121] mb-1.5">Ville</label>
                          <input type="text" value={city} onChange={e => setCity(e.target.value)}
                            placeholder="Paris"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#212121] focus:outline-none focus:ring-2 focus:border-[#5E35B1]" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#212121] mb-1.5">Région</label>
                          <input type="text" value={region} onChange={e => setRegion(e.target.value)}
                            placeholder="Île-de-France"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#212121] focus:outline-none focus:ring-2 focus:border-[#5E35B1]" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#212121] mb-2">
                          Spécialités <span className="text-[#9E9E9E] font-normal">(plusieurs possibles)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {SPECIALTIES_OPTIONS.map(s => (
                            <button key={s} type="button" onClick={() => toggleSpecialty(s)}
                              className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                              style={{
                                borderColor: specialties.includes(s) ? "#5E35B1" : "#E0E0E0",
                                background: specialties.includes(s) ? "#EDE7FF" : "white",
                                color: specialties.includes(s) ? "#5E35B1" : "#616161",
                              }}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button type="submit" disabled={savingAtelier}
                      className="mt-6 px-6 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                      style={{ background: "#5E35B1" }}>
                      {savingAtelier ? "Sauvegarde..." : "Sauvegarder"}
                    </button>
                  </form>
                )}

                {/* PORTFOLIO */}
                {activeTab === "portfolio" && (
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2 className="font-semibold text-[#212121]">Portfolio</h2>
                        <p className="text-sm text-[#9E9E9E] mt-0.5">{portfolio.length} photo{portfolio.length > 1 ? "s" : ""}</p>
                      </div>
                      <label htmlFor="portfolio-upload"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white cursor-pointer"
                        style={{ background: "linear-gradient(135deg, #5E35B1, #EC407A)" }}>
                        {uploadingPhoto ? (
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        Ajouter une photo
                      </label>
                      <input id="portfolio-upload" type="file" accept="image/*" className="hidden" onChange={handlePortfolioUpload} />
                    </div>

                    {portfolio.length === 0 ? (
                      <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#EDE7FF" }}>
                          <Image className="w-8 h-8" style={{ color: "#5E35B1" }} />
                        </div>
                        <p className="font-medium text-[#212121] mb-1">Aucune photo dans votre portfolio</p>
                        <p className="text-sm text-[#9E9E9E] mb-4">Ajoutez vos créations pour attirer plus de clients</p>
                        <label htmlFor="portfolio-upload-empty"
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer"
                          style={{ background: "#5E35B1" }}>
                          <Upload className="w-4 h-4" />
                          Importer des photos
                        </label>
                        <input id="portfolio-upload-empty" type="file" accept="image/*" className="hidden" onChange={handlePortfolioUpload} />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {portfolio.map((url, idx) => (
                          <div key={idx} className="relative group rounded-2xl overflow-hidden aspect-square bg-gray-100">
                            <img src={url} alt={`Portfolio ${idx + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                              <a href={url} target="_blank" rel="noopener noreferrer"
                                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                                <Eye className="w-5 h-5 text-white" />
                              </a>
                              <button type="button" onClick={() => handleRemovePortfolioPhoto(url)}
                                className="p-2 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors">
                                <X className="w-5 h-5 text-white" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {/* Bouton ajouter */}
                        <label htmlFor="portfolio-upload-grid"
                          className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#5E35B1] hover:bg-[#EDE7FF]/30 transition-all">
                          <Plus className="w-8 h-8 text-[#9E9E9E] mb-1" />
                          <span className="text-xs text-[#9E9E9E]">Ajouter</span>
                        </label>
                        <input id="portfolio-upload-grid" type="file" accept="image/*" className="hidden" onChange={handlePortfolioUpload} />
                      </div>
                    )}

                    <div className="mt-4 p-3 rounded-xl bg-blue-50 text-xs text-blue-700">
                      💡 Conseil : Des photos de qualité augmentent vos chances d'être contactée. Montrez vos meilleures créations !
                    </div>
                  </div>
                )}

                {/* COMMANDES */}
                {activeTab === "commandes" && (
                  <div>
                    <h2 className="font-semibold text-[#212121] mb-5">Mes commandes</h2>
                    {loadingOrders ? (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: "#EDE7FF" }} />
                        ))}
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-12">
                        <ShoppingBag className="w-12 h-12 mx-auto mb-3" style={{ color: "#D1C4E9" }} />
                        <p className="text-[#9E9E9E] text-sm mb-2">Aucune commande pour l'instant</p>
                        <p className="text-xs text-[#9E9E9E]">Complétez votre profil pour attirer plus de clients</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders.map((order) => {
                          const s = STATUS_STYLES[order.status] || STATUS_STYLES["pending"];
                          return (
                            <div key={order.id} className="p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                  {order.design?.selectedImageUrl && (
                                    <img src={order.design.selectedImageUrl} alt="" className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm text-[#212121] truncate">
                                    {order.design?.name || "Design sans titre"}
                                  </p>
                                  <p className="text-xs text-[#9E9E9E] mt-0.5">
                                    {order.client?.firstName} {order.client?.lastName} — {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                                  </p>
                                  {order.description && (
                                    <p className="text-xs text-[#616161] mt-1 line-clamp-1">{order.description}</p>
                                  )}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <span className="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                                    style={{ background: s.bg, color: s.text }}>
                                    {STATUS_LABELS[order.status] || order.status}
                                  </span>
                                  {order.agreedAmount && (
                                    <span className="text-sm font-semibold text-[#212121]">
                                      {(order.agreedAmount / 100).toFixed(0)}€
                                    </span>
                                  )}
                                  <Link href="/messages" className="text-xs font-medium" style={{ color: "#5E35B1" }}>
                                    Répondre →
                                  </Link>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* DISPONIBILITÉ & TARIFS */}
                {activeTab === "settings" && (
                <form onSubmit={handleSaveSettings}>
                    <h2 className="font-semibold text-[#212121] mb-5">Disponibilité & Tarifs</h2>
                    <div className="space-y-6">

                      {/* Disponibilité */}
                      <div>
                        <label className="block text-sm font-medium text-[#212121] mb-3">Mon statut</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {AVAILABILITY_OPTIONS.map(opt => (
                            <button key={opt.value} type="button" onClick={() => setAvailability(opt.value)}
                              className="flex items-center gap-3 p-4 rounded-xl border-2 transition-all"
                              style={{
                                borderColor: availability === opt.value ? opt.color : "#E0E0E0",
                                background: availability === opt.value ? opt.bg : "white",
                              }}>
                              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: opt.color }} />
                              <span className="text-sm font-medium" style={{ color: availability === opt.value ? opt.color : "#616161" }}>
                                {opt.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Tarifs */}
                      <div>
                        <label className="block text-sm font-medium text-[#212121] mb-3">
                          <Euro className="w-4 h-4 inline mr-1" />
                          Fourchette de prix
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-[#9E9E9E] mb-1">Prix minimum (€)</label>
                            <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                              placeholder="50"
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#212121] focus:outline-none focus:ring-2 focus:border-[#5E35B1]" />
                          </div>
                          <div>
                            <label className="block text-xs text-[#9E9E9E] mb-1">Prix maximum (€)</label>
                            <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                              placeholder="500"
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#212121] focus:outline-none focus:ring-2 focus:border-[#5E35B1]" />
                          </div>
                        </div>
                      </div>

                      {/* Délai */}
                      <div>
                        <label className="block text-sm font-medium text-[#212121] mb-1.5">
                          <Clock className="w-4 h-4 inline mr-1" />
                          Délai de réalisation (jours)
                        </label>
                        <input type="number" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)}
                          placeholder="14"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#212121] focus:outline-none focus:ring-2 focus:border-[#5E35B1]" />
                        <p className="text-xs text-[#9E9E9E] mt-1">Temps moyen pour réaliser une commande</p>
                      </div>
                    </div>

                    <button type="submit" disabled={savingAtelier}
                      className="mt-6 px-6 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                      style={{ background: "#5E35B1" }}>
                      {savingAtelier ? "Sauvegarde..." : "Sauvegarder"}
                    </button>
                  </form>
                )}

                {/* SÉCURITÉ */}
                {activeTab === "securite" && (
                  <div>
                    <h2 className="font-semibold text-[#212121] mb-5">Sécurité du compte</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#212121] mb-1.5">Mot de passe actuel</label>
                        <div className="relative">
                          <input type={showCurrentPass ? "text" : "password"} value={currentPass}
                            onChange={e => setCurrentPass(e.target.value)}
                            placeholder="Mot de passe actuel"
                            className="w-full px-4 py-2.5 pr-11 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-[#5E35B1]" />
                          <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E9E9E]">
                            {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#212121] mb-1.5">Nouveau mot de passe</label>
                        <div className="relative">
                          <input type={showNewPass ? "text" : "password"} value={newPass}
                            onChange={e => setNewPass(e.target.value)}
                            placeholder="Nouveau mot de passe"
                            className="w-full px-4 py-2.5 pr-11 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-[#5E35B1]" />
                          <button type="button" onClick={() => setShowNewPass(!showNewPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E9E9E]">
                            {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <button
                        className="px-6 py-2.5 rounded-xl text-sm font-medium text-white"
                        style={{ background: "#5E35B1" }}
                        onClick={() => toast.info("Fonctionnalité bientôt disponible")}>
                        Changer le mot de passe
                      </button>
                    </div>
                  </div>
                )}

              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}