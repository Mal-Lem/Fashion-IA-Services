"use client";

import { useState } from "react";
import { toast } from "sonner";

const NOTIF_OPTIONS = [
  { key: "newMessage", label: "Nouveaux messages", desc: "Être notifié quand une couturière vous répond" },
  { key: "orderUpdate", label: "Mise à jour commandes", desc: "Suivre l'avancement de vos commandes" },
  { key: "newsletter", label: "Newsletter", desc: "Recevoir nos conseils mode et nouveautés" },
  { key: "tips", label: "Conseils IA", desc: "Obtenir des suggestions pour améliorer vos designs" },
];

export function NotificationsTab() {
  const [notifications, setNotifications] = useState({
    newMessage: true, orderUpdate: true, newsletter: false, tips: true,
  });

  return (
    <div>
      <h2 className="font-semibold text-[#212121] mb-5">Préférences de notifications</h2>
      <div className="space-y-4">
        {NOTIF_OPTIONS.map(({ key, label, desc }) => (
          <div key={key} className="flex items-start justify-between gap-4 p-4 rounded-xl border border-gray-100">
            <div>
              <p className="text-sm font-medium text-[#212121]">{label}</p>
              <p className="text-xs text-[#9E9E9E] mt-0.5">{desc}</p>
            </div>
            <button type="button"
              onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
              className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
              style={{ background: notifications[key as keyof typeof notifications] ? "#5E35B1" : "#E0E0E0" }}>
              <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
                style={{ transform: notifications[key as keyof typeof notifications] ? "translateX(22px)" : "translateX(2px)" }} />
            </button>
          </div>
        ))}
      </div>
      <button className="mt-5 px-6 py-2.5 rounded-xl text-sm font-medium text-white"
        style={{ background: "#5E35B1" }}
        onClick={() => toast.success("Préférences sauvegardées")}>
        Sauvegarder
      </button>
    </div>
  );
}