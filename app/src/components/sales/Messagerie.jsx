import React, { useState, useEffect, useRef, useMemo } from 'react';
import { C, ST } from '../ui';
import { sb, syncToSupabase, loadFromSupabase, subscribeConfig } from '../../lib/supabase';
import { USERS } from '../../constants/brand';

const CONFIG_KEY = "community_messages";
const MAX_MESSAGES = 200;

// ── Helpers ──
function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `il y a ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `il y a ${days}j`;
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function getUserColor(email) {
  const u = USERS.find(u => u.email === email);
  return u?.color || "#71717A";
}

function getUserName(email) {
  const u = USERS.find(u => u.email === email);
  return u?.name || u?.prenom || email?.split("@")[0] || "Anonyme";
}

function getUserAvatar(email) {
  const u = USERS.find(u => u.email === email);
  return u?.avatar || getInitials(getUserName(email));
}

export default function Messagerie({ user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // ── Load messages from Supabase ──
  useEffect(() => {
    (async () => {
      const data = await loadFromSupabase(CONFIG_KEY);
      if (data && Array.isArray(data)) setMessages(data);
      setLoading(false);
    })();
  }, []);

  // ── Realtime subscription ──
  useEffect(() => {
    const ch = subscribeConfig(CONFIG_KEY, (newData) => {
      if (newData && Array.isArray(newData)) setMessages(newData);
    });
    return () => { sb.removeChannel(ch); };
  }, []);

  // ── Auto-scroll to bottom ──
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send message ──
  async function sendMessage() {
    const text = input.trim();
    if (!text) return;

    const msg = {
      id: Date.now() + Math.random(),
      auteur: user?.email || "",
      nom: user?.name || getUserName(user?.email),
      text,
      date: new Date().toISOString(),
    };

    const updated = [...messages, msg].slice(-MAX_MESSAGES);
    setMessages(updated);
    setInput("");
    inputRef.current?.focus();
    await syncToSupabase(CONFIG_KEY, updated);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // ── Group messages by date ──
  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentDate = null;
    messages.forEach(msg => {
      const d = msg.date ? new Date(msg.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) : "Inconnu";
      if (d !== currentDate) {
        currentDate = d;
        groups.push({ date: d, msgs: [] });
      }
      groups[groups.length - 1].msgs.push(msg);
    });
    return groups;
  }, [messages]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 80px)" }}>
      <ST emoji="💬" sub="Discutez en temps réel avec toute l'équipe.">Messages</ST>

      {/* ── Messages area ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 4px", marginBottom: 8 }}>
        {loading && (
          <div style={{ textAlign: "center", padding: 40, color: "#A1A1AA", fontSize: 13 }}>Chargement...</div>
        )}

        {!loading && messages.length === 0 && (
          <C style={{ textAlign: "center", padding: "60px 30px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#18181B", fontFamily: "'Outfit',sans-serif", marginBottom: 6 }}>Aucun message pour le moment</div>
            <div style={{ fontSize: 13, color: "#71717A" }}>Sois le premier à écrire à l'équipe !</div>
          </C>
        )}

        {groupedMessages.map((group, gi) => (
          <div key={gi}>
            {/* Date separator */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0 10px" }}>
              <div style={{ flex: 1, height: 1, background: "#E4E4E7" }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: "#A1A1AA", textTransform: "capitalize", whiteSpace: "nowrap" }}>{group.date}</span>
              <div style={{ flex: 1, height: 1, background: "#E4E4E7" }} />
            </div>

            {group.msgs.map((msg, mi) => {
              const isMe = msg.auteur === user?.email;
              const color = getUserColor(msg.auteur);
              const avatar = getUserAvatar(msg.auteur);
              const name = msg.nom || getUserName(msg.auteur);
              // Consecutive messages from same author → compact
              const prevMsg = mi > 0 ? group.msgs[mi - 1] : null;
              const sameAuthor = prevMsg && prevMsg.auteur === msg.auteur;

              return (
                <div key={msg.id || mi} style={{ display: "flex", gap: 8, marginBottom: sameAuthor ? 2 : 10, alignItems: "flex-start" }}>
                  {/* Avatar */}
                  {!sameAuthor ? (
                    <div style={{
                      width: 34, height: 34, borderRadius: "50%", background: color,
                      color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 800, fontFamily: "'Outfit',sans-serif",
                      flexShrink: 0, marginTop: 2,
                    }}>{avatar}</div>
                  ) : (
                    <div style={{ width: 34, flexShrink: 0 }} />
                  )}

                  {/* Bubble */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {!sameAuthor && (
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: color, fontFamily: "'Outfit',sans-serif" }}>{name}</span>
                        <span style={{ fontSize: 10, color: "#A1A1AA" }}>{timeAgo(msg.date)}</span>
                      </div>
                    )}
                    <div style={{
                      display: "inline-block",
                      padding: "8px 14px",
                      borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                      background: isMe ? "#E1FFED" : "#F4F4F5",
                      border: isMe ? "1px solid #BBF7D0" : "1px solid #E4E4E7",
                      fontSize: 13, color: "#18181B", lineHeight: 1.5,
                      maxWidth: "85%", wordBreak: "break-word",
                      whiteSpace: "pre-wrap",
                    }}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div style={{
        display: "flex", gap: 8, padding: "10px 12px",
        background: "#fff", borderTop: "1px solid #E4E4E7",
        borderRadius: "0 0 12px 12px",
        position: "sticky", bottom: 0,
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrire un message..."
          rows={1}
          style={{
            flex: 1, fontSize: 13, border: "1px solid #E4E4E7", borderRadius: 10,
            padding: "10px 14px", resize: "none", outline: "none",
            fontFamily: "'Inter',sans-serif", maxHeight: 100, overflowY: "auto",
            lineHeight: 1.4,
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          style={{
            padding: "10px 18px", borderRadius: 10, border: "none",
            background: input.trim() ? "#16A34A" : "#E4E4E7",
            color: input.trim() ? "#fff" : "#A1A1AA",
            cursor: input.trim() ? "pointer" : "default",
            fontSize: 13, fontWeight: 800, fontFamily: "'Outfit',sans-serif",
            transition: "all .15s", whiteSpace: "nowrap",
          }}
        >
          Envoyer ➤
        </button>
      </div>
    </div>
  );
}
