import React, { useState, useEffect } from 'react';
import { sb, fetchTeam } from '../../lib/supabase';
import { C, Btn, ST } from '../ui';

const TEMPLATES = [
  {
    id: 'welcome',
    label: '👋 Bienvenue (nouveau membre)',
    subject: 'Bienvenue dans Sherpas Sales Center 🎉',
    body: `Salut {{prenom}} !

Bienvenue dans l'équipe Sherpas. Tu peux te connecter à l'app interne ici :
https://sherpa-sales-center.vercel.app

Ton accès est déjà configuré, connecte-toi simplement avec ton adresse Gmail.

Si tu as la moindre question, n'hésite pas.

À très vite 🙌
L'équipe Les Sherpas`,
  },
  {
    id: 'update',
    label: '🚀 Nouvelle mise à jour',
    subject: 'Nouveautés sur Sherpas Sales Center',
    body: `Hello l'équipe !

Une nouvelle mise à jour vient d'être déployée sur l'app :

✨ [Décris les nouveautés ici]

Connecte-toi pour découvrir : https://sherpa-sales-center.vercel.app

Comme toujours, vos retours sont les bienvenus !

Bonne journée 💪`,
  },
  {
    id: 'announce',
    label: '📢 Annonce générale',
    subject: '[Annonce] ',
    body: `Hello l'équipe,

[Ton message ici]

Belle journée,
Julien`,
  },
  {
    id: 'blank',
    label: '✏️ Vierge',
    subject: '',
    body: '',
  },
];

function Notifications({ user }) {
  const [team, setTeam] = useState([]);
  const [recipients, setRecipients] = useState([]); // emails sélectionnés
  const [selectMode, setSelectMode] = useState('all'); // all | sales | managers | custom
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null); // { ok, msg }
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => { fetchTeam().then(setTeam); }, []);
  useEffect(() => { loadHistory(); }, []);

  async function loadHistory() {
    try {
      const { data } = await sb.from('email_logs').select('*').order('sent_at', { ascending: false }).limit(50);
      if (data) setHistory(data);
    } catch {}
  }

  // Recalcule destinataires selon mode
  useEffect(() => {
    if (selectMode === 'all') setRecipients(team.filter(t => t.active !== false).map(t => t.email));
    else if (selectMode === 'sales') setRecipients(team.filter(t => t.role === 'sales' && t.active !== false).map(t => t.email));
    else if (selectMode === 'managers') setRecipients(team.filter(t => ['manager', 'admin'].includes(t.role) && t.active !== false).map(t => t.email));
    // custom : on laisse l'état inchangé
  }, [selectMode, team]);

  function applyTemplate(tpl) {
    setSubject(tpl.subject);
    setBody(tpl.body);
  }

  function toggleRecipient(email) {
    setSelectMode('custom');
    setRecipients(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]);
  }

  function personalize(text, member) {
    return text
      .replace(/\{\{prenom\}\}/g, (member?.name || member?.email || '').split(' ')[0])
      .replace(/\{\{nom\}\}/g, member?.name || '')
      .replace(/\{\{email\}\}/g, member?.email || '');
  }

  async function sendEmail() {
    if (!recipients.length) { setFeedback({ ok: false, msg: 'Aucun destinataire sélectionné' }); return; }
    if (!subject.trim()) { setFeedback({ ok: false, msg: 'Le sujet est requis' }); return; }
    if (!body.trim()) { setFeedback({ ok: false, msg: 'Le message est requis' }); return; }
    if (!confirm(`Envoyer ce mail à ${recipients.length} destinataire${recipients.length > 1 ? 's' : ''} ?`)) return;

    setSending(true);
    setFeedback(null);

    try {
      const { data: sess } = await sb.auth.getSession();
      const token = sess?.session?.access_token;
      if (!token) throw new Error('Non connecté');

      // Personnalisation : on envoie un email par destinataire pour pouvoir injecter {{prenom}} etc.
      const containsTokens = /\{\{(prenom|nom|email)\}\}/.test(subject + body);
      let okCount = 0, failCount = 0;
      const errors = [];

      if (containsTokens) {
        // Un envoi par destinataire (séquentiel pour éviter rate-limit)
        for (const email of recipients) {
          const member = team.find(t => t.email === email);
          const r = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
              to: email,
              subject: personalize(subject, member),
              text: personalize(body, member),
              replyTo: user?.email,
            }),
          });
          const j = await r.json();
          if (r.ok) okCount++;
          else { failCount++; errors.push(`${email}: ${j?.error || 'erreur'}`); }
        }
      } else {
        // Un seul envoi groupé
        const r = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ to: recipients, subject, text: body, replyTo: user?.email }),
        });
        const j = await r.json();
        if (r.ok) okCount = recipients.length;
        else { failCount = recipients.length; errors.push(j?.error || 'erreur'); }
      }

      if (failCount === 0) {
        setFeedback({ ok: true, msg: `✅ Email envoyé à ${okCount} destinataire${okCount > 1 ? 's' : ''}` });
        setSubject(''); setBody('');
        loadHistory();
      } else {
        setFeedback({ ok: false, msg: `⚠️ ${okCount} OK / ${failCount} échec — ${errors.slice(0, 2).join(' ; ')}` });
        loadHistory();
      }
    } catch (e) {
      setFeedback({ ok: false, msg: `❌ ${e.message}` });
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <ST emoji="📧" sub="Envoie des emails à tout ou partie de l'équipe (annonces, mises à jour, accueil…).">Notifications par email</ST>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button onClick={() => setShowHistory(!showHistory)} style={{ fontSize: 11, padding: '6px 12px', borderRadius: 8, border: '1px solid #E4E4E7', background: '#fff', cursor: 'pointer', color: '#71717A', fontWeight: 700 }}>
          {showHistory ? '✏️ Composer' : `📜 Historique (${history.length})`}
        </button>
      </div>

      {showHistory ? (
        <C>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10, color: '#18181B', fontFamily: "'Outfit',sans-serif" }}>📜 Historique des envois</div>
          {history.length === 0 ? (
            <div style={{ fontSize: 12, color: '#A1A1AA', textAlign: 'center', padding: 20 }}>Aucun email envoyé pour le moment.</div>
          ) : (
            history.map(h => (
              <div key={h.id} style={{ padding: '10px 12px', background: '#FAFAFA', borderRadius: 8, marginBottom: 6, borderLeft: '3px solid #7C3AED' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#18181B' }}>{h.subject}</span>
                  <span style={{ fontSize: 10, color: '#A1A1AA' }}>{new Date(h.sent_at).toLocaleString('fr-FR')}</span>
                </div>
                <div style={{ fontSize: 10, color: '#71717A' }}>
                  Par <b>{h.sent_by}</b> → {Array.isArray(h.recipients) ? h.recipients.length : 0} destinataire{(Array.isArray(h.recipients) ? h.recipients.length : 0) > 1 ? 's' : ''}
                  {' '}({Array.isArray(h.recipients) ? h.recipients.slice(0, 3).join(', ') + (h.recipients.length > 3 ? '…' : '') : ''})
                </div>
              </div>
            ))
          )}
        </C>
      ) : (
        <>
          {/* Templates */}
          <C style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#71717A', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>📋 Templates</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => applyTemplate(t)} style={{ fontSize: 11, padding: '6px 12px', borderRadius: 8, border: '1px solid #DDD6FE', background: '#F5F3FF', cursor: 'pointer', color: '#7C3AED', fontWeight: 700 }}>
                  {t.label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 10, color: '#A1A1AA', marginTop: 8 }}>
              Variables : <code>{'{{prenom}}'}</code> · <code>{'{{nom}}'}</code> · <code>{'{{email}}'}</code> (envoi personnalisé un par un si présentes)
            </div>
          </C>

          {/* Destinataires */}
          <C style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#71717A', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>👥 Destinataires ({recipients.length})</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'Toute l\'équipe' },
                { id: 'sales', label: '📞 Sales' },
                { id: 'managers', label: '👔 Managers + 👑' },
                { id: 'custom', label: '🎯 Sélection' },
              ].map(opt => (
                <button key={opt.id} onClick={() => setSelectMode(opt.id)} style={{
                  fontSize: 11, padding: '6px 12px', borderRadius: 8,
                  border: `1px solid ${selectMode === opt.id ? '#7C3AED' : '#E4E4E7'}`,
                  background: selectMode === opt.id ? '#F5F3FF' : '#fff',
                  cursor: 'pointer', color: selectMode === opt.id ? '#7C3AED' : '#71717A', fontWeight: 700,
                }}>{opt.label}</button>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {team.map(m => {
                const sel = recipients.includes(m.email);
                return (
                  <button key={m.email} onClick={() => toggleRecipient(m.email)} style={{
                    fontSize: 10, padding: '5px 10px', borderRadius: 99,
                    border: `1px solid ${sel ? (m.color || '#7C3AED') : '#E4E4E7'}`,
                    background: sel ? (m.color || '#7C3AED') + '22' : '#FAFAFA',
                    color: sel ? '#18181B' : '#A1A1AA',
                    cursor: 'pointer', fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <span>{sel ? '✓' : '+'}</span>
                    {m.name || m.email.split('@')[0]}
                  </button>
                );
              })}
            </div>
          </C>

          {/* Composition */}
          <C style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#71717A', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>✏️ Message</div>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Sujet du mail"
              style={{ width: '100%', fontSize: 13, border: '1px solid #E4E4E7', borderRadius: 8, padding: '10px 12px', boxSizing: 'border-box', marginBottom: 8, fontWeight: 700, fontFamily: "'Inter',sans-serif" }} />
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Contenu du mail (texte simple)..."
              rows={12} style={{ width: '100%', fontSize: 12, border: '1px solid #E4E4E7', borderRadius: 8, padding: '10px 12px', boxSizing: 'border-box', resize: 'vertical', fontFamily: "'Inter',sans-serif", lineHeight: 1.5 }} />
          </C>

          {/* Aperçu */}
          {showPreview && recipients.length > 0 && (
            <C style={{ marginBottom: 12, background: '#FFFBEB', border: '1px solid #FDE68A' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#92400E', marginBottom: 8 }}>👁️ Aperçu (1er destinataire)</div>
              {(() => {
                const m = team.find(t => t.email === recipients[0]);
                return (
                  <>
                    <div style={{ fontSize: 11, color: '#A16207', marginBottom: 4 }}><b>À :</b> {recipients[0]}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#18181B', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #FDE68A' }}>{personalize(subject, m)}</div>
                    <pre style={{ margin: 0, fontSize: 12, color: '#3F3F46', lineHeight: 1.5, whiteSpace: 'pre-wrap', fontFamily: "'Inter',sans-serif" }}>{personalize(body, m)}</pre>
                  </>
                );
              })()}
            </C>
          )}

          {/* Feedback */}
          {feedback && (
            <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 10, background: feedback.ok ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${feedback.ok ? '#86EFAC' : '#FCA5A5'}`, fontSize: 12, fontWeight: 600, color: feedback.ok ? '#15803D' : '#991B1B' }}>
              {feedback.msg}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn onClick={() => setShowPreview(!showPreview)} outline color="#7C3AED" style={{ padding: '8px 16px', fontSize: 12 }}>
              {showPreview ? '🙈 Masquer aperçu' : '👁️ Aperçu'}
            </Btn>
            <Btn onClick={sendEmail} disabled={sending || !recipients.length || !subject.trim() || !body.trim()} color="#7C3AED" style={{ padding: '8px 20px', fontSize: 12 }}>
              {sending ? '⏳ Envoi...' : `📤 Envoyer à ${recipients.length} destinataire${recipients.length > 1 ? 's' : ''}`}
            </Btn>
          </div>
        </>
      )}
    </div>
  );
}

export default Notifications;
