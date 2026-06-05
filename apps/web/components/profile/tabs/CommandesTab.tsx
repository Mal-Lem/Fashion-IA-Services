"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Star } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  completed: { bg: "#E8F5E9", text: "#2E7D32" },
  in_progress: { bg: "#FFF3E0", text: "#E65100" },
  accepted: { bg: "#E3F2FD", text: "#1565C0" },
  pending: { bg: "#F5F5F5", text: "#757575" },
  refused: { bg: "#FFEBEE", text: "#C62828" },
};

const STATUS_LABELS: Record<string, string> = {
  completed: "Réalisé", in_progress: "En cours",
  accepted: "Accepté", pending: "En attente",
  refused: "Refusé", cancelled: "Annulé",
};

export function CommandesTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { ordersApi } = await import("@/lib/api");
      const result = await ordersApi.getAll();
      setOrders(result.data || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewOrderId) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:3001/v1/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId: reviewOrderId, rating: reviewRating, comment: reviewComment }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur");
      }
      toast.success("Avis envoyé ! Il sera examiné avant publication.");
      setReviewOrderId(null);
      setReviewComment("");
      setReviewRating(5);
      loadOrders();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'envoi");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "#EDE7FF" }} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-semibold text-[#212121] mb-5">Historique des commandes</h2>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3" style={{ color: "#D1C4E9" }} />
          <p className="text-[#9E9E9E] text-sm">Aucune commande pour l'instant</p>
          <Link href="/couturieres" className="text-sm font-medium mt-2 inline-block" style={{ color: "#5E35B1" }}>
            Trouver une couturière
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const s = STATUS_STYLES[order.status] || STATUS_STYLES["pending"];
            return (
              <div key={order.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="w-12 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  {order.design?.selectedImageUrl && (
                    <img src={order.design.selectedImageUrl} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#212121] truncate">{order.design?.name || "Design"}</p>
                  <p className="text-xs text-[#9E9E9E]">
                    {order.couturiere?.atelierName} — {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                  {order.agreedAmount && (
                    <span className="text-sm font-semibold text-[#212121]">
                      {(order.agreedAmount / 100).toFixed(0)}€
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: s.bg, color: s.text }}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                  <Link href="/messages" className="text-xs font-medium" style={{ color: "#5E35B1" }}>Voir</Link>
                  {order.status === "completed" && !order.review && (
                    <button onClick={() => setReviewOrderId(order.id)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg text-white flex items-center gap-1"
                      style={{ background: "linear-gradient(135deg, #F59E0B, #EC407A)" }}>
                      <Star className="w-3 h-3" /> Avis
                    </button>
                  )}
                  {order.review && (
                    <span className="text-xs text-[#9E9E9E] flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Avis donné
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal avis */}
      {reviewOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)" }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-semibold text-[#212121] mb-1"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem" }}>
              Laisser un avis
            </h3>
            <p className="text-sm text-[#9E9E9E] mb-5">Partagez votre expérience pour aider d'autres clientes</p>

            <div className="mb-5">
              <label className="block text-sm font-medium text-[#212121] mb-2">Note</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <button key={i} type="button" onClick={() => setReviewRating(i)}
                    onMouseEnter={() => setHoveredStar(i)} onMouseLeave={() => setHoveredStar(0)}>
                    <Star className="w-9 h-9 transition-all"
                      style={{
                        color: i <= (hoveredStar || reviewRating) ? "#F59E0B" : "#E0E0E0",
                        fill: i <= (hoveredStar || reviewRating) ? "#F59E0B" : "none",
                      }} />
                  </button>
                ))}
                <span className="text-sm text-[#616161] ml-1 font-medium">
                  {["", "Décevant", "Passable", "Bien", "Très bien", "Excellent !"][hoveredStar || reviewRating]}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#212121] mb-1.5">
                Commentaire <span className="text-[#9E9E9E] font-normal">(optionnel)</span>
              </label>
              <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)}
                placeholder="Décrivez votre expérience..." rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#212121] focus:outline-none focus:ring-2 focus:border-[#5E35B1] resize-none" />
            </div>

            <div className="p-3 rounded-xl mb-4 text-xs text-[#616161]" style={{ background: "#EDE7FF" }}>
              ✨ Votre avis sera examiné avant d'être publié sur la page d'accueil.
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setReviewOrderId(null); setReviewComment(""); setReviewRating(5); }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-[#424242] hover:bg-gray-50">
                Annuler
              </button>
              <button onClick={handleSubmitReview} disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #5E35B1, #EC407A)" }}>
                {submitting ? "Envoi..." : "Publier l'avis"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}