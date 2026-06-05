"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { Heart, Sparkles, Users, Wand2, Award, ArrowRight } from "lucide-react";

const STATS = [
  { value: "340+", label: "Couturières certifiées" },
  { value: "5000+", label: "Designs générés" },
  { value: "98%", label: "Clients satisfaits" },
  { value: "2", label: "Femmes qui m'ont inspirée" },
];

const VALUES = [
  {
    icon: Heart,
    title: "L'amour du métier",
    desc: "Mallem est née de l'amour profond pour la couture, un art transmis de génération en génération par des femmes courageuses et créatives.",
  },
  {
    icon: Sparkles,
    title: "L'innovation au service du talent",
    desc: "Nous utilisons l'intelligence artificielle pour valoriser le travail des couturières et rendre la mode sur-mesure accessible à toutes.",
  },
  {
    icon: Users,
    title: "Une communauté solidaire",
    desc: "Mallem c'est une famille — des couturières passionnées, des clients exigeants, et une technologie qui les réunit.",
  },
  {
    icon: Award,
    title: "L'excellence sur-mesure",
    desc: "Chaque vêtement créé via Mallem est unique, pensé pour vous, et réalisé par des artisanes de talent.",
  },
];

const TEAM = [
  {
    name: "Fondatrice & CEO",
    role: "Data Engineer & Développeuse",
    desc: "Fille et petite-fille de couturières, j'ai grandi entre les tissus et les machines à coudre avant de choisir la tech pour honorer leur héritage.",
    initial: "M",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: "#FAFAFA", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Header />

      <main className="pt-16">

        {/* Hero */}
        <section
          className="relative py-24 px-4 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1a0533, #2d1057)" }}
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full" style={{ background: "#5E35B1", filter: "blur(80px)" }} />
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full" style={{ background: "#EC407A", filter: "blur(100px)" }} />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white/80 mb-6"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
                <Heart className="w-4 h-4 text-[#EC407A]" />
                Notre histoire
              </span>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700, color: "white", lineHeight: 1.2, marginBottom: "1.5rem" }}>
                Mallem — L'art de la couture,<br />réinventé par la technologie
              </h1>
              <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
                Une startup née de l'amour d'une fille pour sa mère couturière et sa grand-mère, 
                deux femmes courageuses qui ont tout donné pour créer de la beauté.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Notre histoire */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: "#EC407A" }}>
                  Notre histoire
                </span>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 700, color: "#212121", margin: "1rem 0" }}>
                  De l'atelier du village en Kabylie 
                </h2>
                <div className="space-y-4 text-[#616161] leading-relaxed">
                  <p>
                    Tout a commencé dans un village, avec une femme extraordinaire — ma mère. 
                    Couturière de talent, elle créait des modèles uniques qu'elle déposait dans le magasin du village. 
                    Les gens venaient les voir, les admiraient, les achetaient. Elle transformait du tissu en rêves.
                  </p>
                  <p>
                    À ses côtés, ma grand-mère — une femme d'une sagesse et d'un courage incroyables — 
                    m'encourageait à suivre leurs traces, à devenir couturière à mon tour. 
                    Ces deux femmes m'ont appris que créer de la beauté, c'est une forme de combat.
                  </p>
                  <p>
                    Mais moi, je voyais mes capacités ailleurs — dans la technologie, dans les données, 
                    dans l'intelligence artificielle. J'ai choisi la tech. Et puis un jour, j'ai compris 
                    qu'il ne fallait pas choisir.
                  </p>
                  <p style={{ color: "#5E35B1", fontWeight: 600 }}>
                    Mallem est née de cette évidence : réunir mes compétences techniques et mon amour 
                    pour ces deux femmes courageuses qui m'ont élevée et inspirée.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, #EDE7FF, #FCE4EC)", padding: "3rem", textAlign: "center" }}>
                  <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-4xl font-bold" style={{ background: "linear-gradient(135deg, #5E35B1, #EC407A)" }}>
                    M
                  </div>
                  <blockquote style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem", color: "#212121", fontStyle: "italic", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                    "Ma mère créait de la beauté avec du tissu. Moi je crée de la beauté avec du code. 
                    Mallem, c'est notre histoire à toutes les trois."
                  </blockquote>
                  <div>
                    <p className="font-semibold text-[#212121]">La Fondatrice</p>
                    <p className="text-sm text-[#9E9E9E]">Data Engineer & CEO de Mallem</p>
                  </div>
                </div>

                {/* Décorations */}
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "#5E35B1" }}>
                  <Wand2 className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#EC407A" }}>
                  <Heart className="w-6 h-6 text-white" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 px-4" style={{ background: "linear-gradient(135deg, #5E35B1, #EC407A)" }}>
          <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {STATS.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <p className="text-white font-bold" style={{ fontSize: "2.5rem", fontFamily: "'Playfair Display', serif" }}>
                  {stat.value}
                </p>
                <p className="text-white/70 text-sm mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Valeurs */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: "#EC407A" }}>
                Ce qui nous guide
              </span>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 700, color: "#212121", marginTop: "0.5rem" }}>
                Nos valeurs
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {VALUES.map((v, idx) => {
                const Icon = v.icon;
                return (
                  <motion.div
                    key={v.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "#EDE7FF" }}>
                      <Icon className="w-6 h-6" style={{ color: "#5E35B1" }} />
                    </div>
                    <h3 className="font-semibold text-[#212121] mb-2">{v.title}</h3>
                    <p className="text-sm text-[#616161] leading-relaxed">{v.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20 px-4" style={{ background: "#F5F0FF" }}>
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: "#EC407A" }}>
                Notre mission
              </span>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 700, color: "#212121", margin: "1rem 0" }}>
                Donner du pouvoir aux couturières, de la liberté aux clients
              </h2>
              <p className="text-[#616161] leading-relaxed mb-8">
                Chez Mallem, nous croyons que chaque couturière mérite d'être reconnue pour son talent, 
                et que chaque personne mérite des vêtements qui lui ressemblent vraiment. 
                Notre technologie IA est au service de cet idéal — pas pour remplacer l'artisanat, 
                mais pour l'amplifier et le rendre accessible à tous.
              </p>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #5E35B1, #EC407A)" }}
              >
                Commencer l'aventure
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}