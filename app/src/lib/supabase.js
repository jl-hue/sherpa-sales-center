import { createClient } from '@supabase/supabase-js';
import { USERS } from '../constants/brand';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// Fallback local quand allowed_users est vide ou inaccessible
const LOCAL_TEAM = USERS.map(u => ({
  email: u.email, name: u.name, avatar: u.avatar, color: u.color, role: u.role, active: true,
}));

export async function fetchTeam() {
  try {
    const { data, error } = await sb.from("allowed_users").select("email, name, avatar, color, role, active").eq("active", true);
    if (!error && data && data.length > 0) return data;
  } catch {}
  return LOCAL_TEAM;
}

export function rowToFeedback(r){return{id:r.id,date:r.date,auteur:r.auteur,anonyme:r.anonyme,clientTypes:r.client_types||[],objections:r.objections||[],bien:r.bien||[],bloque:r.bloque||[],confiance:r.confiance,suggestions:r.suggestions||""};}
export function rowToMatching(r){return{id:r.id,date:r.date,auteur:r.auteur,idealTyp:r.ideal_typ,chosenTyp:r.chosen_typ,followed:r.followed,niveau:r.niveau,psycho:r.psycho};}
export function rowToStock(r){return{typ:r.typ,dispo:r.dispo,nb:r.nb,note:r.note||""};}
export function rowToSuggestion(r){return{id:r.id,date:r.date,auteur:r.auteur,type:r.type,contenu:r.contenu,statut:r.statut};}
export function rowToDemande(r){return{id:r.id,date:r.date,auteur:r.auteur,cp:r.cp,ville:r.ville,matieres:r.matieres||[],niveau:r.niveau,typo:r.typo||[]};}
export function rowToRentree(r){return{id:r.id,date:r.date,auteur:r.auteur,famille:r.famille,classe:r.classe,matieres:r.matieres||[],rappel:r.rappel,notes:r.notes||""};}
