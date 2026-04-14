import { useState, useEffect } from 'react';
import { sb } from '../../lib/supabase';
import { C, Btn, Pill, ST } from '../ui';

const ROLES = [
  { id: "sales", label: "Sales", emoji: "📞", color: "#0B68B4" },
  { id: "manager", label: "Manager", emoji: "👔", color: "#D97706" },
  { id: "formateur", label: "Formateur", emoji: "🎓", color: "#7C3AED" },
];

const STATUTS = [
  { id: "cdi", label: "CDI", emoji: "📄" },
  { id: "stage", label: "Stage", emoji: "🎒" },
  { id: "alternance", label: "Alternance", emoji: "🔄" },
  { id: "freelance", label: "Freelance", emoji: "💻" },
];

const COLORS = ["#0B68B4","#16A34A","#D97706","#7C3AED","#E11D48","#0369A1","#059669","#EAB308"];

function initials(nameOrEmail) {
  if (!nameOrEmail) return "??";
  const parts = nameOrEmail.split(/[\s@._-]/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return nameOrEmail.slice(0, 2).toUpperCase();
}

function Equipe({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const LS_STATUTS = "sherpas_user_statuts_v1";
  const [userStatuts, setUserStatuts] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_STATUTS) || "{}"); } catch { return {}; }
  });
  function saveStatut(email, statut) {
    const next = { ...userStatuts, [email]: statut };
    setUserStatuts(next);
    localStorage.setItem(LS_STATUTS, JSON.stringify(next));
  }
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("sales");
  const [newColor, setNewColor] = useState("#16A34A");
  const [newStatut, setNewStatut] = useState("cdi");
  const [newDateArrivee, setNewDateArrivee] = useState("");
  const [saving, setSaving] = useState(false);

  async function reload() {
    setLoading(true);
    const { data, error } = await sb.from("allowed_users").select("*").order("invited_at", { ascending: false });
    if (error) setError(error.message);
    else setUsers(data || []);
    setLoading(false);
  }
  useEffect(() => { reload(); }, []);

  async function addUser() {
    setError("");
    if (!newEmail.trim() || !newEmail.includes("@")) { setError("Email invalide"); return; }
    setSaving(true);
    const { error } = await sb.from("allowed_users").insert({
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      name: newName.trim() || null,
      avatar: initials(newName || newEmail),
      color: newColor,
      invited_by: user?.email || "manager",
    });
    setSaving(false);
    if (error) { setError(error.message); return; }
    const emailLower = newEmail.trim().toLowerCase();
    saveStatut(emailLower, newStatut);
    // Sauvegarder aussi la date d'arrivée
    const dates = JSON.parse(localStorage.getItem("sherpas_user_dates_v1") || "{}");
    dates[emailLower] = newDateArrivee || new Date().toISOString().slice(0, 10);
    localStorage.setItem("sherpas_user_dates_v1", JSON.stringify(dates));
    setNewEmail(""); setNewName(""); setNewRole("sales"); setNewColor("#16A34A"); setNewStatut("cdi"); setNewDateArrivee("");
    reload();
  }

  async function toggleActive(u) {
    await sb.from("allowed_users").update({ active: !u.active }).eq("id", u.id);
    reload();
  }

  async function changeRole(u, role) {
    await sb.from("allowed_users").update({ role }).eq("id", u.id);
    reload();
  }

  async function removeUser(u) {
    if (!confirm(`Supprimer ${u.email} de la liste ?`)) return;
    await sb.from("allowed_users").delete().eq("id", u.id);
    reload();
  }

  return (
    <div>
      <ST emoji="👥" sub="Invite des membres en ajoutant leur email Google. Ils pourront se connecter uniquement s'ils sont dans cette liste.">Gestion de l'équipe</ST>

      {/* Formulaire d'ajout */}
      <C style={{ marginBottom: 14, borderLeft: "4px solid #16A34A" }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#18181B", marginBottom: 10, fontFamily: "'Outfit',sans-serif" }}>➕ Inviter un nouveau membre</div>

        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#71717A", display: "block", marginBottom: 4 }}>Email Google *</label>
          <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
            placeholder="prenom.nom@gmail.com"
            style={{ width: "100%", fontSize: 13, border: "1px solid #E4E4E7", borderRadius: 8, padding: "9px 12px", boxSizing: "border-box" }} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#71717A", display: "block", marginBottom: 4 }}>Nom complet (optionnel)</label>
          <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="Ex: Thomas Dupont"
            style={{ width: "100%", fontSize: 13, border: "1px solid #E4E4E7", borderRadius: 8, padding: "9px 12px", boxSizing: "border-box" }} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#71717A", display: "block", marginBottom: 4 }}>Rôle</label>
          <div style={{ display: "flex", gap: 6 }}>
            {ROLES.map(r => (
              <button key={r.id} onClick={() => setNewRole(r.id)}
                style={{ flex: 1, padding: "10px", borderRadius: 8, border: `2px solid ${newRole === r.id ? r.color : "#E4E4E7"}`, background: newRole === r.id ? r.color + "12" : "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, color: newRole === r.id ? r.color : "#71717A" }}>
                <div style={{ fontSize: 16, marginBottom: 2 }}>{r.emoji}</div>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#71717A", display: "block", marginBottom: 4 }}>Statut</label>
          <div style={{ display: "flex", gap: 6 }}>
            {STATUTS.map(s => (
              <button key={s.id} onClick={() => setNewStatut(s.id)}
                style={{ flex: 1, padding: "8px", borderRadius: 8, border: `2px solid ${newStatut === s.id ? "#16A34A" : "#E4E4E7"}`, background: newStatut === s.id ? "#F0FDF4" : "#fff", cursor: "pointer", fontSize: 11, fontWeight: 700, color: newStatut === s.id ? "#15803D" : "#71717A", textAlign: "center" }}>
                <div style={{ fontSize: 14, marginBottom: 1 }}>{s.emoji}</div>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#71717A", display: "block", marginBottom: 4 }}>Date d'arrivée</label>
          <input type="date" value={newDateArrivee} onChange={e => setNewDateArrivee(e.target.value)}
            style={{ width: "100%", fontSize: 13, border: "1px solid #E4E4E7", borderRadius: 8, padding: "8px 12px", boxSizing: "border-box" }} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#71717A", display: "block", marginBottom: 4 }}>Couleur</label>
          <div style={{ display: "flex", gap: 6 }}>
            {COLORS.map(c => (
              <button key={c} onClick={() => setNewColor(c)}
                style={{ width: 28, height: 28, borderRadius: "50%", border: newColor === c ? "3px solid #18181B" : "2px solid #E4E4E7", background: c, cursor: "pointer" }} />
            ))}
          </div>
        </div>

        <Btn onClick={addUser} disabled={saving || !newEmail.trim()} full color="#16A34A" style={{ padding: "11px", borderRadius: 99, fontSize: 13 }}>
          {saving ? "Ajout..." : "✉️ Inviter"}
        </Btn>
        {error && <div style={{ marginTop: 8, padding: "8px 12px", background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 8, fontSize: 11, color: "#B91C1C" }}>{error}</div>}
      </C>

      {/* Liste des membres */}
      <C>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#18181B", marginBottom: 10, fontFamily: "'Outfit',sans-serif", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>👥 Membres de l'équipe</span>
          <span style={{ fontSize: 11, color: "#71717A" }}>{users.length} membre{users.length > 1 ? "s" : ""}</span>
        </div>
        {loading && <div style={{ fontSize: 12, color: "#71717A", textAlign: "center", padding: 20 }}>Chargement...</div>}
        {!loading && users.length === 0 && <div style={{ fontSize: 12, color: "#71717A", textAlign: "center", padding: 20 }}>Aucun membre pour le moment</div>}
        {users.map(u => {
          const roleMeta = ROLES.find(r => r.id === u.role) || ROLES[0];
          return (
            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderBottom: "1px solid #F4F4F5", opacity: u.active ? 1 : 0.5 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: u.color || "#16A34A", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 900, fontFamily: "'Outfit',sans-serif", flexShrink: 0 }}>{u.avatar || initials(u.name || u.email)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#18181B", fontFamily: "'Outfit',sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.name || u.email}</div>
                <div style={{ fontSize: 10, color: "#71717A" }}>{u.email}</div>
              </div>
              <select value={userStatuts[u.email] || "cdi"} onChange={e => saveStatut(u.email, e.target.value)}
                style={{ fontSize: 10, padding: "4px 6px", borderRadius: 6, border: "1px solid #E4E4E7", background: "#fff", cursor: "pointer", fontWeight: 600, color: "#3F3F46" }}>
                {STATUTS.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
              </select>
              <input type="date" value={(() => { try { return JSON.parse(localStorage.getItem("sherpas_user_dates_v1") || "{}")[u.email] || ""; } catch { return ""; } })()}
                onChange={e => { const d = JSON.parse(localStorage.getItem("sherpas_user_dates_v1") || "{}"); d[u.email] = e.target.value; localStorage.setItem("sherpas_user_dates_v1", JSON.stringify(d)); }}
                style={{ fontSize: 9, padding: "3px 4px", borderRadius: 4, border: "1px solid #E4E4E7", width: 95 }} />
              <select value={u.role} onChange={e => changeRole(u, e.target.value)}
                style={{ fontSize: 10, padding: "4px 6px", borderRadius: 6, border: "1px solid #E4E4E7", background: "#fff", cursor: "pointer", fontWeight: 700, color: roleMeta.color }}>
                {ROLES.map(r => <option key={r.id} value={r.id}>{r.emoji} {r.label}</option>)}
              </select>
              <button onClick={() => toggleActive(u)}
                style={{ fontSize: 10, padding: "4px 10px", borderRadius: 6, border: "1px solid #E4E4E7", background: u.active ? "#F0FDF4" : "#FEF2F2", color: u.active ? "#15803D" : "#B91C1C", cursor: "pointer", fontWeight: 700 }}>
                {u.active ? "✓ Actif" : "✗ Inactif"}
              </button>
              <button onClick={() => removeUser(u)}
                style={{ fontSize: 14, padding: "4px 8px", borderRadius: 6, border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#B91C1C", cursor: "pointer" }}>
                🗑️
              </button>
            </div>
          );
        })}
      </C>

      <div style={{ marginTop: 14, padding: "12px 14px", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, fontSize: 11, color: "#1E40AF", lineHeight: 1.5 }}>
        💡 <b>Comment ça marche</b> : une fois invité, le membre pourra se connecter au site en cliquant sur "Se connecter avec Google". Son email Google doit correspondre exactement à celui que tu as entré ici.
      </div>
    </div>
  );
}

export default Equipe;
