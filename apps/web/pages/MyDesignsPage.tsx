"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { Plus, Search, Grid, List, MoreHorizontal, Trash2, RefreshCw, Send, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: "#F5F5F5", text: "#757575", label: "Brouillon" },
  sent: { bg: "#E3F2FD", text: "#1565C0", label: "Envoye" },
  in_progress: { bg: "#FFF3E0", text: "#E65100", label: "En cours" },
  completed: { bg: "#E8F5E9", text: "#2E7D32", label: "Realise" },
};

export default function MyDesignsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDesign, setSelectedDesign] = useState<any | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const { designsApi } = await import("@/lib/api");
        const result = await designsApi.getAll(1, 50);
        setDesigns(result.data || []);
        setTotal(result.total || 0);
      } catch {
        setDesigns([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = designs.filter((d) => {
    const matchSearch =
      !searchQuery ||
      d.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  const handleDelete = async (id: string) => {
    try {
      const { designsApi } = await import("@/lib/api");
      await designsApi.remove(id);
      setDesigns((prev) => prev.filter((d) => d.id !== id));
      setConfirmDelete(null);
      if (selectedDesign?.id === id) setSelectedDesign(null);
      toast.success("Design supprime");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleRename = async (id: string, name: string) => {
    try {
      const { designsApi } = await import("@/lib/api");
      await designsApi.update(id, { name });
      setDesigns((prev) => prev.map((d) => (d.id === id ? { ...d, name } : d)));
      toast.success("Design renomme");
    } catch {
      toast.error("Erreur lors du renommage");
    }
  };

  const getImage = (design: any) =>
    design.selectedImageUrl ||
    design.thumbnailUrl ||
    design.generatedImages?.[0] ||
    "https://placehold.co/400x500/EDE7FF/5E35B1?text=Design";

  const getParamTags = (design: any) => {
    const p = design.promptJson || {};
    return [p.type, p.style, ...(p.colors || []), p.fabric, p.occasion].filter(Boolean);
  };

  return (
    <div className="min-h-screen" style={{ background: "#FAFAFA", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Header />

      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6">
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.75rem", fontWeight: 700, color: "#212121" }}>
                Mes designs
              </h1>
              <p className="text-sm text-[#616161] mt-1">{total} designs sauvegardes</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9E9E]" aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un design..."
                  className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#212121] focus:outline-none focus:ring-2 focus:border-[#5E35B1] bg-white w-56"
                />
              </div>
              <div className="flex items-center rounded-xl border border-gray-200 bg-white overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className="p-2.5 transition-colors"
                  style={{ background: viewMode === "grid" ? "#EDE7FF" : "white", color: viewMode === "grid" ? "#5E35B1" : "#9E9E9E" }}
                  aria-label="Vue grille"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className="p-2.5 transition-colors"
                  style={{ background: viewMode === "list" ? "#EDE7FF" : "white", color: viewMode === "list" ? "#5E35B1" : "#9E9E9E" }}
                  aria-label="Vue liste"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <Link
                href="/create"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-white"
                style={{ background: "linear-gradient(135deg, #5E35B1, #EC407A)" }}
              >
                <Plus className="w-4 h-4" />
                Nouveau design
              </Link>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                  <div className="animate-pulse" style={{ height: "240px", background: "linear-gradient(90deg, #EDE7FF 25%, #D1C4E9 50%, #EDE7FF 75%)" }} />
                  <div className="p-3 space-y-2">
                    <div className="h-3 rounded animate-pulse" style={{ background: "#EDE7FF", width: "70%" }} />
                    <div className="h-3 rounded animate-pulse" style={{ background: "#EDE7FF", width: "40%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#EDE7FF" }}>
                <Wand2 className="w-8 h-8" style={{ color: "#5E35B1" }} />
              </div>
              <h2 className="font-semibold text-[#212121] mb-2">Aucun design pour l'instant</h2>
              <p className="text-sm text-[#9E9E9E] mb-6 max-w-xs">
                {searchQuery ? "Aucun design ne correspond a votre recherche." : "Commencez par creer votre premier design avec notre IA."}
              </p>
              <Link
                href="/create"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white"
                style={{ background: "#5E35B1" }}
              >
                <Wand2 className="w-4 h-4" />
                Creer mon premier design
              </Link>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((design) => {
                const status = STATUS_STYLES[design.status] || STATUS_STYLES["draft"];
                return (
                  <motion.div
                    key={design.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-all cursor-pointer relative"
                    onClick={() => setSelectedDesign(design)}
                  >
                    <div className="relative overflow-hidden" style={{ height: "240px" }}>
                      <img
                        src={getImage(design)}
                        alt={design.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === design.id ? null : design.id); }}
                          className="w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="w-4 h-4 text-[#424242]" />
                        </button>
                        <AnimatePresence>
                          {openMenu === design.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-0 top-9 bg-white rounded-xl shadow-lg border border-gray-100 py-1 w-44 z-10"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Link
                                href="/create"
                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#424242] hover:bg-gray-50"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Utiliser comme base
                              </Link>
                              <Link
                                href="/couturieres"
                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#424242] hover:bg-gray-50"
                              >
                                <Send className="w-3.5 h-3.5" />
                                Envoyer a couturiere
                              </Link>
                              <button
                                onClick={() => { setConfirmDelete(design.id); setOpenMenu(null); }}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm w-full text-left hover:bg-red-50"
                                style={{ color: "#C62828" }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Supprimer
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-sm text-[#212121] truncate">{design.name}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs text-[#9E9E9E]">
                          {new Date(design.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: status.bg, color: status.text }}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((design) => {
                const status = STATUS_STYLES[design.status] || STATUS_STYLES["draft"];
                const tags = getParamTags(design);
                return (
                  <motion.div
                    key={design.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => setSelectedDesign(design)}
                  >
                    <div className="w-16 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={getImage(design)} alt={design.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-[#212121] truncate">{design.name}</p>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0" style={{ background: status.bg, color: status.text }}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {tags.slice(0, 4).map((tag: string) => (
                          <span key={tag} className="px-2 py-0.5 rounded-full text-xs" style={{ background: "#EDE7FF", color: "#5E35B1" }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-[#9E9E9E] mt-1.5">
                        {new Date(design.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        href="/couturieres"
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                        style={{ background: "#5E35B1" }}
                      >
                        Envoyer
                      </Link>
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(design.id); }}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" style={{ color: "#C62828" }} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Design detail panel */}
      <AnimatePresence>
        {selectedDesign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => setSelectedDesign(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={getImage(selectedDesign)}
                alt={selectedDesign.name}
                className="w-full object-cover"
                style={{ maxHeight: "320px" }}
              />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <input
                    type="text"
                    value={selectedDesign.name}
                    onChange={(e) => {
                      setSelectedDesign({ ...selectedDesign, name: e.target.value });
                    }}
                    onBlur={(e) => handleRename(selectedDesign.id, e.target.value)}
                    className="font-semibold text-[#212121] text-lg bg-transparent border-b border-transparent hover:border-gray-200 focus:border-[#5E35B1] focus:outline-none"
                  />
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2"
                    style={{ background: STATUS_STYLES[selectedDesign.status]?.bg || "#F5F5F5", color: STATUS_STYLES[selectedDesign.status]?.text || "#757575" }}
                  >
                    {STATUS_STYLES[selectedDesign.status]?.label || selectedDesign.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {getParamTags(selectedDesign).map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-xs" style={{ background: "#EDE7FF", color: "#5E35B1" }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Link
                    href="/couturieres"
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white text-center"
                    style={{ background: "linear-gradient(135deg, #5E35B1, #EC407A)" }}
                  >
                    Trouver une couturiere
                  </Link>
                  <button
                    onClick={() => setSelectedDesign(null)}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-[#424242] hover:bg-gray-50"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm delete dialog */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="font-semibold text-[#212121] mb-2">Supprimer ce design ?</h3>
              <p className="text-sm text-[#616161] mb-5">Cette action est irreversible.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white"
                  style={{ background: "#C62828" }}
                >
                  Supprimer
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-[#424242] hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}