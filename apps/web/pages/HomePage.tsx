"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";;
import { motion } from "framer-motion";
import { Sparkles, Star, ChevronDown, ArrowRight, Wand2, Users, ShoppingBag, ChevronLeft, ChevronRight, Plus, Minus } from "lucide-react";
import { Footer } from "@/components/shared/Footer";
import { COUTURIERES, TESTIMONIALS, FAQ_ITEMS, STATS, IMAGES } from "@/data/mockData";

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString("fr-FR")}</span>;
}

const HERO_DESIGNS = [
  { id: 1, image: IMAGES.eveningGown, label: "Robe de soirée" },
  { id: 2, image: IMAGES.fashionBlazer, label: "Blazer élégant" },
  { id: 3, image: IMAGES.bohemianDress, label: "Robe bohème" },
  { id: 4, image: IMAGES.whiteDress, label: "Ensemble casual" },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [testimonialsIdx, setTestimonialsIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_DESIGNS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#FAFAFA", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Hero */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a0533 0%, #2d1057 50%, #1a0533 100%)" }}
        aria-labelledby="hero-title"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full" style={{ background: "#5E35B1", filter: "blur(80px)" }} />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full" style={{ background: "#EC407A", filter: "blur(100px)" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 border border-white/20 bg-white/10">
                <Sparkles className="w-3.5 h-3.5 text-[#EC407A]" aria-hidden="true" />
                <span className="text-xs text-white/80">Propulsé par l'Intelligence Artificielle</span>
              </div>
              <h1
                id="hero-title"
                className="text-white mb-6"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 700, lineHeight: 1.15 }}
              >
                Imaginez-le.<br />
                <span style={{ color: "#EC407A" }}>Visualisez-le.</span><br />
                Faites-le créer.
              </h1>
              <p className="text-white/70 mb-8 max-w-lg" style={{ fontSize: "1.125rem", lineHeight: 1.7 }}>
                Décrivez votre vêtement idéal, notre IA génère le visuel en secondes, une couturière professionnelle le réalise sur-mesure.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/create"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-base transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/30"
                  style={{ background: "linear-gradient(135deg, #5E35B1, #EC407A)" }}
                >
                  <Wand2 className="w-5 h-5" aria-hidden="true" />
                  Créer mon design
                </Link>
                <Link
                  href="/couturieres"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-all hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/30 border border-white/30 text-white"
                >
                  Voir les couturières
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </motion.div>

            {/* Carousel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
              aria-label="Exemples de designs générés par IA"
            >
              <div
                className="relative rounded-2xl overflow-hidden mx-auto"
                style={{ maxWidth: "420px", height: "500px" }}
              >
                {HERO_DESIGNS.map((design, idx) => (
                  <div
                    key={design.id}
                    className="absolute inset-0 transition-opacity duration-700"
                    style={{ opacity: idx === currentSlide ? 1 : 0 }}
                    aria-hidden={idx !== currentSlide}
                  >
                    <img
                      src={design.image}
                      alt={design.label}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)" }} aria-hidden="true" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur text-white border border-white/20">
                          ✨ Généré par IA
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur text-white border border-white/20">
                          {design.label}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Dots */}
              <div className="flex justify-center gap-2 mt-4" role="tablist" aria-label="Navigation carousel">
                {HERO_DESIGNS.map((_, idx) => (
                  <button
                    key={idx}
                    role="tab"
                    aria-selected={idx === currentSlide}
                    aria-label={`Design ${idx + 1}`}
                    className="transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
                    style={{
                      width: idx === currentSlide ? "24px" : "8px",
                      height: "8px",
                      background: idx === currentSlide ? "#EC407A" : "rgba(255,255,255,0.4)",
                    }}
                    onClick={() => setCurrentSlide(idx)}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <div className="flex justify-center mt-12" aria-hidden="true">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex flex-col items-center gap-1 text-white/50"
            >
              <span className="text-xs">Découvrir</span>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white" aria-labelledby="stats-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="stats-title" className="sr-only">Statistiques de la plateforme</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { label: "designs générés", value: STATS.designs, icon: Sparkles, color: "#5E35B1" },
              { label: "couturières actives", value: STATS.couturieres, icon: Users, color: "#EC407A" },
              { label: "commandes réalisées", value: STATS.commandes, icon: ShoppingBag, color: "#00BCD4" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div
                  className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: `${stat.color}20` }}
                  aria-hidden="true"
                >
                  <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <p
                  className="mb-1"
                  style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", fontWeight: 700, color: "#212121" }}
                >
                  <AnimatedCounter target={stat.value} />
                </p>
                <p className="text-sm text-[#616161]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20" style={{ background: "#FAFAFA" }} aria-labelledby="features-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              id="features-title"
              className="mb-4"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.25rem", fontWeight: 700, color: "#212121" }}
            >
              Comment ça fonctionne ?
            </h2>
            <p className="text-[#616161] max-w-xl mx-auto" style={{ fontSize: "1.0625rem" }}>
              En trois étapes simples, passez de l'idée au vêtement sur-mesure réalisé par une professionnelle.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Créez votre design",
                desc: "Décrivez votre vêtement via notre formulaire intelligent ou en langage naturel. L'IA génère 4 visuels réalistes en moins de 15 secondes.",
                color: "#5E35B1",
                bg: "#EDE7FF",
                icon: Wand2,
              },
              {
                step: "02",
                title: "Choisissez votre couturière",
                desc: "Notre algorithme ML vous recommande les couturières les plus adaptées selon leur spécialité, localisation et disponibilité.",
                color: "#EC407A",
                bg: "#FCE4EC",
                icon: Users,
              },
              {
                step: "03",
                title: "Commandez sur-mesure",
                desc: "Échangez directement avec la couturière choisie via notre messagerie intégrée et recevez votre vêtement unique.",
                color: "#00BCD4",
                bg: "#E0F7FA",
                icon: ShoppingBag,
              },
            ].map((feature, i) => (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{ background: feature.bg }}
                  aria-hidden="true"
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <span className="text-xs font-semibold mb-3" style={{ color: feature.color }}>
                  ÉTAPE {feature.step}
                </span>
                <h3 className="mb-3" style={{ fontSize: "1.25rem", fontWeight: 600, color: "#212121", fontFamily: "'Playfair Display', serif" }}>
                  {feature.title}
                </h3>
                <p className="text-[#616161] text-sm leading-relaxed flex-1">{feature.desc}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Couturieres */}
      <section className="py-20 bg-white" aria-labelledby="couturieres-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2
                id="couturieres-title"
                className="mb-2"
                style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.25rem", fontWeight: 700, color: "#212121" }}
              >
                Nos couturières vedettes
              </h2>
              <p className="text-[#616161]">Découvrez les artisanes talentueuses de notre réseau</p>
            </div>
            <Link
              href="/couturieres"
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#5E35B1]"
              style={{ background: "#EDE7FF", color: "#5E35B1" }}
            >
              Voir toutes
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {COUTURIERES.map((c) => (
              <motion.article
                key={c.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer"
              >
                <Link href={`/couturieres/${c.id}`} className="block focus:outline-none focus:ring-2 focus:ring-[#5E35B1] rounded-2xl">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true">
                      <div className="absolute bottom-3 left-3 right-3">
                        <span
                          className="inline-flex items-center justify-center w-full py-2 rounded-lg text-sm font-medium text-white border border-white/30"
                          style={{ background: "rgba(94,53,177,0.8)" }}
                        >
                          Voir le profil
                        </span>
                      </div>
                    </div>
                    {c.certified && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1" style={{ background: "#5E35B1" }}>
                          ✓ Certifiée
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[#212121] mb-1">{c.name}</h3>
                    <p className="text-sm text-[#616161] mb-3">{c.specialty}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                        <span className="text-sm font-medium text-[#212121]">{c.rating}</span>
                        <span className="text-xs text-[#757575]">({c.reviewCount})</span>
                      </div>
                      <span className="text-xs text-[#757575]">{c.location.split(",")[0]}</span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link
              href="/couturieres"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm"
              style={{ background: "#EDE7FF", color: "#5E35B1" }}
            >
              Voir toutes les couturières
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20" style={{ background: "#EDE7FF" }} aria-labelledby="testimonials-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              id="testimonials-title"
              className="mb-4"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.25rem", fontWeight: 700, color: "#212121" }}
            >
              Ce qu'elles en disent
            </h2>
            <p className="text-[#616161]">Des milliers d'utilisatrices ont déjà créé leurs vêtements sur-mesure</p>
          </div>
          <div className="relative max-w-3xl mx-auto">
            <div className="overflow-hidden">
              <motion.div
                key={testimonialsIdx}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="bg-white rounded-2xl p-8 shadow-sm"
              >
                <div className="flex items-center gap-1 mb-4" aria-label={`${TESTIMONIALS[testimonialsIdx].rating} étoiles sur 5`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < TESTIMONIALS[testimonialsIdx].rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <blockquote className="text-[#424242] leading-relaxed mb-6" style={{ fontSize: "1.0625rem" }}>
                  "{TESTIMONIALS[testimonialsIdx].text}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <img
                    src={TESTIMONIALS[testimonialsIdx].avatar}
                    alt={TESTIMONIALS[testimonialsIdx].name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-[#212121] text-sm">{TESTIMONIALS[testimonialsIdx].name}</p>
                    <p className="text-xs text-[#757575]">{TESTIMONIALS[testimonialsIdx].city} · {TESTIMONIALS[testimonialsIdx].type}</p>
                  </div>
                </div>
              </motion.div>
            </div>
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setTestimonialsIdx((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-[#5E35B1]"
                aria-label="Témoignage précédent"
              >
                <ChevronLeft className="w-4 h-4 text-[#424242]" aria-hidden="true" />
              </button>
              <div className="flex gap-2" role="tablist">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    role="tab"
                    aria-selected={i === testimonialsIdx}
                    aria-label={`Témoignage ${i + 1}`}
                    className="transition-all rounded-full focus:outline-none focus:ring-2 focus:ring-[#5E35B1]"
                    style={{
                      width: i === testimonialsIdx ? "20px" : "8px",
                      height: "8px",
                      background: i === testimonialsIdx ? "#5E35B1" : "#D1C4E9",
                    }}
                    onClick={() => setTestimonialsIdx(i)}
                  />
                ))}
              </div>
              <button
                onClick={() => setTestimonialsIdx((prev) => (prev + 1) % TESTIMONIALS.length)}
                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-[#5E35B1]"
                aria-label="Témoignage suivant"
              >
                <ChevronRight className="w-4 h-4 text-[#424242]" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white" aria-labelledby="faq-title">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              id="faq-title"
              className="mb-4"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.25rem", fontWeight: 700, color: "#212121" }}
            >
              Questions fréquentes
            </h2>
          </div>
          <div className="space-y-3" role="list">
            {FAQ_ITEMS.map((item) => (
              <div
                key={item.id}
                role="listitem"
                className="border border-gray-100 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === item.id ? null : item.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5E35B1] focus:ring-inset"
                  aria-expanded={openFaq === item.id}
                >
                  <span className="font-medium text-[#212121] pr-4">{item.question}</span>
                  <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: openFaq === item.id ? "#5E35B1" : "#F5F5F5" }}>
                    {openFaq === item.id
                      ? <Minus className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                      : <Plus className="w-3.5 h-3.5 text-[#424242]" aria-hidden="true" />
                    }
                  </span>
                </button>
                {openFaq === item.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-5 pb-5 text-[#616161] text-sm leading-relaxed"
                  >
                    {item.answer}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section
        className="py-20 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #5E35B1, #EC407A)" }}
        aria-labelledby="cta-title"
      >
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            id="cta-title"
            className="text-white mb-6"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", fontWeight: 700 }}
          >
            Prête à créer votre vêtement de rêve ?
          </h2>
          <p className="text-white/80 mb-10 max-w-xl mx-auto" style={{ fontSize: "1.125rem" }}>
            Rejoignez plus de 12 400 femmes qui ont déjà transformé leurs idées en vêtements uniques.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl bg-white font-semibold text-base transition-all hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-white/50"
              style={{ color: "#5E35B1" }}
            >
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              Commencer gratuitement
            </Link>
            <Link
              href="/create"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-semibold text-base border-2 border-white/40 text-white hover:bg-white/10 transition-all focus:outline-none focus:ring-4 focus:ring-white/50"
            >
              Essayer sans créer de compte
            </Link>
          </div>
          <p className="text-white/60 text-sm mt-6">Gratuit · Aucune carte bancaire requise · 5 générations offertes</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
