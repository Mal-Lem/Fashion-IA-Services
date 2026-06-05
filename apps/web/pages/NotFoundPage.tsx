"use client";

import Link from "next/link";;
import { Header } from "@/components/shared/Header";
import { Sparkles, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAFAFA", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Header />
      <main className="flex-1 flex items-center justify-center pt-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div
            className="w-24 h-24 rounded-3xl mx-auto mb-8 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #5E35B1, #EC407A)" }}
            aria-hidden="true"
          >
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <p className="text-6xl font-bold mb-4" style={{ color: "#5E35B1", fontFamily: "'Playfair Display', serif" }}>
            404
          </p>
          <h1 className="text-xl font-semibold text-[#212121] mb-3">Page introuvable</h1>
          <p className="text-[#616161] mb-8">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white focus:outline-none focus:ring-4 focus:ring-[#5E35B1]/30"
              style={{ background: "#5E35B1" }}
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Retour à l'accueil
            </Link>
            <Link
              href="/create"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium border border-gray-200 text-[#424242] hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5E35B1]"
            >
              Créer un design
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
