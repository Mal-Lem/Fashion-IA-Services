"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { Search, SlidersHorizontal, Star, MapPin, Check, X } from "lucide-react";
import { motion } from "framer-motion";

const AVAILABILITY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  Disponible: { bg: "#E8F5E9", text: "#2E7D32", dot: "#2E7D32" },
  "Sous 2 semaines": { bg: "#FFF3E0", text: "#E65100", dot: "#E65100" },
  Occupee: { bg: "#F5F5F5", text: "#757575", dot: "#BDBDBD" },
};

const SORT_OPTIONS = [
  { value: "ml", label: "Plus pertinent" },
  { value: "rating", label: "Mieux note" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix decroissant" },
  { value: "available", label: "Disponible rapidement" },
];

const REGION_OPTIONS = [
  "Toute la France",
  "Ile-de-France",
  "Auvergne-Rhone-Alpes",
  "Nouvelle-Aquitaine",
  "Pays de la Loire",
  "Provence-Alpes-Cote d Azur",
];

const SPECIALTY_OPTIONS = [
  "Robes", "Mariage", "Ceremonie", "Retouches",
  "Tailleurs", "Mode africaine", "Sur-mesure", "Sportswear",
  "Vêtements de soirée", "Maille", "Cuir", "Enfants",
];

export default function CouturieresListPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("ml");
  const [region, setRegion] = useState("Toute la France");
  const [minBudget, setMinBudget] = useState(0);
  const [maxBudget, setMaxBudget] = useState(1000);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [couturieres, setCouturieres] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const toggleSpec = (s: string) =>
    setSelectedSpecs((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  useEffect(() => {
    const loadCouturieres = async () => {
      setLoadingData(true);
      try {
        const { couturieresApi } = await import("@/lib/api");
        const params: any = {};
        if (region !== "Toute la France") params.region = region;
        if (selectedSpecs.length > 0) params.specialty = selectedSpecs[0];
        if (maxBudget < 1000) params.maxPrice = maxBudget;
        if (minBudget > 0) params.minPrice = minBudget;
        const result = await couturieresApi.search(params);
        setCouturieres(result.data || []);
      } catch {
        setCouturieres([]);
      } finally {
        setLoadingData(false);
      }
    };
    loadCouturieres();
  }, [region, selectedSpecs, maxBudget]);

  const filtered = couturieres.filter((c) => {
    const matchSearch =
      !search ||
      c.atelierName?.toLowerCase().includes(search.toLowerCase()) ||
      c.locationCity?.toLowerCase().includes(search.toLowerCase()) ||
      c.specialties?.some((s: string) =>
        s.toLowerCase().includes(search.toLowerCase())
      );
    const pricingMin = c.pricingMin || 0;
    const matchBudget = pricingMin === 0 || (pricingMin >= minBudget && pricingMin <= maxBudget);
    return matchSearch && matchBudget;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "rating")
      return (Number(b.avgRating) || 0) - (Number(a.avgRating) || 0);
    if (sort === "price_asc")
      return (a.pricingMin || 0) - (b.pricingMin || 0);
    if (sort === "price_desc")
      return (b.pricingMin || 0) - (a.pricingMin || 0);
    if (sort === "available")
      return a.availabilityStatus === "available" ? -1 : 1;
    return (b.matchScore || 0) - (a.matchScore || 0);
  });

  const getAvailLabel = (status: string) => {
    if (status === "available") return "Disponible";
    if (status === "busy") return "Occupee";
    return "Sous 2 semaines";
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "#FAFAFA", fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <Header />

      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="py-8">
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "2rem",
                fontWeight: 700,
                color: "#212121",
                marginBottom: "0.5rem",
              }}
            >
              Toutes les couturieres
            </h1>
            <p className="text-[#616161]">
              Trouvez la couturiere ideale pour realiser votre design sur-mesure
            </p>
          </div>

          {/* Search + Sort bar */}
          <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-6">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9E9E]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par nom, specialite, ville..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-[#212121] placeholder-[#9E9E9E] focus:outline-none focus:ring-2 focus:border-[#5E35B1] bg-white"
                aria-label="Rechercher des couturieres"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 bg-white text-[#424242] font-medium text-sm hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5E35B1]"
              aria-expanded={showFilters}
            >
              <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
              Filtres
              {selectedSpecs.length > 0 && (
                <span
                  className="w-5 h-5 rounded-full text-xs text-white flex items-center justify-center"
                  style={{ background: "#5E35B1" }}
                >
                  {selectedSpecs.length}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="sr-only">
                Trier par
              </label>
              <select
                id="sort-select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="py-3 px-4 rounded-xl border border-gray-200 bg-white text-sm text-[#424242] focus:outline-none focus:ring-2 focus:border-[#5E35B1] cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 mb-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label
                    htmlFor="region-filter"
                    className="block text-sm font-semibold text-[#212121] mb-2"
                  >
                    Region
                  </label>
                  <select
                    id="region-filter"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-gray-200 text-sm text-[#424242] focus:outline-none focus:ring-2 focus:border-[#5E35B1]"
                  >
                    {REGION_OPTIONS.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#212121] mb-2">
                    Budget (euro)
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={minBudget}
                      onChange={(e) => setMinBudget(Number(e.target.value))}
                      className="w-24 py-2 px-3 rounded-xl border border-gray-200 text-sm text-[#424242] focus:outline-none focus:ring-2 focus:border-[#5E35B1]"
                      min={0}
                      aria-label="Budget minimum"
                    />
                    <span className="text-[#9E9E9E]">—</span>
                    <input
                      type="number"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(Number(e.target.value))}
                      className="w-24 py-2 px-3 rounded-xl border border-gray-200 text-sm text-[#424242] focus:outline-none focus:ring-2 focus:border-[#5E35B1]"
                      min={0}
                      aria-label="Budget maximum"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#212121] mb-2">
                    Specialite
                  </p>
                  <div
                    className="flex flex-wrap gap-2"
                    role="group"
                    aria-label="Filtrer par specialite"
                  >
                    {SPECIALTY_OPTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => toggleSpec(s)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-[#5E35B1]"
                        style={{
                          borderColor: selectedSpecs.includes(s)
                            ? "#5E35B1"
                            : "#E0E0E0",
                          background: selectedSpecs.includes(s)
                            ? "#EDE7FF"
                            : "white",
                          color: selectedSpecs.includes(s)
                            ? "#5E35B1"
                            : "#616161",
                        }}
                        aria-pressed={selectedSpecs.includes(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setSelectedSpecs([]);
                    setRegion("Toute la France");
                    setMinBudget(0);
                    setMaxBudget(1000);
                  }}
                  className="text-sm text-[#616161] hover:text-[#212121] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5E35B1] rounded"
                >
                  Reinitialiser les filtres
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 rounded-xl font-medium text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#5E35B1]"
                  style={{ background: "#5E35B1" }}
                >
                  <X className="w-4 h-4 inline mr-1" aria-hidden="true" />
                  Fermer
                </button>
              </div>
            </motion.div>
          )}

          {/* Results count */}
          <p className="text-sm text-[#616161] mb-6" role="status">
            {loadingData ? (
              "Chargement..."
            ) : (
              <>
                <strong className="text-[#212121]">{sorted.length}</strong>{" "}
                couturiere{sorted.length !== 1 ? "s" : ""} trouvee
                {sorted.length !== 1 ? "s" : ""}
              </>
            )}
          </p>

          {/* Loading skeletons */}
          {loadingData ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100"
                >
                  <div
                    className="w-full animate-pulse"
                    style={{
                      height: "220px",
                      background:
                        "linear-gradient(90deg, #EDE7FF 25%, #D1C4E9 50%, #EDE7FF 75%)",
                    }}
                  />
                  <div className="p-5 space-y-3">
                    <div
                      className="h-4 rounded animate-pulse"
                      style={{ background: "#EDE7FF", width: "60%" }}
                    />
                    <div
                      className="h-3 rounded animate-pulse"
                      style={{ background: "#EDE7FF", width: "80%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#616161] mb-4">
                Aucune couturiere ne correspond a vos criteres.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedSpecs([]);
                }}
                className="px-5 py-2.5 rounded-xl font-medium text-white text-sm"
                style={{ background: "#5E35B1" }}
              >
                Voir toutes les couturieres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map((couturiere) => {
                const availLabel = getAvailLabel(couturiere.availabilityStatus);
                const avail =
                  AVAILABILITY_STYLES[availLabel] ||
                  AVAILABILITY_STYLES["Disponible"];
                const priceFrom = couturiere.pricingMin
                  ? Math.round(couturiere.pricingMin)
                  : null;
                const rating = Number(couturiere.avgRating || 0).toFixed(1);

                return (
                  <motion.article
                    key={couturiere.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -4 }}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
                  >
                    <div className="relative overflow-hidden" style={{ height: "220px" }}>
                      <img
                        src={
                          couturiere.user?.avatarUrl ||
                          "https://placehold.co/400x300/EDE7FF/5E35B1?text=Atelier"
                        }
                        alt={couturiere.atelierName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-end p-4 gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                        }}
                        aria-hidden="true"
                      >
                        <Link
                          href={`/couturieres/${couturiere.id}`}
                          className="w-full py-2.5 rounded-xl font-medium text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-white"
                          style={{ background: "#5E35B1" }}
                          tabIndex={-1}
                        >
                          Voir le profil
                        </Link>
                      </div>
                      {couturiere.isCertified && (
                        <div className="absolute top-3 left-3">
                          <span
                            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                            style={{ background: "rgba(94,53,177,0.9)" }}
                          >
                            <Check className="w-3 h-3" aria-hidden="true" />
                            Certifiee
                          </span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ background: avail.bg, color: avail.text }}
                        >
                          <span
                            className="inline-block w-1.5 h-1.5 rounded-full mr-1"
                            style={{ background: avail.dot }}
                            aria-hidden="true"
                          />
                          {availLabel}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/couturieres/${couturiere.id}`}
                      className="block p-5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#5E35B1]"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h2 className="font-semibold text-[#212121]">
                            {couturiere.atelierName}
                          </h2>
                          <p className="text-sm text-[#616161]">
                            {couturiere.specialties?.[0] || "Couture generale"}
                          </p>
                        </div>
                        {couturiere.matchScore > 0 && (
                          <span
                            className="text-sm font-semibold"
                            style={{ color: "#5E35B1" }}
                          >
                            {couturiere.matchScore}%
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star
                            className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                            aria-hidden="true"
                          />
                          <span className="font-medium text-[#212121]">
                            {rating}
                          </span>
                          <span className="text-[#9E9E9E]">
                            ({couturiere.reviewCount || 0})
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[#9E9E9E]">
                          <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                          {couturiere.locationCity}
                        </div>
                        {priceFrom && (
                          <span className="text-[#424242] ml-auto">
                            A partir de {priceFrom} euro
                          </span>
                        )}
                      </div>
                    </Link>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}