"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";;
import { Header } from "@/components/shared/Header";
import { ZoomIn, Download, Check, ChevronLeft, ChevronRight, X, Share2, BookmarkPlus, ArrowRight, RefreshCw, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
// import { IMAGES } from "@/data/mockData";


export default function ResultsPage() {
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [generatedDesigns, setGeneratedDesigns] = useState<{ id: number; image: string; label: string }[]>([]);
  const [designId, setDesignId] = useState<string | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [designName, setDesignName] = useState("Mon design #1");
  const [designParams, setDesignParams] = useState<Record<string, unknown>>({});
  const [shaking, setShaking] = useState(false);
  const router = useRouter();

  useEffect(() => {
  const storedParams = sessionStorage.getItem("designParams");
  const storedResult = sessionStorage.getItem("designResult");

  if (storedParams) setDesignParams(JSON.parse(storedParams));

  if (storedResult) {
    const result = JSON.parse(storedResult);
    const images = result.images || result.urls || [];
    setDesignId(result.designId);
    setGeneratedDesigns(
      images.map((img: string, i: number) => ({
        id: i + 1,
        image: img,
        label: `Variante ${i + 1}`,
      }))
    );
  }

  const t = setTimeout(() => setLoading(false), 1000);
  return () => clearTimeout(t);
}, []);

  const handleSelect = (id: number) => {
    setSelected(id);
    setTimeout(() => {
      document.getElementById("action-zone")?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  const handleSave = async (id: number) => {
  if (!designId) return;
  try {
    const { designsApi } = await import("@/lib/api");
    const selectedImage = generatedDesigns.find(d => d.id === id)?.image;
    if (selectedImage) {
      await designsApi.select(designId, selectedImage);
      await designsApi.update(designId, { name: designName, isSaved: true });
    }
    toast.success("Sauvegardé dans Mes designs !");
  } catch {
    toast.error("Erreur lors de la sauvegarde");
  }
};

  const handleContinue = () => {
    if (!selected) {
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
      return;
    }
    if (designId) {
  router.push(`/couturieres?designId=${designId}`);
    } else {
  router.push("/couturieres");
      }
  };

  const paramTags = designParams.mode === "form"
    ? [
        designParams.type as string,
        designParams.style as string,
        ...((designParams.couleurs as string[]) || []),
        designParams.tissu as string,
        designParams.coupe as string,
        designParams.occasion as string,
      ].filter(Boolean)
    : [(designParams.prompt as string)?.slice(0, 40) + "..."].filter(Boolean);

  const lightboxDesign = lightboxIdx !== null ? generatedDesigns[lightboxIdx] : null;

  return (
    <div className="min-h-screen" style={{ background: "#FAFAFA", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Header />

      {/* Lightbox */}
      {lightboxDesign && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.9)" }}
          role="dialog"
          aria-modal="true"
          aria-label={`Vue agrandie - ${lightboxDesign.label}`}
          onClick={() => setLightboxIdx(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            onClick={() => setLightboxIdx(null)}
            aria-label="Fermer"
          >
            <X className="w-5 h-5 text-white" aria-hidden="true" />
          </button>
          <button
            className="absolute left-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => i !== null ? (i - 1 + generatedDesigns.length) % generatedDesigns.length : 0); }}
            aria-label="Image précédente"
          >
            <ChevronLeft className="w-5 h-5 text-white" aria-hidden="true" />
          </button>
          <img
            src={lightboxDesign.image}
            alt={lightboxDesign.label}
            className="max-h-screen max-w-4xl w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => i !== null ? (i + 1) % generatedDesigns.length : 0); }}
            aria-label="Image suivante"
          >
            <ChevronRight className="w-5 h-5 text-white" aria-hidden="true" />
          </button>
        </div>
      )}

      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="py-6 border-b border-gray-100">
            <nav aria-label="Fil d'Ariane">
              <ol className="flex items-center gap-2 text-xs text-[#9E9E9E] mb-2">
                <li><Link href="/" className="hover:text-[#616161]">Accueil</Link></li>
                <li>/</li>
                <li><Link href="/create" className="hover:text-[#616161]">Créer</Link></li>
                <li>/</li>
                <li className="text-[#5E35B1]" aria-current="page">Résultats</li>
              </ol>
            </nav>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.75rem", fontWeight: 700, color: "#212121" }}>
                  Voici vos 4 designs générés par IA
                </h1>
                <p className="text-[#616161] text-sm mt-1">Sélectionnez votre préféré pour trouver les couturières disponibles</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm" style={{ background: "#FFF3E0", color: "#E65100" }}>
                <Clock className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                Ces designs sont disponibles pendant 24 heures
              </div>
            </div>
            {/* Param tags */}
            {paramTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {paramTags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: "#EDE7FF", color: "#5E35B1" }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Design grid */}
            <div className="lg:col-span-2">
              <motion.div
                animate={shaking ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-2 gap-4"
                role="group"
                aria-label="Designs générés"
              >
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="rounded-2xl overflow-hidden" style={{ height: "340px" }}>
                        <div className="w-full h-full animate-pulse" style={{ background: "linear-gradient(90deg, #EDE7FF 25%, #D1C4E9 50%, #EDE7FF 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} aria-hidden="true" />
                      </div>
                    ))
                  : generatedDesigns.map((design, idx) => (
                      <motion.div
                        key={design.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.15 }}
                        className="relative group rounded-2xl overflow-hidden cursor-pointer"
                        style={{
                          height: "340px",
                          outline: selected === design.id ? "3px solid #5E35B1" : "3px solid transparent",
                          outlineOffset: "2px",
                          boxShadow: selected === design.id ? "0 0 0 4px rgba(94,53,177,0.15)" : "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                        onClick={() => handleSelect(design.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && handleSelect(design.id)}
                        aria-pressed={selected === design.id}
                        aria-label={`${design.label}${selected === design.id ? " (sélectionné)" : ""}`}
                      >
                        <img src={design.image} alt={design.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3" aria-hidden="true">
                          <button
                            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/40 transition-colors"
                            onClick={(e) => { e.stopPropagation(); setLightboxIdx(idx); }}
                            aria-label={`Agrandir ${design.label}`}
                          >
                            <ZoomIn className="w-5 h-5 text-white" />
                          </button>
                          <button
                            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/40 transition-colors"
                            onClick={(e) => { e.stopPropagation(); handleSave(design.id); }}
                            aria-label={`Sauvegarder ${design.label}`}
                          >
                            <BookmarkPlus className="w-5 h-5 text-white" />
                          </button>
                          <button
                            className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
                            style={{ background: "#5E35B1" }}
                            onClick={(e) => { e.stopPropagation(); handleSelect(design.id); }}
                            aria-label={`Sélectionner ${design.label}`}
                          >
                            <Check className="w-5 h-5 text-white" />
                          </button>
                        </div>

                        {/* Selected badge */}
                        {selected === design.id && (
                          <div className="absolute top-3 right-3">
                            <span className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg" style={{ background: "#5E35B1" }} aria-hidden="true">
                              <Check className="w-4 h-4 text-white" />
                            </span>
                          </div>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 p-3" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }}>
                          <span className="text-white text-xs font-medium">{design.label}</span>
                        </div>
                      </motion.div>
                    ))}
              </motion.div>

              {/* Bottom actions */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => { generatedDesigns.forEach((d) => handleSave(d.id)); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-[#424242] hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5E35B1]"
                >
                  <BookmarkPlus className="w-4 h-4" aria-hidden="true" />
                  Tout sauvegarder
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSave(1)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-[#424242] hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5E35B1]"
                    aria-label="Partager les designs"
                  >
                    <Share2 className="w-4 h-4" aria-hidden="true" />
                    Partager
                  </button>
                  <Link
                    href="/create"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-[#424242] hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5E35B1]"
                  >
                    <RefreshCw className="w-4 h-4" aria-hidden="true" />
                    Régénérer
                  </Link>
                </div>
              </div>
            </div>

            {/* Right panel */}
            <aside className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-semibold text-[#212121] mb-4">Paramètres utilisés</h2>
                {paramTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {paramTags.map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: "#EDE7FF", color: "#5E35B1" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#9E9E9E]">Paramètres non disponibles</p>
                )}
                <Link
                  href="/create"
                  className="flex items-center gap-2 w-full justify-center py-2.5 rounded-xl border border-gray-200 text-sm text-[#424242] hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5E35B1]"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  Modifier un paramètre
                </Link>
              </div>

              {/* Selection + name */}
              {selected && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border-2 p-6"
                  style={{ borderColor: "#5E35B1" }}
                >
                  <p className="text-sm font-semibold text-[#5E35B1] mb-3">
                    ✓ Design sélectionné
                  </p>
                  <label htmlFor="design-name" className="block text-sm font-medium text-[#212121] mb-1.5">
                    Nom du design
                  </label>
                  <input
                    id="design-name"
                    type="text"
                    value={designName}
                    onChange={(e) => setDesignName(e.target.value)}
                    maxLength={50}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-[#212121] focus:outline-none focus:ring-2 focus:border-[#5E35B1] mb-4"
                    placeholder="Mon design #1"
                  />
                  <button
                    onClick={() => handleSave(selected)}
                    className="flex items-center gap-2 w-full justify-center py-2.5 rounded-xl border border-gray-200 text-sm text-[#424242] hover:bg-gray-50 mb-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5E35B1]"
                  >
                    <Download className="w-4 h-4" aria-hidden="true" />
                    Sauvegarder ce design
                  </button>
                </motion.div>
              )}

              {/* CTA zone */}
              <div id="action-zone">
                <button
                  onClick={handleContinue}
                  disabled={!selected}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-white transition-all focus:outline-none focus:ring-4 focus:ring-[#5E35B1]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg, #5E35B1, #EC407A)", fontSize: "1rem" }}
                  title={!selected ? "Sélectionnez d'abord un design" : undefined}
                >
                  Trouver une couturière →
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </button>
                {!selected && (
                  <p className="text-xs text-center text-[#9E9E9E] mt-2">
                    Sélectionnez d'abord un design ci-dessus
                  </p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
