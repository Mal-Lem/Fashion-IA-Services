"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { motion } from "framer-motion";
import {
  Star, MapPin, Clock, Euro, Scissors, Award, MessageCircle,
  ChevronLeft, Eye, Heart, Share2, Check
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const AVAILABILITY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  available: { label: "Disponible", color: "#2E7D32", bg: "#E8F5E9" },
  busy: { label: "Occupée", color: "#E65100", bg: "#FFF3E0" },
  vacation: { label: "En congé", color: "#1565C0", bg: "#E3F2FD" },
  on_request: { label: "Sur demande", color: "#6A1B9A", bg: "#F3E5F5" },
};

interface Props {
  id: string;
}

export default function CouturierePublicPage({ id }: Props) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (id) loadProfile();
  }, [id]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const headers: any = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`http://localhost:3001/v1/couturieres/${id}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        router.push("/couturieres");
      }
    } catch {
      router.push("/couturieres");
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    if (!isAuthenticated) {
      toast.error("Connectez-vous pour contacter cette couturière");
      router.push("/login");
      return;
    }
    router.push("/messages");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAFA" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#5E35B1]/20 border-t-[#5E35B1] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#9E9E9E] text-sm">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const avail = AVAILABILITY_LABELS[profile.availabilityStatus] || AVAILABILITY_LABELS["on_request"];
  const photos = Array.isArray(profile.portfolioPhotos) ? profile.portfolioPhotos : [];
  const rating = profile.avgRating ? Number(profile.avgRating).toFixed(1) : null;

  return (
    <div className="min-h-screen" style={{ background: "#FAFAFA", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Header />

      <main className="pt-16">

        {/* Hero banner */}
        <div className="relative h-48 sm:h-64 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1a0533, #2d1057)" }}>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full"
              style={{ background: "#5E35B1", filter: "blur(80px)" }} />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full"
              style={{ background: "#EC407A", filter: "blur(100px)" }} />
          </div>
          {photos[0] && (
            <img src={photos[0]} alt="Couverture" className="w-full h-full object-cover opacity-30" />
          )}
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

          {/* Retour */}
          <div className="pt-4 pb-6">
            <Link href="/couturieres"
              className="inline-flex items-center gap-2 text-sm text-[#616161] hover:text-[#212121] transition-colors">
              <ChevronLeft className="w-4 h-4" />
              Retour aux couturières
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Colonne gauche */}
            <div className="lg:col-span-1 space-y-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto flex items-center justify-center text-white text-3xl font-bold"
                    style={{ background: "linear-gradient(135deg, #5E35B1, #EC407A)" }}>
                    {profile.user?.avatarUrl ? (
                      <img src={profile.user.avatarUrl} alt={profile.atelierName} className="w-full h-full object-cover" />
                    ) : (
                      profile.atelierName?.charAt(0)?.toUpperCase() || "C"
                    )}
                  </div>
                  {profile.isCertified && (
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: "#5E35B1" }}>
                      <Award className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                <h1 className="font-bold text-[#212121] mb-1"
                  style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem" }}>
                  {profile.atelierName}
                </h1>
                <p className="text-sm text-[#616161] mb-3">{profile.user?.firstName} {profile.user?.lastName}</p>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4"
                  style={{ background: avail.bg, color: avail.color }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: avail.color }} />
                  {avail.label}
                </span>

                {rating && (
                  <div className="flex items-center justify-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className="w-4 h-4"
                        style={{ color: i <= Math.round(Number(rating)) ? "#F59E0B" : "#E0E0E0",
                          fill: i <= Math.round(Number(rating)) ? "#F59E0B" : "none" }} />
                    ))}
                    <span className="text-sm font-semibold text-[#212121] ml-1">{rating}</span>
                    <span className="text-xs text-[#9E9E9E]">({profile.reviewCount} avis)</span>
                  </div>
                )}

                <div className="space-y-3">
                  <button onClick={handleContact}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all"
                    style={{ background: "linear-gradient(135deg, #5E35B1, #EC407A)" }}>
                    <MessageCircle className="w-4 h-4" />
                    Contacter
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => setLiked(!liked)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50"
                      style={{ color: liked ? "#EC407A" : "#616161" }}>
                      <Heart className="w-4 h-4" style={{ fill: liked ? "#EC407A" : "none" }} />
                      {liked ? "Sauvegardé" : "Sauvegarder"}
                    </button>
                    <button
                      onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Lien copié !"); }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 text-[#616161]">
                      <Share2 className="w-4 h-4" />
                      Partager
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Infos pratiques */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <h3 className="font-semibold text-[#212121] text-sm">Informations pratiques</h3>

                {(profile.locationCity || profile.locationRegion) && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#EDE7FF" }}>
                      <MapPin className="w-4 h-4" style={{ color: "#5E35B1" }} />
                    </div>
                    <div>
                      <p className="text-xs text-[#9E9E9E]">Localisation</p>
                      <p className="text-sm font-medium text-[#212121]">
                        {profile.locationCity}{profile.locationRegion ? `, ${profile.locationRegion}` : ""}
                      </p>
                    </div>
                  </div>
                )}

                {(profile.pricingMin || profile.pricingMax) && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#EDE7FF" }}>
                      <Euro className="w-4 h-4" style={{ color: "#5E35B1" }} />
                    </div>
                    <div>
                      <p className="text-xs text-[#9E9E9E]">Tarifs</p>
                      <p className="text-sm font-medium text-[#212121]">
                        {profile.pricingMin && profile.pricingMax
                          ? `${profile.pricingMin}€ — ${profile.pricingMax}€`
                          : profile.pricingMin ? `À partir de ${profile.pricingMin}€`
                          : `Jusqu'à ${profile.pricingMax}€`}
                      </p>
                    </div>
                  </div>
                )}

                {profile.deliveryTimeDays && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#EDE7FF" }}>
                      <Clock className="w-4 h-4" style={{ color: "#5E35B1" }} />
                    </div>
                    <div>
                      <p className="text-xs text-[#9E9E9E]">Délai moyen</p>
                      <p className="text-sm font-medium text-[#212121]">{profile.deliveryTimeDays} jours</p>
                    </div>
                  </div>
                )}

                {profile.experienceYears && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#EDE7FF" }}>
                      <Scissors className="w-4 h-4" style={{ color: "#5E35B1" }} />
                    </div>
                    <div>
                      <p className="text-xs text-[#9E9E9E]">Expérience</p>
                      <p className="text-sm font-medium text-[#212121]">{profile.experienceYears} ans</p>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Spécialités */}
              {profile.specialties?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="font-semibold text-[#212121] text-sm mb-3">Spécialités</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.specialties.map((s: string) => (
                      <span key={s} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                        style={{ background: "#EDE7FF", color: "#5E35B1" }}>
                        <Check className="w-3 h-3" />
                        {s}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Colonne droite */}
            <div className="lg:col-span-2 space-y-6">
              {profile.bio && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="font-semibold text-[#212121] mb-3">À propos</h2>
                  <p className="text-[#616161] leading-relaxed text-sm">{profile.bio}</p>
                </motion.div>
              )}

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-[#212121]">Portfolio</h2>
                  <span className="text-sm text-[#9E9E9E]">{photos.length} création{photos.length > 1 ? "s" : ""}</span>
                </div>

                {photos.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
                    <Scissors className="w-12 h-12 mx-auto mb-3" style={{ color: "#D1C4E9" }} />
                    <p className="text-[#9E9E9E] text-sm">Portfolio en cours de construction</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {photos.map((url: string, idx: number) => (
                      <button key={idx} onClick={() => setSelectedPhoto(url)}
                        className="relative group rounded-2xl overflow-hidden aspect-square bg-gray-100 hover:opacity-90 transition-opacity">
                        <img src={url} alt={`Création ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="rounded-2xl p-6 text-center"
                style={{ background: "linear-gradient(135deg, #EDE7FF, #FCE4EC)" }}>
                <h3 className="font-semibold text-[#212121] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Ce profil vous intéresse ?
                </h3>
                <p className="text-sm text-[#616161] mb-4">
                  Contactez {profile.user?.firstName} pour discuter de votre projet sur-mesure.
                </p>
                <button onClick={handleContact}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #5E35B1, #EC407A)" }}>
                  <MessageCircle className="w-4 h-4" />
                  Envoyer un message
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.9)" }}
          onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedPhoto(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm">
              Fermer ✕
            </button>
            <img src={selectedPhoto} alt="Création" className="w-full rounded-2xl object-contain max-h-[80vh]" />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}