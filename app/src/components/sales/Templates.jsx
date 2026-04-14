import React, { useState, useEffect } from 'react';
import { syncToSupabase } from '../../lib/supabase';
import { C, Btn, ST, CopyBtn } from '../ui';
import { DEFAULT_SMS_TEMPLATES } from '../../constants/smsTemplates';

const LS_KEY = "sherpas_sms_templates_v1";

function Templates() {
  const [templates, setTemplates] = useState(() => {
    try { const raw = localStorage.getItem(LS_KEY); return raw ? JSON.parse(raw) : DEFAULT_SMS_TEMPLATES; } catch { return DEFAULT_SMS_TEMPLATES; }
  });
  const [filterCat, setFilterCat] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // index
  const [draft, setDraft] = useState({ cat: "", nom: "", body: "" });
  const [adding, setAdding] = useState(false);
  const [openCat, setOpenCat] = useState(null);

  function save(next) { setTemplates(next); localStorage.setItem(LS_KEY, JSON.stringify(next)); syncToSupabase("sms_templates", next); }

  const cats = [...new Set(templates.map(t => t.cat))].sort();
  const filtered = templates.filter(t => {
    if (filterCat && t.cat !== filterCat) return false;
    if (search && !t.nom.toLowerCase().includes(search.toLowerCase()) && !t.body.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      {/* Filtres */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          style={{ fontSize: 11, padding: "6px 10px", borderRadius: 8, border: "1px solid #E4E4E7", fontWeight: 700, color: filterCat ? "#7C3AED" : "#71717A", cursor: "pointer" }}>
          <option value="">📂 Toutes catégories</option>
          {cats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher..."
          style={{ flex: 1, fontSize: 11, border: "1px solid #E4E4E7", borderRadius: 8, padding: "6px 10px", minWidth: 120 }} />
        <Btn onClick={() => { setAdding(true); setDraft({ cat: cats[0] || "Autre", nom: "", body: "" }); }} color="#16A34A" style={{ padding: "6px 14px", borderRadius: 8, fontSize: 11 }}>➕ Nouveau</Btn>
        <span style={{ fontSize: 10, color: "#A1A1AA", display: "flex", alignItems: "center" }}>{filtered.length} template{filtered.length > 1 ? "s" : ""}</span>
      </div>

      {/* Formulaire ajout */}
      {adding && (
        <C style={{ marginBottom: 14, borderLeft: "4px solid #16A34A" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#15803D", marginBottom: 8 }}>➕ Nouveau template</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            <input value={draft.cat} onChange={e => setDraft({...draft, cat: e.target.value})} placeholder="Catégorie" list="cats-list"
              style={{ flex: 1, fontSize: 11, border: "1px solid #E4E4E7", borderRadius: 6, padding: "6px 10px" }} />
            <datalist id="cats-list">{cats.map(c => <option key={c} value={c} />)}</datalist>
            <input value={draft.nom} onChange={e => setDraft({...draft, nom: e.target.value})} placeholder="Nom du template"
              style={{ flex: 2, fontSize: 11, border: "1px solid #E4E4E7", borderRadius: 6, padding: "6px 10px", fontWeight: 700 }} />
          </div>
          <textarea value={draft.body} onChange={e => setDraft({...draft, body: e.target.value})} placeholder="Contenu du SMS/mail..."
            rows={6} style={{ width: "100%", fontSize: 11, border: "1px solid #E4E4E7", borderRadius: 6, padding: "8px 10px", boxSizing: "border-box", resize: "vertical", marginBottom: 6 }} />
          <div style={{ display: "flex", gap: 6 }}>
            <Btn onClick={() => { if (!draft.nom || !draft.body) return; save([...templates, draft]); setAdding(false); }} color="#16A34A" style={{ padding: "6px 14px", borderRadius: 6, fontSize: 11 }}>💾 Enregistrer</Btn>
            <Btn onClick={() => setAdding(false)} outline color="#71717A" style={{ padding: "6px 14px", borderRadius: 6, fontSize: 11 }}>Annuler</Btn>
          </div>
        </C>
      )}

      {/* Templates par catégorie — menus déroulants */}
      {cats.filter(c => !filterCat || c === filterCat).map(cat => {
        const catTemplates = filtered.filter(t => t.cat === cat);
        if (catTemplates.length === 0) return null;
        const isOpen = openCat === cat;
        return (
          <C key={cat} style={{ marginBottom: 8, cursor: "pointer", padding: isOpen ? "12px 14px" : "10px 14px" }} onClick={() => setOpenCat(isOpen ? null : cat)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 9, background: "#F5F3FF", color: "#7C3AED", borderRadius: 4, padding: "2px 8px", fontWeight: 700 }}>{cat}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#18181B", fontFamily: "'Outfit',sans-serif" }}>{catTemplates.length} template{catTemplates.length > 1 ? "s" : ""}</span>
              </div>
              <span style={{ fontSize: 14, color: "#71717A", transition: "transform .2s", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
            </div>
            {isOpen && (
              <div onClick={e => e.stopPropagation()} style={{ marginTop: 12 }}>
                {catTemplates.map(t => {
                  const realIdx = templates.indexOf(t);
                  const isEditing = editing === realIdx;
                  return (
                    <div key={realIdx} style={{ marginBottom: 10, padding: "8px 10px", background: "#FAFAFA", borderRadius: 8, borderLeft: "3px solid #7C3AED" }}>
                      {!isEditing ? (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#18181B" }}>{t.nom}</span>
                            <div style={{ display: "flex", gap: 4 }}>
                              <CopyBtn text={t.body} />
                              <button onClick={() => { setEditing(realIdx); setDraft({ ...t }); }} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, border: "1px solid #E4E4E7", background: "#fff", cursor: "pointer", color: "#71717A" }}>✏️</button>
                              <button onClick={() => { if (confirm(`Supprimer "${t.nom}" ?`)) save(templates.filter((_, i) => i !== realIdx)); }}
                                style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, border: "1px solid #FCA5A5", background: "#FEF2F2", cursor: "pointer", color: "#E11D48" }}>🗑️</button>
                            </div>
                          </div>
                          <pre style={{ margin: 0, fontSize: 11, color: "#3F3F46", lineHeight: 1.5, whiteSpace: "pre-wrap", background: "#fff", borderRadius: 6, padding: "8px 10px", maxHeight: 150, overflow: "auto" }}>{t.body}</pre>
                        </>
                      ) : (
                        <>
                          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                            <input value={draft.cat} onChange={e => setDraft({...draft, cat: e.target.value})} list="cats-list"
                              style={{ flex: 1, fontSize: 11, border: "1px solid #E4E4E7", borderRadius: 6, padding: "6px 10px" }} />
                            <input value={draft.nom} onChange={e => setDraft({...draft, nom: e.target.value})}
                              style={{ flex: 2, fontSize: 11, border: "1px solid #E4E4E7", borderRadius: 6, padding: "6px 10px", fontWeight: 700 }} />
                          </div>
                          <textarea value={draft.body} onChange={e => setDraft({...draft, body: e.target.value})}
                            rows={8} style={{ width: "100%", fontSize: 11, border: "1px solid #E4E4E7", borderRadius: 6, padding: "8px 10px", boxSizing: "border-box", resize: "vertical", marginBottom: 6 }} />
                          <div style={{ display: "flex", gap: 6 }}>
                            <Btn onClick={() => { const next = [...templates]; next[realIdx] = draft; save(next); setEditing(null); }} color="#16A34A" style={{ padding: "6px 14px", borderRadius: 6, fontSize: 11 }}>💾 Sauvegarder</Btn>
                            <Btn onClick={() => setEditing(null)} outline color="#71717A" style={{ padding: "6px 14px", borderRadius: 6, fontSize: 11 }}>Annuler</Btn>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </C>
        );
      })}
    </div>
  );
}

export default Templates;
