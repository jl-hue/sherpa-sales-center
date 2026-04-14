import { useState, useEffect } from 'react';
import { sb } from '../../lib/supabase';
import { Logo } from '../ui';

function LoginScreen({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  // Au montage : pas d'auto-login
  // Si l'URL contient un hash OAuth (#access_token=...) → on traite le retour OAuth
  // Sinon → on signOut pour forcer une nouvelle connexion à chaque visite
  useEffect(() => {
    let cancelled = false;
    const hasOAuthCallback = window.location.hash.includes("access_token");

    if (hasOAuthCallback) {
      // Retour de Google → on laisse Supabase traiter et on écoute SIGNED_IN
      const { data: listener } = sb.auth.onAuthStateChange((event, session) => {
        if (cancelled) return;
        if (event === "SIGNED_IN" && session) {
          handleSession(session);
          // Nettoie l'URL
          window.history.replaceState(null, "", window.location.pathname);
        }
      });
      setChecking(false);
      return () => { cancelled = true; listener?.subscription?.unsubscribe(); };
    } else {
      // Visite normale → on déconnecte toute session persistée pour forcer un click
      sb.auth.signOut().finally(() => { if (!cancelled) setChecking(false); });
      return () => { cancelled = true; };
    }
  }, []);

  async function handleSession(session) {
    const email = session.user?.email?.toLowerCase();
    if (!email) { setError("Email Google non détecté"); return; }
    // Whitelist check
    const { data: allowed, error: e1 } = await sb
      .from("allowed_users")
      .select("*")
      .eq("email", email)
      .eq("active", true)
      .maybeSingle();

    if (e1) { setError("Erreur Supabase: " + e1.message); return; }
    if (!allowed) {
      setError(`⛔ ${email} n'est pas invité. Contacte ton manager.`);
      await sb.auth.signOut();
      return;
    }

    // Met à jour last_login_at
    await sb.from("allowed_users").update({ last_login_at: new Date().toISOString() }).eq("id", allowed.id);

    // Construit l'objet user de l'app
    const user = {
      id: allowed.id,
      email: allowed.email,
      name: allowed.name || email.split("@")[0],
      avatar: allowed.avatar || email.slice(0, 2).toUpperCase(),
      color: allowed.color || "#16A34A",
      role: allowed.role,
    };
    onLogin(user);
  }

  async function loginGoogle() {
    setError("");
    setLoading(true);
    try {
      const { data, error } = await sb.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) { setError(error.message); setLoading(false); return; }
      // Si Supabase n'a pas redirigé automatiquement, on force
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      setError("Erreur : " + (e.message || String(e)));
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(150deg,#0D1F12 0%,#16A34A 60%,#62E58E 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, position: "relative", overflow: "hidden" }}>
      <svg style={{ position: "absolute", top: 0, left: 0, opacity: .08, pointerEvents: "none" }} width="400" height="280" viewBox="0 0 400 280"><path d="-20,80 Q80,20 180,100 Q280,180 380,60" stroke="white" strokeWidth="60" fill="none" strokeLinecap="round" /></svg>
      <svg style={{ position: "absolute", bottom: 0, right: 0, opacity: .06, pointerEvents: "none" }} width="360" height="260" viewBox="0 0 360 260"><path d="0,200 Q100,100 220,160 Q320,210 380,100" stroke="white" strokeWidth="70" fill="none" strokeLinecap="round" /></svg>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <Logo size={44} white={true} />
        <span style={{ fontSize: 28, fontWeight: 900, color: "#fff", fontFamily: "'Outfit',sans-serif", letterSpacing: "-.02em" }}>LES SHERPAS</span>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
        <span style={{ background: "rgba(255,255,255,.2)", color: "#fff", borderRadius: 99, padding: "4px 14px", fontSize: 12, fontWeight: 700, fontFamily: "'Outfit',sans-serif" }}>🏔️ Sales Center V5</span>
        <span style={{ background: "rgba(255,255,255,.2)", color: "#fff", borderRadius: 99, padding: "4px 14px", fontSize: 12, fontWeight: 700, fontFamily: "'Outfit',sans-serif" }}>Accès sécurisé 🔒</span>
      </div>

      <div style={{ width: "100%", maxWidth: 420, background: "rgba(255,255,255,.97)", borderRadius: 24, padding: 36, boxShadow: "0 24px 80px rgba(0,0,0,.25)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#18181B", fontFamily: "'Outfit',sans-serif", marginBottom: 6 }}>Connexion</div>
          <div style={{ fontSize: 13, color: "#71717A", lineHeight: 1.5 }}>Connecte-toi avec ton compte Google.<br />Seuls les membres invités peuvent accéder.</div>
        </div>

        {checking ? (
          <div style={{ textAlign: "center", padding: "20px 0", color: "#71717A", fontSize: 13 }}>Vérification...</div>
        ) : (
          <button
            onClick={loginGoogle}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 12,
              border: "2px solid #E4E4E7",
              background: "#fff",
              cursor: loading ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              fontSize: 15,
              fontWeight: 700,
              color: "#18181B",
              fontFamily: "'Outfit',sans-serif",
              transition: "all .15s",
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.borderColor = "#16A34A"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#E4E4E7"; }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.6 10.23c0-.68-.07-1.35-.18-2H10v3.8h5.4c-.24 1.25-.94 2.3-2 3v2.5h3.24c1.9-1.75 2.97-4.33 2.97-7.3z" fill="#4285F4"/>
              <path d="M10 20c2.7 0 4.96-.9 6.6-2.42l-3.23-2.5c-.9.6-2.04.96-3.37.96-2.6 0-4.8-1.75-5.58-4.1H1.08v2.58C2.72 17.76 6.08 20 10 20z" fill="#34A853"/>
              <path d="M4.42 11.94c-.2-.6-.3-1.24-.3-1.94s.1-1.34.3-1.94V5.48H1.08A9.98 9.98 0 0 0 0 10c0 1.62.4 3.15 1.08 4.52l3.34-2.58z" fill="#FBBC05"/>
              <path d="M10 3.96c1.47 0 2.78.5 3.82 1.5l2.86-2.87C14.96.99 12.7 0 10 0 6.08 0 2.72 2.24 1.08 5.48l3.34 2.58C5.2 5.7 7.4 3.96 10 3.96z" fill="#EA4335"/>
            </svg>
            {loading ? "Redirection..." : "Se connecter avec Google"}
          </button>
        )}

        {error && (
          <div style={{ marginTop: 14, padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 10, fontSize: 12, color: "#B91C1C", lineHeight: 1.5 }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: 20, padding: "10px 14px", background: "#F4F4F5", borderRadius: 10, fontSize: 10, color: "#71717A", lineHeight: 1.5, textAlign: "center" }}>
          🔒 Accès réservé à l'équipe Sherpas · Toute connexion est journalisée
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
