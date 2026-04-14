import React, { useState } from 'react';
import SalesScripts from './Scripts';
import SalesObjections from './Objections';
import Templates from './Templates';

function Ressources({ scripts, objections, setSuggestions }) {
  const [tab, setTab] = useState("templates");

  return (
    <div>
      <div style={{ display: "flex", gap: 4, background: "#F4F4F5", padding: 3, borderRadius: 10, marginBottom: 14 }}>
        {[
          { id: "templates", label: "📱 Templates SMS" },
          { id: "scripts", label: "📞 Scripts d'appel" },
          { id: "objections", label: "🛡️ Fiches objections" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", cursor: "pointer", background: tab === t.id ? "#fff" : "transparent", boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,.08)" : "none", fontSize: 11, fontWeight: 800, color: tab === t.id ? "#18181B" : "#71717A", fontFamily: "'Outfit',sans-serif" }}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "templates" && <Templates />}
      {tab === "scripts" && <SalesScripts scripts={scripts} />}
      {tab === "objections" && <SalesObjections objections={objections} setSuggestions={setSuggestions} />}
    </div>
  );
}

export default Ressources;
