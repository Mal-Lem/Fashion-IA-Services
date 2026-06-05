"use client";

import Link from "next/link";
import { Crown, Sparkles, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

interface ProfileHeaderProps {
  avatarPreview: string | null;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileHeader({ avatarPreview, onAvatarChange }: ProfileHeaderProps) {
  const { user } = useAuth();
  const avatarSrc = avatarPreview || user?.avatarUrl || null;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 flex items-center gap-6">
      
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold overflow-hidden"
          style={{ background: "linear-gradient(135deg, #5E35B1, #EC407A)" }}>
          {avatarSrc ? (
            <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            user?.firstName?.charAt(0)?.toUpperCase() || "U"
          )}
        </div>
        <label htmlFor="avatar-upload"
          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:opacity-90 transition-opacity"
          style={{ background: "#5E35B1" }} title="Modifier la photo">
          <Camera className="w-3.5 h-3.5 text-white" />
        </label>
        <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
      </div>

      {/* Infos */}
      <div className="flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-bold text-[#212121]" style={{ fontSize: "1.25rem" }}>
            {user?.firstName} {user?.lastName}
          </h1>
          {user?.isPremium ? (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #5E35B1, #EC407A)" }}>
              <Crown className="w-3 h-3" /> Premium
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: "#F5F5F5", color: "#757575" }}>
              Gratuit
            </span>
          )}
        </div>
        <p className="text-sm text-[#616161] mt-1">{user?.email}</p>
        <div className="flex items-center gap-4 mt-2">
          <span className="text-xs text-[#9E9E9E]">
            <Sparkles className="w-3 h-3 inline mr-1" style={{ color: "#5E35B1" }} />
            {user?.generationsUsed}/{user?.generationsMax === 999 ? "illimité" : user?.generationsMax} générations ce mois
          </span>
          {user?.gender && <span className="text-xs text-[#9E9E9E] capitalize">{user.gender}</span>}
        </div>
      </div>

      {/* CTA Premium */}
      {!user?.isPremium && (
        <Link href="/abonnements"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #5E35B1, #EC407A)" }}>
          <Crown className="w-4 h-4" /> Passer Premium
        </Link>
      )}
    </motion.div>
  );
}