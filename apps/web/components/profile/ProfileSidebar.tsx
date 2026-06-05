"use client";

import { User, Ruler, ShoppingBag, Lock, Bell, LucideIcon } from "lucide-react";

export type TabId = "profil" | "morphologie" | "commandes" | "securite" | "notifications";

const tabs: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: "profil", label: "Mon profil", icon: User },
  { id: "morphologie", label: "Mannequin", icon: Ruler },
  { id: "commandes", label: "Commandes", icon: ShoppingBag },
  { id: "securite", label: "Sécurité", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
];

interface ProfileSidebarProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

export function ProfileSidebar({ activeTab, onChange }: ProfileSidebarProps) {
  return (
    <nav className="lg:col-span-1">
      <div className="bg-white rounded-2xl border border-gray-100 p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => onChange(tab.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left"
              style={{
                background: activeTab === tab.id ? "#EDE7FF" : "transparent",
                color: activeTab === tab.id ? "#5E35B1" : "#616161",
              }}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}