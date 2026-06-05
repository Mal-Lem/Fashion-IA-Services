"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const BodyScanner = lazy(() => import("@/components/morphology/BodyScanner"));

const GENDER_OPTIONS = [
  { value: "femme", label: "Femme" },
  { value: "homme", label: "Homme" },
  { value: "mixte", label: "Mixte" },
];
const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export function MorphologieTab() {
  const { user, refreshUser } = useAuth();
  const [showScanner, setShowScanner] = useState(false);
  const [savingMorpho, setSavingMorpho] = useState(false);
  const [gender, setGender] = useState(user?.gender || "");
  const [standardSize, setStandardSize] = useState("");
  const [bust, setBust] = useState("");
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  const [shoulders, setShoulders] = useState("");
  const [height, setHeight] = useState("");
  const [backLength, setBackLength] = useState("");
  const [inseam, setInseam] = useState("");
  const [armLength, setArmLength] = useState("");

  useEffect(() => {
    if (user?.morphologyJson) {
      const m = user.morphologyJson;
      setStandardSize(m.standardSize || "");
      setBust(m.bust?.toString() || "");
      setWaist(m.waist?.toString() || "");
      setHips(m.hips?.toString() || "");
      setShoulders(m.shoulders?.toString() || "");
      setHeight(m.height?.toString() || "");
      setBackLength(m.backLength?.toString() || "");
      setInseam(m.inseam?.toString() || "");
      setArmLength(m.armLength?.toString() || "");
    }
    if (user?.gender) setGender(user.gender);
  }, [user]);

  const handleScanComplete = (m: any) => {
    setShowScanner(false);
    if (m.height) setHeight(m.height.toString());
    if (m.bust) setBust(m.bust.toString());
    if (m.waist) setWaist(m.waist.toString());
    if (m.hips) setHips(m.hips.toString());
    if (m.shoulders) setShoulders(m.shoulders.toString());
    if (m.armLength) setArmLength(m.armLength.toString());
    if (m.inseam) setInseam(m.inseam.toString());
    toast.success("Mesures détectées et appliquées !");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMorpho(true);
    try {
      const { usersApi } = await import("@/lib/api");
      await usersApi.updateMorphology(gender, {
        standardSize,
        bust: bust ? Number(bust) : undefined,
        waist: waist ? Number(waist) : undefined,
        hips: hips ? Number(hips) : undefined,
        shoulders: shoulders ? Number(shoulders) : undefined,
        height: height ? Number(height) : undefined,
        backLength: backLength ? Number(backLength) : undefined,
        inseam: inseam ? Number(inseam) : undefined,
        armLength: armLength ? Number(armLength) : undefined,
      });
      await refreshUser?.();
      toast.success("Mannequin numérique mis à jour");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSavingMorpho(false);
    }
  };

  const measures = [
    { label: "Taille (cm)", value: height, setter: setHeight },
    { label: "Poitrine", value: bust, setter: setBust },
    { label: "Tour de taille", value: waist, setter: setWaist },
    { label: "Tour de hanches", value: hips, setter: setHips },
    { label: "Largeur épaules", value: shoulders, setter: setShoulders },
    { label: "Longueur dos", value: backLength, setter: setBackLength },
    { label: "Entrejambe", value: inseam, setter: setInseam },
    { label: "Longueur bras", value: armLength, setter: setArmLength },
  ];

  return (
    <form onSubmit={handleSave}>
      <button type="button" onClick={() => setShowScanner(true)}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-medium text-white mb-5"
        style={{ background: "linear-gradient(135deg, #5E35B1, #EC407A)" }}>
        <Camera className="w-5 h-5" />
        Scanner mon corps automatiquement
      </button>

      {showScanner && (
        <Suspense fallback={<div className="text-center py-4 text-[#9E9E9E]">Chargement...</div>}>
          <BodyScanner onMeasurementsDetected={handleScanComplete} onClose={() => setShowScanner(false)} />
        </Suspense>
      )}

      <h2 className="font-semibold text-[#212121] mb-1">Mannequin numérique</h2>
      <p className="text-sm text-[#9E9E9E] mb-5">Ces informations personnalisent les designs IA générés pour votre morphologie.</p>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#212121] mb-2">Genre</label>
          <div className="flex gap-3">
            {GENDER_OPTIONS.map(g => (
              <button key={g.value} type="button" onClick={() => setGender(g.value)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all"
                style={{
                  borderColor: gender === g.value ? "#5E35B1" : "#E0E0E0",
                  background: gender === g.value ? "#EDE7FF" : "white",
                  color: gender === g.value ? "#5E35B1" : "#616161",
                }}>
                {g.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#212121] mb-2">Taille standard</label>
          <div className="flex flex-wrap gap-2">
            {SIZE_OPTIONS.map(s => (
              <button key={s} type="button" onClick={() => setStandardSize(s)}
                className="px-4 py-2 rounded-xl text-sm font-medium border transition-all"
                style={{
                  borderColor: standardSize === s ? "#5E35B1" : "#E0E0E0",
                  background: standardSize === s ? "#EDE7FF" : "white",
                  color: standardSize === s ? "#5E35B1" : "#616161",
                }}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#212121] mb-3">Mesures détaillées (cm)</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {measures.map(({ label, value, setter }) => (
              <div key={label}>
                <label className="block text-xs text-[#9E9E9E] mb-1">{label}</label>
                <input type="number" value={value} onChange={e => setter(e.target.value)}
                  placeholder="--"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-[#212121] focus:outline-none focus:ring-2 focus:border-[#5E35B1]"
                  min={0} max={300} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <button type="submit" disabled={savingMorpho}
        className="mt-6 px-6 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50"
        style={{ background: "#5E35B1" }}>
        {savingMorpho ? "Sauvegarde..." : "Sauvegarder le mannequin"}
      </button>
    </form>
  );
}