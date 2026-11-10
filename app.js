// =========================================================
// Médiathèque — le « cerveau » de l'appli.
// Plan du fichier :
//   1. Réglages de base, mots, petits outils
//   2. Les données (une fiche = un jeu, un film, une série ou un livre)
//   3. Stockage (Firebase, ou mode démo local)
//   4. Navigation (adresses #…, téléphone / PC)
//   5. Affichage : barre de gauche, en-tête, outils, listes, tableau, frise
//   6. La fiche (panneau à droite sur PC, fenêtre du bas sur téléphone)
//   7. Fenêtres : Ajouter, Modifier, Réglages, Thème, Supports
//   8. Gestes et animations (glisser entre les pages, menu du titre…)
//   9. Clics, saisie, clavier
//  10. Export / import Excel, données de test
//  11. Démarrage
// =========================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, collection, onSnapshot, setDoc, writeBatch, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";
import { chargerExcelJS, ajouterFeuille, telechargerClasseur, lireClasseur, lireFeuille } from "./excel-style.js";
import { chercherEnLigne, chercherAffiches, voirAussi, copierImage, reduireFichier } from "./sources.js";
import { dessinerFrise } from "./frise.js";
import { genererDonneesTest } from "./test.js";

// ---------- 1. Réglages de base, mots, petits outils ----------

const VERSION = "v0.3.0";
const NOM_APPLI = "app-mediatheque";   // nom du dossier dans Firestore et des fichiers Excel

const TYPES = [
  { id: "jeu", nom: "Jeux", un: "Jeu" },
  { id: "film", nom: "Films", un: "Film" },
  { id: "serie", nom: "Séries", un: "Série" },
  { id: "livre", nom: "Livres", un: "Livre" }
];
const typeDe = id => TYPES.find(t => t.id === id) || TYPES[1];

// Les mots changent un peu selon le type : « À voir » / « À jouer » / « À lire »…
const MOTS = {
  film:  { avoir: "À voir",   fini: "Vu",   vus: "Vus",   passage: "Vu",   revoir: "À revoir" },
  serie: { avoir: "À voir",   fini: "Vue",  vus: "Vues",  passage: "Vu",   revoir: "À revoir" },
  jeu:   { avoir: "À jouer",  fini: "Fini", vus: "Joués", passage: "Joué", revoir: "À rejouer" },
  livre: { avoir: "À lire",   fini: "Lu",   vus: "Lus",   passage: "Lu",   revoir: "À relire" }
};
const STATUTS = ["avoir", "encours", "fini", "reserve", "abandon"];
function nomStatut(s, type) {
  const m = MOTS[type] || MOTS.film;
  return { avoir: m.avoir, encours: "En cours", fini: m.fini, reserve: "En réserve", abandon: "Abandonné" }[s] || "";
}
// Les 3 pages de chaque type : À voir (+ en réserve en bas), En cours, Vus (+ abandonnés en bas)
const PAGES = [
  { id: "avoir", statuts: ["avoir"], bas: "reserve", icone: "savoir" },
  { id: "encours", statuts: ["encours"], bas: null, icone: "sencours" },
  { id: "vus", statuts: ["fini"], bas: "abandon", icone: "ok" }
];
const nomPage = (i, type) => i === 0 ? MOTS[type].avoir : i === 1 ? "En cours" : MOTS[type].vus;
const couleurPage = i => `var(--st-${["avoir", "encours", "fini"][i]})`;
const pageDuStatut = s => s === "encours" ? 1 : (s === "fini" || s === "abandon") ? 2 : 0;

const TRIS = [
  { id: "ajout", nom: "Ajout récent" }, { id: "titre", nom: "Titre" }, { id: "annee", nom: "Année" },
  { id: "note", nom: "Note" }, { id: "vu", nom: "Dernier vu" }
];
const VUES = [
  { id: "liste", nom: "Liste", icone: "vliste" }, { id: "compact", nom: "Compacte", icone: "vcompact" },
  { id: "mosa", nom: "Mosaïque", icone: "vmosa" }, { id: "tab", nom: "Tableau", icone: "vtab" }
];
const FRISES = [{ id: "ligne", nom: "Ligne" }, { id: "horiz", nom: "Horizontale" }, { id: "mur", nom: "Mur" }];
const ACCENTS = [
  { id: "nuit", nom: "Bleu nuit" }, { id: "sapin", nom: "Sapin" }, { id: "bordeaux", nom: "Bordeaux" },
  { id: "petrole", nom: "Pétrole" }, { id: "indigo", nom: "Indigo" }
];
const SUPPORTS_DEPART = ["Cinéma", "Netflix", "Canal+", "Prime Video", "Disney+", "Apple TV+", "HBO Max", "MUBI",
  "Blu-ray", "PC", "Switch", "PS5", "Steam Deck", "Papier", "Kindle", "Bibliothèque"];

// Réglages de ressenti, gardés sur CET appareil seulement (pas synchronisés)
const CLE_REGLAGES = "mediatheque-reglages";
let reglages = {
  theme: "auto", accent: null, police: "plex", onglets: "t2", animations: "completes", vibrations: "oui",
  fichePC: "bandeau", frise: "horiz", vues: {}, tris: {}, type: "film", page: 0,
  // PC : taille du texte et des jaquettes (curseurs), largeurs réglées en glissant les bords
  texte: 1.1, jaquettes: 1, largCote: null, largPanneau: null, colonnes: {}
};
try { Object.assign(reglages, JSON.parse(localStorage.getItem(CLE_REGLAGES)) || {}); } catch (e) { /* valeurs par défaut */ }
function changerReglage(nom, valeur) {
  reglages[nom] = valeur;
  try { localStorage.setItem(CLE_REGLAGES, JSON.stringify(reglages)); } catch (e) { /* stockage bloqué */ }
}

const $ = id => document.getElementById(id);
const ic = (nom, classe = "") => `<svg class="ic ${classe}"><use href="#i-${nom}"></use></svg>`;
const nouvelId = () => Math.random().toString(36).slice(2, 10);
const simplifier = t => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const echapper = t => String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const lienValide = u => /^https?:\/\/\S+$/i.test(String(u || "").trim()) ? String(u).trim() : "";
const etoiles = n => n ? `<span class="etoiles">${"★".repeat(n)}<i>${"★".repeat(5 - n)}</i></span>` : "";
const deuxChiffres = n => String(n).padStart(2, "0");
const moisActuel = () => { const d = new Date(); return `${d.getFullYear()}-${deuxChiffres(d.getMonth() + 1)}`; };
const jourActuel = () => { const d = new Date(); return `${moisActuel()}-${deuxChiffres(d.getDate())}`; };

// Mode « moins d'animations » : réglage de l'appli OU réglage du téléphone
const animOK = () => reglages.animations !== "simples" && !matchMedia("(prefers-reduced-motion: reduce)").matches;
function animer(el, images, options) {
  if (!el || !animOK() || !el.animate) return null;
  try { return el.animate(images, options); } catch (e) { return null; }
}
const DOUX = "cubic-bezier(.22,.9,.25,1)", RESSORT = "cubic-bezier(.3,1.5,.5,1)";
// Petite vibration (téléphone Android) quand on change de page ou de catégorie
function vibrer() {
  if (reglages.vibrations === "non" || !estTel()) return;
  try { navigator.vibrate && navigator.vibrate(8); } catch (e) { /* pas de vibreur */ }
}

// ---------- Dates souples ----------
// Une date de passage peut être plus ou moins précise :
//   "2024-03-12" (jour), "2024-03" (mois), "2024-ete" (saison), "2024" (année)
const NOMS_MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const MOIS_COURTS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const SAISONS = { hiver: { nom: "hiver", mois: 0 }, printemps: { nom: "printemps", mois: 3 }, ete: { nom: "été", mois: 6 }, automne: { nom: "automne", mois: 9 } };
function lireDate(s) {
  let m;
  if ((m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s))) return { precision: "jour", an: +m[1], mois: (+m[1]) * 12 + (+m[2] - 1), jour: +m[3] };
  if ((m = /^(\d{4})-(\d{2})$/.exec(s))) return { precision: "mois", an: +m[1], mois: (+m[1]) * 12 + (+m[2] - 1) };
  if ((m = /^(\d{4})-(hiver|printemps|ete|automne)$/.exec(s))) return { precision: "saison", an: +m[1], mois: (+m[1]) * 12 + SAISONS[m[2]].mois, saison: SAISONS[m[2]].nom };
  if ((m = /^(\d{4})$/.exec(s))) return { precision: "annee", an: +m[1], mois: (+m[1]) * 12 + 6 };
  return null;
}
const dateValide = s => !!lireDate(String(s || "").trim());
// Valeur pour trier les dates (plus grand = plus récent)
const valeurDate = s => { const d = lireDate(s); return d ? d.mois + (d.jour ? d.jour / 32 : .5) : -1; };
// « 12 mars 2024 », « mars 2024 », « été 2024 », « 2024 »
function texteDate(s, court = false) {
  const d = lireDate(s);
  if (!d) return "";
  const mois = (court ? MOIS_COURTS : NOMS_MOIS)[d.mois % 12];
  if (d.precision === "jour") return `${d.jour} ${mois} ${d.an}`;
  if (d.precision === "mois") return `${mois} ${d.an}`;
  if (d.precision === "saison") return `${d.saison} ${d.an}`;
  return `${d.an}`;
}
// L'inverse (pour l'import Excel) : « mars 2024 » → "2024-03"
function dateDuTexte(t) {
  const s = simplifier(t).replace(/\./g, "");
  if (dateValide(s)) return s;
  let m;
  if ((m = /^(\d{1,2}) ([a-z]+) (\d{4})$/.exec(s))) { const i = NOMS_MOIS.findIndex(x => simplifier(x).startsWith(m[2].slice(0, 3))); if (i >= 0) return `${m[3]}-${deuxChiffres(i + 1)}-${deuxChiffres(+m[1])}`; }
  if ((m = /^([a-z]+) (\d{4})$/.exec(s))) {
    const saison = { hiver: "hiver", printemps: "printemps", ete: "ete", automne: "automne" }[m[1]];
    if (saison) return `${m[2]}-${saison}`;
    const i = NOMS_MOIS.findIndex(x => simplifier(x).startsWith(m[1].slice(0, 3)));
    if (i >= 0) return `${m[2]}-${deuxChiffres(i + 1)}`;
  }
  return "";
}

// ---------- 2. Les données ----------
// Une fiche = { id, type, titre, annee, createur, genres[], image, miniature, statut, revoir, note, coeur,
//               passages[], debut, support, tags[], avis, saisons { actif, total, vues[] }, test, cree }
//   image     : adresse de l'affiche sur le web
//   miniature : petite copie de l'affiche (~10 Ko) gardée dans la fiche
//   passages  : dates où je l'ai vu / joué / lu (plusieurs si revu)
//   debut     : quand je l'ai commencé (posé tout seul en passant « En cours »)
let medias = new Map();
let donnees = { supports: [...SUPPORTS_DEPART], idees: "" };

function normaliser(id, d) {
  const liste = v => Array.isArray(v) ? [...new Set(v.map(x => String(x || "").trim()).filter(Boolean))] : [];
  const s = d.saisons || {};
  return {
    id,
    type: TYPES.some(t => t.id === d.type) ? d.type : "film",
    titre: String(d.titre || "").trim().slice(0, 200),
    annee: Number.isFinite(+d.annee) && +d.annee > 0 ? Math.round(+d.annee) : null,
    createur: String(d.createur || "").trim(),
    genres: liste(d.genres),
    image: lienValide(d.image),
    miniature: typeof d.miniature === "string" && d.miniature.startsWith("data:image/") ? d.miniature : "",
    statut: STATUTS.includes(d.statut) ? d.statut : "avoir",
    revoir: !!d.revoir,
    note: Math.max(0, Math.min(5, Math.round(+d.note || 0))),
    coeur: !!d.coeur,
    passages: liste(d.passages).filter(dateValide).sort((a, b) => valeurDate(a) - valeurDate(b)),
    debut: dateValide(d.debut) ? d.debut : "",
    support: String(d.support || "").trim(),
    tags: liste(d.tags),
    avis: String(d.avis || ""),
    saisons: { actif: !!s.actif, total: Math.max(0, Math.round(+s.total || 0)), vues: (Array.isArray(s.vues) ? s.vues : []).map(Number).filter(n => n > 0) },
    test: !!d.test,
    cree: typeof d.cree === "number" ? d.cree : 0
  };
}
function normaliserDonnees(d) {
  return {
    supports: Array.isArray(d.supports) ? d.supports.map(String).filter(Boolean) : [...SUPPORTS_DEPART],
    idees: typeof d.idees === "string" ? d.idees : ""   // Réglages › Notes
  };
}
const dernierPassage = m => m.passages[m.passages.length - 1] || "";

// Couleur de remplacement quand il n'y a pas d'affiche (calculée d'après le titre)
function teinte(t) { let h = 0; for (const c of String(t)) h = (h * 31 + c.charCodeAt(0)) % 360; return h; }
const degrade = t => { const h = teinte(t); return `linear-gradient(170deg,hsl(${h} 30% 56%),hsl(${(h + 30) % 360} 28% 36%))`; };
const initiale = t => (String(t).replace(/^(le |la |les |l'|the )/i, "").match(/[\p{L}\p{N}]/u) || ["?"])[0].toUpperCase();
// Affiche d'une fiche (copie gardée, sinon adresse web, sinon couleur + initiale)
function vignette(m, classe = "") {
  const src = m.miniature || m.image;
  return `<span class="vg ${classe}" style="background:${degrade(m.titre)}"><b>${echapper(initiale(m.titre))}</b>${src ? `<img src="${echapper(src)}" alt="" loading="lazy" decoding="async" onerror="this.remove()">` : ""}</span>`;
}

// ---------- 3. Stockage ----------
// Rangement dans Firestore :
//   users/{mon uid}/app-mediatheque/donnees               -> { supports, idees }
//   users/{mon uid}/app-mediatheque/donnees/medias/{id}   -> une fiche par document
// Hors ligne, Firestore garde les modifications et les envoie au retour du réseau.
// Si deux appareils modifient la même fiche : la dernière modification gagne.
const MODE_DEMO = new URLSearchParams(location.search).has("demo");
let db = null, auth = null, uid = null;
let chargeMedias = false, chargeDonnees = false;
const refDonnees = () => doc(db, "users", uid, NOM_APPLI, "donnees");
const refMedia = id => doc(db, "users", uid, NOM_APPLI, "donnees", "medias", id);
const pret = () => chargeMedias && chargeDonnees;

function erreurEcriture(err) { console.error(err); afficherToast("Échec de l'enregistrement"); }
const pourEnvoi = m => { const { id, ...reste } = m; return { ...reste, maj: serverTimestamp() }; };

function ecrireMedias(liste) {
  liste.forEach(m => medias.set(m.id, m));
  if (MODE_DEMO) { sauverDemo(); return; }
  for (let i = 0; i < liste.length; i += 300) {
    const lot = writeBatch(db);
    liste.slice(i, i + 300).forEach(m => lot.set(refMedia(m.id), pourEnvoi(m)));
    lot.commit().catch(erreurEcriture);
  }
}
const ecrireMedia = m => ecrireMedias([m]);
function effacerMedias(ids) {
  ids.forEach(id => medias.delete(id));
  if (MODE_DEMO) { sauverDemo(); return; }
  for (let i = 0; i < ids.length; i += 300) {
    const lot = writeBatch(db);
    ids.slice(i, i + 300).forEach(id => lot.delete(refMedia(id)));
    lot.commit().catch(erreurEcriture);
  }
}
function sauverDonnees() {
  if (MODE_DEMO) { sauverDemo(); return; }
  setDoc(refDonnees(), { ...donnees, maj: serverTimestamp() }).catch(erreurEcriture);
}
function sauverDemo() {
  try { localStorage.setItem("mediatheque-demo", JSON.stringify({ donnees, medias: [...medias.values()] })); }
  catch (e) { afficherToast("Mémoire du navigateur pleine"); }
}
function demarrerDemo() {
  try {
    const d = JSON.parse(localStorage.getItem("mediatheque-demo")) || {};
    donnees = normaliserDonnees(d.donnees || {});
    medias = new Map((d.medias || []).map(m => [m.id, normaliser(m.id, m)]));
  } catch (e) { /* on part de zéro */ }
  infoCompte = "Mode démo : données gardées sur cet appareil seulement.";
  chargeMedias = chargeDonnees = true;
  $("appli").hidden = false;
  router();
}
let infoCompte = "";
function demarrerFirebase() {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = initializeFirestore(app, {
    ignoreUndefinedProperties: true,
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
  });
  onAuthStateChanged(auth, user => {
    if (!user) { $("ecran-connexion").hidden = false; $("appli").hidden = true; return; }
    uid = user.uid;
    infoCompte = `Connecté : ${user.displayName || user.email}`;
    $("ecran-connexion").hidden = true; $("appli").hidden = false;

    onSnapshot(refDonnees(), { includeMetadataChanges: true }, snap => {
      metaDonnees = snap.metadata; majSynchro();
      if (!snap.exists()) {
        // Première utilisation : on crée les réglages de départ (seulement si la réponse
        // vient du serveur, pour ne jamais écraser mes données en étant hors ligne)
        if (snap.metadata.fromCache) return;
        donnees = normaliserDonnees({});
        sauverDonnees();
      } else {
        donnees = normaliserDonnees(snap.data());
        NotesIdees.maj(donnees.idees);
      }
      chargeDonnees = true;
      rafraichir();
    });
    onSnapshot(collection(db, "users", uid, NOM_APPLI, "donnees", "medias"), { includeMetadataChanges: true }, snap => {
      metaMedias = snap.metadata; majSynchro();
      if (snap.empty && snap.metadata.fromCache && !chargeMedias) return;
      medias = new Map(snap.docs.map(d => [d.id, normaliser(d.id, d.data())]));
      chargeMedias = true;
      rafraichir();
    });
  });
}
async function seConnecter() {
  const fournisseur = new GoogleAuthProvider();
  $("connexion-erreur").hidden = true;
  try { await signInWithPopup(auth, fournisseur); }
  catch (err) {
    if (err.code === "auth/popup-blocked" || err.code === "auth/operation-not-supported-in-this-environment") signInWithRedirect(auth, fournisseur);
    else if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
      $("connexion-erreur").textContent = "Connexion impossible : " + err.message;
      $("connexion-erreur").hidden = false;
    }
  }
}
// Indicateur de synchro (dans Réglages) : synchronisé / en attente / hors ligne
let metaDonnees = null, metaMedias = null;
function etatSynchro() {
  if (MODE_DEMO) return { c: "off", i: "nuage-off", t: "Mode démo : pas de synchro" };
  if (!navigator.onLine) return { c: "off", i: "nuage-off", t: "Hors ligne" };
  if (metaDonnees?.hasPendingWrites || metaMedias?.hasPendingWrites) return { c: "attente", i: "nuage-att", t: "En attente d'envoi" };
  return { c: "ok", i: "nuage-ok", t: "Synchronisé" };
}
function majSynchro() {
  const s = etatSynchro();
  document.querySelectorAll(".synchro").forEach(el => { el.className = "synchro " + s.c; el.innerHTML = ic(s.i) + `<span>${s.t}</span>`; });
}
addEventListener("online", majSynchro);
addEventListener("offline", majSynchro);

// ---------- 4. Navigation ----------
// Téléphone ou PC : la mise en page change avec la largeur de l'écran.
const largePC = matchMedia("(min-width: 900px)");
const estPC = () => largePC.matches;
const estTel = () => !largePC.matches;
function majMiseEnPage() {
  document.body.classList.toggle("pc", estPC());
  document.body.classList.toggle("tel", estTel());
}
largePC.addEventListener("change", () => { majMiseEnPage(); rendreTout(); });

// Chaque fenêtre a son adresse (#fiche=ID, #ajout, #reglages…) : le bouton « retour »
// du téléphone ferme la fenêtre ouverte, comme dans une vraie appli.
//   « frise » peut se combiner avec une fiche : #frise&fiche=ID
let aNavigue = false;
function aller(adresse) { aNavigue = true; location.hash = adresse; }
function retour() {
  if (aNavigue) { history.back(); return; }
  // Page ouverte directement sur une fenêtre : on revient à la fiche si on était sur « Choisir l'affiche »
  location.replace("#" + (adresse.affiche && adresse.fiche ? adresseFiche(adresse.fiche) : ""));
}
function lireAdresse() {
  const parts = decodeURIComponent(location.hash.slice(1)).split("&").filter(Boolean);
  const r = { frise: false, fiche: null, fenetre: null, id: null };
  parts.forEach(p => {
    if (p === "frise") r.frise = true;
    else if (p.startsWith("fiche=")) r.fiche = p.slice(6);
    else if (p.startsWith("modifier=")) { r.fenetre = "modifier"; r.id = p.slice(9); }
    else if (p === "affiche") r.affiche = true;   // « Choisir l'affiche », par-dessus la fiche
    else r.fenetre = p;   // ajout, reglages, theme, supports
  });
  return r;
}
// Adresse d'une fiche en gardant la frise ouverte si on y est
const adresseFiche = id => (lireAdresse().frise ? "frise&" : "") + "fiche=" + id;

let ui = {
  type: TYPES.some(t => t.id === reglages.type) ? reglages.type : "film",
  page: [0, 1, 2].includes(reglages.page) ? reglages.page : 0,
  recherche: "", filtres: new Set(), friseTypes: new Set(),
  ajoutPassage: false, precision: "mois", vaOnglet: "proches"
};
let adresse = lireAdresse();
let ficheAffichee = null;   // id de la fiche ouverte (pour ne l'animer qu'à l'ouverture)

function router() {
  if (!pret()) return;
  const avant = adresse;
  adresse = lireAdresse();
  if (avant.fiche !== adresse.fiche) { ui.ajoutPassage = false; ui.vaOnglet = "proches"; }
  // Fenêtre « Choisir l'affiche » (2e couche, au-dessus de la fiche)
  const m = adresse.fiche && medias.get(adresse.fiche);
  if (adresse.affiche && m && affChoix?.id !== m.id) ouvrirAffiche(m);
  if (!adresse.affiche) { $("voile2").hidden = true; $("voile2").innerHTML = ""; affChoix = null; }
  fermerMenu(true);
  rendreTout();
  if (rechargerApres && !adresse.fenetre && !adresse.fiche) location.reload();
}
addEventListener("hashchange", router);

// Redessine quand des données arrivent, sans casser une saisie en cours
function rafraichir() {
  if (!pret()) return;
  rendreTout({ doux: true });
}

// ---------- 5. Affichage ----------

// Fiches visibles d'une page (type actuel, recherche, filtres, tri)
function correspond(m) {
  const mots = simplifier(ui.recherche).split(/\s+/).filter(Boolean);
  if (mots.length) {
    const t = simplifier([m.titre, m.createur, m.genres.join(" "), m.tags.join(" ")].join(" "));
    if (!mots.every(x => t.includes(x))) return false;
  }
  for (const f of ui.filtres) {
    const [genre, valeur] = [f[0], f.slice(2)];
    if (genre === "t" && !m.tags.includes(valeur)) return false;
    if (genre === "g" && !m.genres.includes(valeur)) return false;
  }
  return true;
}
function trier(liste) {
  const tri = reglages.tris[ui.type] || "ajout";
  const fr = new Intl.Collator("fr", { sensitivity: "base", numeric: true });
  const f = {
    ajout: (a, b) => b.cree - a.cree,
    titre: (a, b) => fr.compare(a.titre, b.titre),
    annee: (a, b) => (b.annee || 0) - (a.annee || 0) || fr.compare(a.titre, b.titre),
    note: (a, b) => b.note - a.note || fr.compare(a.titre, b.titre),
    vu: (a, b) => valeurDate(dernierPassage(b)) - valeurDate(dernierPassage(a)) || b.cree - a.cree
  }[tri];
  return liste.sort(f);
}
function contenuPage(i, type = ui.type) {
  const p = PAGES[i];
  const duType = [...medias.values()].filter(m => m.type === type && correspond(m));
  return {
    principaux: trier(duType.filter(m => p.statuts.includes(m.statut))),
    bas: p.bas ? trier(duType.filter(m => m.statut === p.bas)) : [],
    titreBas: p.bas === "reserve" ? "En réserve" : p.bas === "abandon" ? "Abandonnés" : ""
  };
}
const vueActuelle = () => {
  const v = reglages.vues[ui.type] || "liste";
  return v === "tab" && !estPC() ? "liste" : v;
};

// Petite ligne grise sous le titre : « 2024 · Science-fiction · S2/4 »
function meta(m) {
  const morceaux = [m.annee, m.genres[0]];
  if (m.type === "serie" && m.saisons.actif && m.saisons.total) morceaux.push(`S${m.saisons.vues.length}/${m.saisons.total}`);
  return morceaux.filter(Boolean).map(echapper).join(" · ");
}
function ligneHTML(m, pale) {
  return `<button class="it ${pale ? "pale" : ""} ${adresse.fiche === m.id ? "sel" : ""}" data-fiche="${m.id}">${vignette(m)}
    <span class="it-txt"><span class="it-ti">${echapper(m.titre)}${m.revoir ? `<span class="rev">${echapper(MOTS[m.type].revoir.toLowerCase())}</span>` : ""}</span><span class="it-me">${meta(m)}</span></span>
    <span class="it-rt">${m.coeur ? ic("coeur", "coeur") : ""}${etoiles(m.note)}</span></button>`;
}
function carteHTML(m, pale) {
  return `<button class="mc ${pale ? "pale" : ""} ${adresse.fiche === m.id ? "sel" : ""}" data-fiche="${m.id}">${vignette(m, "grand")}
    ${m.coeur ? `<span class="mc-coeur">${ic("coeur")}</span>` : ""}${m.revoir ? `<span class="mc-rev">${echapper(MOTS[m.type].revoir.replace("À ", ""))}</span>` : ""}
    <span class="mc-ti">${echapper(m.titre)}</span>${etoiles(m.note)}</button>`;
}
function pageHTML(i) {
  const { principaux, bas, titreBas } = contenuPage(i);
  if (!principaux.length && !bas.length) {
    return `<div class="vide-page">${ui.recherche || ui.filtres.size ? "Aucun résultat" : "Rien ici pour l'instant"}</div>`;
  }
  const vue = vueActuelle();
  if (vue === "mosa") {
    return `<div class="mosa">${principaux.map(m => carteHTML(m)).join("")}
      ${bas.length ? `<div class="sec">${titreBas}</div>${bas.map(m => carteHTML(m, true)).join("")}` : ""}</div>`;
  }
  return `<div class="liste ${vue === "compact" ? "compacte" : ""}">${principaux.map(m => ligneHTML(m)).join("")}
    ${bas.length ? `<div class="sec">${titreBas}</div>${bas.map(m => ligneHTML(m, true)).join("")}` : ""}</div>`;
}

// --- Barre de gauche (PC) ---
function rendreCote() {
  if (!estPC()) { $("cote").innerHTML = ""; return; }
  if (!$("recherche-pc")) {
    $("cote").innerHTML = `<div class="logo"><img src="icones/icone.svg" alt="" width="22" height="22">Médiathèque</div>
      <label class="chercher">${ic("cherche", "s")}<input id="recherche-pc" type="search" placeholder="Chercher" aria-label="Chercher"><kbd>Ctrl K</kbd></label>
      <div id="cote-nav" class="cote-nav"></div>`;
  }
  $("recherche-pc").value = ui.recherche;
  $("cote-nav").innerHTML = `<div class="groupe">Bibliothèque</div>
    ${TYPES.map(t => `<button class="nav ${!adresse.frise && t.id === ui.type ? "on" : ""}" data-type="${t.id}">${ic(t.id)}${t.nom}</button>`).join("")}
    <div class="groupe">Historique</div>
    <button class="nav ${adresse.frise ? "on" : ""}" data-action="frise">${ic("frise")}Frise</button>
    <button class="nav bas" data-aller="reglages">${ic("regl")}Réglages</button>`;
}

// --- En-tête ---
function rendreEntete() {
  const t = typeDe(ui.type);
  if (adresse.frise) {
    const seg = `<div class="seg frise-choix">${FRISES.map(f => `<button data-frise="${f.id}" aria-pressed="${reglages.frise === f.id}">${f.nom}</button>`).join("")}</div>`;
    $("entete").innerHTML = estPC()
      ? `<div class="pc-tete"><h1>Frise</h1>${seg}<span class="sp"></span></div>`
      : `<div class="tel-tete"><button class="btn-icone" data-action="fermer-frise" aria-label="Retour">${ic("retour")}</button><h1 class="frise-titre">Frise</h1>${seg}</div>`;
    return;
  }
  if (estPC()) {
    retenir(".statuts .sind");
    $("entete").innerHTML = `<div class="pc-tete"><h1>${t.nom}</h1>
      <div class="statuts">${PAGES.map((p, i) => `<button class="st ${i === ui.page ? "on" : ""}" data-page="${i}" style="--c:${couleurPage(i)}">${ic(p.icone)}${nomPage(i, ui.type)}</button>`).join("")}<i class="sind"></i></div>
      <span class="sp"></span><button class="btn pri" data-action="ajouter">${ic("plus", "s")}Ajouter</button></div>`;
    poserTraitStatut();
  } else {
    $("entete").innerHTML = `<div class="tel-tete"><div class="titreS"><small>${t.nom}</small>
        <button class="dtitre" id="dtitre" style="color:${couleurPage(ui.page)}"><span class="dmot">${nomPage(ui.page, ui.type)}</span>${ic("bas", "s")}</button></div>
      <button class="btn-icone" data-action="recherche" aria-label="Chercher">${ic("cherche")}</button>
      <button class="btn-icone" data-action="frise" aria-label="Frise">${ic("frise")}</button>
      <button class="btn-icone" data-aller="reglages" aria-label="Réglages">${ic("regl")}</button></div>
      <div class="points">${PAGES.map((p, i) => `<i class="${i === ui.page ? "on" : ""}" data-page="${i}" style="--c:${couleurPage(i)}"></i>`).join("")}</div>`;
  }
}
// Les « plaquettes » (trait sous le statut, pastille des vues, onglet du bas) glissent
// d'un choix à l'autre. Quand la barre est redessinée, la nouvelle plaquette repart
// de l'ancienne position, puis glisse jusqu'au nouveau choix.
const anciennes = {};
function retenir(sel) { const p = document.querySelector(sel); if (p && p.style.width) anciennes[sel] = { l: p.style.left, w: p.style.width }; }
function poserPlaquette(selPlaquette, selChoix) {
  const p = document.querySelector(selPlaquette), on = document.querySelector(selChoix);
  if (!p) return;
  if (!on) { p.style.opacity = 0; return; }
  p.style.opacity = 1;
  const a = anciennes[selPlaquette];
  delete anciennes[selPlaquette];
  if (a && !p.style.width && animOK()) {
    p.style.transition = "none"; p.style.left = a.l; p.style.width = a.w;
    p.getBoundingClientRect();          // force le navigateur à poser l'ancienne position
    p.style.transition = "";
  }
  p.style.left = on.offsetLeft + "px"; p.style.width = on.offsetWidth + "px";
}
const poserTraitStatut = () => poserPlaquette(".statuts .sind", ".statuts .st.on");

// --- Outils : tags, tri, vues ---
function rendreOutils() {
  if (adresse.frise) {
    $("outils").innerHTML = `<div class="puces">${TYPES.map(t => `<button class="puce" data-frise-type="${t.id}" aria-pressed="${ui.friseTypes.has(t.id)}">${ic(t.id, "s")}${t.nom}</button>`).join("")}</div>`;
    return;
  }
  const tri = TRIS.find(x => x.id === (reglages.tris[ui.type] || "ajout"));
  const vues = VUES.filter(v => v.id !== "tab" || estPC());
  const vue = vueActuelle();
  retenir(".vues .vind");
  $("outils").innerHTML = `<button class="btn outil ${ui.filtres.size ? "actif" : ""}" data-action="menu-tags">${ic("tag", "s")}Tags${ui.filtres.size ? `<i class="pastille"></i>` : ""}</button>
    <button class="btn outil" data-action="menu-tri">${ic("tri", "s")}${tri.nom}${ic("bas", "s fl")}</button>
    <span class="sp"></span>
    <div class="vues"><i class="vind"></i>${vues.map(v => `<button data-vue="${v.id}" class="${v.id === vue ? "on" : ""}" title="${v.nom}" aria-label="${v.nom}">${ic(v.icone, "s")}${estPC() && v.id === vue ? `<span>${v.nom}</span>` : ""}</button>`).join("")}</div>`;
  poserPastilleVues();
}
const poserPastilleVues = () => poserPlaquette(".vues .vind", ".vues button.on");

// --- Contenu : les 3 pages côte à côte (qu'on fait glisser), le tableau, ou la frise ---
let tableauEnEdition = false;
function rendreContenu() {
  if (adresse.frise) { rendreFrise(); return; }
  if (vueActuelle() === "tab") { if (!tableauEnEdition) rendreTableau(); return; }
  // On garde la position de défilement de chaque page quand on redessine
  const defil = [...document.querySelectorAll("#contenu .page")].map(p => p.scrollTop);
  $("contenu").innerHTML = `<div class="piste" id="piste" style="transform:translateX(${-ui.page * 100 / 3}%)">${[0, 1, 2].map(i =>
    `<div class="page" data-page-num="${i}">${pageHTML(i)}</div>`).join("")}</div>`;
  document.querySelectorAll("#contenu .page").forEach((p, i) => { if (defil[i]) p.scrollTop = defil[i]; });
}

// --- Onglets du bas (téléphone) ---
function rendreOnglets() {
  if (estPC()) { $("onglets").innerHTML = ""; return; }
  retenir("#onglets .oind");
  $("onglets").innerHTML = `<i class="oind"></i>${TYPES.map(t => `<button class="og ${t.id === ui.type && !adresse.frise ? "on" : ""}" data-type="${t.id}">${ic(t.id)}<span>${t.nom}</span></button>`).join("")}`;
  poserPlaquetteOnglets();
}
const poserPlaquetteOnglets = () => poserPlaquette("#onglets .oind", "#onglets .og.on");

// --- Le tableau (PC) : on écrit directement dans les cases ---
const COLS_TABLEAU = ["vg", "titre", "annee", "statut", "note", "coeur", "vu", "support", "tags"];
function rendreTableau() {
  const { principaux, bas } = contenuPage(ui.page);
  const ligne = m => `<tr data-id="${m.id}" class="${adresse.fiche === m.id ? "sel" : ""} ${bas.includes(m) ? "pale" : ""}">
    <td data-col="vg">${vignette(m, "mini")}</td>
    <td data-col="titre" class="t-titre">${echapper(m.titre)}</td>
    <td data-col="annee">${m.annee || ""}</td>
    <td data-col="statut"><span class="pil"><i class="dot" style="background:var(--st-${m.statut})"></i>${nomStatut(m.statut, m.type)}</span></td>
    <td data-col="note">${etoiles(m.note) || `<span class="vide-n">—</span>`}</td>
    <td data-col="coeur" class="t-coeur ${m.coeur ? "on" : ""}">${ic("coeur")}</td>
    <td data-col="vu">${echapper(m.passages.map(p => texteDate(p, true)).join(" · "))}</td>
    <td data-col="support">${echapper(m.support)}</td>
    <td data-col="tags">${echapper(m.tags.join(", "))}</td></tr>`;
  // Colonnes : largeur réglée en glissant le bord de l'en-tête (le titre prend la place qui reste)
  const COLS = [["vg", "", 44], ["titre", "Titre", null], ["annee", "Année", 62], ["statut", "Statut", 118], ["note", "Note", 88],
    ["coeur", "♥", 36], ["vu", MOTS[ui.type].passage, 140], ["support", "Support", 110], ["tags", "Tags", 120]];
  // Le titre garde toujours au moins 160 px : s'il manque de place, le tableau défile de côté
  const fixe = COLS.reduce((s, [k, , w]) => s + (w ? (reglages.colonnes[k] || w) : 0), 0);
  $("contenu").innerHTML = `<div class="tab-wrap"><table class="tableau" style="min-width:${fixe + 160}px">
    <colgroup>${COLS.map(([k, , w]) => `<col data-col="${k}" ${w ? `style="width:${reglages.colonnes[k] || w}px"` : ""}>`).join("")}</colgroup>
    <thead><tr>${COLS.map(([k, n, w], i) => `<th>${n}${w && k !== "vg" ? `<i class="redim-col" data-col="${k}" title="Glisser pour élargir"></i>` : ""}${i === 0 ? "" : ""}</th>`).join("")}</tr></thead>
    <tbody>${[...principaux, ...bas].map(ligne).join("")}
      <tr class="nouveau"><td>${ic("plus", "s")}</td><td colspan="8"><input id="tab-nouveau" placeholder="Nouveau titre… (Entrée pour ajouter)" autocomplete="off"></td></tr></tbody></table></div>`;
}

// --- La frise ---
function evenementsFrise() {
  const evs = [];
  medias.forEach(m => {
    if (ui.friseTypes.size && !ui.friseTypes.has(m.type)) return;
    m.passages.forEach((p, k) => {
      const d = lireDate(p);
      if (!d) return;
      // Le début n'a de sens que pour le dernier passage
      const debut = k === m.passages.length - 1 && m.debut ? lireDate(m.debut)?.mois ?? null : null;
      evs.push({ id: m.id, titre: m.titre, type: m.type, mois: d.mois, precision: d.precision, jour: d.jour, saison: d.saison,
        debut, note: m.note, coeur: m.coeur, fois: k + 1, vignette: vignette(m, "fv"), tri: valeurDate(p) });
    });
  });
  return evs.sort((a, b) => b.tri - a.tri);
}
function rendreFrise() {
  $("contenu").innerHTML = `<div class="frise frise-${reglages.frise}">${dessinerFrise(reglages.frise, evenementsFrise(), { pc: estPC() })}</div>`;
  // La frise horizontale s'ouvre sur aujourd'hui (tout à droite)
  const d = document.querySelector(".fh-defile");
  if (d) d.scrollLeft = d.scrollWidth;
}

// Dessine tout l'écran (doux = données arrivées : pas d'animation, on ne casse pas une saisie)
function rendreTout(opts = {}) {
  majMiseEnPage();
  document.body.dataset.frise = adresse.frise ? "oui" : "non";
  rendreCote();
  rendreEntete();
  rendreOutils();
  rendreContenu();
  rendreOnglets();
  $("fab").hidden = estPC() || !!adresse.frise;
  $("cherche-tel").hidden = estPC() || !rechercheTelOuverte;
  rendreFiche(opts);
  rendreFenetre(opts);
}

// ---------- 6. La fiche ----------
function ficheHTML(m) {
  const mots = MOTS[m.type];
  const src = m.miniature || m.image;
  const supports = [...new Set([...donnees.supports, m.support].filter(Boolean))];
  const tousTags = [...new Set([...medias.values()].flatMap(x => x.tags))].sort((a, b) => a.localeCompare(b, "fr"));
  const s = m.saisons;
  const saisons = m.type !== "serie" ? "" : `
    <div class="bloc"><span class="k">Par saison</span><span class="v"><button class="tog ${s.actif ? "on" : ""}" data-action="saisons" role="switch" aria-checked="${s.actif}" aria-label="Suivre par saison"></button></span></div>
    ${s.actif ? `<div class="bloc"><span class="k">Saisons</span><span class="v saisons">${Array.from({ length: s.total }, (_, k) => k + 1).map(n => {
      const vue = s.vues.includes(n), enCours = !vue && n === Math.max(0, ...s.vues) + 1 && m.statut === "encours";
      return `<button class="sa ${vue ? "vue" : ""} ${enCours ? "encours" : ""}" data-saison="${n}">S${n}${vue ? ic("ok") : ""}</button>`;
    }).join("")}<button class="sa plus" data-action="saison-plus" aria-label="Ajouter une saison">+</button>${s.total ? `<button class="sa moins" data-action="saison-moins" aria-label="Enlever une saison">−</button>` : ""}</span></div>` : ""}`;
  const passages = m.passages.map((p, k) => `<button class="chip" data-passage="${k}">${echapper(texteDate(p))}</button>`).join("");
  const formPassage = !ui.ajoutPassage ? "" : `<div class="pas-form">
    <div class="seg">${[["jour", "Jour"], ["mois", "Mois"], ["saison", "Saison"], ["annee", "Année"]].map(([p, n]) => `<button data-precision="${p}" aria-pressed="${ui.precision === p}">${n}</button>`).join("")}</div>
    <div class="pas-champs">${ui.precision === "jour" ? `<input id="pas-jour" type="date" value="${jourActuel()}" max="${jourActuel()}">`
      : ui.precision === "mois" ? `<input id="pas-mois" type="month" value="${moisActuel()}" max="${moisActuel()}">`
      : ui.precision === "saison" ? `<select id="pas-saison">${Object.entries(SAISONS).map(([k, v]) => `<option value="${k}" ${Math.floor(new Date().getMonth() / 3) === Math.floor(v.mois / 3) ? "selected" : ""}>${v.nom}</option>`).join("")}</select><input id="pas-an" type="number" inputmode="numeric" value="${new Date().getFullYear()}" min="1900" max="2100">`
      : `<input id="pas-an" type="number" inputmode="numeric" value="${new Date().getFullYear()}" min="1900" max="2100">`}
      <button class="btn pri" data-action="valider-passage">Ajouter</button></div></div>`;
  return `<div class="fi-fond" style="background:${degrade(m.titre)}">${src ? `<img src="${echapper(src)}" alt="" onerror="this.remove()">` : ""}</div>
    <div class="fi-tete"><button class="fi-aff-btn" data-action="choisir-affiche" aria-label="Changer l'affiche">${vignette(m, "fi-aff")}<span class="fi-crayon">${ic("crayon")}</span></button>
      <div class="fi-tt"><h2>${echapper(m.titre)}</h2>
        <div class="fi-me">${[m.annee, m.createur].filter(Boolean).map(echapper).join(" · ")}${m.genres.length ? `<br>${echapper(m.genres.join(", "))}` : ""}</div></div>
      <div class="fi-btns"><button class="btn-icone" data-action="menu-fiche" aria-label="Plus d'actions">${ic("dots")}</button>
        ${estPC() ? `<button class="btn-icone" data-action="fermer-fiche" aria-label="Fermer">${ic("x")}</button>` : ""}</div></div>
    <div class="fi-actions">
      <button class="btn" data-action="menu-statut"><i class="dot" style="background:var(--st-${m.statut})"></i>${nomStatut(m.statut, m.type)}${ic("bas", "s")}</button>
      <button class="btn" data-action="ajout-passage">${ic("oeil", "s")}+ ${mots.passage}</button>
      <button class="btn coeur-btn ${m.coeur ? "on" : ""}" data-action="coeur" aria-label="Coup de cœur">${ic("coeur")}</button></div>
    <div class="fi-blocs">
      <div class="bloc b-statut"><span class="k">Statut</span><span class="v"><button class="choix" data-action="menu-statut"><i class="dot" style="background:var(--st-${m.statut})"></i>${nomStatut(m.statut, m.type)}${ic("bas", "s")}</button></span></div>
      <div class="bloc"><span class="k">Note</span><span class="v note">${[1, 2, 3, 4, 5].map(i => `<button class="et ${i <= m.note ? "on" : ""}" data-note="${i}" aria-label="${i} étoile${i > 1 ? "s" : ""}">★</button>`).join("")}
        <button class="coeur-btn b-coeur ${m.coeur ? "on" : ""}" data-action="coeur" aria-label="Coup de cœur">${ic("coeur")}</button></span></div>
      <div class="bloc"><span class="k">${mots.revoir}</span><span class="v"><button class="tog ${m.revoir ? "on" : ""}" data-action="revoir" role="switch" aria-checked="${m.revoir}" aria-label="${mots.revoir}"></button></span></div>
      ${saisons}
      <div class="bloc"><span class="k">${mots.passage}</span><span class="v passages">${passages}<button class="chip plus" data-action="ajout-passage">+ Ajouter</button></span></div>
      ${formPassage}
      ${m.debut ? `<div class="bloc"><span class="k">Commencé</span><span class="v"><button class="chip" data-action="debut">${echapper(texteDate(m.debut))}</button></span></div>` : ""}
      <div class="bloc"><span class="k">Support</span><span class="v"><select data-champ="support" aria-label="Support">
        <option value="">—</option>${supports.map(x => `<option ${x === m.support ? "selected" : ""}>${echapper(x)}</option>`).join("")}<option value="__autre">Autre…</option></select></span></div>
      <div class="bloc"><span class="k">Tags</span><span class="v tags">${m.tags.map(t => `<button class="chip tag" data-suppr-tag="${echapper(t)}" title="Enlever">${echapper(t)}<span class="x">×</span></button>`).join("")}
        <input data-champ="tag" list="liste-tags" placeholder="+ tag" aria-label="Ajouter un tag"><datalist id="liste-tags">${tousTags.map(t => `<option value="${echapper(t)}">`).join("")}</datalist></span></div>
      <textarea class="avis" data-champ="avis" rows="2" placeholder="Mon avis…" aria-label="Mon avis">${echapper(m.avis)}</textarea>
      <div class="va" id="va">${vaHTML(m)}</div>
    </div>`;
}

// --- « Voir aussi » : titres proches + même réalisateur / studio / auteur / chaîne ---
// Les suggestions sont cherchées une fois par fiche (gardées en mémoire tant que l'appli est ouverte).
const vaCache = new Map();   // id de la fiche -> { etat, proches, createur }
const NOM_CREATEUR = { film: "Même réalisateur", jeu: "Même studio", livre: "Même auteur", serie: "Même chaîne" };
function vaHTML(m) {
  const v = vaCache.get(m.id);
  const onglets = [["proches", "Titres proches"], ...(m.createur ? [["createur", NOM_CREATEUR[m.type]]] : [])];
  if (!onglets.some(o => o[0] === ui.vaOnglet)) ui.vaOnglet = "proches";
  const liste = v?.[ui.vaOnglet] || [];
  return `<div class="va-titre">Voir aussi</div>
    ${onglets.length > 1 ? `<div class="seg va-onglets">${onglets.map(([k, n]) => `<button data-va="${k}" aria-pressed="${ui.vaOnglet === k}">${n}</button>`).join("")}</div>` : ""}
    ${!v || v.etat === "charge" ? `<div class="aj-info">Recherche de suggestions…</div>`
      : v.etat === "erreur" ? `<div class="aj-info">Suggestions indisponibles (pas de réseau ?)</div>`
      : !liste.length ? `<div class="aj-info">Aucune suggestion trouvée.</div>`
      : liste.map((r, i) => ligneResultat(r, m.type, `data-va-res="${i}"`, "va-" + i)).join("")}`;
}
function majVoirAussi() {
  const m = ficheOuverte();
  if (m && $("va")) $("va").innerHTML = vaHTML(m);
}
function chargerVoirAussi(m) {
  if (vaCache.has(m.id)) return;
  vaCache.set(m.id, { etat: "charge" });
  voirAussi(m)
    .then(r => vaCache.set(m.id, { etat: "fini", ...r }))
    .catch(() => vaCache.set(m.id, { etat: "erreur" }))
    .finally(() => { if (adresse.fiche === m.id) majVoirAussi(); });
}

// --- Choisir l'affiche (toucher l'affiche dans la fiche) ---
// Une grille avec l'affiche actuelle et celles trouvées en ligne (seulement en hauteur),
// plus « Photo / fichier » et « Coller un lien ».
let affChoix = null;   // { id, liste: [{ image, legende }] }
function ouvrirAffiche(m) {
  affChoix = { id: m.id, liste: [] };
  const v2 = $("voile2");
  v2.className = "voile " + (estPC() ? "centre" : "bas");
  v2.innerHTML = `<div class="fenetre affiches" role="dialog" aria-label="Choisir l'affiche">
    <div class="fhd"><h2>Choisir l'affiche</h2><button class="btn-icone" data-action="fermer" aria-label="Fermer">${ic("x")}</button></div>
    <div class="aff-info">${ic("info", "s")}<span>Seulement des affiches en hauteur : les images larges (logos, captures) sont écartées.</span></div>
    <div class="aff-grille" id="aff-grille"></div>
    <div class="aff-lien" id="aff-lien" hidden><input id="aff-url" type="text" inputmode="url" placeholder="https://… (adresse de l'image)" autocomplete="off" spellcheck="false">
      <button class="btn pri" data-action="aff-url-ok">OK</button></div>
    <div class="deux aff-bas"><button class="btn" data-action="aff-fichier">${ic("photo", "s")}Photo / fichier</button>
      <button class="btn" data-action="aff-lien">${ic("lien", "s")}Coller un lien</button></div>
    <input type="file" id="aff-fichier" accept="image/*" hidden></div>`;
  v2.hidden = false;
  animer(v2.querySelector(".fenetre"), estPC() ? [{ opacity: 0, transform: "scale(.96)" }, { opacity: 1, transform: "none" }] : [{ transform: "translateY(100%)" }, { transform: "none" }], { duration: 320, easing: DOUX });
  majGrilleAffiches(m, true);
  // Seulement des affiches DU MÊME TITRE (autres éditions, autres posters…)
  const source = { serie: "TVmaze", livre: "Édition", film: "Wikipédia", jeu: "Wikipédia" }[m.type];
  chercherAffiches(m.type, m.titre).then(urls => {
    if (!affChoix || affChoix.id !== m.id) return;
    affChoix.liste = urls.filter(u => u !== m.image).map((u, i) => ({ image: u, legende: m.type === "livre" ? `${source} ${i + 1}` : source }));
    majGrilleAffiches(m, false);
  }).catch(() => majGrilleAffiches(m, false, true));
}
function majGrilleAffiches(m, enCours, erreur) {
  if (!$("aff-grille")) return;
  const actuelle = (m.miniature || m.image) ? `<div class="aff"><span class="aff-v on">${vignette(m)}<span class="coche">${ic("ok")}</span></span><small>Actuelle</small></div>` : "";
  $("aff-grille").innerHTML = actuelle + affChoix.liste.map((a, i) => `<button class="aff" data-aff="${i}">
      <span class="aff-v">${vignette({ titre: m.titre, image: a.image, miniature: "" })}</span><small>${echapper(a.legende)}</small></button>`).join("")
    + (enCours ? `<div class="aff-attente">Recherche…</div>` : erreur ? `<div class="aff-attente">Recherche indisponible</div>`
      : !affChoix.liste.length ? `<div class="aff-attente">Aucune autre affiche trouvée</div>` : "");
}
function appliquerAffiche(m, { image = "", miniature = "" }) {
  const avant = { image: m.image, miniature: m.miniature };
  m.image = image; m.miniature = miniature;
  ecrireMedia(m);
  if (image && !miniature) copierImage(image).then(mini => {
    const x = medias.get(m.id);
    if (mini && x && x.image === image) { x.miniature = mini; ecrireMedia(x); rafraichir(); }
  });
  retour();
  afficherToast("Affiche changée", () => { Object.assign(m, avant); ecrireMedia(m); rafraichir(); });
}

// Affiche (ou met à jour) la fiche ouverte : panneau à droite sur PC, fenêtre du bas sur téléphone.
// Elle ne s'anime qu'à l'ouverture : toucher un bouton dedans ne la « rouvre » jamais.
function rendreFiche(opts = {}) {
  const m = adresse.fiche ? medias.get(adresse.fiche) : null;
  // Ne pas redessiner pendant qu'on tape dans la fiche (sinon le texte saute)
  const conteneur = estPC() ? $("panneau") : $("voile");
  const saisie = conteneur.contains(document.activeElement) && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
  if (opts.doux && saisie && m && ficheAffichee === m.id) return;

  if (!m) {
    $("panneau").hidden = $("redim-panneau").hidden = true; $("panneau").innerHTML = "";
    if ($("voile").dataset.quoi === "fiche") fermerVoile();
    ficheAffichee = null;
    return;
  }
  const nouvelle = ficheAffichee !== m.id;
  ficheAffichee = m.id;
  chargerVoirAussi(m);
  if (estPC()) {
    if ($("voile").dataset.quoi === "fiche") fermerVoile();
    $("panneau").hidden = $("redim-panneau").hidden = false;
    $("panneau").className = "panneau fi-" + reglages.fichePC;
    const defil = $("panneau").scrollTop;
    $("panneau").innerHTML = `<div class="fiche">${ficheHTML(m)}</div>`;
    if (!nouvelle) $("panneau").scrollTop = defil;
    else animer($("panneau").firstChild, [{ opacity: 0, transform: "translateX(12px)" }, { opacity: 1, transform: "none" }], { duration: 260, easing: DOUX });
  } else {
    $("panneau").hidden = $("redim-panneau").hidden = true;
    const deja = $("voile").dataset.quoi === "fiche" && !$("voile").hidden;
    const feuille = deja ? $("voile").querySelector(".feuille") : null;
    if (feuille) {
      const defil = feuille.scrollTop;
      feuille.innerHTML = `<div class="poignee"></div><div class="fiche">${ficheHTML(m)}</div>`;
      feuille.scrollTop = defil;
    } else {
      ouvrirVoile("fiche", "bas", `<div class="feuille fiche-tel" role="dialog" aria-label="${echapper(m.titre)}"><div class="poignee"></div><div class="fiche">${ficheHTML(m)}</div></div>`);
      animer($("voile"), [{ backgroundColor: "rgba(0,0,0,0)" }, { backgroundColor: "rgba(10,12,18,.45)" }], { duration: 250 });
      animer($("voile").querySelector(".feuille"), [{ transform: "translateY(100%)" }, { transform: "none" }], { duration: 420, easing: "cubic-bezier(.3,1.2,.5,1)" });
    }
  }
}

// ---------- 7. Fenêtres ----------
function ouvrirVoile(quoi, forme, html) {
  $("voile").dataset.quoi = quoi;
  $("voile").className = "voile " + forme;
  $("voile").innerHTML = html;
  $("voile").hidden = false;
}
function fermerVoile() { $("voile").hidden = true; $("voile").innerHTML = ""; $("voile").dataset.quoi = ""; }

let fenetreAffichee = "";
function rendreFenetre(opts = {}) {
  const f = adresse.fenetre;
  if (!f) {
    if ($("voile").dataset.quoi && $("voile").dataset.quoi !== "fiche") fermerVoile();
    fenetreAffichee = "";
    return;
  }
  const cle = f + (adresse.id || "");
  // Une fenêtre déjà ouverte ne se redessine pas quand des données arrivent (on y tape peut-être)
  if (opts.doux && fenetreAffichee === cle) { if (f === "reglages") majSynchro(); return; }
  const nouvelle = fenetreAffichee !== cle;
  fenetreAffichee = cle;
  if (f === "ajout") { if (nouvelle) ouvrirAjout(); return; }
  if (f === "modifier") { const m = medias.get(adresse.id); if (m) ouvrirModifier(m); else retour(); return; }
  if (f === "reglages") ouvrirReglages();
  else if (f === "theme") ouvrirTheme();
  else if (f === "supports") ouvrirSupports();
  if (nouvelle) animer($("voile").querySelector(".fenetre"), [{ opacity: 0, transform: "scale(.96) translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 240, easing: DOUX });
}

// --- 4 petites icônes de statut (Ajouter et « Voir aussi ») ---
// À voir (marque-page), En cours (lecture), Vu (coche), Réserve (boîte).
// Un titre déjà dans ma médiathèque montre son statut : toucher une autre icône le change.
const STATUTS_AJOUT = [["avoir", "savoir"], ["encours", "sencours"], ["fini", "ok"], ["reserve", "boite"]];
const dejaLa = (type, titre) => [...medias.values()].find(x => x.type === type && simplifier(x.titre) === simplifier(titre));
function boutonsStatut(type, titre, attribut) {
  const m = dejaLa(type, titre);
  return `<span class="st4 ${m ? "fait" : ""}">${STATUTS_AJOUT.map(([s, i]) =>
    `<button ${attribut} data-statut="${s}" class="${m?.statut === s ? "on" : ""}" style="--c:var(--st-${s})" title="${nomStatut(s, type)}" aria-label="${nomStatut(s, type)}">${ic(i)}</button>`).join("")}</span>`;
}
function ajouterAvecStatut(infos, type, statut, bouton) {
  const m = dejaLa(type, infos.titre);
  if (m) {
    if (m.statut === statut) return;
    const avant = m.statut;
    m.statut = statut;
    if (statut === "encours" && !m.debut) m.debut = moisActuel();
    ecrireMedia(m);
    afficherToast(`« ${m.titre} » : ${nomStatut(statut, type)}`, () => { m.statut = avant; ecrireMedia(m); apresAjout(); });
  } else {
    const f = creerFiche(infos, type, statut);
    afficherToast(`« ${f.titre} » ajouté`, () => { effacerMedias([f.id]); apresAjout(); });
  }
  apresAjout();
  // L'icône choisie « saute » un peu
  const sel = bouton && bouton.closest("[data-ligne]")?.dataset.ligne;
  if (sel) animer(document.querySelector(`[data-ligne="${sel}"] .st4 button.on`), [{ transform: "scale(.6)" }, { transform: "scale(1.25)", offset: .55 }, { transform: "none" }], { duration: 380 });
}
// Après un ajout : listes, fenêtre Ajouter et « Voir aussi » se mettent à jour
function apresAjout() { majAjout(); majVoirAussi(); rendreContenu(); }

// --- Ajouter : recherche en ligne + ajout à la main ---
let aj = null;   // { type, texte, resultats, etat, minuteur, controle }
function ouvrirAjout(prerempli = "") {
  aj = { type: ui.type, texte: prerempli, resultats: [], etat: "" };
  ouvrirVoile("ajout", estPC() ? "centre" : "plein", `<div class="fenetre ajout" role="dialog" aria-label="Ajouter">
    <div class="fhd"><h2>Ajouter</h2><button class="btn-icone" data-action="fermer" aria-label="Fermer">${ic("x")}</button></div>
    <div class="seg aj-types">${TYPES.map(t => `<button data-aj-type="${t.id}">${ic(t.id, "s")}${t.un}</button>`).join("")}</div>
    <label class="aj-champ">${ic("cherche")}<input id="aj-texte" type="search" placeholder="Titre…" autocomplete="off" aria-label="Titre"></label>
    <div id="aj-res" class="aj-res"></div></div>`);
  $("aj-texte").value = prerempli;
  majAjout();
  if (prerempli) lancerRecherche();
  setTimeout(() => $("aj-texte")?.focus(), 60);
}
function majAjout() {
  if (!aj || !$("aj-res")) return;   // fenêtre fermée entre-temps
  document.querySelectorAll("[data-aj-type]").forEach(b => b.setAttribute("aria-pressed", b.dataset.ajType === aj.type));
  const t = aj.texte.trim();
  $("aj-res").innerHTML = !t ? `<div class="aj-info">Tape un titre : l'appli cherche l'affiche et les infos.</div>` :
    `<div class="aj-r manuel" data-ligne="aj-m">${ic("plus")}<span class="aj-t"><b>« ${echapper(t)} »</b><small>sans recherche</small></span>${boutonsStatut(aj.type, t, "data-aj-manuel")}</div>
    ${aj.etat === "charge" ? `<div class="aj-info">Recherche…</div>` : aj.etat === "erreur" ? `<div class="aj-info">Recherche en ligne indisponible : ajoute à la main.</div>`
      : aj.etat === "fini" && !aj.resultats.length ? `<div class="aj-info">Aucun résultat en ligne.</div>` : ""}
    ${aj.resultats.map((r, i) => ligneResultat(r, aj.type, `data-aj-res="${i}"`, "aj-" + i)).join("")}`;
}
// Une ligne de résultat (Ajouter, « Voir aussi ») : affiche, titre, infos, 4 icônes de statut
function ligneResultat(r, type, attribut, cle) {
  return `<div class="aj-r" data-ligne="${cle}">
    <span class="vg" style="background:${degrade(r.titre)}"><b>${echapper(initiale(r.titre))}</b>${r.image ? `<img src="${echapper(r.image)}" alt="" loading="lazy" onerror="this.remove()">` : ""}</span>
    <span class="aj-t"><b>${echapper(r.titre)}</b><small>${echapper(r.info || [r.annee, r.createur].filter(Boolean).join(" · "))}</small></span>
    ${boutonsStatut(type, r.titre, attribut)}</div>`;
}
function lancerRecherche() {
  clearTimeout(aj.minuteur);
  aj.controle?.abort();
  const texte = aj.texte.trim();
  if (texte.length < 2) { aj.resultats = []; aj.etat = ""; majAjout(); return; }
  aj.etat = "charge"; majAjout();
  aj.minuteur = setTimeout(async () => {
    const controle = aj.controle = new AbortController();
    try {
      const res = await chercherEnLigne(aj.type, texte, controle.signal);
      if (controle.signal.aborted || !aj) return;
      aj.resultats = res; aj.etat = "fini";
    } catch (e) {
      if (controle.signal.aborted || !aj) return;
      aj.resultats = []; aj.etat = "erreur";
    }
    majAjout();
  }, 450);
}
// Crée une fiche (depuis la recherche, l'ajout à la main, le tableau ou le partage)
function creerFiche(infos, type, statut) {
  const m = normaliser(nouvelId(), { ...infos, type, statut, cree: Date.now() });
  if (statut === "encours") m.debut = moisActuel();
  ecrireMedia(m);
  // Copie de l'affiche en arrière-plan (la fiche est déjà enregistrée)
  if (m.image) copierImage(m.image).then(mini => {
    const actuelle = medias.get(m.id);
    if (mini && actuelle) { actuelle.miniature = mini; ecrireMedia(actuelle); rafraichir(); }
  });
  return m;
}

// --- Modifier : titre, type, année, créateur, image, genres ---
let brouillon = null;
function ouvrirModifier(m) {
  if (fenetreAffichee === "modifier" + m.id && $("voile").dataset.quoi === "modifier") return;
  brouillon = { ...m };
  ouvrirVoile("modifier", estPC() ? "centre" : "plein", `<div class="fenetre modif" role="dialog" aria-label="Modifier">
    <div class="fhd"><h2>Modifier</h2><button class="btn-icone" data-action="fermer" aria-label="Fermer">${ic("x")}</button></div>
    <div class="modif-haut"><span id="mo-apercu">${vignette(m, "mo-aff")}</span>
      <div class="modif-img"><div class="modif-btns"><button class="btn" data-action="chercher-affiche">${ic("cherche", "s")}Chercher l'affiche</button>
        <button class="btn" data-action="choisir-image">${ic("photo", "s")}Fichier</button></div>
        <input id="mo-image" type="text" inputmode="url" placeholder="ou coller l'adresse d'une image" value="${echapper(m.image)}" autocomplete="off" spellcheck="false">
        <input type="file" id="mo-fichier" accept="image/*" hidden></div></div>
    <div id="mo-res" class="mo-res" hidden></div>
    <label class="champ"><span>Titre</span><input id="mo-titre" value="${echapper(m.titre)}" autocomplete="off"></label>
    <div class="champs2">
      <label class="champ"><span>Type</span><select id="mo-type">${TYPES.map(t => `<option value="${t.id}" ${t.id === m.type ? "selected" : ""}>${t.un}</option>`).join("")}</select></label>
      <label class="champ"><span>Année</span><input id="mo-annee" type="number" inputmode="numeric" value="${m.annee || ""}"></label></div>
    <label class="champ"><span>${m.type === "livre" ? "Auteur" : m.type === "jeu" ? "Studio" : m.type === "serie" ? "Chaîne / plateforme" : "Réalisation"}</span><input id="mo-createur" value="${echapper(m.createur)}" autocomplete="off"></label>
    <label class="champ"><span>Genres (séparés par des virgules)</span><input id="mo-genres" value="${echapper(m.genres.join(", "))}" autocomplete="off"></label>
    <div class="fbas"><button class="btn" data-action="fermer">Annuler</button><button class="btn pri" data-action="enregistrer-modif">Enregistrer</button></div></div>`);
}
// « Chercher l'affiche » : affiches trouvées en ligne pour ce titre, on touche la bonne
async function chercherAffiche() {
  const zone = $("mo-res");
  zone.hidden = false;
  zone.innerHTML = `<div class="aj-info">Recherche…</div>`;
  try {
    const res = (await chercherEnLigne($("mo-type").value, $("mo-titre").value)).filter(r => r.image);
    brouillon.affiches = res;
    zone.innerHTML = res.length ? res.map((r, i) => `<button class="mo-choix" data-mo-res="${i}" title="${echapper(r.titre)}">
      <span class="vg"><img src="${echapper(r.image)}" alt="" loading="lazy" onerror="this.closest('button').remove()"></span>
      <small>${echapper(r.titre)}${r.annee ? ` · ${r.annee}` : ""}</small></button>`).join("")
      : `<div class="aj-info">Aucune affiche trouvée : colle l'adresse d'une image ci-dessus.</div>`;
  } catch (e) { zone.innerHTML = `<div class="aj-info">Recherche en ligne indisponible.</div>`; }
}
function enregistrerModif() {
  const m = medias.get(brouillon.id);
  if (!m) { retour(); return; }
  const titre = $("mo-titre").value.trim();
  if (!titre) { $("mo-titre").focus(); return; }
  const image = lienValide($("mo-image").value);
  const changeImage = image !== m.image;
  Object.assign(m, normaliser(m.id, {
    ...m, titre, type: $("mo-type").value, annee: $("mo-annee").value, createur: $("mo-createur").value,
    genres: $("mo-genres").value.split(","), image,
    miniature: brouillon.miniatureChoisie ?? (changeImage ? "" : m.miniature)
  }));
  ecrireMedia(m);
  vaCache.delete(m.id);   // titre ou créateur ont pu changer : on recherchera les suggestions
  if (changeImage && image && brouillon.miniatureChoisie === undefined) copierImage(image).then(mini => {
    if (mini && medias.get(m.id)) { medias.get(m.id).miniature = mini; ecrireMedia(medias.get(m.id)); rafraichir(); }
  });
  if (m.type !== ui.type) { ui.type = m.type; changerReglage("type", m.type); }
  location.replace("#" + adresseFiche(m.id));
}

// --- Réglages ---
const NOMS_THEME = { auto: "Auto", clair: "Clair", sombre: "Sombre" };
function seg(nom, choix, actuel) {
  return `<div class="seg" data-reglage="${nom}">${choix.map(([v, t]) => `<button data-valeur="${v}" aria-pressed="${actuel === v}">${t}</button>`).join("")}</div>`;
}
function ouvrirReglages() {
  const accent = document.documentElement.dataset.accent;
  const nbTest = [...medias.values()].filter(m => m.test).length;
  ouvrirVoile("reglages", estPC() ? "centre" : "plein", `<div class="fenetre regl" role="dialog" aria-label="Réglages">
    <div class="fhd"><h2>Réglages</h2><button class="btn-icone" data-action="fermer" aria-label="Fermer">${ic("x")}</button></div>
    <div class="sect">Compte</div>
    <div class="groupe">
      <div class="reg"><span class="resume">${echapper(infoCompte)}</span><span class="synchro"></span></div>
      ${MODE_DEMO ? "" : `<button class="reg" data-action="deconnexion"><span>Se déconnecter</span>${ic("sortie")}</button>`}
    </div>
    <div class="sect">Apparence</div>
    <div class="groupe">
      <button class="reg" data-aller="theme"><span>Thème</span><span class="val">${NOMS_THEME[reglages.theme]}${ic("droite")}</span></button>
      <div class="reg"><span>Couleur</span><span class="accents">${ACCENTS.map(a => `<button class="pastille-acc" data-accent="${a.id}" aria-pressed="${accent === a.id}" title="${a.nom}" aria-label="${a.nom}"></button>`).join("")}</span></div>
      ${estPC() ? `<div class="reg"><span>Texte</span><span class="curseur"><input type="range" min="0.85" max="1.5" step="0.05" value="${reglages.texte}" data-curseur="texte" aria-label="Taille du texte"><b>${Math.round(reglages.texte * 100)} %</b></span></div>
        <div class="reg"><span>Jaquettes</span><span class="curseur"><input type="range" min="0.7" max="2" step="0.05" value="${reglages.jaquettes}" data-curseur="jaquettes" aria-label="Taille des jaquettes"><b>${Math.round(reglages.jaquettes * 100)} %</b></span></div>
        <button class="reg" data-action="largeurs"><span>Largeurs (barre, fiche, colonnes)</span><span class="val">Remettre</span></button>
        <div class="reg"><span>Police</span>${seg("police", [["plex", "IBM Plex Sans"], ["figtree", "Figtree"]], reglages.police)}</div>
        <div class="reg"><span>Fiche</span>${seg("fichePC", [["bandeau", "Bandeau"], ["flou", "Fond flou"], ["simple", "Simple"]], reglages.fichePC)}</div>`
      : `<div class="reg"><span>Onglets du bas</span>${seg("onglets", [["t1", "Cases"], ["t2", "Bloc"], ["t3", "Classeur"], ["t4", "Tuiles"]], reglages.onglets)}</div>
        <div class="reg"><span>Vibrations</span>${seg("vibrations", [["oui", "Oui"], ["non", "Non"]], reglages.vibrations)}</div>`}
      <div class="reg"><span>Animations</span>${seg("animations", [["completes", "Complètes"], ["simples", "Simples"]], reglages.animations)}</div>
      <div class="reg"><span>Frise</span>${seg("frise", FRISES.map(f => [f.id, f.nom]), reglages.frise)}</div>
    </div>
    <div class="sect">Listes</div>
    <div class="groupe">
      <button class="reg" data-aller="supports"><span>Supports</span><span class="val">${donnees.supports.length}${ic("droite")}</span></button>
      <button class="reg" data-action="notes"><span>Notes</span><span class="val">${ic("droite")}</span></button>
    </div>
    <div class="sect">Excel</div>
    <div class="deux"><button class="btn" data-action="export">${ic("telecharger", "s")}Exporter</button><button class="btn" data-action="import">${ic("envoyer", "s")}Importer</button></div>
    <input type="file" id="fichier-import" accept=".xlsx" hidden>
    <div class="sect">Données de test</div>
    <div class="deux"><button class="btn" data-action="test-charger">Charger</button><button class="btn" data-action="test-effacer" ${nbTest ? "" : "disabled"}>Effacer${nbTest ? ` (${nbTest})` : ""}</button></div>
    <p class="version">${VERSION}</p></div>`);
  majSynchro();
}
function ouvrirTheme() {
  ouvrirVoile("theme", estPC() ? "centre" : "plein", `<div class="fenetre regl" role="dialog" aria-label="Thème">
    <div class="fhd"><button class="btn-icone" data-action="fermer" aria-label="Retour">${ic("retour")}</button><h2>Thème</h2></div>
    <div class="groupe">${Object.entries(NOMS_THEME).map(([v, n]) => `<button class="reg" data-theme="${v}"><span>${n}</span><span class="radio ${reglages.theme === v ? "on" : ""}"></span></button>`).join("")}</div></div>`);
}
function ouvrirSupports() {
  if ($("voile").querySelector(".supports")?.contains(document.activeElement)) return;
  ouvrirVoile("supports", estPC() ? "centre" : "plein", `<div class="fenetre regl supports" role="dialog" aria-label="Supports">
    <div class="fhd"><button class="btn-icone" data-action="fermer" aria-label="Retour">${ic("retour")}</button><h2>Supports</h2></div>
    <div class="groupe">${donnees.supports.map((s, i) => `<div class="reg ligne-sup"><input value="${echapper(s)}" data-sup="${i}" aria-label="Support"><button class="btn-icone" data-suppr-sup="${i}" aria-label="Supprimer">${ic("poubelle")}</button></div>`).join("")}</div>
    <button class="btn" data-action="ajout-support">${ic("plus", "s")}Ajouter</button></div>`);
}

// --- Menus flottants (statut, tri, tags, ⋯, menu du titre) ---
let menu = null;   // { el, items, choisir, ancre }
function ouvrirMenu(ancre, items, choisir, { classe = "" } = {}) {
  fermerMenu(true);
  const el = $("menu");
  el.className = "menu-flottant " + classe;
  el.innerHTML = items.map((it, i) => it.titre ? `<div class="m-titre">${echapper(it.titre)}</div>` :
    `<button data-m="${i}" class="${it.coche ? "coche" : ""} ${it.danger ? "danger" : ""}">${it.html || echapper(it.nom)}${it.coche ? ic("ok", "m-ok") : ""}</button>`).join("");
  el.hidden = false;
  // Placé sous le bouton, sans dépasser de l'écran.
  // (si la page entière était agrandie avec un « zoom », les positions mesurées seraient déjà
  //  agrandies : on les divise par ce zoom ; aujourd'hui seul #appli est zoomé, pas les menus)
  const z = parseFloat(getComputedStyle(document.body).zoom) || 1;
  const r = ancre.getBoundingClientRect();
  const l = el.offsetWidth * z, h = el.offsetHeight * z;
  let x = Math.max(8, Math.min(r.left, innerWidth - l - 8)), y = r.bottom + 6;
  if (y + h > innerHeight - 8) y = Math.max(8, r.top - h - 6);
  el.style.left = x / z + "px"; el.style.top = y / z + "px";
  el.style.transformOrigin = `${(r.left - x) / z + 20}px ${y > r.top ? 0 : h / z}px`;
  menu = { el, items, choisir, ancre };
  animer(el, [{ opacity: 0, transform: "scale(.92) translateY(-4px)" }, { opacity: 1, transform: "none" }], { duration: 220, easing: DOUX });
  [...el.querySelectorAll("button")].forEach((b, i) => animer(b, [{ opacity: 0, transform: "translateX(-6px)" }, { opacity: 1, transform: "none" }], { duration: 220, delay: 30 + i * 30, easing: DOUX, fill: "backwards" }));
}
function fermerMenu(tout_de_suite) {
  if (!menu) return;
  const el = menu.el;
  menu = null;
  document.querySelector(".dtitre")?.classList.remove("ouvert");
  if (tout_de_suite || !animOK()) { el.hidden = true; return; }
  const a = animer(el, [{ opacity: 1 }, { opacity: 0, transform: "scale(.96)" }], { duration: 130, easing: "ease-in" });
  setTimeout(() => { if (!menu) el.hidden = true; }, a ? 120 : 0);
}

// ---------- PC : tailles (curseurs) et largeurs (bords à glisser) ----------
// « Texte » = zoom de l'écran de l'appli (texte, boutons, espaces).
// « Jaquettes » = taille des affiches ; on la divise par le zoom du texte pour qu'elle n'en dépende pas.
function appliquerTailles() {
  const r = document.documentElement.style;
  r.setProperty("--zt", reglages.texte);
  r.setProperty("--jq", reglages.jaquettes / reglages.texte);
  if (reglages.largCote) r.setProperty("--larg-cote", reglages.largCote + "px"); else r.removeProperty("--larg-cote");
  if (reglages.largPanneau) r.setProperty("--larg-panneau", reglages.largPanneau + "px"); else r.removeProperty("--larg-panneau");
  poserTraitStatut(); poserPastilleVues();
}
// Bords à attraper : barre de gauche, panneau de la fiche, colonnes du tableau.
// Double-clic sur un bord = largeur de départ.
const BORNES = { cote: [150, 380], panneau: [280, 720], col: [36, 600] };
let redim = null;
document.addEventListener("pointerdown", e => {
  const h = e.target.closest(".redim, .redim-col");
  if (!h || !estPC() || e.button > 0) return;
  e.preventDefault();
  const type = h.dataset.redim || "col";
  const el = type === "cote" ? $("cote") : type === "panneau" ? $("panneau") : document.querySelector(`.tableau col[data-col="${h.dataset.col}"]`);
  if (!el) return;
  redim = { type, h, el, x0: e.clientX, depart: type === "col" ? parseFloat(el.style.width) : el.offsetWidth, w: null, col: h.dataset.col };
  h.classList.add("actif"); document.body.classList.add("redim-en-cours");
  try { h.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
});
document.addEventListener("pointermove", e => {
  if (!redim) return;
  const dx = (e.clientX - redim.x0) / reglages.texte;   // le zoom du texte agrandit aussi les mouvements
  const [mini, maxi] = BORNES[redim.type];
  const w = Math.round(Math.max(mini, Math.min(maxi, redim.depart + (redim.type === "panneau" ? -dx : dx))));
  redim.w = w;
  if (redim.type === "cote") document.documentElement.style.setProperty("--larg-cote", w + "px");
  else if (redim.type === "panneau") document.documentElement.style.setProperty("--larg-panneau", w + "px");
  else {
    redim.el.style.width = w + "px";
    // la largeur minimale du tableau suit (titre ≥ 160 px)
    const t = redim.el.closest("table");
    const fixe = [...t.querySelectorAll("col")].reduce((s, c) => s + (parseFloat(c.style.width) || 0), 0);
    t.style.minWidth = fixe + 160 + "px";
  }
  poserTraitStatut(); poserPastilleVues();
});
document.addEventListener("pointerup", () => {
  if (!redim) return;
  const r = redim; redim = null;
  r.h.classList.remove("actif"); document.body.classList.remove("redim-en-cours");
  if (r.w === null) return;
  if (r.type === "cote") changerReglage("largCote", r.w);
  else if (r.type === "panneau") changerReglage("largPanneau", r.w);
  else { reglages.colonnes[r.col] = r.w; changerReglage("colonnes", reglages.colonnes); }
});
document.addEventListener("dblclick", e => {
  const h = e.target.closest(".redim, .redim-col");
  if (!h) return;
  const type = h.dataset.redim || "col";
  if (type === "cote") changerReglage("largCote", null);
  else if (type === "panneau") changerReglage("largPanneau", null);
  else { delete reglages.colonnes[h.dataset.col]; changerReglage("colonnes", reglages.colonnes); rendreContenu(); }
  appliquerTailles();
});

// ---------- 8. Gestes et animations ----------

// Changer de page (À voir / En cours / Vus) : la liste glisse, le titre change avec un petit fondu
function allerPage(n, { glisse = false } = {}) {
  n = Math.max(0, Math.min(2, n));
  const dir = Math.sign(n - ui.page) || 1, change = n !== ui.page;
  ui.page = n; changerReglage("page", n);
  if (change) vibrer();
  if (vueActuelle() === "tab") { rendreEntete(); rendreTableau(); return; }
  const piste = $("piste");
  if (piste) {
    piste.style.transition = animOK() ? `transform .42s ${DOUX}` : "none";
    piste.style.transform = `translateX(${-n * 100 / 3}%)`;
  }
  // En-tête
  const mot = document.querySelector(".dmot"), titre = $("dtitre");
  if (mot && change) {
    animer(mot, [{ transform: "none", opacity: 1 }, { transform: `translateX(${-dir * 16}px)`, opacity: 0 }], { duration: 130, easing: "ease-in" });
    setTimeout(() => {
      mot.textContent = nomPage(n, ui.type); titre.style.color = couleurPage(n);
      animer(mot, [{ transform: `translateX(${dir * 16}px)`, opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 260, easing: DOUX });
    }, animOK() ? 130 : 0);
  }
  document.querySelectorAll(".points i").forEach((p, i) => p.classList.toggle("on", i === n));
  document.querySelectorAll(".statuts .st").forEach((s, i) => s.classList.toggle("on", i === n));
  poserTraitStatut();
  // Les lignes de la nouvelle page arrivent en cascade
  if (change && piste) cascade(piste.children[n]);
}
function cascade(page) {
  if (!page || !animOK()) return;
  [...page.querySelectorAll(".it, .mc")].slice(0, 14).forEach((el, i) =>
    animer(el, [{ transform: "translateY(8px)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 300, delay: 40 + i * 22, easing: DOUX, fill: "backwards" }));
}
function changerType(t) {
  if (t === ui.type && !adresse.frise) return;
  ui.type = t; changerReglage("type", t);
  ui.filtres.clear();
  vibrer();
  if (adresse.frise || adresse.fiche) { location.hash = ""; return; }   // le routeur redessine
  rendreTout();
  const p = $("piste"); if (p) cascade(p.children[ui.page]);
  const og = document.querySelector("#onglets .og.on .ic");
  animer(og, [{ transform: "none" }, { transform: "translateY(-4px)", offset: .4 }, { transform: "none" }], { duration: 420, easing: RESSORT });
}

// Glisser la liste du doigt (téléphone) : la page suit le doigt, puis se cale
let glisse = null;   // { x0, y0, dx, t0, actif }
$("contenu").addEventListener("pointerdown", e => {
  if (estPC() || !$("piste") || e.button > 0) return;
  glisse = { x0: e.clientX, y0: e.clientY, dx: 0, t0: performance.now(), actif: false, id: e.pointerId };
});
$("contenu").addEventListener("pointermove", e => {
  if (!glisse) return;
  const dx = e.clientX - glisse.x0, dy = e.clientY - glisse.y0;
  if (!glisse.actif) {
    if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { glisse = null; return; }  // défilement vertical
    if (Math.abs(dx) < 10) return;
    glisse.actif = true;
    try { $("contenu").setPointerCapture(glisse.id); } catch (err) { /* rien */ }
  }
  let d = dx;
  if ((ui.page === 0 && d > 0) || (ui.page === 2 && d < 0)) d *= .3;   // élastique aux bords
  glisse.dx = d;
  const p = $("piste");
  p.style.transition = "none";
  p.style.transform = `translateX(calc(${-ui.page * 100 / 3}% + ${d}px))`;
});
function finGlisse() {
  if (!glisse) return;
  const g = glisse; glisse = null;
  if (!g.actif) return;
  bloquerClic = true; setTimeout(() => { bloquerClic = false; }, 60);
  const vite = Math.abs(g.dx) / (performance.now() - g.t0) > .5;
  const n = (Math.abs(g.dx) > $("contenu").clientWidth * .22 || (vite && Math.abs(g.dx) > 24)) ? ui.page - Math.sign(g.dx) : ui.page;
  allerPage(n, { glisse: true });
  if (n === ui.page) { const p = $("piste"); p.style.transition = `transform .35s ${DOUX}`; p.style.transform = `translateX(${-ui.page * 100 / 3}%)`; }
}
$("contenu").addEventListener("pointerup", finGlisse);
$("contenu").addEventListener("pointercancel", finGlisse);
let bloquerClic = false;   // un glisser ne doit pas ouvrir la fiche touchée au départ

// Menu du titre (téléphone) : toucher = ouvrir ; appuyer, glisser vers le choix, lâcher = choisir
let appuiTitre = null;
function menuTitre(ancre) {
  ancre.classList.add("ouvert");
  ouvrirMenu(ancre, PAGES.map((p, i) => ({
    html: `<i class="dot" style="background:${couleurPage(i)}"></i><span>${nomPage(i, ui.type)}<small>${["+ en réserve", "", "+ abandonnés"][i]}</small></span>`, coche: i === ui.page
  })), i => allerPage(i), { classe: "menu-titre" });
}
document.addEventListener("pointerdown", e => {
  const t = e.target.closest("#dtitre");
  if (!t) return;
  appuiTitre = { x: e.clientX, y: e.clientY, etaitOuvert: !!menu && menu.ancre === t, bouge: false, survol: -1 };
  if (!appuiTitre.etaitOuvert) menuTitre(t);
  try { t.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
});
document.addEventListener("pointermove", e => {
  if (!appuiTitre || !menu) return;
  if (Math.hypot(e.clientX - appuiTitre.x, e.clientY - appuiTitre.y) > 6) appuiTitre.bouge = true;
  const boutons = [...menu.el.querySelectorAll("button")];
  const n = boutons.findIndex(b => { const r = b.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; });
  if (n !== appuiTitre.survol) { appuiTitre.survol = n; boutons.forEach((b, i) => b.classList.toggle("survol", i === n)); if (n >= 0) vibrer(); }
});
document.addEventListener("pointerup", () => {
  if (!appuiTitre) return;
  const a = appuiTitre; appuiTitre = null;
  bloquerClic = true; setTimeout(() => { bloquerClic = false; }, 60);
  if (a.bouge) { if (a.survol >= 0) { const m = menu; fermerMenu(); m.choisir(a.survol); } else fermerMenu(); }
  else if (a.etaitOuvert) fermerMenu();
});

// ---------- 9. Clics, saisie, clavier ----------

// Message en bas de l'écran pendant 5 secondes, avec un bouton optionnel (« Annuler »…)
let minuteurToast = null, actionToast = null;
function afficherToast(texte, action = null, libelle = "Annuler") {
  $("toast-texte").textContent = texte;
  $("toast-annuler").textContent = libelle;
  $("toast-annuler").hidden = !action;
  actionToast = action;
  $("toast").hidden = false;
  animer($("toast"), [{ opacity: 0, transform: "translate(-50%, 10px)" }, { opacity: 1, transform: "translate(-50%, 0)" }], { duration: 220, easing: DOUX });
  clearTimeout(minuteurToast);
  minuteurToast = setTimeout(() => { $("toast").hidden = true; actionToast = null; }, 5000);
}
$("toast-annuler").addEventListener("click", () => { const a = actionToast; $("toast").hidden = true; actionToast = null; if (a) a(); });

// La fiche ouverte (et ses modifications)
const ficheOuverte = () => adresse.fiche ? medias.get(adresse.fiche) : null;
function majFiche(m, modif) {
  modif(m);
  ecrireMedia(m);
  rendreFiche();
  rendreContenu();
}
function changerStatut(m, s) {
  const avant = m.statut;
  if (s === avant) return;
  majFiche(m, x => {
    x.statut = s;
    if (s === "encours" && !x.debut) x.debut = moisActuel();
  });
  // Passé en « Fini » : proposer d'ajouter la date d'aujourd'hui
  if (s === "fini" && !m.passages.some(p => p.startsWith(moisActuel()))) {
    afficherToast(`${nomStatut(s, m.type)} : ajouter ${NOMS_MOIS[new Date().getMonth()]} ?`, () => ajouterPassage(m, moisActuel()), "Ajouter");
  }
}
function ajouterPassage(m, date) {
  majFiche(m, x => {
    x.passages = [...x.passages, date].filter((p, i, t) => t.indexOf(p) === i).sort((a, b) => valeurDate(a) - valeurDate(b));
    x.revoir = false;
    if (x.statut !== "fini" && x.statut !== "abandon") x.statut = "fini";
  });
}

// Un seul « écouteur » pour tous les clics : on regarde ce qui a été touché
document.addEventListener("click", e => {
  if (bloquerClic) { e.preventDefault(); return; }
  // Menu flottant
  if (menu) {
    const b = e.target.closest("#menu button");
    if (b) { const m = menu; fermerMenu(); m.choisir(+b.dataset.m); return; }
    if (!e.target.closest("#dtitre")) { fermerMenu(); return; }
  }
  const el = e.target.closest("button, [data-fiche], td[data-col], .points i");
  if (!el) {
    if (e.target === $("voile") || e.target === $("voile2")) retour();   // toucher le fond sombre ferme la fenêtre
    return;
  }
  const d = el.dataset;
  const m = ficheOuverte();

  if (el.matches(".points i")) { allerPage(+d.page); return; }
  if (d.aller) { aller(d.aller); return; }
  if (d.fiche && !el.closest("#voile")) {
    if (adresse.fiche === d.fiche) return;
    // Sur PC, passer d'une fiche à l'autre ne remplit pas l'historique
    if (estPC() && adresse.fiche) location.replace("#" + adresseFiche(d.fiche)); else aller(adresseFiche(d.fiche));
    return;
  }
  if (d.fiche) { retour(); setTimeout(() => aller(adresseFiche(d.fiche)), 30); return; }
  if (d.type) { changerType(d.type); return; }
  if (d.page !== undefined && el.matches(".st")) { allerPage(+d.page); return; }
  if (d.vue) {
    reglages.vues[ui.type] = d.vue; changerReglage("vues", reglages.vues);
    document.querySelectorAll(".vues button").forEach(b => b.classList.toggle("on", b === el));
    rendreOutils(); rendreContenu();
    animer(document.querySelector(`.vues button[data-vue="${d.vue}"] .ic`), [{ transform: "scale(.7)" }, { transform: "scale(1.2)", offset: .55 }, { transform: "none" }], { duration: 380 });
    cascade($("piste")?.children[ui.page]);
    return;
  }
  if (d.frise) { changerReglage("frise", d.frise); rendreEntete(); rendreContenu(); return; }
  if (d.friseType) {
    if (ui.friseTypes.has(d.friseType)) ui.friseTypes.delete(d.friseType); else ui.friseTypes.add(d.friseType);
    rendreOutils(); rendreContenu(); return;
  }

  switch (d.action) {
    case "ajouter": aller("ajout"); return;
    case "fermer": retour(); return;
    case "fermer-fiche": retour(); return;
    case "frise": if (!adresse.frise) aller("frise"); return;
    case "fermer-frise": retour(); return;
    case "recherche":
      rechercheTelOuverte = true; $("cherche-tel").hidden = false; $("recherche-tel").focus(); return;
    case "fermer-recherche":
      rechercheTelOuverte = false; ui.recherche = ""; $("recherche-tel").value = ""; $("cherche-tel").hidden = true; rendreContenu(); return;
    case "menu-tri":
      ouvrirMenu(el, TRIS.map(t => ({ nom: t.nom, coche: (reglages.tris[ui.type] || "ajout") === t.id })), i => {
        reglages.tris[ui.type] = TRIS[i].id; changerReglage("tris", reglages.tris); rendreOutils(); rendreContenu();
      });
      return;
    case "menu-tags": {
      const duType = [...medias.values()].filter(x => x.type === ui.type);
      const tags = [...new Set(duType.flatMap(x => x.tags))].sort((a, b) => a.localeCompare(b, "fr"));
      const genres = [...new Set(duType.flatMap(x => x.genres))].sort((a, b) => a.localeCompare(b, "fr"));
      const items = [{ nom: "Tout afficher", coche: !ui.filtres.size, cle: "" },
        ...(tags.length ? [{ titre: "Mes tags" }] : []), ...tags.map(t => ({ nom: t, cle: "t:" + t, coche: ui.filtres.has("t:" + t) })),
        ...(genres.length ? [{ titre: "Genres" }] : []), ...genres.map(g => ({ nom: g, cle: "g:" + g, coche: ui.filtres.has("g:" + g) }))];
      ouvrirMenu(el, items, i => {
        const c = items[i].cle;
        if (!c) ui.filtres.clear(); else if (ui.filtres.has(c)) ui.filtres.delete(c); else ui.filtres.add(c);
        rendreOutils(); rendreContenu();
      }, { classe: "menu-long" });
      return;
    }
    // --- Fiche ---
    case "menu-fiche":
      if (!m) return;
      ouvrirMenu(el, [{ html: `${ic("crayon", "s")}Modifier` }, { html: `${ic("poubelle", "s")}Supprimer`, danger: true }], i => {
        if (i === 0) location.replace("#modifier=" + m.id);
        else {
          effacerMedias([m.id]);
          retour();
          afficherToast("Fiche supprimée", () => { ecrireMedia(m); rafraichir(); });
        }
      });
      return;
    case "menu-statut":
      if (!m) return;
      ouvrirMenu(el, STATUTS.map(s => ({ html: `<i class="dot" style="background:var(--st-${s})"></i>${nomStatut(s, m.type)}`, coche: s === m.statut })), i => changerStatut(m, STATUTS[i]));
      return;
    case "coeur":
      if (!m) return;
      majFiche(m, x => { x.coeur = !x.coeur; });
      if (m.coeur) eclatsCoeur(document.querySelectorAll(".coeur-btn.on"));
      return;
    case "revoir": if (m) { majFiche(m, x => { x.revoir = !x.revoir; }); etirer(); } return;
    case "saisons": if (m) majFiche(m, x => { x.saisons.actif = !x.saisons.actif; if (x.saisons.actif && !x.saisons.total) x.saisons.total = 1; }); return;
    case "saison-plus": if (m) majFiche(m, x => { x.saisons.total++; }); return;
    case "saison-moins": if (m) majFiche(m, x => { x.saisons.total = Math.max(0, x.saisons.total - 1); x.saisons.vues = x.saisons.vues.filter(n => n <= x.saisons.total); }); return;
    case "ajout-passage":
      ui.ajoutPassage = !ui.ajoutPassage; rendreFiche();
      if (ui.ajoutPassage) { const f = document.querySelector(".pas-form"); f?.scrollIntoView({ block: "nearest", behavior: animOK() ? "smooth" : "auto" }); animer(f, [{ opacity: 0, transform: "translateY(-6px)" }, { opacity: 1, transform: "none" }], { duration: 220, easing: DOUX }); }
      return;
    case "valider-passage": {
      if (!m) return;
      let date = "";
      if (ui.precision === "jour") date = $("pas-jour").value;
      else if (ui.precision === "mois") date = $("pas-mois").value;
      else if (ui.precision === "saison") date = `${$("pas-an").value}-${$("pas-saison").value}`;
      else date = String($("pas-an").value);
      if (!dateValide(date)) { afficherToast("Date incomplète"); return; }
      ui.ajoutPassage = false;
      ajouterPassage(m, date);
      const chips = document.querySelectorAll(".passages .chip:not(.plus)");
      animer(chips[m.passages.indexOf(date)], [{ transform: "scale(.4)", opacity: 0 }, { transform: "scale(1.12)", offset: .6 }, { transform: "none", opacity: 1 }], { duration: 380 });
      return;
    }
    case "debut":
      if (!m) return;
      ouvrirMenu(el, [{ html: `${ic("poubelle", "s")}Enlever la date de début`, danger: true }], () => majFiche(m, x => { x.debut = ""; }));
      return;
    // --- Ajouter ---
    case "choisir-image": $("mo-fichier").click(); return;
    // --- Choisir l'affiche ---
    case "choisir-affiche": if (m) aller(adresseFiche(m.id) + "&affiche"); return;
    case "aff-fichier": $("aff-fichier").click(); return;
    case "aff-lien": $("aff-lien").hidden = false; $("aff-url").focus(); return;
    case "aff-url-ok": {
      const url = lienValide($("aff-url").value);
      if (!url) { afficherToast("Adresse d'image invalide"); return; }
      if (m) appliquerAffiche(m, { image: url });
      return;
    }
    case "chercher-affiche": chercherAffiche(); return;
    case "enregistrer-modif": enregistrerModif(); return;
    // --- Réglages ---
    case "deconnexion":
      if (confirm("Se déconnecter ? Tes fiches restent en sécurité dans ton compte.")) signOut(auth).then(() => location.reload());
      return;
    case "largeurs":
      changerReglage("largCote", null); changerReglage("largPanneau", null); changerReglage("colonnes", {});
      appliquerTailles(); rendreContenu();
      afficherToast("Largeurs remises comme au départ");
      return;
    case "notes": NotesIdees.ouvrir(donnees.idees, texte => { donnees.idees = texte; sauverDonnees(); }); return;
    case "export": exporterExcel(); return;
    case "import": $("fichier-import").click(); return;
    case "test-charger": chargerTest(); return;
    case "test-effacer": effacerTest(); return;
    case "ajout-support":
      donnees.supports.push("Nouveau"); sauverDonnees(); ouvrirSupports();
      { const champs = document.querySelectorAll("[data-sup]"); champs[champs.length - 1]?.select(); }
      return;
  }

  if (d.note && m) {
    const n = +d.note === m.note ? 0 : +d.note;   // retoucher la même étoile l'enlève
    majFiche(m, x => { x.note = n; });
    document.querySelectorAll(".note .et.on").forEach((s, i) => animer(s, [{ transform: "scale(1)" }, { transform: "scale(1.4)", offset: .45 }, { transform: "scale(1)" }], { duration: 360, delay: i * 45 }));
    return;
  }
  if (d.precision) { ui.precision = d.precision; rendreFiche(); return; }
  if (d.aff !== undefined && affChoix && m) { const a = affChoix.liste[+d.aff]; if (a) appliquerAffiche(m, { image: a.image }); return; }
  if (d.moRes !== undefined && brouillon?.affiches) {
    const r = brouillon.affiches[+d.moRes];
    $("mo-image").value = r.image;
    delete brouillon.miniatureChoisie;
    $("mo-apercu").innerHTML = vignette({ titre: $("mo-titre").value, image: r.image, miniature: "" }, "mo-aff");
    document.querySelectorAll(".mo-choix").forEach(b => b.classList.toggle("on", b === el));
    return;
  }
  if (d.passage !== undefined && m) {
    const k = +d.passage, date = m.passages[k];
    ouvrirMenu(el, [{ html: `${ic("poubelle", "s")}Enlever ${echapper(texteDate(date))}`, danger: true }], () => {
      majFiche(m, x => { x.passages = x.passages.filter((_, i) => i !== k); });
      afficherToast("Date enlevée", () => ajouterPassage(m, date));
    });
    return;
  }
  if (d.saison && m) {
    const n = +d.saison;
    majFiche(m, x => {
      // Toucher une saison : elle (et celles d'avant) deviennent vues ; retoucher la dernière vue l'enlève
      const vues = new Set(x.saisons.vues);
      if (vues.has(n) && !vues.has(n + 1)) vues.delete(n); else for (let k = 1; k <= n; k++) vues.add(k);
      x.saisons.vues = [...vues].sort((a, b) => a - b);
    });
    return;
  }
  if (d.supprTag && m) { majFiche(m, x => { x.tags = x.tags.filter(t => t !== d.supprTag); }); return; }
  // Ajouter
  if (d.ajType) { aj.type = d.ajType; majAjout(); lancerRecherche(); return; }
  if (d.statut && d.ajManuel !== undefined && aj) {
    const t = aj.texte.trim(); if (t) ajouterAvecStatut({ titre: t }, aj.type, d.statut, el);
    return;
  }
  if (d.statut && d.ajRes !== undefined && aj) {
    const r = aj.resultats[+d.ajRes]; if (r) ajouterAvecStatut(r, aj.type, d.statut, el);
    return;
  }
  if (d.statut && d.vaRes !== undefined) {
    const v = vaCache.get(adresse.fiche), m2 = ficheOuverte();
    const r = v && m2 && v[ui.vaOnglet]?.[+d.vaRes];
    if (r) ajouterAvecStatut(r, m2.type, d.statut, el);
    return;
  }
  if (d.va) { ui.vaOnglet = d.va; majVoirAussi(); return; }
  // Réglages
  if (d.accent && el.closest(".accents")) {
    changerReglage("accent", d.accent); document.documentElement.dataset.accent = d.accent;
    document.querySelectorAll(".pastille-acc").forEach(b => b.setAttribute("aria-pressed", b === el));
    return;
  }
  if (d.valeur && el.closest("[data-reglage]")) {
    const nom = el.closest("[data-reglage]").dataset.reglage;
    changerReglage(nom, d.valeur);
    el.closest(".seg").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b === el));
    if (nom === "police") document.documentElement.dataset.police = d.valeur;
    if (nom === "onglets") { document.documentElement.dataset.onglets = d.valeur; requestAnimationFrame(poserPlaquetteOnglets); }
    if (nom === "animations") document.documentElement.dataset.anim = d.valeur;
    if (nom === "frise" && adresse.frise) { rendreEntete(); rendreContenu(); }
    return;
  }
  if (d.theme) {
    changerReglage("theme", d.theme); window.appliquerTheme(d.theme);
    document.querySelectorAll("[data-theme] .radio").forEach(r => r.classList.toggle("on", r.closest("[data-theme]") === el));
    return;
  }
  if (d.supprSup !== undefined) {
    const i = +d.supprSup, nom = donnees.supports[i];
    donnees.supports.splice(i, 1); sauverDonnees(); ouvrirSupports();
    afficherToast(`« ${nom} » supprimé`, () => { donnees.supports.splice(i, 0, nom); sauverDonnees(); if (adresse.fenetre === "supports") ouvrirSupports(); });
    return;
  }
  // Tableau (PC) : clic sur une case = la modifier
  if (el.matches("td[data-col]")) { cliqueCase(el); return; }
});
// Le fond (listes) se met à jour derrière la fenêtre d'ajout
function rafraichirFond() { rendreContenu(); }

// Petits effets : éclats autour du cœur, interrupteur qui s'étire
function eclatsCoeur(boutons) {
  if (!animOK()) return;
  boutons.forEach(b => {
    animer(b, [{ transform: "scale(.6)" }, { transform: "scale(1.3)", offset: .55 }, { transform: "none" }], { duration: 420, easing: "ease-out" });
    for (let k = 0; k < 6; k++) {
      const p = document.createElement("i"); p.className = "eclat"; b.appendChild(p);
      const a = k * Math.PI / 3;
      const an = animer(p, [{ transform: "translate(0,0) scale(1)", opacity: 1 }, { transform: `translate(${Math.cos(a) * 20}px,${Math.sin(a) * 20}px) scale(.3)`, opacity: 0 }], { duration: 460, easing: "cubic-bezier(.2,.8,.3,1)" });
      setTimeout(() => p.remove(), 520);
    }
  });
}
function etirer() {
  document.querySelectorAll('.tog[data-action="revoir"]').forEach(t => { t.classList.add("etire"); setTimeout(() => t.classList.remove("etire"), 180); });
}

// Saisie : recherche, ajout, fiche (tags, avis, support), supports, nouveau titre du tableau
let rechercheTelOuverte = false;
let minuteurAvis = null;
document.addEventListener("input", e => {
  const t = e.target;
  if (t.id === "recherche-pc" || t.id === "recherche-tel") { ui.recherche = t.value; rendreContenu(); return; }
  // Curseurs Texte / Jaquettes (PC) : l'écran change pendant qu'on fait glisser
  if (t.dataset.curseur) {
    changerReglage(t.dataset.curseur, +t.value);
    t.nextElementSibling.textContent = Math.round(+t.value * 100) + " %";
    appliquerTailles();
    return;
  }
  if (t.id === "aj-texte" && aj) { aj.texte = t.value; lancerRecherche(); return; }
  if (t.dataset.champ === "avis") {
    const m = ficheOuverte(); if (!m) return;
    clearTimeout(minuteurAvis);
    minuteurAvis = setTimeout(() => { m.avis = t.value; ecrireMedia(m); }, 600);
    return;
  }
  if (t.id === "mo-image") {
    const url = lienValide(t.value);
    delete brouillon.miniatureChoisie;
    $("mo-apercu").innerHTML = vignette({ titre: $("mo-titre").value || brouillon.titre, image: url, miniature: "" }, "mo-aff");
  }
});
document.addEventListener("change", async e => {
  const t = e.target, m = ficheOuverte();
  // Tableau : une liste déroulante enregistre dès qu'on change le choix
  if (caseEnCours && t.tagName === "SELECT" && t.parentElement === caseEnCours.td) { validerCase(); return; }
  if (t.dataset.champ === "support" && m) {
    let v = t.value;
    if (v === "__autre") {
      v = (prompt("Nouveau support (ex. Crunchyroll, Game Pass…)") || "").trim();
      if (v && !donnees.supports.includes(v)) { donnees.supports.push(v); sauverDonnees(); }
    }
    majFiche(m, x => { x.support = v === "__autre" ? x.support : v; });
    return;
  }
  if (t.dataset.champ === "tag" && m) { ajouterTag(m, t.value); return; }
  if (t.dataset.champ === "avis" && m) { clearTimeout(minuteurAvis); m.avis = t.value; ecrireMedia(m); return; }
  if (t.dataset.sup !== undefined) {
    const v = t.value.trim();
    if (v) { donnees.supports[+t.dataset.sup] = v; sauverDonnees(); }
    return;
  }
  if (t.id === "aff-fichier") {
    const f = t.files[0]; t.value = "";
    if (!f || !m) return;
    try { appliquerAffiche(m, { miniature: await reduireFichier(f) }); }
    catch (err) { afficherToast("Image illisible"); }
    return;
  }
  if (t.id === "mo-fichier") {
    const f = t.files[0]; t.value = "";
    if (!f) return;
    try {
      brouillon.miniatureChoisie = await reduireFichier(f);
      $("mo-image").value = "";
      $("mo-apercu").innerHTML = vignette({ titre: brouillon.titre, miniature: brouillon.miniatureChoisie, image: "" }, "mo-aff");
    } catch (err) { afficherToast("Image illisible"); }
    return;
  }
  if (t.id === "fichier-import") { importerExcel(t); return; }
});
function ajouterTag(m, valeur) {
  const v = String(valeur || "").trim().slice(0, 40);
  if (!v || m.tags.includes(v)) return;
  majFiche(m, x => { x.tags = [...x.tags, v]; });
  document.querySelector('[data-champ="tag"]')?.focus();
}

// Tableau (PC) : modifier directement dans les cases
let caseEnCours = null;
function cliqueCase(td) {
  const id = td.closest("tr").dataset.id, m = medias.get(id), col = td.dataset.col;
  if (!m) return;
  if (col === "vg" || col === "vu") { aller(adresseFiche(id)); return; }
  if (col === "coeur") { m.coeur = !m.coeur; ecrireMedia(m); td.classList.toggle("on", m.coeur); if (m.coeur) eclatsCoeur([td]); rendreFiche({ doux: true }); return; }
  if (caseEnCours?.td === td) return;
  validerCase();
  tableauEnEdition = true;
  let champ;
  if (col === "statut") champ = `<select>${STATUTS.map(s => `<option value="${s}" ${s === m.statut ? "selected" : ""}>${nomStatut(s, m.type)}</option>`).join("")}</select>`;
  else if (col === "note") champ = `<select>${[0, 1, 2, 3, 4, 5].map(n => `<option value="${n}" ${n === m.note ? "selected" : ""}>${n ? "★".repeat(n) : "—"}</option>`).join("")}</select>`;
  else if (col === "support") champ = `<select><option value="">—</option>${[...new Set([...donnees.supports, m.support].filter(Boolean))].map(s => `<option ${s === m.support ? "selected" : ""}>${echapper(s)}</option>`).join("")}</select>`;
  else champ = `<input value="${echapper(col === "titre" ? m.titre : col === "annee" ? (m.annee || "") : m.tags.join(", "))}" ${col === "annee" ? 'type="number"' : ""} autocomplete="off">`;
  caseEnCours = { td, id, col, html: td.innerHTML };
  td.classList.add("edit");
  td.innerHTML = champ;
  const c = td.firstChild; c.focus(); c.select?.();
}
function validerCase(annuler = false) {
  if (!caseEnCours) return;
  const { td, id, col, html } = caseEnCours;
  caseEnCours = null;
  const m = medias.get(id), c = td.firstChild;
  if (m && !annuler && c) {
    const v = c.value;
    if (col === "titre" && v.trim()) m.titre = v.trim();
    if (col === "annee") m.annee = +v > 0 ? Math.round(+v) : null;
    if (col === "statut" && STATUTS.includes(v) && v !== m.statut) { m.statut = v; if (v === "encours" && !m.debut) m.debut = moisActuel(); }
    if (col === "note" && +v >= 0 && +v <= 5) m.note = +v;
    if (col === "support") m.support = v;
    if (col === "tags") m.tags = [...new Set(v.split(",").map(x => x.trim()).filter(Boolean))];
    ecrireMedia(m);
  }
  tableauEnEdition = false;
  td.classList.remove("edit");
  if (annuler) td.innerHTML = html;
  setTimeout(() => { if (!caseEnCours) { rendreTableau(); rendreFiche({ doux: true }); } }, 0);
}
document.addEventListener("focusout", e => {
  if (caseEnCours && e.target.parentElement === caseEnCours.td) setTimeout(() => { if (caseEnCours && !caseEnCours.td.contains(document.activeElement)) validerCase(); }, 0);
});

// Clavier : Ctrl+K recherche, Échap ferme, flèches pour passer d'une fiche à l'autre (PC), 0-5 pour noter
document.addEventListener("keydown", e => {
  const t = e.target;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    if (estPC()) { $("recherche-pc")?.focus(); $("recherche-pc")?.select(); } else document.querySelector('[data-action="recherche"]')?.click();
    return;
  }
  if (caseEnCours) {
    if (e.key === "Enter") { e.preventDefault(); validerCase(); }
    else if (e.key === "Escape") { e.preventDefault(); validerCase(true); }
    else if (e.key === "Tab") {
      e.preventDefault();
      const { td } = caseEnCours, tr = td.closest("tr");
      const cases = [...tr.querySelectorAll("td[data-col]")].filter(c => ["titre", "annee", "statut", "note", "support", "tags"].includes(c.dataset.col));
      const suivante = cases[(cases.indexOf(td) + (e.shiftKey ? -1 : 1) + cases.length) % cases.length];
      validerCase();
      setTimeout(() => { const n = document.querySelector(`tr[data-id="${tr.dataset.id}"] td[data-col="${suivante.dataset.col}"]`); if (n) cliqueCase(n); }, 10);
    }
    return;
  }
  if (t.id === "tab-nouveau" && e.key === "Enter") {
    const titre = t.value.trim(); if (!titre) return;
    creerFiche({ titre }, ui.type, ["avoir", "encours", "fini"][ui.page]);
    rendreTableau(); $("tab-nouveau")?.focus();
    return;
  }
  if (t.dataset?.champ === "tag" && e.key === "Enter") { e.preventDefault(); const m = ficheOuverte(); if (m) ajouterTag(m, t.value); return; }
  if (e.key === "Escape") {
    if (menu) { fermerMenu(); return; }
    if (adresse.fenetre || adresse.fiche) { retour(); return; }
  }
  if (/INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
  // PC : flèches haut / bas = fiche précédente / suivante ; 0 à 5 = note
  if (estPC() && adresse.fiche && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
    const { principaux, bas } = contenuPage(ui.page);
    const liste = [...principaux, ...bas];
    const i = liste.findIndex(x => x.id === adresse.fiche);
    const n = liste[i + (e.key === "ArrowDown" ? 1 : -1)];
    if (n) { e.preventDefault(); location.replace("#" + adresseFiche(n.id)); setTimeout(() => document.querySelector(`[data-fiche="${n.id}"]`)?.scrollIntoView({ block: "nearest" }), 30); }
    return;
  }
  if (estPC() && adresse.fiche && /^[0-5]$/.test(e.key)) { const m = ficheOuverte(); if (m) majFiche(m, x => { x.note = +e.key; }); }
});

$("btn-connexion").addEventListener("click", seConnecter);
$("fab").addEventListener("click", () => {
  animer($("fab"), [{ transform: "scale(.88)" }, { transform: "scale(1.06)", offset: .6 }, { transform: "none" }], { duration: 360, easing: "ease-out" });
  aller("ajout");
});
addEventListener("resize", () => { poserPlaquetteOnglets(); poserPastilleVues(); poserTraitStatut(); });

// ---------- 10. Excel et données de test ----------
// Feuille « Médias » (une ligne par fiche, avec une miniature de l'affiche) et feuille « Supports ».
const COLONNES = [
  { header: "Affiche", key: "affiche", width: 7 }, { header: "Type", key: "type", width: 8 },
  { header: "Titre", key: "titre", width: 36 }, { header: "Année", key: "annee", width: 8 },
  { header: "Créateur", key: "createur", width: 24 }, { header: "Statut", key: "statut", width: 12 },
  { header: "À revoir", key: "revoir", width: 9 }, { header: "Note", key: "note", width: 7 },
  { header: "Coup de cœur", key: "coeur", width: 12 }, { header: "Vu", key: "vu", width: 26 },
  { header: "Commencé", key: "debut", width: 14 }, { header: "Support", key: "support", width: 14 },
  { header: "Genres", key: "genres", width: 24 }, { header: "Tags", key: "tags", width: 20 },
  { header: "Saisons", key: "saisons", width: 9 }, { header: "Avis", key: "avis", width: 40 },
  { header: "Image", key: "image", width: 30 }, { header: "Ajouté le", key: "ajoute", width: 12 }, { header: "Test", key: "test", width: 6 }
];
const ouiNon = v => v ? "Oui" : "";
const dateCourte = ms => ms ? new Date(ms - new Date(ms).getTimezoneOffset() * 60000).toISOString().slice(0, 10) : "";
async function exporterExcel() {
  try {
    const ExcelJS = await chargerExcelJS();
    const classeur = new ExcelJS.Workbook();
    classeur.creator = "Médiathèque";
    const ordreType = t => TYPES.findIndex(x => x.id === t);
    const liste = [...medias.values()].sort((a, b) => ordreType(a.type) - ordreType(b.type) || STATUTS.indexOf(a.statut) - STATUTS.indexOf(b.statut) || a.titre.localeCompare(b.titre, "fr"));
    const ws = ajouterFeuille(classeur, "Médias", COLONNES, liste.map(m => ({
      affiche: "", type: typeDe(m.type).un, titre: m.titre, annee: m.annee || "", createur: m.createur,
      statut: nomStatut(m.statut, m.type), revoir: ouiNon(m.revoir), note: m.note || "", coeur: ouiNon(m.coeur),
      vu: m.passages.map(p => texteDate(p)).join(" ; "), debut: texteDate(m.debut), support: m.support,
      genres: m.genres.join(", "), tags: m.tags.join(", "),
      saisons: m.saisons.actif ? `${m.saisons.vues.length}/${m.saisons.total}` : "", avis: m.avis,
      image: m.image, ajoute: dateCourte(m.cree), test: ouiNon(m.test)
    })));
    // Miniatures dans la 1re colonne
    liste.forEach((m, i) => {
      if (!m.miniature) return;
      const id = classeur.addImage({ base64: m.miniature, extension: "jpeg" });
      ws.getRow(i + 2).height = 40;
      ws.addImage(id, { tl: { col: 0.15, row: i + 1.08 }, ext: { width: 34, height: 51 } });
    });
    ws.getColumn("avis").alignment = { wrapText: true, vertical: "middle" };
    ajouterFeuille(classeur, "Supports", [{ header: "Support", key: "s", width: 22 }], donnees.supports.map(s => ({ s })));
    await telechargerClasseur(classeur, NOM_APPLI);
  } catch (err) { afficherToast("Export impossible : " + err.message); }
}
async function importerExcel(champ) {
  const fichier = champ.files[0];
  champ.value = "";
  if (!fichier) return;
  if (!confirm("Remplacer toutes tes fiches par le contenu de ce fichier ?")) return;
  try {
    const classeur = await lireClasseur(fichier);
    const lignes = lireFeuille(classeur.getWorksheet("Médias")).filter(l => l["Titre"]);
    if (!lignes.length) throw new Error("feuille « Médias » introuvable ou vide");
    const supports = lireFeuille(classeur.getWorksheet("Supports")).map(l => l["Support"]).filter(Boolean);
    // Les fiches qui ont le même type et le même titre gardent leur identifiant et leur miniature
    const cle = (type, titre) => type + "|" + simplifier(titre);
    // (deux fiches au même titre restent deux fiches : chacune reprend une ancienne à son tour)
    const anciennes = new Map();
    [...medias.values()].forEach(m => { const k = cle(m.type, m.titre); anciennes.set(k, [...(anciennes.get(k) || []), m]); });
    const reprendre = k => (anciennes.get(k) || []).shift();
    const typeDuTexte = t => (TYPES.find(x => simplifier(x.un) === simplifier(t) || simplifier(x.nom) === simplifier(t)) || TYPES[1]).id;
    const statutDuTexte = (t, type) => STATUTS.find(s => simplifier(nomStatut(s, type)) === simplifier(t))
      || STATUTS.find(s => TYPES.some(x => simplifier(nomStatut(s, x.id)) === simplifier(t))) || "avoir";
    const maintenant = Date.now();
    const nouvelles = lignes.map((l, i) => {
      const type = typeDuTexte(l["Type"]), a = reprendre(cle(type, l["Titre"]));
      const saisons = /^(\d+)\/(\d+)$/.exec(l["Saisons"] || "");
      const ajoute = Date.parse(l["Ajouté le"]);
      return normaliser(a ? a.id : nouvelId(), {
        type, titre: l["Titre"], annee: l["Année"], createur: l["Créateur"], statut: statutDuTexte(l["Statut"], type),
        revoir: simplifier(l["À revoir"]) === "oui", note: l["Note"], coeur: simplifier(l["Coup de cœur"]) === "oui",
        passages: String(l["Vu"] || "").split(";").map(dateDuTexte).filter(Boolean), debut: dateDuTexte(l["Commencé"] || ""),
        support: l["Support"], genres: String(l["Genres"] || "").split(","), tags: String(l["Tags"] || "").split(","),
        avis: l["Avis"], image: l["Image"], miniature: a?.miniature,
        saisons: saisons ? { actif: true, total: +saisons[2], vues: Array.from({ length: +saisons[1] }, (_, k) => k + 1) } : a?.saisons,
        test: simplifier(l["Test"]) === "oui", cree: a?.cree || (isNaN(ajoute) ? maintenant - i : ajoute)
      });
    });
    const avant = [...medias.values()], avantSupports = [...donnees.supports];
    const garder = new Set(nouvelles.map(m => m.id));
    effacerMedias(avant.filter(m => !garder.has(m.id)).map(m => m.id));
    ecrireMedias(nouvelles);
    if (supports.length) { donnees.supports = supports; sauverDonnees(); }
    retour();
    afficherToast(`Import terminé : ${nouvelles.length} fiches`, () => {
      const remises = new Set(avant.map(m => m.id));
      effacerMedias([...medias.keys()].filter(id => !remises.has(id)));
      ecrireMedias(avant);
      donnees.supports = avantSupports; sauverDonnees();
      rafraichir();
    });
    // Les fiches importées sans miniature : on recopie leur affiche en arrière-plan
    copierMiniaturesManquantes(nouvelles.filter(m => m.image && !m.miniature));
  } catch (err) { afficherToast("Import impossible : " + err.message); }
}
async function copierMiniaturesManquantes(liste) {
  for (const m of liste) {
    const mini = await copierImage(m.image);
    const actuelle = medias.get(m.id);
    if (mini && actuelle) { actuelle.miniature = mini; ecrireMedia(actuelle); }
  }
  rafraichir();
}
function chargerTest() {
  if (!confirm("Ajouter 200 fiches de test (50 par type) ? Elles s'effacent en un clic ensuite.")) return;
  const liste = genererDonneesTest(nouvelId);
  ecrireMedias(liste);
  const nouveaux = [...new Set(liste.map(m => m.support).filter(Boolean))].filter(s => !donnees.supports.includes(s));
  if (nouveaux.length) { donnees.supports.push(...nouveaux); sauverDonnees(); }
  retour();
  afficherToast(`${liste.length} fiches de test ajoutées`);
}
function effacerTest() {
  const liste = [...medias.values()].filter(m => m.test);
  if (!liste.length || !confirm(`Effacer les ${liste.length} fiches de test ? Tes vraies fiches ne sont pas touchées.`)) return;
  effacerMedias(liste.map(m => m.id));
  retour();
  afficherToast("Données de test effacées", () => { ecrireMedias(liste); rafraichir(); });
}

// Lien reçu via le menu « Partager » d'Android (…/?title=…&text=…&url=…) : on ouvre « Ajouter »
function lirePartage() {
  const p = new URLSearchParams(location.search);
  if (!p.has("url") && !p.has("text") && !p.has("title")) return;
  const texte = p.get("text") || "";
  const lien = lienValide(p.get("url")) || (texte.match(/https?:\/\/\S+/) || [""])[0];
  const titre = (p.get("title") || texte.replace(lien, "")).replace(/\s+/g, " ").trim().slice(0, 120);
  history.replaceState(null, "", location.pathname + (MODE_DEMO ? "?demo" : ""));
  const attendre = setInterval(() => {
    if (!pret()) return;
    clearInterval(attendre);
    aNavigue = true;
    history.pushState(null, "", "#ajout");
    adresse = lireAdresse();
    fenetreAffichee = "ajout";
    rendreTout();
    ouvrirAjout(titre);
  }, 200);
}

// ---------- 11. Démarrage ----------
// Service worker : ouvrir l'appli sans réseau, l'installer, et la mettre à jour toute seule
let rechargerApres = false;
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then(reg => {
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") reg.update().catch(() => {}); });
  }).catch(() => {});
  const avaitUneVersion = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!avaitUneVersion || rechargerApres) return;
    rechargerApres = true;
    if (!adresse.fenetre && !adresse.fiche) location.reload();
  });
}
majMiseEnPage();
lirePartage();
if (MODE_DEMO) demarrerDemo(); else demarrerFirebase();
