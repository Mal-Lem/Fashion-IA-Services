"use client";
import { use } from "react";
import CouturierePublicPage from "@/pages/CouturierePublicPage";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <CouturierePublicPage id={id} />;
}