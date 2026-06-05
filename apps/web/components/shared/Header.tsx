"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Sparkles, Menu, X, User, MessageCircle, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push("/");
  };

  const navLinks = user?.role === "couturiere"
    ? [
        { label: "Mon espace pro", href: "/espace-pro" },
        { label: "Couturières", href: "/couturieres" },
        { label: "Tarifs", href: "/abonnements" },
      ]
    : [
        { label: "Créer un design", href: "/create" },
        { label: "Couturières", href: "/couturieres" },
        { label: "Tarifs", href: "/abonnements" },
        { label: "À propos", href: "/a-propos" },
        { label: "Contact", href: "/contact" },
      ];

  const isActive = (href: string) => pathname === href;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-sm" : "bg-transparent"
      }`}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#5E35B1] rounded-md"
            aria-label="Mallem - Accueil">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#5E35B1" }}>
              <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <span className="hidden sm:block font-semibold text-[#212121]"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem" }}>
              Mallem
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav aria-label="Navigation principale" className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className={`text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#5E35B1] rounded px-1 py-0.5 ${
                  isActive(link.href) ? "text-[#5E35B1] font-medium" : "text-[#616161] hover:text-[#212121]"
                }`}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                {/* Messages */}
                <Link href="/messages"
                  className="relative p-2 rounded-full hover:bg-gray-100 text-[#616161] hover:text-[#212121] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5E35B1]"
                  aria-label="Messagerie">
                  <MessageCircle className="w-5 h-5" aria-hidden="true" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#EC407A]" aria-label="Nouveaux messages" />
                </Link>

                {/* User menu */}
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5E35B1]"
                    aria-expanded={userMenuOpen} aria-haspopup="menu" aria-label="Menu utilisateur">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-medium"
                      style={{ background: "#5E35B1" }}>
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        user.name.charAt(0)
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-[#616161] hidden sm:block" aria-hidden="true" />
                  </button>

                  {userMenuOpen && (
                    <div role="menu"
                      className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                      onBlur={() => setUserMenuOpen(false)}>

                      {/* Header du dropdown */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                            style={{ background: "#5E35B1" }}>
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              user.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#212121]">{user.name}</p>
                            <p className="text-xs text-[#616161]">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {user.isPremium && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#EDE7FF] text-[#5E35B1]">
                              Premium
                            </span>
                          )}
                          {user.role === "couturiere" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#FCE4EC] text-[#C2185B]">
                              Couturière
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="py-1">
                        {/* Mes designs — uniquement pour les clients */}
                        {user.role !== "couturiere" && (
                          <Link href="/mes-designs" role="menuitem"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-[#424242] hover:bg-gray-50 transition-colors"
                            onClick={() => setUserMenuOpen(false)}>
                            <Sparkles className="w-4 h-4 text-[#5E35B1]" aria-hidden="true" />
                            Mes designs
                          </Link>
                        )}

                        {/* Espace pro — uniquement pour les couturières */}
                        {user.role === "couturiere" && (
                          <Link href="/espace-pro" role="menuitem"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-[#424242] hover:bg-gray-50 transition-colors"
                            onClick={() => setUserMenuOpen(false)}>
                            <LayoutDashboard className="w-4 h-4 text-[#5E35B1]" aria-hidden="true" />
                            Mon espace pro
                          </Link>
                        )}

                        {/* Admin */}
                        {user.role === "admin" && (
                          <Link href="/admin" role="menuitem"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-[#424242] hover:bg-gray-50 transition-colors"
                            onClick={() => setUserMenuOpen(false)}>
                            <LayoutDashboard className="w-4 h-4 text-[#5E35B1]" aria-hidden="true" />
                            Administration
                          </Link>
                        )}

                        {/* Mon profil — adapté selon le rôle */}
                        <Link
                          href={user?.role === "couturiere" ? "/espace-pro" : "/profil"}
                          role="menuitem"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-[#424242] hover:bg-gray-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}>
                          <User className="w-4 h-4 text-[#5E35B1]" aria-hidden="true" />
                          {user?.role === "couturiere" ? "Mon profil atelier" : "Mon profil"}
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 pt-1">
                        <button role="menuitem" onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[#C62828] hover:bg-red-50 transition-colors">
                          <LogOut className="w-4 h-4" aria-hidden="true" />
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login"
                  className="hidden sm:inline-flex text-sm font-medium text-[#616161] hover:text-[#212121] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5E35B1] rounded px-2 py-1">
                  Connexion
                </Link>
                <Link href="/register"
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#5E35B1] focus:ring-offset-2"
                  style={{ background: "#5E35B1" }}>
                  Essayer gratuitement
                </Link>
              </>
            )}

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5E35B1]"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}>
              {mobileOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav aria-label="Navigation mobile" className="md:hidden border-t border-gray-100 bg-white py-4 px-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className="block px-4 py-3 rounded-lg text-sm text-[#424242] hover:bg-gray-50 transition-colors"
                onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            ))}
            {isAuthenticated && user && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <Link
                  href={user.role === "couturiere" ? "/espace-pro" : "/profil"}
                  className="block px-4 py-3 rounded-lg text-sm text-[#424242] hover:bg-gray-50 transition-colors"
                  onClick={() => setMobileOpen(false)}>
                  {user.role === "couturiere" ? "Mon espace pro" : "Mon profil"}
                </Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="block w-full text-left px-4 py-3 rounded-lg text-sm text-[#C62828] hover:bg-red-50 transition-colors">
                  Déconnexion
                </button>
              </div>
            )}
            {!isAuthenticated && (
              <div className="mt-3 flex flex-col gap-2 px-4">
                <Link href="/login"
                  className="text-center py-2.5 rounded-lg text-sm font-medium text-[#5E35B1] border border-[#D1C4E9] hover:bg-[#EDE7FF] transition-colors"
                  onClick={() => setMobileOpen(false)}>
                  Connexion
                </Link>
                <Link href="/register"
                  className="text-center py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
                  style={{ background: "#5E35B1" }}
                  onClick={() => setMobileOpen(false)}>
                  Essayer gratuitement
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}