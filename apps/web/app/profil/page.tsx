"use client";
import { Suspense } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import UserProfilePage from "@/pages/UserProfilePage";

export default function ProfilPage() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (user?.role === "couturiere") router.push("/espace-pro");
  }, [user, router]);
  if (user?.role === "couturiere") return null;
  return (
    <Suspense fallback={null}>
      <UserProfilePage />
    </Suspense>
  );
}