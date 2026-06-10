"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/shared/Header";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Search, ArrowLeft, Image, X, FileText, Check, CheckCheck, Palette } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getAccessToken, WS_URL } from "@/lib/api";
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
  createdAt: string; orderId?: string;
  sender?: { id: string; firstName: string; avatarUrl?: string };
}

interface Conversation {
  orderId: string; status: string; description?: string;
  design?: { name: string; selectedImageUrl?: string };
  partner?: { id: string; firstName: string; lastName: string; avatarUrl?: string; isOnline?: boolean; lastSeenAt?: string };
  lastMessage?: { content: string; createdAt: string; isSystem: boolean; attachmentUrls?: string[] };
  unreadCount?: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return d.toLocaleDateString("fr-FR", { weekday: "long" });
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function shouldShowDateSeparator(prev: Message | null, current: Message) {
  if (!prev) return true;
  return formatDate(prev.createdAt) !== formatDate(current.createdAt);
}

function formatLastSeen(dateStr: string | undefined, isOnline: boolean | undefined): string {
  if (isOnline) return "En ligne";
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Vu il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Vu il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `Vu il y a ${diffD}j`;
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
  const [showDesignPicker, setShowDesignPicker] = useState(false);
  const [myDesigns, setMyDesigns] = useState<any[]>([]);
  const [loadingDesigns, setLoadingDesigns] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const activeConvRef = useRef<Conversation | null>(null);
  const messagesListRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  useEffect(() => { activeConvRef.current = activeConv; }, [activeConv]);

  useEffect(() => {
    if (isNearBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const load = async () => {
      try {
        const token = getAccessToken();
        const res = await fetch(`${API_BASE}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setConversations(data || []);
          data?.forEach((c: any) => {
            socketRef.current?.emit("join_conversation", { orderId: c.orderId });
          });
          if (data?.length > 0 && !activeConv && !showSidebar) setActiveConv(data[0]);
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
        const res = await fetch(`${API_BASE}/messages/${activeConv.orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setMessages(await res.json());
      } catch {}
    };
    load();
    setConversations((prev) =>
      prev.map((c) => (c.orderId === activeConv.orderId ? { ...c, unreadCount: 0 } : c))
    );
  }, [activeConv]);

  useEffect(() => {
    if (!user) return;
    const token = getAccessToken();
    const socket = io(WS_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      setConnected(true);
      conversations.forEach((c) => {
        socket.emit("join_conversation", { orderId: c.orderId });
      });
    });
    socket.on("disconnect", () => setConnected(false));

    socket.on("new_message", (msg: Message) => {
      const currentConv = activeConvRef.current;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setConversations((prev) =>
        prev.map((c) => {
          if (c.orderId === msg.orderId) {
            return {
              ...c,
              lastMessage: { content: msg.content, createdAt: msg.createdAt, isSystem: msg.isSystem, attachmentUrls: msg.attachmentUrls },
              unreadCount: (currentConv?.orderId === msg.orderId ? 0 : (c.unreadCount || 0) + 1),
            };
          }
          return c;
        })
      );
    });

    socketRef.current = socket;
    return () => { socket.disconnect(); };
  }, [user]);

  const joinRoom = useCallback((orderId: string) => {
    socketRef.current?.emit("join_conversation", { orderId });
  }, []);

  useEffect(() => {
    if (activeConv && socketRef.current?.connected) {
      joinRoom(activeConv.orderId);
    }
  }, [activeConv, joinRoom]);

  const handleSelectConv = useCallback((conv: Conversation) => {
    setActiveConv(conv);
    setShowSidebar(false);
    setShowOrderCard(true);
  }, []);

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

      const res = await fetch(`${API_BASE}/messages/${activeConv.orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const newMsg = await res.json();
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        setConversations((prev) =>
          prev.map((c) =>
            c.orderId === activeConv.orderId
              ? { ...c, lastMessage: { content: newMsg.content, createdAt: newMsg.createdAt, isSystem: false, attachmentUrls: newMsg.attachmentUrls } }
              : c
          )
        );
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
      const res = await fetch(`${API_BASE}/messages/upload`, {
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

  const loadMyDesigns = async () => {
    setLoadingDesigns(true);
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_BASE}/designs?page=1&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMyDesigns(data.data || []);
      }
    } catch {} finally {
      setLoadingDesigns(false);
    }
  };

  const handleOpenDesignPicker = () => {
    setShowDesignPicker(true);
    loadMyDesigns();
  };

  const handleSelectDesign = (design: any) => {
    const imgUrl = design.selectedImageUrl || design.generatedImages?.[0] || design.thumbnailUrl;
    if (imgUrl) {
      setImagePreviews((prev) => [...prev, imgUrl]);
    }
    setShowDesignPicker(false);
  };

  const handleScroll = useCallback(() => {
    const el = messagesListRef.current;
    if (!el) return;
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
  }, []);

  const filtered = useMemo(
    () => conversations.filter((c) =>
      !search || c.partner?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase()) ||
      c.design?.name?.toLowerCase().includes(search.toLowerCase()),
    ),
    [conversations, search],
  );

  return (
    <div className="h-screen overflow-hidden" style={{ background: "#FAFAFA", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Header />
      <main className="flex flex-col overflow-hidden pt-16" style={{ height: "100vh" }}>
        <div className="w-full h-full max-w-7xl mx-auto flex overflow-hidden lg:my-4 lg:shadow-sm lg:border lg:border-gray-100 bg-white lg:rounded-2xl">

          <aside className={`${showSidebar ? "flex" : "hidden"} lg:flex flex-col w-full lg:w-80 xl:w-96 flex-shrink-0 border-r border-gray-100 h-full`}>
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h1 className="font-semibold text-[#212121]" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem" }}>
                  Messages
                </h1>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: connected ? "#2E7D32" : "#C62828" }} />
                  <span className="text-xs" style={{ color: connected ? "#2E7D32" : "#C62828" }}>
                    {connected ? "En ligne" : "Déconnecté"}
                  </span>
                </div>
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
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3" style={{ background: "#EDE7FF" }}>
                    <Send className="w-7 h-7" style={{ color: "#5E35B1" }} />
                  </div>
                  <p className="text-[#9E9E9E] text-sm">Aucune conversation</p>
                  <Link href="/couturieres" className="mt-3 text-sm font-medium" style={{ color: "#5E35B1" }}>
                    Trouver une couturiere
                  </Link>
                </div>
              ) : (
                filtered.map((conv) => {
                  const isActive = activeConv?.orderId === conv.orderId;
                  const hasUnread = (conv.unreadCount || 0) > 0;
                  const lastMsgContent = conv.lastMessage?.content
                    ? (conv.lastMessage.content.length > 40 ? conv.lastMessage.content.slice(0, 40) + "..." : conv.lastMessage.content)
                    : conv.description?.slice(0, 40) || "Aucun message";

                  return (
                    <button key={conv.orderId} onClick={() => handleSelectConv(conv)}
                      className="w-full flex items-start gap-3 p-3.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-50"
                      style={{ background: isActive ? "#F5F0FF" : hasUnread ? "#F8F6FF" : undefined, borderLeft: isActive ? "3px solid #5E35B1" : hasUnread ? "3px solid #EC407A" : "3px solid transparent" }}>
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden" style={{ background: "#5E35B1" }}>
                        {conv.partner?.avatarUrl ? <img src={conv.partner.avatarUrl} alt="" className="w-full h-full object-cover" /> : conv.partner?.firstName?.[0]?.toUpperCase() || "?"}
                        </div>
                        {conv.partner?.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white" style={{ background: "#2E7D32" }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm truncate" style={{ fontWeight: 700, color: hasUnread ? "#1a0533" : "#212121" }}>
                            {conv.partner?.firstName} {conv.partner?.lastName}
                          </span>
                          {conv.lastMessage && (
                            <span className="text-xs flex-shrink-0 ml-2" style={{ color: hasUnread ? "#5E35B1" : "#9E9E9E", fontWeight: hasUnread ? 700 : 400 }}>
                              {formatDate(conv.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs truncate" style={{ color: hasUnread ? "#1a0533" : "#9E9E9E", fontWeight: hasUnread ? 700 : 400 }}>
                            {conv.lastMessage?.isSystem ? "Message systeme" : lastMsgContent}
                          </p>
                          <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                            {hasUnread && (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs font-bold" style={{ background: "#EC407A" }}>
                                {conv.unreadCount! > 9 ? "9+" : conv.unreadCount}
                              </span>
                            )}
                            {!hasUnread && (
                              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                                style={{ background: STATUS_STYLES[conv.status]?.bg || "#F5F5F5", color: STATUS_STYLES[conv.status]?.text || "#757575" }}>
                                {STATUS_LABELS[conv.status] || conv.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <div className={`${!showSidebar ? "flex" : "hidden"} lg:flex flex-1 flex-col min-w-0 h-full`}>
            {!activeConv ? (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div className="flex flex-col items-center max-w-sm">
                  <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #EDE7FF, #FCE4EC)" }}>
                    <Send className="w-10 h-10" style={{ color: "#5E35B1" }} />
                  </motion.div>
                  <h2 className="font-semibold text-[#212121] mb-2" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem" }}>Vos messages</h2>
                  <p className="text-[#9E9E9E] text-sm mb-1">Selectionnez une conversation pour commencer</p>
                  {conversations.length > 0 ? (
                    <p className="text-xs mb-4" style={{ color: "#5E35B1" }}>
                      {conversations.length} conversation{conversations.length > 1 ? 's' : ''}
                      {conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0) > 0 &&
                        ` · ${conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)} message${conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0) > 1 ? 's' : ''} non lu${conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0) > 1 ? 's' : ''}`
                      }
                    </p>
                  ) : (
                    <p className="text-xs text-[#9E9E9E] mb-4">Aucune conversation pour le moment</p>
                  )}
                  <Link href="/couturieres" className="px-5 py-2.5 rounded-xl text-sm font-medium text-white"
                    style={{ background: "linear-gradient(135deg, #5E35B1, #EC407A)" }}>
                    Trouver une couturiere
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 p-3.5 border-b border-gray-100">
                  <button onClick={() => setShowSidebar(true)} className="lg:hidden p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft className="w-5 h-5 text-[#424242]" />
                  </button>
                  <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-semibold text-sm overflow-hidden" style={{ background: "#5E35B1" }}>
                    {activeConv.partner?.avatarUrl ? <img src={activeConv.partner.avatarUrl} alt="" className="w-full h-full object-cover" /> : activeConv.partner?.firstName?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#212121] text-sm">{activeConv.partner?.firstName} {activeConv.partner?.lastName}</p>
                    <p className="text-xs truncate" style={{ color: activeConv.partner?.isOnline ? "#2E7D32" : "#9E9E9E" }}>
                      {formatLastSeen(activeConv.partner?.lastSeenAt, activeConv.partner?.isOnline)}
                    </p>
                  </div>
                  <button onClick={() => setShowOrderCard(!showOrderCard)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <FileText className="w-4 h-4 text-[#757575]" />
                  </button>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ background: STATUS_STYLES[activeConv.status]?.bg || "#F5F5F5", color: STATUS_STYLES[activeConv.status]?.text || "#757575" }}>
                    {STATUS_LABELS[activeConv.status] || activeConv.status}
                  </span>
                </div>

                {showOrderCard && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden">
                    <div className="mx-4 mt-3 p-4 rounded-xl border border-gray-100" style={{ background: "#FAFAFA" }}>
                      <div className="flex items-center gap-3">
                        {activeConv.design?.selectedImageUrl && (
                          <img src={activeConv.design.selectedImageUrl} alt="" className="w-14 h-14 rounded-xl object-cover" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-[#212121]">{activeConv.design?.name || "Commande"}</p>
                          <p className="text-xs text-[#757575] mt-0.5">{activeConv.description || "Aucune description"}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesListRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-1">
                  <AnimatePresence>
                    {messages.filter((msg, idx, arr) => arr.findIndex(m => m.id === msg.id) === idx).map((msg, i) => {
                      const prev = i > 0 ? messages[i - 1] : null;
                      const showDate = shouldShowDateSeparator(prev, msg);
                      const isOwn = msg.senderId === user?.id;

                      return (
                        <div key={msg.id}>
                          {showDate && (
                            <div className="flex justify-center py-3">
                              <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: "#EDE7FF", color: "#616161" }}>
                                {formatDate(msg.createdAt)}
                              </span>
                            </div>
                          )}
                          {msg.isSystem ? (
                            <div className="flex justify-center py-1">
                              <span className="px-4 py-1.5 rounded-full text-xs text-[#757575] bg-[#F5F5F5]">{msg.content}</span>
                            </div>
                          ) : (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                              className={`flex ${isOwn ? "justify-end" : "justify-start"} gap-2 py-0.5`}>
                              {!isOwn && (
                                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold self-end overflow-hidden" style={{ background: "#5E35B1" }}>
                                  {msg.sender?.avatarUrl ? <img src={msg.sender.avatarUrl} alt="" className="w-full h-full object-cover" /> : msg.sender?.firstName?.[0]?.toUpperCase() || "?"}
                                </div>
                              )}
                              <div className={`max-w-[75%] ${isOwn ? "order-1" : ""}`}>
                                {msg.messageType === "image" && msg.attachmentUrls?.length > 0 && (
                                  <div className={`flex flex-wrap gap-1 mb-0.5 ${isOwn ? "justify-end" : "justify-start"}`}>
                                    {msg.attachmentUrls.map((url: string, j: number) => (
                                      <img key={j} src={url} alt="" className="rounded-2xl cursor-pointer hover:opacity-90 object-cover"
                                        style={{ maxHeight: "160px", maxWidth: "200px" }}
                                        onClick={() => setLightboxUrl(url)} />
                                    ))}
                                  </div>
                                )}
                                {msg.content && (
                                  <div className="px-4 py-2.5 text-sm leading-relaxed"
                                    style={{
                                      background: isOwn ? "linear-gradient(135deg, #5E35B1, #7C3AED)" : "#F5F5F5",
                                      color: isOwn ? "white" : "#212121",
                                      borderRadius: "18px",
                                      borderBottomRightRadius: isOwn ? "6px" : "18px",
                                      borderBottomLeftRadius: isOwn ? "18px" : "6px",
                                    }}>
                                    {msg.content}
                                  </div>
                                )}
                                <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? "justify-end" : "justify-start"}`}>
                                  <span className="text-xs text-[#9E9E9E]">{formatTime(msg.createdAt)}</span>
                                  {isOwn && (
                                    msg.readAt ? (
                                      <CheckCheck className="w-3.5 h-3.5" style={{ color: "#5E35B1" }} />
                                    ) : (
                                      <Check className="w-3.5 h-3.5 text-[#BDBDBD]" />
                                    )
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="p-3.5 border-t border-gray-100">
                  {imagePreviews.length > 0 && (
                    <div className="mb-3 flex gap-2 flex-wrap">
                      {imagePreviews.map((url, i) => (
                        <div key={i} className="relative inline-block">
                          <img src={url} alt="" className="h-16 rounded-lg object-cover" />
                          <button type="button" onClick={() => setImagePreviews((prev) => prev.filter((_, j) => j !== i))}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-[#757575] hover:bg-gray-100 transition-colors disabled:opacity-50">
                      <Image className="w-5 h-5" />
                    </button>
                    <button type="button" onClick={handleOpenDesignPicker}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-[#757575] hover:bg-gray-100 transition-colors" title="Envoyer un design">
                      <Palette className="w-5 h-5" />
                    </button>
                    <input type="text" value={inputVal} onChange={(e) => setInputVal(e.target.value)}
                      placeholder="Écrivez votre message..." disabled={sending}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#212121] placeholder-[#9E9E9E] focus:outline-none focus:ring-2 focus:border-[#5E35B1] bg-[#FAFAFA]" />
                    <button type="submit" disabled={(!inputVal.trim() && imagePreviews.length === 0) || sending}
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-50 hover:opacity-90"
                      style={{ background: "linear-gradient(135deg, #5E35B1, #EC407A)" }}>
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </main>

      {lightboxUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.9)" }} onClick={() => setLightboxUrl(null)}>
          <button onClick={() => setLightboxUrl(null)} className="absolute top-4 right-4 text-white/70 hover:text-white text-sm z-10">✕ Fermer</button>
          <img src={lightboxUrl} alt="" className="max-w-full max-h-[90vh] rounded-2xl object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {showDesignPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setShowDesignPicker(false)}>
          <div className="bg-white rounded-2xl p-5 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-[#212121]">Mes designs</h3>
              <button onClick={() => setShowDesignPicker(false)} className="p-1 rounded-full hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            {loadingDesigns ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: "#EDE7FF" }} />
                ))}
              </div>
            ) : myDesigns.length === 0 ? (
              <div className="text-center py-8">
                <Palette className="w-10 h-10 mx-auto mb-3 text-[#9E9E9E]" />
                <p className="text-[#9E9E9E] text-sm">Aucun design</p>
                <Link href="/create" className="mt-2 text-sm font-medium inline-block" style={{ color: "#5E35B1" }}>Créer un design</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {myDesigns.map((d: any) => (
                  <button key={d.id} onClick={() => handleSelectDesign(d)}
                    className="text-left p-2 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                    <img src={d.selectedImageUrl || d.generatedImages?.[0] || d.thumbnailUrl}
                      alt={d.name} className="w-full h-32 object-cover rounded-lg mb-2" />
                    <p className="text-sm font-medium text-[#212121] truncate">{d.name}</p>
                    <p className="text-xs text-[#9E9E9E]">{new Date(d.createdAt).toLocaleDateString("fr-FR")}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
