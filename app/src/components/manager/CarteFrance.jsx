import React, { useState, useEffect, useMemo, useRef } from 'react';
import { C, ST } from '../ui';

const GEOJSON_DEPS = "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson";
const GEOJSON_REGIONS = "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/regions-version-simplifiee.geojson";

const REGIONS_MAP = {
  "Île-de-France": { deps: ["75","77","78","91","92","93","94","95"] },
  "Hauts-de-France": { deps: ["02","59","60","62","80"] },
  "Grand Est": { deps: ["08","10","51","52","54","55","57","67","68","88"] },
  "Normandie": { deps: ["14","27","50","61","76"] },
  "Bretagne": { deps: ["22","29","35","56"] },
  "Pays de la Loire": { deps: ["44","49","53","72","85"] },
  "Centre-Val de Loire": { deps: ["18","28","36","37","41","45"] },
  "Bourgogne-Franche-Comté": { deps: ["21","25","39","58","70","71","89","90"] },
  "Nouvelle-Aquitaine": { deps: ["16","17","19","23","24","33","40","47","64","79","86","87"] },
  "Auvergne-Rhône-Alpes": { deps: ["01","03","07","15","26","38","42","43","63","69","73","74"] },
  "Occitanie": { deps: ["09","11","12","30","31","32","34","46","48","65","66","81","82"] },
  "Provence-Alpes-Côte d'Azur": { deps: ["04","05","06","13","83","84"] },
  "Corse": { deps: ["2A","2B"] },
};

// Projection GPS → SVG (Lambert-like pour la France)
function project(lon, lat) {
  const x = (lon + 5.5) * 55;
  const y = (51.5 - lat) * 62;
  return [x, y];
}

function coordsToPath(coords) {
  return coords.map((ring, ri) => {
    const pts = ring.map(([lon, lat]) => project(lon, lat));
    return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + " Z";
  }).join(" ");
}

function featureToPath(feature) {
  const geom = feature.geometry;
  if (geom.type === "Polygon") return coordsToPath(geom.coordinates);
  if (geom.type === "MultiPolygon") return geom.coordinates.map(coordsToPath).join(" ");
  return "";
}

function CarteFrance({ user }) {
  const [view, setView] = useState("departements");
  const [demandes, setDemandes] = useState([]);
  const [filtreNiveau, setFiltreNiveau] = useState("");
  const [filtreMatiere, setFiltreMatiere] = useState("");
  const [geoJsonDeps, setGeoJsonDeps] = useState(null);
  const [geoJsonRegions, setGeoJsonRegions] = useState(null);
  const [geoJsonVilles, setGeoJsonVilles] = useState([]);
  const [villeCoords, setVilleCoords] = useState({});
  const [hoveredZone, setHoveredZone] = useState(null);

  useEffect(() => {
    fetch(GEOJSON_DEPS).then(r => r.json()).then(setGeoJsonDeps).catch(() => {});
    fetch(GEOJSON_REGIONS).then(r => r.json()).then(setGeoJsonRegions).catch(() => {});
  }, []);

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("sherpas_demandes_zones_v1") || "[]");
      setDemandes(raw);
      const villes = [...new Set(raw.map(d => d.ville).filter(Boolean))];
      const features = [];
      Promise.all(villes.map(v =>
        fetch(`https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(v)}&fields=contour,centre,code,codesPostaux,codeDepartement&format=geojson&limit=1`)
          .then(r => r.json())
          .then(data => {
            const f = data.features?.[0];
            if (f) {
              f.properties._ville = v;
              features.push(f);
              const centre = f.properties.centre?.coordinates;
              const cp = f.properties.codesPostaux?.[0] || "";
              if (centre) setVilleCoords(prev => ({ ...prev, [v.toLowerCase()]: { lat: centre[1], lon: centre[0], cp, dept: f.properties.codeDepartement || cp.slice(0, 2) } }));
            }
          }).catch(() => {})
      )).then(() => setGeoJsonVilles(features));
    } catch {}
  }, []);

  // Extraire les niveaux et matières uniques des demandes
  const allNiveaux = useMemo(() => [...new Set(demandes.map(d => d.niveau).filter(Boolean))].sort(), [demandes]);
  const allMatieres = useMemo(() => {
    const s = new Set();
    demandes.forEach(d => { if (d.matieres) d.matieres.split(", ").forEach(m => s.add(m)); });
    return [...s].sort();
  }, [demandes]);

  // Demandes filtrées
  const filteredDemandes = useMemo(() => {
    return demandes.filter(d => {
      if (filtreNiveau && d.niveau !== filtreNiveau) return false;
      if (filtreMatiere && (!d.matieres || !d.matieres.includes(filtreMatiere))) return false;
      return true;
    });
  }, [demandes, filtreNiveau, filtreMatiere]);

  const parVille = useMemo(() => {
    const m = {};
    filteredDemandes.forEach(d => { const v = (d.ville || "").toLowerCase(); if (!v) return; m[v] = m[v] || { count: 0, ville: d.ville, matieres: new Set() }; m[v].count++; if (d.matieres) d.matieres.split(", ").forEach(mat => m[v].matieres.add(mat)); });
    return Object.values(m).sort((a, b) => b.count - a.count);
  }, [filteredDemandes]);

  const parDept = useMemo(() => {
    const m = {};
    filteredDemandes.forEach(d => { const v = (d.ville || "").toLowerCase(); const coord = villeCoords[v]; const dept = coord?.dept || (d.cp || "").slice(0, 2); if (!dept) return; m[dept] = m[dept] || { count: 0, dept, matieres: new Set() }; m[dept].count++; if (d.matieres) d.matieres.split(", ").forEach(mat => m[dept].matieres.add(mat)); });
    return Object.values(m).sort((a, b) => b.count - a.count);
  }, [filteredDemandes, villeCoords]);

  const parRegion = useMemo(() => {
    const m = {};
    filteredDemandes.forEach(d => { const v = (d.ville || "").toLowerCase(); const coord = villeCoords[v]; const dept = coord?.dept || (d.cp || "").slice(0, 2); const region = Object.entries(REGIONS_MAP).find(([, r]) => r.deps.includes(dept)); const rName = region ? region[0] : "Autre"; m[rName] = m[rName] || { count: 0, region: rName, matieres: new Set() }; m[rName].count++; if (d.matieres) d.matieres.split(", ").forEach(mat => m[rName].matieres.add(mat)); });
    return Object.values(m).sort((a, b) => b.count - a.count);
  }, [filteredDemandes, villeCoords]);

  const currentData = view === "villes" ? parVille : view === "departements" ? parDept : parRegion;
  const maxCount = Math.max(...currentData.map(d => d.count), 1);
  const minCount = Math.min(...currentData.filter(d => d.count > 0).map(d => d.count), maxCount);

  function getHeatColor(count) {
    if (count === 0) return "#F4F4F5";
    const ratio = maxCount === minCount ? 1 : (count - minCount) / (maxCount - minCount);
    if (ratio <= 0.5) { const t = ratio * 2; return `rgb(${Math.round(22 + t * 212)},${Math.round(163 + t * 16)},${Math.round(74 - t * 66)})`; }
    const t = (ratio - 0.5) * 2; return `rgb(${Math.round(234 - t * 9)},${Math.round(179 - t * 150)},${Math.round(8 + t * 64)})`;
  }

  function getZoneData(code, nom) {
    if (view === "departements") return parDept.find(d => d.dept === code) || null;
    if (view === "regions") return parRegion.find(r => r.region === nom) || null;
    if (view === "villes") return parVille.find(v => v.ville.toLowerCase() === (nom || "").toLowerCase()) || null;
    return null;
  }

  return (
    <div>
      <ST emoji="🗺️" sub="Zones sans profs à domicile — signalements de l'équipe sales.">Carte des demandes</ST>

      <div style={{ display: "flex", gap: 4, background: "#F4F4F5", padding: 3, borderRadius: 10, marginBottom: 14 }}>
        {[{ id: "villes", label: "📍 Villes" }, { id: "departements", label: "🏛️ Départements" }, { id: "regions", label: "🗺️ Régions" }].map(t => (
          <button key={t.id} onClick={() => setView(t.id)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", cursor: "pointer", background: view === t.id ? "#fff" : "transparent", boxShadow: view === t.id ? "0 1px 3px rgba(0,0,0,.08)" : "none", fontSize: 11, fontWeight: 800, color: view === t.id ? "#18181B" : "#71717A", fontFamily: "'Outfit',sans-serif" }}>{t.label}</button>
        ))}
      </div>

      {/* Filtres */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <select value={filtreNiveau} onChange={e => setFiltreNiveau(e.target.value)}
          style={{ fontSize: 11, padding: "6px 10px", borderRadius: 8, border: "1px solid #E4E4E7", background: filtreNiveau ? "#F0FDF4" : "#fff", fontWeight: 700, color: filtreNiveau ? "#15803D" : "#71717A", cursor: "pointer" }}>
          <option value="">🎓 Tous niveaux</option>
          {allNiveaux.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <select value={filtreMatiere} onChange={e => setFiltreMatiere(e.target.value)}
          style={{ fontSize: 11, padding: "6px 10px", borderRadius: 8, border: "1px solid #E4E4E7", background: filtreMatiere ? "#EFF6FF" : "#fff", fontWeight: 700, color: filtreMatiere ? "#1E40AF" : "#71717A", cursor: "pointer" }}>
          <option value="">📚 Toutes matières</option>
          {allMatieres.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        {(filtreNiveau || filtreMatiere) && (
          <button onClick={() => { setFiltreNiveau(""); setFiltreMatiere(""); }}
            style={{ fontSize: 10, padding: "5px 10px", borderRadius: 6, border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#E11D48", cursor: "pointer", fontWeight: 700 }}>
            ✕ Réinitialiser
          </button>
        )}
        <span style={{ fontSize: 10, color: "#A1A1AA", display: "flex", alignItems: "center" }}>{filteredDemandes.length}/{demandes.length} signalements</span>
      </div>

      {/* Légende */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, justifyContent: "center" }}>
        <span style={{ fontSize: 9, color: "#71717A" }}>Peu</span>
        <div style={{ width: 120, height: 8, borderRadius: 4, background: "linear-gradient(to right, #16A34A, #EAB308, #E11D48)" }} />
        <span style={{ fontSize: 9, color: "#71717A" }}>Beaucoup</span>
        <span style={{ fontSize: 9, color: "#D4D4D8", marginLeft: 8 }}>⬜ Aucune</span>
      </div>

      {/* Carte SVG */}
      <C style={{ marginBottom: 14, padding: "10px", position: "relative", background: "transparent", border: "none", boxShadow: "none" }}>
        <svg viewBox="-10 -10 870 640" style={{ width: "100%", height: "auto", background: "transparent" }}>
          {/* Départements ou Régions */}
          {view === "departements" && geoJsonDeps && geoJsonDeps.features.map((f, i) => {
            const code = f.properties.code;
            const nom = f.properties.nom;
            const data = parDept.find(d => d.dept === code);
            const count = data?.count || 0;
            return (
              <path key={i} d={featureToPath(f)} fill={getHeatColor(count)} stroke={hoveredZone === code ? "#18181B" : "#A1A1AA"} strokeWidth={hoveredZone === code ? 2 : 0.5}
                onMouseEnter={() => setHoveredZone(code)} onMouseLeave={() => setHoveredZone(null)}
                style={{ cursor: "pointer", transition: "fill .2s" }}>
                <title>{nom} ({code}) — {count > 0 ? `${count} demande${count > 1 ? "s" : ""}` : "Aucune demande"}</title>
              </path>
            );
          })}

          {view === "regions" && geoJsonRegions && geoJsonRegions.features.map((f, i) => {
            const nom = f.properties.nom;
            const data = parRegion.find(r => r.region === nom);
            const count = data?.count || 0;
            return (
              <path key={i} d={featureToPath(f)} fill={getHeatColor(count)} stroke={hoveredZone === nom ? "#18181B" : "#71717A"} strokeWidth={hoveredZone === nom ? 2.5 : 1}
                onMouseEnter={() => setHoveredZone(nom)} onMouseLeave={() => setHoveredZone(null)}
                style={{ cursor: "pointer", transition: "fill .2s" }}>
                <title>{nom} — {count > 0 ? `${count} demande${count > 1 ? "s" : ""}` : "Aucune demande"}</title>
              </path>
            );
          })}

          {view === "villes" && (
            <>
              {/* Fond : départements en gris clair */}
              {geoJsonDeps && geoJsonDeps.features.map((f, i) => (
                <path key={`bg${i}`} d={featureToPath(f)} fill="#F9FAFB" stroke="#D4D4D8" strokeWidth={0.3} />
              ))}
              {/* Villes colorées par-dessus */}
              {geoJsonVilles.map((f, i) => {
                const ville = f.properties._ville || f.properties.nom;
                const data = parVille.find(v => v.ville.toLowerCase() === (ville || "").toLowerCase());
                const count = data?.count || 0;
                return (
                  <path key={i} d={featureToPath(f)} fill={getHeatColor(count)} stroke={hoveredZone === ville ? "#18181B" : "#B91C1C"} strokeWidth={hoveredZone === ville ? 2 : 1}
                    onMouseEnter={() => setHoveredZone(ville)} onMouseLeave={() => setHoveredZone(null)}
                    style={{ cursor: "pointer" }}>
                    <title>{ville} — {count} demande{count > 1 ? "s" : ""}</title>
                  </path>
                );
              })}
            </>
          )}
        </svg>

        {/* Tooltip hover */}
        {hoveredZone && (() => {
          const data = view === "departements" ? parDept.find(d => d.dept === hoveredZone) : view === "regions" ? parRegion.find(r => r.region === hoveredZone) : parVille.find(v => v.ville === hoveredZone);
          if (!data) return null;
          const label = data.ville || (data.dept ? `Dept ${data.dept}` : data.region);
          return (
            <div style={{ position: "absolute", top: 10, right: 10, background: "#fff", border: "1px solid #E4E4E7", borderRadius: 8, padding: "8px 12px", boxShadow: "0 4px 12px rgba(0,0,0,.08)", zIndex: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#18181B" }}>📍 {label}</div>
              <div style={{ fontSize: 12, color: "#E11D48", fontWeight: 700 }}>{data.count} demande{data.count > 1 ? "s" : ""}</div>
              {data.matieres && <div style={{ fontSize: 10, color: "#71717A", marginTop: 2 }}>{[...data.matieres].join(", ")}</div>}
            </div>
          );
        })()}
      </C>

      {/* Classement */}
      <C>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#18181B", marginBottom: 10, fontFamily: "'Outfit',sans-serif" }}>
          📊 Classement ({filteredDemandes.length} signalement{filteredDemandes.length > 1 ? "s" : ""}){(filtreNiveau || filtreMatiere) ? ` · filtrés sur ${[filtreNiveau, filtreMatiere].filter(Boolean).join(" + ")}` : ""}
        </div>
        {currentData.map((d, i) => {
          const label = d.ville || (d.dept ? `Département ${d.dept}` : d.region);
          const mats = d.matieres ? [...d.matieres].join(", ") : "";
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, padding: "6px 10px", background: "#FAFAFA", borderRadius: 8, borderLeft: `3px solid ${getHeatColor(d.count)}` }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: getHeatColor(d.count), width: 22, textAlign: "center" }}>{d.count}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#18181B" }}>📍 {label}</div>
                {mats && <div style={{ fontSize: 9, color: "#71717A" }}>{mats}</div>}
              </div>
            </div>
          );
        })}
        {demandes.length === 0 && <div style={{ fontSize: 12, color: "#A1A1AA", textAlign: "center", padding: 20 }}>Aucun signalement pour le moment</div>}
      </C>
    </div>
  );
}

export default CarteFrance;
