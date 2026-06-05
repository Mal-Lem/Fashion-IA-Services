"use client";

import Link from "next/link";;
import { Sparkles, Globe, MessageCircle, Share2 } from "lucide-react";

export function Footer() {
  const columns = [
    {
      title: "Produit",
      links: [
        { label: "Créer un design", href: "/create" },
        { label: "Mes designs", href: "/mes-designs" },
        { label: "Tarifs", href: "/abonnements" },
        { label: "Nouveautés", href: "/" },
      ],
    },
    {
      title: "Couturières",
      links: [
        { label: "Trouver une couturière", href: "/couturieres" },
        { label: "Devenir couturière", href: "/register" },
        { label: "Espace professionnel", href: "/espace-pro" },
        { label: "Certification", href: "/couturieres" },
      ],
    },
    {
      title: "Entreprise",
      links: [
        { label: "À propos", href: "/" },
        { label: "Blog", href: "/" },
        { label: "Presse", href: "/" },
        { label: "Contact", href: "/" },
      ],
    },
    {
      title: "Légal",
      links: [
        { label: "Confidentialité", href: "/" },
        { label: "CGU", href: "/" },
        { label: "Mentions légales", href: "/" },
        { label: "RGPD", href: "/" },
      ],
    },
  ];

  return (
    <footer className="bg-[#212121] text-white" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href ="/" className="flex items-center gap-2 mb-4" aria-label="Fashion AI Platform">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#5E35B1" }}>
                <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 600 }}>
                Fashion AI
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Visualisez votre vêtement idéal grâce à l'IA, puis faites-le créer par une couturière professionnelle.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Instagram" className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50">
                <Globe className="w-4 h-4" aria-hidden="true" />
              </a>
              <a href="#" aria-label="Twitter" className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50">
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
              </a>
              <a href="#" aria-label="Facebook" className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50">
                <Share2 className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Links */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-white mb-4">{col.title}</h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href = {link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © 2026 Fashion AI Platform. Tous droits réservés.
          </p>
          <p className="text-xs text-gray-500">
            🔒 Vos données sont protégées conformément au RGPD
          </p>
        </div>
      </div>
    </footer>
  );
}
