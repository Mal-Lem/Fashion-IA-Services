"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileSidebar, TabId } from "@/components/profile/ProfileSidebar";
import { ProfilTab } from "@/components/profile/tabs/ProfilTab";
import { MorphologieTab } from "@/components/profile/tabs/MorphologieTab";
import { CommandesTab } from "@/components/profile/tabs/CommandesTab";
import { SecuriteTab } from "@/components/profile/tabs/SecuriteTab";
import { NotificationsTab } from "@/components/profile/tabs/NotificationsTab";

export default function UserProfilePage() {
  const { updateAvatar } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>(
    (searchParams.get("tab") as TabId) || "profil"
  );
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    router.push(`/profil?tab=${tab}`, { scroll: false });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image trop lourde (max 5MB)"); return; }

    const reader = new FileReader();
    reader.onload = ev => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:3001/v1/users/me/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Erreur upload");
      const data = await res.json();
      updateAvatar(data.avatarUrl);
      setAvatarPreview(`${data.avatarUrl}?t=${Date.now()}`);
      toast.success("Photo de profil mise à jour !");
    } catch {
      setAvatarPreview(null);
      toast.error("Erreur lors de l'upload");
    }
  };

  const TAB_COMPONENTS: Record<TabId, React.ReactNode> = {
    profil: <ProfilTab />,
    morphologie: <MorphologieTab />,
    commandes: <CommandesTab />,
    securite: <SecuriteTab />,
    notifications: <NotificationsTab />,
  };

  return (
    <div className="min-h-screen" style={{ background: "#FAFAFA", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Header />
      <main className="pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProfileHeader avatarPreview={avatarPreview} onAvatarChange={handleAvatarChange} />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <ProfileSidebar activeTab={activeTab} onChange={handleTabChange} />
            <div className="lg:col-span-3">
              <motion.div key={activeTab} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl border border-gray-100 p-6">
                {TAB_COMPONENTS[activeTab]}
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}