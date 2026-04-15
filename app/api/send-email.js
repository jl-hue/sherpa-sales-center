// Vercel serverless function: POST /api/send-email
// Body: { to: string|string[], subject: string, html?: string, text?: string }
// Headers: Authorization: Bearer <supabase_access_token>
// Sécurité: vérifie le token Supabase et que l'utilisateur est admin (ou manager)

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // CORS (utile en local, redondant en prod)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { to, subject, html, text, replyTo } = req.body || {};
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ error: 'Missing fields: to, subject, html|text' });
    }

    // 1. Vérifier le token Supabase
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing Authorization Bearer token' });

    const sb = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_KEY,
      { auth: { persistSession: false } }
    );
    const { data: userData, error: userErr } = await sb.auth.getUser(token);
    if (userErr || !userData?.user?.email) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const callerEmail = userData.user.email;

    // 2. Vérifier le rôle dans allowed_users (admin ou manager)
    const { data: allowed, error: rowErr } = await sb
      .from('allowed_users')
      .select('email, role, active')
      .eq('email', callerEmail)
      .maybeSingle();
    if (rowErr || !allowed?.active || !['admin', 'manager'].includes(allowed.role)) {
      return res.status(403).json({ error: 'Forbidden — admin/manager required' });
    }

    // 3. Envoyer via Resend
    const RESEND_KEY = process.env.RESEND_API_KEY;
    const FROM = process.env.EMAIL_FROM || 'Les Sherpas <onboarding@resend.dev>';
    if (!RESEND_KEY) return res.status(500).json({ error: 'RESEND_API_KEY not configured' });

    const recipients = Array.isArray(to) ? to : [to];
    const payload = {
      from: FROM,
      to: recipients,
      subject,
      ...(html ? { html } : {}),
      ...(text ? { text } : {}),
      ...(replyTo ? { reply_to: replyTo } : {}),
    };

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const result = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: result?.message || 'Resend error', details: result });

    // 4. Logguer l'envoi dans Supabase (pour historique)
    try {
      await sb.from('email_logs').insert({
        sent_by: callerEmail,
        recipients: recipients,
        subject,
        body: html || text || '',
        resend_id: result?.id || null,
      });
    } catch {}

    return res.status(200).json({ ok: true, id: result?.id });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Internal error' });
  }
}
