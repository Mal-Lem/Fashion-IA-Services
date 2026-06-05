"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const STYLE_OPTIONS = ["Casual", "Formel", "Boheme", "Sportswear", "Elegant", "Vintage", "Minimaliste"];

export function ProfilTab() {
  const { user, refreshUser } = useAuth();
  const [styles, setStyles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggleStyle = (s: string) =>
    setStyles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { usersApi } = await import("@/lib/api");
      await usersApi.updatePreferences({ styles });
      await refreshUser?.();
      toast.success("Profil mis à jour");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave}>
      <h2 className="font-semibold text-[#212121] mb-5">Informations personnelles</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#212121] mb-1.5">Prénom</label>
            <input type="text" value={user?.firstName || ""} readOnly
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#212121] bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#212121] mb-1.5">Nom</label>
            <input type="text" value={user?.lastName || ""} readOnly
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#212121] bg-gray-50" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#212121] mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9E9E]" />
            <input type="email" value={user?.email || ""} readOnly
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#212121] bg-gray-50" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#212121] mb-2">Styles préférés</label>
          <div className="flex flex-wrap gap-2">
            {STYLE_OPTIONS.map(s => (
              <button key={s} type="button" onClick={() => toggleStyle(s)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                style={{
                  borderColor: styles.includes(s) ? "#5E35B1" : "#E0E0E0",
                  background: styles.includes(s) ? "#EDE7FF" : "white",
                  color: styles.includes(s) ? "#5E35B1" : "#616161",
                }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
      <button type="submit" disabled={saving}
        className="mt-6 px-6 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50"
        style={{ background: "#5E35B1" }}>
        {saving ? "Sauvegarde..." : "Sauvegarder"}
      </button>
    </form>
  );
}