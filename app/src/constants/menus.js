// Menus de la sidebar, partagés entre Sidebar et Reglages (pour la fonction de réorganisation)
export const MENUS = {
  // Item commun épinglé en haut — visible dans tous les sous-espaces Sales
  salesPinned: [
    ["dash", "📊", "Tableau de bord"],
  ],
  sales: [
    ["planning", "📋", "Mon planning ✦"],
    ["rdv", "📅", "Mes rendez-vous"],
    ["lanterne", "🔦", "Lanterne V5 ✦"],
    ["ressources", "📚", "Ressources"],
  ],
  salesFormation: [
    ["formation", "🎓", "Formation"],
  ],
  salesAutres: [
    ["moi", "📊", "Mon espace"],
    ["feedback", "💬", "Mon feedback"],
    ["boutique", "🛍️", "Boutique"],
    ["trophees", "🏆", "Salle des trophées"],
  ],
  salesCommunaute: [
    ["messagerie", "💬", "Messages"],
    ["annonces", "📢", "Annonces"],
    ["evenements", "🎉", "Événements"],
    ["trombinoscope", "📸", "Trombinoscope"],
  ],
  // Item commun épinglé en haut — visible dans tous les sous-espaces Manager
  managerPinned: [
    ["m-vue", "🧭", "Vue d'ensemble"],
  ],
  manager: [
    ["m-equipe", "👥", "Gestion équipe ✦"],
    ["m-edt", "📅", "Emploi du temps ✦"],
    ["m-plan", "🪑", "Plan de table ✦"],
    ["m-objectifs", "🎯", "Objectifs & Défis ✦"],
    ["m-boutique", "🛍️", "Boutique (Sherpoints)"],
  ],
  managerFormation: [
    ["f-scripts", "📞", "Éditeur Scripts"],
    ["f-formations", "🎓", "Éditeur Formations"],
    ["f-suggestions", "💡", "Suggestions équipe"],
  ],
  managerStats: [
    ["m-stats", "📈", "Stats équipe"],
    ["m-carte", "🗺️", "Carte demandes"],
    ["m-feedback", "💬", "Feedbacks équipe"],
  ],
};
