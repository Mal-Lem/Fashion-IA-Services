"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/shared/Header";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Search, ArrowLeft, Image, X, FileText, Wifi, WifiOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getAccessToken } from "@/lib/api";
import { io, Socket } from "socket.io-client";

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  accepted: { bg: "#E8F5E9", text: "#2E7D32" },
  in_progress: { bg: "#FFF3E0", text: "#E65100" },
  refused: { bg: "#FFEBEE", text: "#C62828" },
  pending: { bg: "#F5F5F5", text: "#757575" },
  completed: { bg: "#E3F2FD", text: "#1565C0" },
};

const STATUS_LABELS: Record<string, string> = {
  accepted: "Acceptee", in_progress: "En cours", refused: "Refusee",
  pending: "En attente", completed: "Terminee", cancelled: "Annulee",
};

interface Message {
  id: string; senderId: string; content: string; messageType: string;
  attachmentUrls?: string[]; isSystem: boolean; readAt: string | null;
  createdAt: string; sender?: { id: string; firstName: string; avatarUrl?: string };
}

interface Conversation {
  orderId: string; status: string;
  design?: { name: string; selectedImageUrl?: string };
  partner?: { id: string; firstName: string; lastName: string; avatarUrl?: string };
  lastMessage?: { content: string; createdAt: string; isSystem: boolean };
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [search, setSearch] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showOrderCard, setShowOrderCard] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const load = async () => {
      try {
        const token = getAccessToken();
        const res = await fetch("http://localhost:3001/v1/messages", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setConversations(data || []);
          if (data && data.length > 0 && !activeConv) setActiveConv(data[0]);
        }
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!activeConv) return;
    const load = async () => {
      try {
        const token = getAccessToken();
        const res = await fetch(`http://localhost:3001/v1/messages/${activeConv.orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setMessages(await res.json());
      } catch {}
    };
    load();
  }, [activeConv]);

  const socketRef = useRef<Socket | null>(null);
  const activeConvRef = useRef<Conversation | null>(null);

  useEffect(() => {
    activeConvRef.current = activeConv;
  }, [activeConv]);

  useEffect(() => {
    if (!user) return;
    const token = getAccessToken();
    console.log("[WS] Connecting...");
    const socket = io("http://localhost:3001", {
      auth: { token },
      transports: ["polling"],
    });

    socket.on("connect", () => {
      console.log("[WS] Connected:", socket.id);
      setConnected(true);
      if (activeConvRef.current) {
        console.log("[WS] Joining room:", activeConvRef.current.orderId);
        socket.emit("join_conversation", { orderId: activeConvRef.current.orderId });
      }
    });
    socket.on("connect_error", (err) => {
      console.error("[WS] Error:", err.message);
    });
    socket.on("disconnect", (reason) => {
      console.log("[WS] Disconnected:", reason);
      if (reason === "io server disconnect" || reason === "transport close") {
        setConnected(false);
      }
    });

    socket.on("new_message", (msg: Message) => {
      const currentConv = activeConvRef.current;
      console.log("[WS] new_message:", msg.content?.substring(0, 30), "conv:", currentConv?.orderId);
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      if (currentConv && msg.orderId === currentConv.orderId) {
        setConversations((prev) =>
          prev.map((c) =>
            c.orderId === currentConv.orderId
              ? { ...c, lastMessage: { content: msg.content, createdAt: msg.createdAt, isSystem: msg.isSystem } }
              : c
          )
        );
      }
    });

    socketRef.current = socket;
    return () => { socket.disconnect(); };
  }, [user]);


  const handleSelectConv = (conv: Conversation) => {
    setActiveConv(conv);
    setShowSidebar(false);
    setShowOrderCard(true);
    if (socketRef.current?.connected) {
      socketRef.current.emit("join_conversation", { orderId: conv.orderId });
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputVal.trim() && imagePreviews.length === 0) || !activeConv || sending) return;
    setSending(true);
    const content = inputVal.trim();
    setInputVal("");

    try {
      const token = getAccessToken();
      const body: any = { content: content || "" };
      if (imagePreviews.length > 0) body.attachmentUrls = imagePreviews;

      const res = await fetch(`http://localhost:3001/v1/messages/${activeConv.orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Send failed:", err);
      }
      setImagePreviews([]);
    } catch {} finally { setSending(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const token = getAccessToken();
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("http://localhost:3001/v1/messages/upload", {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setImagePreviews((prev) => [...prev, data.url as string]);
      }
    } catch {} finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const filtered = conversations.filter(
    (c) => !search || c.partner?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      c.design?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAFAFA", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Header />
      <main className="flex-1 pt-16 flex overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
        <div className="w-full max-w-7xl mx-auto flex overflow-hidden rounded-none lg:rounded-2xl lg:my-4 lg:shadow-sm lg:border lg:border-gray-100 bg-white">

          <aside className={`${showSidebar ? "flex" : "hidden"} lg:flex flex-col w-full lg:w-80 xl:w-96 flex-shrink-0 border-r border-gray-100`}>
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h1 className="font-semibold text-[#212121]" style={{ fontSize: "1.1rem" }}>Messages</h1>
                <span title={connected ? "WS connecté" : "WS déconnecté"}>
                  <div className="w-3 h-3 rounded-full" style={{ background: connected ? "#2E7D32" : "#C62828" }} />
                </span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9E9E]" />
                <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#212121] placeholder-[#9E9E9E] focus:outline-none focus:ring-2 focus:border-[#5E35B1] bg-[#FAFAFA]" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-3 p-2">
                      <div className="w-12 h-12 rounded-full animate-pulse flex-shrink-0" style={{ background: "#EDE7FF" }} />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 rounded animate-pulse" style={{ background: "#EDE7FF", width: "60%" }} />
                        <div className="h-3 rounded animate-pulse" style={{ background: "#EDE7FF", width: "80%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <p className="text-[#9E9E9E] text-sm">Aucune conversation</p>
                  <Link href="/couturieres" className="mt-3 text-sm font-medium" style={{ color: "#5E35B1" }}>Trouver une couturiere</Link>
                </div>
              ) : (
                filtered.map((conv) => {
                  const isActive = activeConv?.orderId === conv.orderId;
                  return (
                    <button key={conv.orderId} onClick={() => handleSelectConv(conv)}
                      className="w-full flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-50"
                      style={{ background: isActive ? "#F5F0FF" : undefined, borderLeft: isActive ? "3px solid #5E35B1" : "3px solid transparent" }}>
                      <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white font-semibold text-sm overflow-hidden" style={{ background: "#5E35B1" }}>
                        {conv.partner?.avatarUrl ? <img src={conv.partner.avatarUrl} alt="" className="w-full h-full object-cover" /> : conv.partner?.firstName?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-[#212121] text-sm truncate">{conv.partner?.firstName} {conv.partner?.lastName}</span>
                          {conv.lastMessage && <span className="text-xs text-[#9E9E9E] flex-shrink-0 ml-2">{formatDate(conv.lastMessage.createdAt)}</span>}
                        </div>
                        <p className="text-xs truncate mb-1.5" style={{ color: conv.lastMessage?.isSystem ? "#9E9E9E" : "#212121", fontWeight: conv.lastMessage?.isSystem ? 400 : 500 }}>
                          {conv.lastMessage?.isSystem ? "Message systeme" : conv.lastMessage?.content || "Aucun message"}
                        </p>
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: STATUS_STYLES[conv.status]?.bg || "#F5F5F5", color: STATUS_STYLES[conv.status]?.text || "#757575" }}>
                          {STATUS_LABELS[conv.status] || conv.status}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <div className={`${!showSidebar ? "flex" : "hidden"} lg:flex flex-1 flex-col min-w-0`}>
            {!activeConv ? (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <p className="text-[#9E9E9E] mb-2">Selectionnez une conversation</p>
                  <Link href="/couturieres" className="text-sm font-medium" style={{ color: "#5E35B1" }}>Trouver une couturiere</Link>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                  <button onClick={() => setShowSidebar(true)} className="lg:hidden p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft className="w-5 h-5 text-[#424242]" />
                  </button>
                  <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-semibold text-sm overflow-hidden" style={{ background: "#5E35B1" }}>
                    {activeConv.partner?.avatarUrl ? <img src={activeConv.partner.avatarUrl} alt="" className="w-full h-full object-cover" /> : activeConv.partner?.firstName?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#212121] text-sm">{activeConv.partner?.firstName} {activeConv.partner?.lastName}</p>
                    <p className="text-xs text-[#9E9E9E] truncate">{activeConv.design?.name || "Commande"}</p>
                  </div>
                  <button onClick={() => setShowOrderCard(!showOrderCard)} className="p-2 rounded-lg hover:bg-gray-100" title="Details commande">
                    <FileText className="w-4 h-4 text-[#757575]" />
                  </button>
                  <span className="px-3 py-1 rounded-full text-xs font-medium flex-shrink-0"
                    style={{ background: STATUS_STYLES[activeConv.status]?.bg || "#F5F5F5", color: STATUS_STYLES[activeConv.status]?.text || "#757575" }}>
                    {STATUS_LABELS[activeConv.status] || activeConv.status}
                  </span>
                </div>

                {showOrderCard && (
                  <div className="mx-4 mt-3 p-4 rounded-xl border border-gray-100" style={{ background: "#FAFAFA" }}>
                    <div className="flex items-center gap-3">
                      {activeConv.design?.selectedImageUrl && (
                        <img src={activeConv.design.selectedImageUrl} alt="" className="w-14 h-14 rounded-xl object-cover" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-[#212121]">{activeConv.design?.name || "Commande"}</p>
                        <p className="text-xs text-[#757575] mt-0.5">Statut : {STATUS_LABELS[activeConv.status] || activeConv.status}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <AnimatePresence>
                    {messages.map((msg) => {
                      const isOwn = msg.senderId === user?.id;
                      if (msg.isSystem) {
                        return (
                          <div key={msg.id} className="flex justify-center">
                            <span className="px-4 py-1.5 rounded-full text-xs text-[#757575] bg-[#F5F5F5]">{msg.content}</span>
                          </div>
                        );
                      }
                      return (
                        <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isOwn ? "justify-end" : "justify-start"} gap-2`}>
                          {!isOwn && (
                            <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold self-end overflow-hidden" style={{ background: "#5E35B1" }}>
                              {msg.sender?.avatarUrl ? <img src={msg.sender.avatarUrl} alt="" className="w-full h-full object-cover" /> : msg.sender?.firstName?.[0]?.toUpperCase() || "?"}
                            </div>
                          )}
                          <div className="max-w-xs lg:max-w-md">
                            {msg.messageType === "image" && msg.attachmentUrls?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-1">
                                {msg.attachmentUrls.map((url: string, i: number) => (
                                  <img key={i} src={url} alt="" className="rounded-2xl cursor-pointer hover:opacity-90"
                                    style={{ maxHeight: "150px", maxWidth: "200px" }}
                                    onClick={() => window.open(url, "_blank")} />
                                ))}
                              </div>
                            )}
                            {msg.content && (
                              <div className="px-4 py-2.5 rounded-2xl text-sm"
                                style={{ background: isOwn ? "#5E35B1" : "#F5F5F5", color: isOwn ? "white" : "#212121",
                                  borderBottomRightRadius: isOwn ? "4px" : "16px", borderBottomLeftRadius: isOwn ? "16px" : "4px" }}>
                                {msg.content}
                              </div>
                            )}
                            <div className={`flex items-center gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                              <span className="text-xs text-[#9E9E9E]">{formatTime(msg.createdAt)}</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="p-4 border-t border-gray-100">
                  {imagePreviews.length > 0 && (
                    <div className="mb-3 flex gap-2 flex-wrap">
                      {imagePreviews.map((url, i) => (
                        <div key={i} className="relative inline-block">
                          <img src={url} alt="" className="h-16 rounded-lg" />
                          <button type="button" onClick={() => setImagePreviews((prev) => prev.filter((_, j) => j !== i))}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-[#757575] hover:bg-gray-100 transition-colors disabled:opacity-50">
                      <Image className="w-5 h-5" />
                    </button>
                    <input type="text" value={inputVal} onChange={(e) => setInputVal(e.target.value)}
                      placeholder="Ecrivez votre message..." disabled={sending}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#212121] placeholder-[#9E9E9E] focus:outline-none focus:ring-2 focus:border-[#5E35B1] bg-[#FAFAFA]" />
                    <button type="submit" disabled={(!inputVal.trim() && imagePreviews.length === 0) || sending}
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-50 hover:opacity-90"
                      style={{ background: "#5E35B1" }} aria-label="Envoyer">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
