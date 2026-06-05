"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export function SecuriteTab() {
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");

  return (
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
        <button className="px-6 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{ background: "#5E35B1" }}
          onClick={() => toast.info("Fonctionnalité bientôt disponible")}>
          Changer le mot de passe
        </button>
      </div>
    </div>
  );
}