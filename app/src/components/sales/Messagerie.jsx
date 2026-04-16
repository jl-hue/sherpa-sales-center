import React, { useState, useEffect, useRef, useMemo } from 'react';
import { C, ST } from '../ui';
import { sb, syncToSupabase, loadFromSupabase, subscribeConfig, fetchTeam } from '../../lib/supabase';
import { USERS } from '../../constants/brand';
import { getBalance, addBalance, fmtSherpoints, CURRENCY } from '../../lib/economy';

const GENERAL_KEY = "community_messages";
const CHALLENGES_KEY = "community_challenges";
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
function dmKey(email1, email2) {
  const sorted = [email1, email2].sort();
  return `dm_${sorted[0].replace(/[^a-z0-9]/gi, "_")}_${sorted[1].replace(/[^a-z0-9]/gi, "_")}`;
}

export default function Messagerie({ user }) {
  const [activeConv, setActiveConv] = useState(null); // null=general, email=DM
  const [teamMembers, setTeamMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // ── Last activity per conversation (for sorting sidebar) ──
  const [lastActivity, setLastActivity] = useState({}); // { configKey: isoDate }

  // ── Challenges ──
  const [challenges, setChallenges] = useState([]); // global challenges list
  const [showDefiForm, setShowDefiForm] = useState(false);
  const [defiTitre, setDefiTitre] = useState("");
  const [defiMise, setDefiMise] = useState(10);

  const configKey = activeConv ? dmKey(user?.email, activeConv) : GENERAL_KEY;

  // ── Load team ──
  useEffect(() => {
    fetchTeam().then(members => setTeamMembers(members.filter(m => m.email !== user?.email)));
  }, [user?.email]);

  // ── Load messages + track last activity ──
  useEffect(() => {
    setLoading(true);
    setMessages([]);
    (async () => {
      const data = await loadFromSupabase(configKey);
      if (data && Array.isArray(data)) {
        setMessages(data);
        if (data.length > 0) {
          const last = data[data.length - 1]?.date;
          if (last) setLastActivity(prev => ({ ...prev, [configKey]: last }));
        }
      }
      setLoading(false);
    })();
  }, [configKey]);

  // ── Load all DM last activities on mount (for sorting) ──
  useEffect(() => {
    if (teamMembers.length === 0 || !user?.email) return;
    Promise.all(teamMembers.map(async m => {
      const key = dmKey(user.email, m.email);
      const data = await loadFromSupabase(key);
      if (data && Array.isArray(data) && data.length > 0) {
        return { key, date: data[data.length - 1]?.date };
      }
      return null;
    })).then(results => {
      const act = {};
      results.filter(Boolean).forEach(r => { act[r.key] = r.date; });
      // Also load general
      loadFromSupabase(GENERAL_KEY).then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          act[GENERAL_KEY] = data[data.length - 1]?.date;
        }
        setLastActivity(prev => ({ ...prev, ...act }));
      });
    });
  }, [teamMembers, user?.email]);

  // ── Load challenges ──
  useEffect(() => {
    loadFromSupabase(CHALLENGES_KEY).then(data => {
      if (data && Array.isArray(data)) setChallenges(data);
    });
    const ch = subscribeConfig(CHALLENGES_KEY, newData => {
      if (newData && Array.isArray(newData)) setChallenges(newData);
    });
    return () => { sb.removeChannel(ch); };
  }, []);

  // ── Notification permission ──
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
  }, []);

  // ── Notification sound ──
  const playNotifSound = useRef(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880; osc.type = "sine"; gain.gain.value = 0.15;
      osc.start(); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  }).current;

  const prevCountRef = useRef(0);
  useEffect(() => { prevCountRef.current = messages.length; }, [configKey]);

  // ── Realtime subscription ──
  useEffect(() => {
    const ch = subscribeConfig(configKey, (newData) => {
      if (newData && Array.isArray(newData)) {
        if (newData.length > prevCountRef.current) {
          const lastMsg = newData[newData.length - 1];
          if (lastMsg && lastMsg.auteur !== user?.email) {
            playNotifSound();
            if ("Notification" in window && Notification.permission === "granted") {
              const senderName = lastMsg.nom || getUserName(lastMsg.auteur);
              new Notification(`💬 ${senderName}`, {
                body: lastMsg.text?.slice(0, 100) || "Nouveau message",
                icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💬</text></svg>",
                tag: "sherpas-msg",
              });
            }
          }
          // Update last activity
          const lastDate = newData[newData.length - 1]?.date;
          if (lastDate) setLastActivity(prev => ({ ...prev, [configKey]: lastDate }));
        }
        prevCountRef.current = newData.length;
        setMessages(newData);
      }
    });
    return () => { sb.removeChannel(ch); };
  }, [configKey, user?.email, playNotifSound]);

  // ── Auto-scroll ──
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // ── Send message ──
  async function sendMessage() {
    const text = input.trim();
    if (!text) return;
    const msg = { id: Date.now() + Math.random(), auteur: user?.email || "", nom: user?.name || getUserName(user?.email), text, date: new Date().toISOString() };
    const updated = [...messages, msg].slice(-MAX_MESSAGES);
    prevCountRef.current = updated.length;
    setMessages(updated);
    setInput("");
    inputRef.current?.focus();
    setLastActivity(prev => ({ ...prev, [configKey]: msg.date }));
    await syncToSupabase(configKey, updated);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  // ── Challenge functions ──
  async function proposerDefi() {
    if (!activeConv || !defiTitre.trim() || defiMise < 1) return;
    const myBal = getBalance(user?.email);
    if (myBal < defiMise) { alert(`Solde insuffisant ! Tu as ${myBal} ${CURRENCY.plural}.`); return; }
    const defi = {
      id: Date.now() + Math.random(),
      from: user?.email,
      to: activeConv,
      titre: defiTitre.trim(),
      mise: defiMise,
      status: "pending", // pending → accepted → won_from / won_to / declined
      date: new Date().toISOString(),
    };
    const updated = [...challenges, defi];
    setChallenges(updated);
    await syncToSupabase(CHALLENGES_KEY, updated);
    // Send a system message in the DM
    const sysMsg = { id: Date.now() + Math.random(), auteur: "system", nom: "⚔️ Défi", text: `${getUserName(user?.email)} propose un défi : "${defiTitre.trim()}" — Mise : ${defiMise} ${CURRENCY.emoji} chacun !`, date: new Date().toISOString(), defiId: defi.id };
    const updatedMsgs = [...messages, sysMsg].slice(-MAX_MESSAGES);
    prevCountRef.current = updatedMsgs.length;
    setMessages(updatedMsgs);
    await syncToSupabase(configKey, updatedMsgs);
    setShowDefiForm(false);
    setDefiTitre("");
    setDefiMise(10);
  }

  async function accepterDefi(defiId) {
    const defi = challenges.find(d => d.id === defiId);
    if (!defi || defi.status !== "pending") return;
    const myBal = getBalance(user?.email);
    if (myBal < defi.mise) { alert(`Solde insuffisant ! Tu as ${myBal} ${CURRENCY.plural}.`); return; }
    const updated = challenges.map(d => d.id === defiId ? { ...d, status: "accepted" } : d);
    setChallenges(updated);
    await syncToSupabase(CHALLENGES_KEY, updated);
    // System message
    const sysMsg = { id: Date.now() + Math.random(), auteur: "system", nom: "⚔️ Défi", text: `${getUserName(user?.email)} accepte le défi ! ${defi.mise} ${CURRENCY.emoji} chacun en jeu.`, date: new Date().toISOString(), defiId };
    const updatedMsgs = [...messages, sysMsg].slice(-MAX_MESSAGES);
    prevCountRef.current = updatedMsgs.length;
    setMessages(updatedMsgs);
    await syncToSupabase(configKey, updatedMsgs);
  }

  async function refuserDefi(defiId) {
    const updated = challenges.map(d => d.id === defiId ? { ...d, status: "declined" } : d);
    setChallenges(updated);
    await syncToSupabase(CHALLENGES_KEY, updated);
    const sysMsg = { id: Date.now() + Math.random(), auteur: "system", nom: "⚔️ Défi", text: `${getUserName(user?.email)} décline le défi.`, date: new Date().toISOString(), defiId };
    const updatedMsgs = [...messages, sysMsg].slice(-MAX_MESSAGES);
    prevCountRef.current = updatedMsgs.length;
    setMessages(updatedMsgs);
    await syncToSupabase(configKey, updatedMsgs);
  }

  async function voterGagnant(defiId, winnerEmail) {
    const defi = challenges.find(d => d.id === defiId);
    if (!defi || defi.status !== "accepted") return;
    const myEmail = user?.email;
    // Record this participant's vote
    const votes = { ...(defi.votes || {}) };
    votes[myEmail] = winnerEmail;
    // Check if both participants voted
    const otherEmail = myEmail === defi.from ? defi.to : defi.from;
    const otherVote = votes[otherEmail];

    if (otherVote && otherVote === winnerEmail) {
      // Both agree → resolve the challenge
      const loserEmail = winnerEmail === defi.from ? defi.to : defi.from;
      const totalGain = defi.mise * 2;
      await addBalance(loserEmail, -defi.mise);
      await addBalance(winnerEmail, defi.mise);
      const updated = challenges.map(d => d.id === defiId ? { ...d, status: "resolved", winner: winnerEmail, votes } : d);
      setChallenges(updated);
      await syncToSupabase(CHALLENGES_KEY, updated);
      const sysMsg = { id: Date.now() + Math.random(), auteur: "system", nom: "🏆 Résultat", text: `Les deux participants sont d'accord ! ${getUserName(winnerEmail)} remporte le défi "${defi.titre}" et gagne ${totalGain} ${CURRENCY.emoji} !`, date: new Date().toISOString(), defiId };
      const updatedMsgs = [...messages, sysMsg].slice(-MAX_MESSAGES);
      prevCountRef.current = updatedMsgs.length;
      setMessages(updatedMsgs);
      await syncToSupabase(configKey, updatedMsgs);
    } else if (otherVote && otherVote !== winnerEmail) {
      // Disagreement → dispute
      const updated = challenges.map(d => d.id === defiId ? { ...d, status: "dispute", votes } : d);
      setChallenges(updated);
      await syncToSupabase(CHALLENGES_KEY, updated);
      const sysMsg = { id: Date.now() + Math.random(), auteur: "system", nom: "⚠️ Désaccord", text: `Désaccord sur le résultat du défi "${defi.titre}" ! ${getUserName(defi.from)} a voté ${getUserName(votes[defi.from])} et ${getUserName(defi.to)} a voté ${getUserName(votes[defi.to])}. Mettez-vous d'accord et revotez !`, date: new Date().toISOString(), defiId };
      const updatedMsgs = [...messages, sysMsg].slice(-MAX_MESSAGES);
      prevCountRef.current = updatedMsgs.length;
      setMessages(updatedMsgs);
      await syncToSupabase(configKey, updatedMsgs);
    } else {
      // First vote — waiting for the other
      const updated = challenges.map(d => d.id === defiId ? { ...d, votes } : d);
      setChallenges(updated);
      await syncToSupabase(CHALLENGES_KEY, updated);
      const sysMsg = { id: Date.now() + Math.random(), auteur: "system", nom: "🗳️ Vote", text: `${getUserName(myEmail)} a voté. En attente du vote de ${getUserName(otherEmail)}...`, date: new Date().toISOString(), defiId };
      const updatedMsgs = [...messages, sysMsg].slice(-MAX_MESSAGES);
      prevCountRef.current = updatedMsgs.length;
      setMessages(updatedMsgs);
      await syncToSupabase(configKey, updatedMsgs);
    }
  }

  async function revoterDefi(defiId) {
    // Reset votes for a disputed challenge, set back to accepted
    const updated = challenges.map(d => d.id === defiId ? { ...d, status: "accepted", votes: {} } : d);
    setChallenges(updated);
    await syncToSupabase(CHALLENGES_KEY, updated);
    const sysMsg = { id: Date.now() + Math.random(), auteur: "system", nom: "🔄 Revote", text: `Les votes ont été réinitialisés. Revotez pour désigner le gagnant !`, date: new Date().toISOString(), defiId };
    const updatedMsgs = [...messages, sysMsg].slice(-MAX_MESSAGES);
    prevCountRef.current = updatedMsgs.length;
    setMessages(updatedMsgs);
    await syncToSupabase(configKey, updatedMsgs);
  }

  // ── Group messages by date ──
  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentDate = null;
    messages.forEach(msg => {
      const d = msg.date ? new Date(msg.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) : "Inconnu";
      if (d !== currentDate) { currentDate = d; groups.push({ date: d, msgs: [] }); }
      groups[groups.length - 1].msgs.push(msg);
    });
    return groups;
  }, [messages]);

  // ── Sort team members by last activity ──
  const sortedMembers = useMemo(() => {
    return [...teamMembers].sort((a, b) => {
      const ka = dmKey(user?.email, a.email);
      const kb = dmKey(user?.email, b.email);
      const da = lastActivity[ka] || "";
      const db = lastActivity[kb] || "";
      return db.localeCompare(da); // most recent first
    });
  }, [teamMembers, lastActivity, user?.email]);

  // ── Active challenges for current DM ──
  const convChallenges = useMemo(() => {
    if (!activeConv) return [];
    return challenges.filter(d =>
      (d.from === user?.email && d.to === activeConv) ||
      (d.from === activeConv && d.to === user?.email)
    ).filter(d => d.status === "pending" || d.status === "accepted" || d.status === "dispute");
  }, [challenges, activeConv, user?.email]);

  const convTitle = activeConv ? getUserName(activeConv) : "Général";
  const convEmoji = activeConv ? "🔒" : "🌐";

  // ── Render a challenge card inside chat ──
  function renderDefiCard(defi) {
    const isPending = defi.status === "pending";
    const isAccepted = defi.status === "accepted";
    const isDispute = defi.status === "dispute";
    const iAmTarget = defi.to === user?.email;
    const iAmFrom = defi.from === user?.email;
    const myVote = defi.votes?.[user?.email];
    const borderColor = isDispute ? "#E11D48" : "#F59E0B";

    return (
      <div style={{ margin: "8px 0", padding: "12px 16px", background: isDispute ? "linear-gradient(135deg, #FEF2F2, #FECACA)" : "linear-gradient(135deg, #FFFBEB, #FEF3C7)", border: `2px solid ${borderColor}`, borderRadius: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 20 }}>{isDispute ? "⚠️" : "⚔️"}</span>
          <div style={{ fontSize: 13, fontWeight: 800, color: isDispute ? "#991B1B" : "#92400E", fontFamily: "'Outfit',sans-serif" }}>Défi : {defi.titre}</div>
        </div>
        <div style={{ fontSize: 12, color: "#78350F", marginBottom: 8 }}>
          Mise : <strong>{defi.mise} {CURRENCY.emoji}</strong> chacun · Gain total : <strong>{defi.mise * 2} {CURRENCY.emoji}</strong>
        </div>
        <div style={{ fontSize: 11, color: "#A16207", marginBottom: 8 }}>
          {getUserName(defi.from)} vs {getUserName(defi.to)}
        </div>

        {/* ── Pending: accept / refuse ── */}
        {isPending && iAmTarget && (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => accepterDefi(defi.id)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "#16A34A", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 800, fontFamily: "'Outfit',sans-serif", boxShadow: "0 2px 8px rgba(22,163,74,.3)" }}>✅ Accepter le défi</button>
            <button onClick={() => refuserDefi(defi.id)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "#E11D48", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 800, fontFamily: "'Outfit',sans-serif", boxShadow: "0 2px 8px rgba(225,29,72,.3)" }}>❌ Refuser</button>
          </div>
        )}
        {isPending && iAmFrom && (
          <div style={{ fontSize: 11, color: "#A16207", fontStyle: "italic", padding: "6px 0" }}>⏳ En attente de réponse de {getUserName(defi.to)}...</div>
        )}

        {/* ── Accepted: vote for winner (both must agree) ── */}
        {isAccepted && (iAmFrom || iAmTarget) && (
          <div>
            <div style={{ fontSize: 11, color: "#15803D", fontWeight: 700, marginBottom: 8 }}>✅ Défi en cours ! Votez pour le gagnant (les 2 doivent être d'accord) :</div>
            {myVote ? (
              <div style={{ fontSize: 12, color: "#0B68B4", fontWeight: 700, padding: "6px 0" }}>
                🗳️ Tu as voté : <strong>{getUserName(myVote)}</strong> — en attente de l'autre vote...
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => voterGagnant(defi.id, defi.from)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `2px solid ${getUserColor(defi.from)}`, background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 800, color: getUserColor(defi.from), fontFamily: "'Outfit',sans-serif" }}>🏆 {getUserName(defi.from)} gagne</button>
                <button onClick={() => voterGagnant(defi.id, defi.to)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `2px solid ${getUserColor(defi.to)}`, background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 800, color: getUserColor(defi.to), fontFamily: "'Outfit',sans-serif" }}>🏆 {getUserName(defi.to)} gagne</button>
              </div>
            )}
          </div>
        )}

        {/* ── Dispute: votes don't match ── */}
        {isDispute && (
          <div>
            <div style={{ fontSize: 12, color: "#991B1B", fontWeight: 700, marginBottom: 6 }}>⚠️ Désaccord ! Vos votes ne correspondent pas.</div>
            <div style={{ fontSize: 11, color: "#78350F", marginBottom: 8 }}>
              {getUserName(defi.from)} a voté <strong>{getUserName(defi.votes?.[defi.from])}</strong> · {getUserName(defi.to)} a voté <strong>{getUserName(defi.votes?.[defi.to])}</strong>
            </div>
            <button onClick={() => revoterDefi(defi.id)} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: "#F59E0B", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 800, fontFamily: "'Outfit',sans-serif" }}>🔄 Réinitialiser les votes et revoter</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 80px)" }}>
      <ST emoji="💬" sub="Discutez en temps réel avec toute l'équipe.">Messages</ST>

      <div style={{ display: "flex", flex: 1, gap: 0, overflow: "hidden", borderRadius: 12, border: "1px solid #E4E4E7" }}>

        {/* ══════ LEFT: Contacts sidebar ══════ */}
        <div style={{ width: 200, minWidth: 200, background: "#FAFAFA", borderRight: "1px solid #E4E4E7", overflowY: "auto", flexShrink: 0 }}>
          {/* General channel */}
          <button onClick={() => setActiveConv(null)}
            style={{ width: "100%", padding: "12px 14px", border: "none", borderBottom: "1px solid #E4E4E7", background: activeConv === null ? "#E1FFED" : "transparent", cursor: "pointer", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#16A34A", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🌐</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: activeConv === null ? "#15803D" : "#18181B", fontFamily: "'Outfit',sans-serif" }}>Général</div>
                <div style={{ fontSize: 10, color: "#A1A1AA" }}>
                  {lastActivity[GENERAL_KEY] ? timeAgo(lastActivity[GENERAL_KEY]) : "Toute l'équipe"}
                </div>
              </div>
            </div>
          </button>

          <div style={{ padding: "10px 14px 6px", fontSize: 10, fontWeight: 800, color: "#A1A1AA", textTransform: "uppercase", letterSpacing: ".06em" }}>
            Messages privés
          </div>

          {sortedMembers.map(member => {
            const isActive = activeConv === member.email;
            const color = member.color || getUserColor(member.email);
            const avatar = member.avatar || getInitials(member.name);
            const key = dmKey(user?.email, member.email);
            const lastDate = lastActivity[key];
            return (
              <button key={member.email} onClick={() => setActiveConv(member.email)}
                style={{ width: "100%", padding: "10px 14px", border: "none", borderBottom: "1px solid #F4F4F5", background: isActive ? "#EFF6FF" : "transparent", cursor: "pointer", textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, fontFamily: "'Outfit',sans-serif", flexShrink: 0 }}>{avatar}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: isActive ? "#1E40AF" : "#3F3F46", fontFamily: "'Outfit',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{member.name || member.email}</div>
                    <div style={{ fontSize: 10, color: "#A1A1AA" }}>{lastDate ? timeAgo(lastDate) : member.role || "sales"}</div>
                  </div>
                </div>
              </button>
            );
          })}

          {teamMembers.length === 0 && (
            <div style={{ padding: "16px 14px", fontSize: 11, color: "#A1A1AA", textAlign: "center" }}>Aucun membre</div>
          )}
        </div>

        {/* ══════ RIGHT: Chat area ══════ */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Chat header */}
          <div style={{ padding: "10px 16px", borderBottom: "1px solid #E4E4E7", background: "#fff", display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {activeConv && (
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: getUserColor(activeConv), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, fontFamily: "'Outfit',sans-serif", flexShrink: 0 }}>{getUserAvatar(activeConv)}</div>
              )}
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#18181B", fontFamily: "'Outfit',sans-serif" }}>{convEmoji} {convTitle}</div>
                <div style={{ fontSize: 10, color: "#A1A1AA" }}>{activeConv ? "Conversation privée" : "Visible par toute l'équipe"}</div>
              </div>
            </div>
            {/* Défi button (only in DMs) */}
            {activeConv && (
              <button onClick={() => setShowDefiForm(!showDefiForm)}
                style={{ padding: "6px 14px", borderRadius: 8, border: "2px solid #F59E0B", background: showDefiForm ? "#FFFBEB" : "#fff", cursor: "pointer", fontSize: 11, fontWeight: 800, color: "#92400E", fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", gap: 4, transition: "all .15s" }}>
                ⚔️ Défi
              </button>
            )}
          </div>

          {/* Défi form */}
          {showDefiForm && activeConv && (
            <div style={{ padding: "12px 16px", background: "#FFFBEB", borderBottom: "1px solid #FDE68A" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#92400E", fontFamily: "'Outfit',sans-serif", marginBottom: 8 }}>⚔️ Proposer un défi à {getUserName(activeConv)}</div>
              <input value={defiTitre} onChange={e => setDefiTitre(e.target.value)} placeholder="Ex: Le premier à closer 3 ventes cette semaine"
                style={{ width: "100%", fontSize: 12, border: "1px solid #FDE68A", borderRadius: 8, padding: "8px 12px", marginBottom: 8, boxSizing: "border-box" }} />
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#78350F" }}>Mise ({CURRENCY.emoji})</label>
                <input type="number" min="1" max="500" value={defiMise} onChange={e => setDefiMise(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ width: 80, fontSize: 12, border: "1px solid #FDE68A", borderRadius: 8, padding: "6px 10px" }} />
                <span style={{ fontSize: 10, color: "#A16207" }}>x2 = {defiMise * 2} {CURRENCY.emoji} pour le gagnant</span>
                <div style={{ flex: 1 }} />
                <button onClick={proposerDefi} disabled={!defiTitre.trim()}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: defiTitre.trim() ? "#F59E0B" : "#E4E4E7", color: "#fff", cursor: defiTitre.trim() ? "pointer" : "default", fontSize: 12, fontWeight: 800, fontFamily: "'Outfit',sans-serif" }}>
                  Envoyer le défi ⚔️
                </button>
              </div>
              <div style={{ fontSize: 10, color: "#A16207", marginTop: 6 }}>Ton solde : {fmtSherpoints(getBalance(user?.email))}</div>
            </div>
          )}

          {/* Active challenges banner */}
          {convChallenges.length > 0 && (
            <div style={{ padding: "8px 16px", background: "#FEF3C7", borderBottom: "1px solid #FDE68A" }}>
              {convChallenges.map(d => <div key={d.id}>{renderDefiCard(d)}</div>)}
            </div>
          )}

          {/* Messages area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
            {loading && <div style={{ textAlign: "center", padding: 40, color: "#A1A1AA", fontSize: 13 }}>Chargement...</div>}

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
                  const isSystem = msg.auteur === "system";
                  const isMe = msg.auteur === user?.email;
                  const color = isSystem ? "#F59E0B" : getUserColor(msg.auteur);
                  const avatar = isSystem ? "⚔️" : getUserAvatar(msg.auteur);
                  const name = msg.nom || getUserName(msg.auteur);
                  const prevMsg = mi > 0 ? group.msgs[mi - 1] : null;
                  const sameAuthor = prevMsg && prevMsg.auteur === msg.auteur;

                  return (
                    <div key={msg.id || mi} style={{ display: "flex", gap: 8, marginBottom: sameAuthor ? 2 : 10, alignItems: "flex-start" }}>
                      {!sameAuthor ? (
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%", background: isSystem ? "#FEF3C7" : color,
                          color: isSystem ? "#000" : "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: isSystem ? 16 : 11, fontWeight: 800, fontFamily: "'Outfit',sans-serif",
                          flexShrink: 0, marginTop: 2, border: isSystem ? "2px solid #F59E0B" : "none",
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
                          borderRadius: isSystem ? "10px" : isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                          background: isSystem ? "#FFFBEB" : isMe ? "#E1FFED" : "#F4F4F5",
                          border: isSystem ? "1px solid #FDE68A" : isMe ? "1px solid #BBF7D0" : "1px solid #E4E4E7",
                          fontSize: 13, color: isSystem ? "#78350F" : "#18181B", lineHeight: 1.5,
                          maxWidth: "85%", wordBreak: "break-word", whiteSpace: "pre-wrap",
                          fontStyle: isSystem ? "italic" : "normal",
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
          <div style={{ display: "flex", gap: 8, padding: "10px 12px", background: "#fff", borderTop: "1px solid #E4E4E7" }}>
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder={activeConv ? `Message à ${getUserName(activeConv)}...` : "Écrire un message..."}
              rows={1} style={{ flex: 1, fontSize: 13, border: "1px solid #E4E4E7", borderRadius: 10, padding: "10px 14px", resize: "none", outline: "none", fontFamily: "'Inter',sans-serif", maxHeight: 100, overflowY: "auto", lineHeight: 1.4 }} />
            <button onClick={sendMessage} disabled={!input.trim()}
              style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: input.trim() ? "#16A34A" : "#E4E4E7", color: input.trim() ? "#fff" : "#A1A1AA", cursor: input.trim() ? "pointer" : "default", fontSize: 13, fontWeight: 800, fontFamily: "'Outfit',sans-serif", transition: "all .15s", whiteSpace: "nowrap" }}>
              Envoyer ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
