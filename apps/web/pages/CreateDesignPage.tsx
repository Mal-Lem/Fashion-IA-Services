"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/shared/Header";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// ── Options ───────────────────────────────────────────────────
const GENDER_OPTIONS = ["femme", "homme", "mixte"];
const TYPE_OPTIONS = ["Robe", "Jupe", "Pantalon", "Haut", "Veste", "Manteau", "Combinaison", "Short", "Costume", "Kimono", "Ensemble"];
const STYLE_OPTIONS = ["Casual", "Elegant", "Boheme", "Streetwear", "Vintage", "Minimaliste", "Romantique", "Avant-garde", "Sportswear", "Haute couture"];
const FABRIC_OPTIONS = ["Soie", "Lin", "Coton", "Velours", "Dentelle", "Satin", "Tweed", "Jersey", "Organza", "Cuir", "Daim", "Mousseline"];
const CUT_OPTIONS = ["Droite", "Ajustee", "Evasee", "Asymetrique", "Portefeuille", "Trapeze", "Fluide", "Structuree"];
const LENGTH_OPTIONS = ["Tres court", "Court", "Mi-long", "Long", "Extra long"];
const SLEEVES_OPTIONS = ["Sans manches", "Bretelles fines", "Courtes", "3/4", "Longues", "Bouffantes", "Cloche"];
const NECKLINE_OPTIONS = ["Col rond", "Col V", "Col carre", "Bustier", "Col bateau", "Col roule", "Decollete plongeant", "Dos nu", "Epaules denudees"];
const CLOSURE_OPTIONS = ["Sans fermeture", "Zip", "Boutons", "Lacage", "Noue", "Agrafe", "Velcro"];
const PATTERN_OPTIONS = ["Uni", "Rayures", "Carreaux", "Fleurs", "Geometrique", "Animal print", "Tie-dye", "Cachemire", "Pois", "Abstrait"];
const ORNAMENT_OPTIONS = ["Broderie", "Dentelle", "Sequins", "Perles", "Plumes", "Fronces", "Smocks", "Appliques", "Passementerie", "Rubans"];
const FINISHING_OPTIONS = ["Ourlet simple", "Franges", "Volants", "Plisse", "Surpique", "Biais", "Godets"];
const OCCASION_OPTIONS = ["Quotidien", "Travail", "Soiree", "Mariage", "Cocktail", "Sport", "Plage", "Festival", "Ceremonie"];
const SEASON_OPTIONS = ["Printemps", "Ete", "Automne", "Hiver", "Toutes saisons"];
const INSPIRATION_OPTIONS = ["Francaise", "Africaine", "Asiatique", "Americaine", "Scandinave", "Orientale", "Latine", "Britannique"];
const SILHOUETTE_OPTIONS = ["Decontracte", "Sophistique", "Avant-gardiste", "Classique", "Moderne", "Romantique", "Edgy"];

// Couleurs prédéfinies populaires
const PRESET_COLORS = [
  { hex: "#000000", name: "Noir" },
  { hex: "#FFFFFF", name: "Blanc" },
  { hex: "#C0C0C0", name: "Argent" },
  { hex: "#FFD700", name: "Or" },
  { hex: "#FF0000", name: "Rouge" },
  { hex: "#FF69B4", name: "Rose" },
  { hex: "#FFC0CB", name: "Rose poudre" },
  { hex: "#FF7F50", name: "Corail" },
  { hex: "#FFA500", name: "Orange" },
  { hex: "#FFFF00", name: "Jaune" },
  { hex: "#90EE90", name: "Vert clair" },
  { hex: "#008000", name: "Vert" },
  { hex: "#006400", name: "Vert fonce" },
  { hex: "#ADD8E6", name: "Bleu clair" },
  { hex: "#0000FF", name: "Bleu" },
  { hex: "#000080", name: "Bleu marine" },
  { hex: "#800080", name: "Violet" },
  { hex: "#EDE7FF", name: "Lavande" },
  { hex: "#8B4513", name: "Marron" },
  { hex: "#800000", name: "Bordeaux" },
  { hex: "#F5F5DC", name: "Beige" },
  { hex: "#D2691E", name: "Terracotta" },
  { hex: "#708090", name: "Gris ardoise" },
  { hex: "#2F4F4F", name: "Vert sapin" },
];

interface Color {
  hex: string;
  name: string;
}

interface Section {
  id: string;
  label: string;
  open: boolean;
}

export default function CreateDesignPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [mode, setMode] = useState<"form" | "prompt">("form");
  const [generating, setGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");

  // Paramètres de base
  const [gender, setGender] = useState("");
  const [type, setType] = useState("");
  const [style, setStyle] = useState("");
  const [fabric, setFabric] = useState("");
  const [cut, setCut] = useState("");
  const [occasion, setOccasion] = useState("");

  // Couleurs
  const [colors, setColors] = useState<Color[]>([{ hex: "#5E35B1", name: "Violet" }]);
  const [showColorPicker, setShowColorPicker] = useState<number | null>(null);

  // Paramètres avancés
  const [length, setLength] = useState("");
  const [sleeves, setSleeves] = useState("");
  const [neckline, setNeckline] = useState("");
  const [closure, setClosure] = useState("");
  const [pattern, setPattern] = useState("");
  const [ornaments, setOrnaments] = useState<string[]>([]);
  const [finishing, setFinishing] = useState("");
  const [season, setSeason] = useState("");
  const [inspiration, setInspiration] = useState("");
  const [silhouette, setSilhouette] = useState("");

  // Sections accordéon
  const [sections, setSections] = useState<Section[]>([
    { id: "base", label: "Paramètres de base", open: true },
    { id: "couleurs", label: "Couleurs", open: true },
    { id: "details", label: "Détails du vêtement", open: false },
    { id: "style", label: "Style & inspiration", open: false },
  ]);

  const toggleSection = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, open: !s.open } : s));
  };

  const toggleOrnament = (o: string) => {
    setOrnaments(prev => prev.includes(o) ? prev.filter(x => x !== o) : [...prev, o]);
  };

  // Gestion des couleurs
  const addColor = () => {
    if (colors.length < 4) {
      setColors(prev => [...prev, { hex: "#EC407A", name: "Rose" }]);
    }
  };

  const removeColor = (idx: number) => {
    setColors(prev => prev.filter((_, i) => i !== idx));
  };

  const updateColor = (idx: number, hex: string) => {
    setColors(prev => prev.map((c, i) => i === idx ? { ...c, hex } : c));
  };

  const updateColorName = (idx: number, name: string) => {
    setColors(prev => prev.map((c, i) => i === idx ? { ...c, name } : c));
  };

  const selectPresetColor = (idx: number, preset: Color) => {
    setColors(prev => prev.map((c, i) => i === idx ? preset : c));
    setShowColorPicker(null);
  };

  const hasParams = mode === "prompt"
    ? prompt.trim().length > 0
    : type !== "" || style !== "" || gender !== "";

  const quotaReached = !user?.isPremium &&
    (user?.generationsUsed || 0) >= (user?.generationsMax || 5) &&
    (user?.aiCredits || 0) === 0;

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (quotaReached) {
      toast.error("Quota mensuel atteint. Passez Premium !");
      router.push("/abonnements");
      return;
    }
    if (!hasParams) {
      toast.error("Selectionnez au moins un parametre");
      return;
    }

    setGenerating(true);

    try {
      const { designsApi } = await import("@/lib/api");

      const data = mode === "form"
        ? {
            mode: "guided" as const,
            gender,
            type,
            style,
            colors: colors.map(c => ({ hex: c.hex, name: c.name })),
            fabric,
            cut,
            occasion,
            length,
            sleeves,
            neckline,
            closure,
            pattern,
            ornaments: ornaments.length > 0 ? ornaments : undefined,
            finishing,
            season,
            inspiration,
            silhouette,
          }
        : {
            mode: "free_prompt" as const,
            freePrompt: prompt,
          };

      const result = await designsApi.generate(data);

      if ((result as any).error === "QUOTA_EXCEEDED") {
        toast.error("Quota mensuel atteint. Passez Premium !");
        router.push("/abonnements");
        return;
      }

      sessionStorage.setItem("designResult", JSON.stringify(result));
      sessionStorage.setItem("designParams", JSON.stringify(data));
      router.push("/create/results");

    } catch (error: any) {
      if (error.message === "UNAUTHORIZED") {
        router.push("/login");
      } else {
        toast.error("Erreur lors de la generation : " + error.message);
      }
    } finally {
      setGenerating(false);
    }
  };

  const SelectButton = ({ value, current, onClick }: { value: string; current: string; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-2 rounded-xl text-sm font-medium border transition-all"
      style={{
        borderColor: current === value ? "#5E35B1" : "#E0E0E0",
        background: current === value ? "#EDE7FF" : "white",
        color: current === value ? "#5E35B1" : "#616161",
      }}
    >
      {value}
    </button>
  );

  const MultiButton = ({ value, selected, onClick }: { value: string; selected: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-2 rounded-xl text-sm font-medium border transition-all"
      style={{
        borderColor: selected ? "#5E35B1" : "#E0E0E0",
        background: selected ? "#EDE7FF" : "white",
        color: selected ? "#5E35B1" : "#616161",
      }}
    >
      {value}
    </button>
  );

  return (
    <div className="min-h-screen" style={{ background: "#FAFAFA", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Header />

      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="py-8 text-center">
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 700, color: "#212121" }}>
              Creer mon design
            </h1>
            <p className="text-[#616161] mt-2">
              Decrivez votre vetement ideal et notre IA le visualisera pour vous
            </p>
            {user && (
              <p className="text-xs text-[#9E9E9E] mt-1">
                {user.generationsUsed}/{user.generationsMax === 999 ? "illimite" : user.generationsMax} generations utilisees
              </p>
            )}
          </div>

          {/* Mode toggle */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <button
              onClick={() => setMode("form")}
              className="px-6 py-2.5 rounded-xl font-medium text-sm transition-all"
              style={{
                background: mode === "form" ? "#5E35B1" : "white",
                color: mode === "form" ? "white" : "#616161",
                border: "1px solid",
                borderColor: mode === "form" ? "#5E35B1" : "#E0E0E0",
              }}
            >
              Formulaire guide
            </button>
            <button
              onClick={() => setMode("prompt")}
              className="px-6 py-2.5 rounded-xl font-medium text-sm transition-all"
              style={{
                background: mode === "prompt" ? "#5E35B1" : "white",
                color: mode === "prompt" ? "white" : "#616161",
                border: "1px solid",
                borderColor: mode === "prompt" ? "#5E35B1" : "#E0E0E0",
              }}
            >
              Prompt libre
            </button>
          </div>

          {/* Prompt libre */}
          {mode === "prompt" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 mb-6"
            >
              <label className="block text-sm font-semibold text-[#212121] mb-3">
                Decrivez votre vetement en detail
              </label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                rows={5}
                placeholder="Ex: Une robe longue en soie blanche avec une broderie florale doree sur le bustier, manches courtes bouffantes, col carre, pour un mariage en ete..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#212121] focus:outline-none focus:ring-2 focus:border-[#5E35B1] resize-none"
              />
              <p className="text-xs text-[#9E9E9E] mt-2">{prompt.length}/500 caracteres</p>
            </motion.div>
          )}

          {/* Formulaire guidé */}
          {mode === "form" && (
            <div className="space-y-4">

              {/* Section : Paramètres de base */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => toggleSection("base")}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-[#212121]">Parametres de base</span>
                  {sections.find(s => s.id === "base")?.open
                    ? <ChevronUp className="w-5 h-5 text-[#9E9E9E]" />
                    : <ChevronDown className="w-5 h-5 text-[#9E9E9E]" />
                  }
                </button>

                <AnimatePresence>
                  {sections.find(s => s.id === "base")?.open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-5 space-y-5"
                    >
                      {/* Genre */}
                      <div>
                        <label className="block text-sm font-medium text-[#212121] mb-2">Genre</label>
                        <div className="flex flex-wrap gap-2">
                          {GENDER_OPTIONS.map(g => (
                            <SelectButton key={g} value={g} current={gender} onClick={() => setGender(gender === g ? "" : g)} />
                          ))}
                        </div>
                      </div>

                      {/* Type */}
                      <div>
                        <label className="block text-sm font-medium text-[#212121] mb-2">Type de vetement</label>
                        <div className="flex flex-wrap gap-2">
                          {TYPE_OPTIONS.map(t => (
                            <SelectButton key={t} value={t} current={type} onClick={() => setType(type === t ? "" : t)} />
                          ))}
                        </div>
                      </div>

                      {/* Style */}
                      <div>
                        <label className="block text-sm font-medium text-[#212121] mb-2">Style</label>
                        <div className="flex flex-wrap gap-2">
                          {STYLE_OPTIONS.map(s => (
                            <SelectButton key={s} value={s} current={style} onClick={() => setStyle(style === s ? "" : s)} />
                          ))}
                        </div>
                      </div>

                      {/* Tissu */}
                      <div>
                        <label className="block text-sm font-medium text-[#212121] mb-2">Tissu</label>
                        <div className="flex flex-wrap gap-2">
                          {FABRIC_OPTIONS.map(f => (
                            <SelectButton key={f} value={f} current={fabric} onClick={() => setFabric(fabric === f ? "" : f)} />
                          ))}
                        </div>
                      </div>

                      {/* Occasion */}
                      <div>
                        <label className="block text-sm font-medium text-[#212121] mb-2">Occasion</label>
                        <div className="flex flex-wrap gap-2">
                          {OCCASION_OPTIONS.map(o => (
                            <SelectButton key={o} value={o} current={occasion} onClick={() => setOccasion(occasion === o ? "" : o)} />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Section : Couleurs */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => toggleSection("couleurs")}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-[#212121]">Couleurs ({colors.length}/4)</span>
                  {sections.find(s => s.id === "couleurs")?.open
                    ? <ChevronUp className="w-5 h-5 text-[#9E9E9E]" />
                    : <ChevronDown className="w-5 h-5 text-[#9E9E9E]" />
                  }
                </button>

                <AnimatePresence>
                  {sections.find(s => s.id === "couleurs")?.open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-5"
                    >
                      <p className="text-sm text-[#9E9E9E] mb-4">
                        Selectionnez jusqu'a 4 couleurs pour votre vetement
                      </p>

                      <div className="space-y-4">
                        {colors.map((color, idx) => (
                          <div key={idx} className="relative">
                            <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                              {/* Apercu couleur + picker */}
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setShowColorPicker(showColorPicker === idx ? null : idx)}
                                  className="w-12 h-12 rounded-xl border-2 border-white shadow-md flex-shrink-0 transition-transform hover:scale-105"
                                  style={{ background: color.hex }}
                                  title="Choisir une couleur"
                                />
                                {/* Input color natif caché */}
                                <input
                                  type="color"
                                  value={color.hex}
                                  onChange={e => updateColor(idx, e.target.value)}
                                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                  title="Personnaliser la couleur"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                {/* Code hex */}
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-mono text-[#616161] bg-white px-2 py-1 rounded border border-gray-200">
                                    {color.hex.toUpperCase()}
                                  </span>
                                </div>
                                {/* Nom de la couleur */}
                                <input
                                  type="text"
                                  value={color.name}
                                  onChange={e => updateColorName(idx, e.target.value)}
                                  placeholder="Nom de la couleur"
                                  className="w-full text-sm px-2 py-1 rounded-lg border border-gray-200 focus:outline-none focus:border-[#5E35B1]"
                                />
                              </div>

                              {/* Supprimer */}
                              {colors.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeColor(idx)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                                >
                                  <X className="w-4 h-4 text-red-400" />
                                </button>
                              )}
                            </div>

                            {/* Palette de couleurs prédéfinies */}
                            <AnimatePresence>
                              {showColorPicker === idx && (
                                <motion.div
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -4 }}
                                  className="absolute z-10 left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-xl p-4"
                                >
                                  <p className="text-xs font-medium text-[#616161] mb-3">Couleurs populaires</p>
                                  <div className="grid grid-cols-8 gap-2 mb-3">
                                    {PRESET_COLORS.map(preset => (
                                      <button
                                        key={preset.hex}
                                        type="button"
                                        onClick={() => selectPresetColor(idx, preset)}
                                        className="w-8 h-8 rounded-lg border-2 transition-all hover:scale-110"
                                        style={{
                                          background: preset.hex,
                                          borderColor: color.hex === preset.hex ? "#5E35B1" : "transparent",
                                          boxShadow: color.hex === preset.hex ? "0 0 0 2px #5E35B1" : "0 1px 3px rgba(0,0,0,0.2)",
                                        }}
                                        title={preset.name}
                                      />
                                    ))}
                                  </div>
                                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                    <span className="text-xs text-[#9E9E9E]">Couleur personnalisee :</span>
                                    <input
                                      type="color"
                                      value={color.hex}
                                      onChange={e => updateColor(idx, e.target.value)}
                                      className="w-8 h-8 rounded cursor-pointer border border-gray-200"
                                    />
                                    <span className="text-xs font-mono text-[#616161]">{color.hex.toUpperCase()}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setShowColorPicker(null)}
                                    className="mt-2 w-full py-1.5 rounded-lg text-xs font-medium text-white"
                                    style={{ background: "#5E35B1" }}
                                  >
                                    Valider
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>

                      {/* Ajouter une couleur */}
                      {colors.length < 4 && (
                        <button
                          type="button"
                          onClick={addColor}
                          className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#5E35B1] text-sm font-medium w-full justify-center transition-colors hover:bg-[#EDE7FF]"
                          style={{ color: "#5E35B1" }}
                        >
                          <Plus className="w-4 h-4" />
                          Ajouter une couleur ({colors.length}/4)
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Section : Détails du vêtement */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => toggleSection("details")}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-[#212121]">Details du vetement</span>
                  {sections.find(s => s.id === "details")?.open
                    ? <ChevronUp className="w-5 h-5 text-[#9E9E9E]" />
                    : <ChevronDown className="w-5 h-5 text-[#9E9E9E]" />
                  }
                </button>

                <AnimatePresence>
                  {sections.find(s => s.id === "details")?.open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-5 space-y-5"
                    >
                      {/* Coupe */}
                      <div>
                        <label className="block text-sm font-medium text-[#212121] mb-2">Coupe</label>
                        <div className="flex flex-wrap gap-2">
                          {CUT_OPTIONS.map(c => (
                            <SelectButton key={c} value={c} current={cut} onClick={() => setCut(cut === c ? "" : c)} />
                          ))}
                        </div>
                      </div>

                      {/* Longueur */}
                      <div>
                        <label className="block text-sm font-medium text-[#212121] mb-2">Longueur</label>
                        <div className="flex flex-wrap gap-2">
                          {LENGTH_OPTIONS.map(l => (
                            <SelectButton key={l} value={l} current={length} onClick={() => setLength(length === l ? "" : l)} />
                          ))}
                        </div>
                      </div>

                      {/* Manches */}
                      <div>
                        <label className="block text-sm font-medium text-[#212121] mb-2">Manches</label>
                        <div className="flex flex-wrap gap-2">
                          {SLEEVES_OPTIONS.map(s => (
                            <SelectButton key={s} value={s} current={sleeves} onClick={() => setSleeves(sleeves === s ? "" : s)} />
                          ))}
                        </div>
                      </div>

                      {/* Encolure */}
                      <div>
                        <label className="block text-sm font-medium text-[#212121] mb-2">Encolure</label>
                        <div className="flex flex-wrap gap-2">
                          {NECKLINE_OPTIONS.map(n => (
                            <SelectButton key={n} value={n} current={neckline} onClick={() => setNeckline(neckline === n ? "" : n)} />
                          ))}
                        </div>
                      </div>

                      {/* Fermeture */}
                      <div>
                        <label className="block text-sm font-medium text-[#212121] mb-2">Fermeture</label>
                        <div className="flex flex-wrap gap-2">
                          {CLOSURE_OPTIONS.map(c => (
                            <SelectButton key={c} value={c} current={closure} onClick={() => setClosure(closure === c ? "" : c)} />
                          ))}
                        </div>
                      </div>

                      {/* Motifs */}
                      <div>
                        <label className="block text-sm font-medium text-[#212121] mb-2">Motifs</label>
                        <div className="flex flex-wrap gap-2">
                          {PATTERN_OPTIONS.map(p => (
                            <SelectButton key={p} value={p} current={pattern} onClick={() => setPattern(pattern === p ? "" : p)} />
                          ))}
                        </div>
                      </div>

                      {/* Ornements (multi-select) */}
                      <div>
                        <label className="block text-sm font-medium text-[#212121] mb-2">
                          Ornements <span className="text-[#9E9E9E] font-normal">(plusieurs possibles)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {ORNAMENT_OPTIONS.map(o => (
                            <MultiButton key={o} value={o} selected={ornaments.includes(o)} onClick={() => toggleOrnament(o)} />
                          ))}
                        </div>
                      </div>

                      {/* Finitions */}
                      <div>
                        <label className="block text-sm font-medium text-[#212121] mb-2">Finitions</label>
                        <div className="flex flex-wrap gap-2">
                          {FINISHING_OPTIONS.map(f => (
                            <SelectButton key={f} value={f} current={finishing} onClick={() => setFinishing(finishing === f ? "" : f)} />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Section : Style & inspiration */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => toggleSection("style")}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-[#212121]">Style & inspiration</span>
                  {sections.find(s => s.id === "style")?.open
                    ? <ChevronUp className="w-5 h-5 text-[#9E9E9E]" />
                    : <ChevronDown className="w-5 h-5 text-[#9E9E9E]" />
                  }
                </button>

                <AnimatePresence>
                  {sections.find(s => s.id === "style")?.open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-5 space-y-5"
                    >
                      {/* Saison */}
                      <div>
                        <label className="block text-sm font-medium text-[#212121] mb-2">Saison</label>
                        <div className="flex flex-wrap gap-2">
                          {SEASON_OPTIONS.map(s => (
                            <SelectButton key={s} value={s} current={season} onClick={() => setSeason(season === s ? "" : s)} />
                          ))}
                        </div>
                      </div>

                      {/* Inspiration culturelle */}
                      <div>
                        <label className="block text-sm font-medium text-[#212121] mb-2">Inspiration culturelle</label>
                        <div className="flex flex-wrap gap-2">
                          {INSPIRATION_OPTIONS.map(i => (
                            <SelectButton key={i} value={i} current={inspiration} onClick={() => setInspiration(inspiration === i ? "" : i)} />
                          ))}
                        </div>
                      </div>

                      {/* Silhouette */}
                      <div>
                        <label className="block text-sm font-medium text-[#212121] mb-2">Silhouette</label>
                        <div className="flex flex-wrap gap-2">
                          {SILHOUETTE_OPTIONS.map(s => (
                            <SelectButton key={s} value={s} current={silhouette} onClick={() => setSilhouette(silhouette === s ? "" : s)} />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          )}

          {/* Résumé des paramètres sélectionnés */}
          {mode === "form" && (
            <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-xs font-semibold text-[#9E9E9E] uppercase mb-2">Votre selection</p>
              <div className="flex flex-wrap gap-2">
                {[gender, type, style, fabric, cut, occasion, length, sleeves, neckline, closure, pattern, finishing, season, inspiration, silhouette]
                  .filter(Boolean)
                  .map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: "#EDE7FF", color: "#5E35B1" }}>
                      {tag}
                    </span>
                  ))}
                {ornaments.map(o => (
                  <span key={o} className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: "#FCE4EC", color: "#C2185B" }}>
                    {o}
                  </span>
                ))}
                {colors.map(c => (
                  <span key={c.hex} className="px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5" style={{ background: "#F5F5F5", color: "#424242" }}>
                    <span className="w-3 h-3 rounded-full inline-block border border-gray-200" style={{ background: c.hex }} />
                    {c.name || c.hex}
                  </span>
                ))}
                {!hasParams && <span className="text-xs text-[#9E9E9E]">Aucun parametre selectionne</span>}
              </div>
            </div>
          )}

          {/* Bouton Générer */}
          <div className="mt-6">
            <button
              onClick={handleGenerate}
              disabled={generating || !hasParams || quotaReached}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-white text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-[#5E35B1]/30"
              style={{ background: "linear-gradient(135deg, #5E35B1, #EC407A)" }}
            >
              {generating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generation en cours...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Generer mes designs IA
                </>
              )}
            </button>
            {quotaReached && (
              <p className="text-center text-sm text-[#9E9E9E] mt-2">
                Quota atteint —{" "}
                <a href="/abonnements" style={{ color: "#5E35B1" }} className="font-medium">
                  Passer Premium
                </a>
              </p>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}