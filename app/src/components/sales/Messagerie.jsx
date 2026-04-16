import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { C, ST } from '../ui';
import { sb, syncToSupabase, loadFromSupabase, subscribeConfig, fetchTeam } from '../../lib/supabase';
import { USERS } from '../../constants/brand';

const GENERAL_KEY = "community_messages";
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

// DM config key: sorted emails to ensure both users see the same channel
function dmKey(email1, email2) {
  const sorted = [email1, email2].sort();
  return `dm_${sorted[0].replace(/[^a-z0-9]/gi, "_")}_${sorted[1].replace(/[^a-z0-9]/gi, "_")}`;
}

export default function Messagerie({ user }) {
  // ── Active conversation: null = general, email string = DM ──
  const [activeConv, setActiveConv] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Current config key based on active conversation
  const configKey = activeConv ? dmKey(user?.email, activeConv) : GENERAL_KEY;

  // ── Load team members ──
  useEffect(() => {
    fetchTeam().then(members => {
      setTeamMembers(members.filter(m => m.email !== user?.email));
    });
  }, [user?.email]);

  // ── Load messages when conversation changes ──
  useEffect(() => {
    setLoading(true);
    setMessages([]);
    (async () => {
      const data = await loadFromSupabase(configKey);
      if (data && Array.isArray(data)) setMessages(data);
      setLoading(false);
    })();
  }, [configKey]);

  // ── Request notification permission on mount ──
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // ── Notification sound ──
  const playNotifSound = useRef(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "sine";
      gain.gain.value = 0.15;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  }).current;

  // ── Track previous message count to detect new incoming ──
  const prevCountRef = useRef(0);
  useEffect(() => { prevCountRef.current = messages.length; }, [configKey]);

  // ── Realtime subscription (re-subscribes on conversation change) ──
  useEffect(() => {
    const ch = subscribeConfig(configKey, (newData) => {
      if (newData && Array.isArray(newData)) {
        if (newData.length > prevCountRef.current) {
          const lastMsg = newData[newData.length - 1];
          if (lastMsg && lastMsg.auteur !== user?.email) {
            playNotifSound();
            if ("Notification" in window && Notification.permission === "granted") {
              const senderName = lastMsg.nom || getUserName(lastMsg.auteur);
              const convLabel = activeConv ? "Message privé" : "Général";
              new Notification(`💬 ${senderName}`, {
                body: lastMsg.text?.slice(0, 100) || "Nouveau message",
                icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💬</text></svg>",
                tag: "sherpas-msg",
              });
            }
          }
        }
        prevCountRef.current = newData.length;
        setMessages(newData);
      }
    });
    return () => { sb.removeChannel(ch); };
  }, [configKey, user?.email, activeConv, playNotifSound]);

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
    prevCountRef.current = updated.length;
    setMessages(updated);
    setInput("");
    inputRef.current?.focus();
    await syncToSupabase(configKey, updated);
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

  // ── Conversation title ──
  const convTitle = activeConv ? getUserName(activeConv) : "Général";
  const convEmoji = activeConv ? "🔒" : "🌐";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 80px)" }}>
      <ST emoji="💬" sub="Discutez en temps réel avec toute l'équipe.">Messages</ST>

      <div style={{ display: "flex", flex: 1, gap: 0, overflow: "hidden", borderRadius: 12, border: "1px solid #E4E4E7" }}>

        {/* ══════ LEFT: Contacts sidebar ══════ */}
        <div style={{ width: 200, minWidth: 200, background: "#FAFAFA", borderRight: "1px solid #E4E4E7", overflowY: "auto", flexShrink: 0 }}>
          {/* General channel */}
          <button
            onClick={() => setActiveConv(null)}
            style={{
              width: "100%", padding: "12px 14px", border: "none", borderBottom: "1px solid #E4E4E7",
              background: activeConv === null ? "#E1FFED" : "transparent",
              cursor: "pointer", textAlign: "left", transition: "background .15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", background: "#16A34A",
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, flexShrink: 0,
              }}>🌐</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: activeConv === null ? "#15803D" : "#18181B", fontFamily: "'Outfit',sans-serif" }}>Général</div>
                <div style={{ fontSize: 10, color: "#A1A1AA" }}>Toute l'équipe</div>
              </div>
            </div>
          </button>

          {/* DM header */}
          <div style={{ padding: "10px 14px 6px", fontSize: 10, fontWeight: 800, color: "#A1A1AA", textTransform: "uppercase", letterSpacing: ".06em" }}>
            Messages privés
          </div>

          {/* Team members */}
          {teamMembers.map(member => {
            const isActive = activeConv === member.email;
            const color = member.color || getUserColor(member.email);
            const avatar = member.avatar || getInitials(member.name);
            return (
              <button
                key={member.email}
                onClick={() => setActiveConv(member.email)}
                style={{
                  width: "100%", padding: "10px 14px", border: "none",
                  borderBottom: "1px solid #F4F4F5",
                  background: isActive ? "#EFF6FF" : "transparent",
                  cursor: "pointer", textAlign: "left", transition: "background .15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%", background: color,
                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 800, fontFamily: "'Outfit',sans-serif", flexShrink: 0,
                  }}>{avatar}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: 12, fontWeight: 700,
                      color: isActive ? "#1E40AF" : "#3F3F46",
                      fontFamily: "'Outfit',sans-serif",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>{member.name || member.email}</div>
                    <div style={{ fontSize: 10, color: "#A1A1AA" }}>{member.role || "sales"}</div>
                  </div>
                </div>
              </button>
            );
          })}

          {teamMembers.length === 0 && (
            <div style={{ padding: "16px 14px", fontSize: 11, color: "#A1A1AA", textAlign: "center" }}>
              Aucun membre
            </div>
          )}
        </div>

        {/* ══════ RIGHT: Chat area ══════ */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Chat header */}
          <div style={{
            padding: "10px 16px", borderBottom: "1px solid #E4E4E7", background: "#fff",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            {activeConv && (
              <div style={{
                width: 32, height: 32, borderRadius: "50%", background: getUserColor(activeConv),
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 800, fontFamily: "'Outfit',sans-serif", flexShrink: 0,
              }}>{getUserAvatar(activeConv)}</div>
            )}
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#18181B", fontFamily: "'Outfit',sans-serif" }}>
                {convEmoji} {convTitle}
              </div>
              <div style={{ fontSize: 10, color: "#A1A1AA" }}>
                {activeConv ? "Conversation privée" : "Visible par toute l'équipe"}
              </div>
            </div>
          </div>

          {/* Messages area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
            {loading && (
              <div style={{ textAlign: "center", padding: 40, color: "#A1A1AA", fontSize: 13 }}>Chargement...</div>
            )}

            {!loading && messages.length === 0 && (
              <div style={{ textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>{activeConv ? "🔒" : "💬"}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#18181B", fontFamily: "'Outfit',sans-serif", marginBottom: 4 }}>
                  {activeConv ? `Conversation avec ${getUserName(activeConv)}` : "Aucun message"}
                </div>
                <div style={{ fontSize: 12, color: "#71717A" }}>
                  {activeConv ? "Envoie le premier message !" : "Sois le premier à écrire à l'équipe !"}
                </div>
              </div>
            )}

            {groupedMessages.map((group, gi) => (
              <div key={gi}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "14px 0 8px" }}>
                  <div style={{ flex: 1, height: 1, background: "#E4E4E7" }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#A1A1AA", textTransform: "capitalize", whiteSpace: "nowrap" }}>{group.date}</span>
                  <div style={{ flex: 1, height: 1, background: "#E4E4E7" }} />
                </div>

                {group.msgs.map((msg, mi) => {
                  const isMe = msg.auteur === user?.email;
                  const color = getUserColor(msg.auteur);
                  const avatar = getUserAvatar(msg.auteur);
                  const name = msg.nom || getUserName(msg.auteur);
                  const prevMsg = mi > 0 ? group.msgs[mi - 1] : null;
                  const sameAuthor = prevMsg && prevMsg.auteur === msg.auteur;

                  return (
                    <div key={msg.id || mi} style={{ display: "flex", gap: 8, marginBottom: sameAuthor ? 2 : 10, alignItems: "flex-start" }}>
                      {!sameAuthor ? (
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%", background: color,
                          color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 800, fontFamily: "'Outfit',sans-serif",
                          flexShrink: 0, marginTop: 2,
                        }}>{avatar}</div>
                      ) : (
                        <div style={{ width: 32, flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {!sameAuthor && (
                          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
                            <span style={{ fontSize: 12, fontWeight: 800, color, fontFamily: "'Outfit',sans-serif" }}>{name}</span>
                            <span style={{ fontSize: 10, color: "#A1A1AA" }}>{timeAgo(msg.date)}</span>
                          </div>
                        )}
                        <div style={{
                          display: "inline-block", padding: "8px 14px",
                          borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                          background: isMe ? "#E1FFED" : "#F4F4F5",
                          border: isMe ? "1px solid #BBF7D0" : "1px solid #E4E4E7",
                          fontSize: 13, color: "#18181B", lineHeight: 1.5,
                          maxWidth: "85%", wordBreak: "break-word", whiteSpace: "pre-wrap",
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

          {/* Input bar */}
          <div style={{
            display: "flex", gap: 8, padding: "10px 12px",
            background: "#fff", borderTop: "1px solid #E4E4E7",
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={activeConv ? `Message à ${getUserName(activeConv)}...` : "Écrire un message..."}
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
      </div>
    </div>
  );
}
