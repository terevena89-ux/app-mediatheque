// =========================================================
// Petits outils communs à app.js, sources.js et frise.js
// (une seule copie au lieu de trois — audit C3)
// =========================================================

// Texte sans accents, en minuscules (pour comparer « Élan » et « elan »)
export const simplifier = t => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
// Texte sûr à glisser dans du HTML
export const echapper = t => String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// Titre sans accents ni ponctuation (« Spider-Man: Homecoming » = « spider man homecoming »)
export const titreNu = t => simplifier(t).replace(/[^a-z0-9]+/g, " ").trim();
