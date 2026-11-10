// =========================================================
// La frise : tout ce que j'ai vu / joué / lu, dans le temps.
// Trois façons de la dessiner (au choix dans Réglages, ou en haut de la frise) :
//   "ligne"  : une ligne au centre, les titres alternent à gauche et à droite
//   "horiz"  : le temps va de gauche à droite, une piste par type,
//              une barre montre la durée (du début à la fin) quand on la connaît
//   "mur"    : une rangée d'affiches par mois, le long d'un fil
//
// Chaque « événement » = un passage (une fois où j'ai vu / joué / lu le titre) :
//   { id, titre, type, mois, precision, debut, note, coeur, fois, vignette }
//   mois      : numéro du mois depuis l'an 0 (année × 12 + mois de 0 à 11)
//   precision : "jour" | "mois" | "saison" | "annee"
//   debut     : numéro du mois de début (ou null)
//   fois      : 1 pour la 1re fois, 2 pour « revu »…
//   vignette  : petit bout de HTML de l'affiche (fourni par app.js)
// =========================================================

export const COULEURS_TYPES = { jeu: "#8A6FD0", film: "#3B82F6", serie: "#D9466F", livre: "#22A06B" };
const NOMS = { jeu: "Jeux", film: "Films", serie: "Séries", livre: "Livres" };
const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const echapper = t => String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const etoiles = n => n ? `<span class="etoiles">${"★".repeat(n)}<i>${"★".repeat(5 - n)}</i></span>` : "";

// Petit texte de date d'un événement : « 12 mars », « mars », « été », « dans l'année »
function quand(e) {
  if (e.precision === "annee") return "dans l'année";
  if (e.precision === "saison") return e.saison || "";
  if (e.precision === "jour") return `${e.jour} ${MOIS[e.mois % 12]}`;
  return MOIS[e.mois % 12];
}
const encore = e => e.fois > 1 ? ` · ${e.fois}e fois` : "";

// ---------- 1. Ligne du temps ----------
function ligne(evs) {
  let an = null, cote = 0, h = "";
  evs.forEach(e => {
    const a = Math.floor(e.mois / 12);
    if (a !== an) { an = a; h += `<div class="fl-an"><b>${a}</b></div>`; }
    h += `<button class="fl-ev ${cote++ % 2 ? "d" : ""}" data-fiche="${e.id}" style="--tc:${COULEURS_TYPES[e.type]}">
      <span class="fl-txt"><span class="fl-quand">${echapper(quand(e))}${encore(e)}</span>
        <span class="fl-titre">${echapper(e.titre)}</span>${etoiles(e.note)}</span>${e.vignette}</button>`;
  });
  return `<div class="f-ligne">${h}</div>`;
}

// ---------- 2. Frise horizontale ----------
function horizontale(evs, larg) {
  const maintenant = new Date(), moisNow = maintenant.getFullYear() * 12 + maintenant.getMonth();
  const tous = evs.flatMap(e => [e.mois, e.debut ?? e.mois]);
  const debut = Math.min(...tous, moisNow) - 1, fin = Math.max(...tous, moisNow) + 1;
  const W = larg;                                          // largeur d'un mois en pixels
  const X = m => (m - debut) * W + W / 2;
  let axe = "", grille = "";
  for (let m = debut; m <= fin; m++) {
    const janvier = m % 12 === 0;
    axe += `<span class="fh-m ${janvier ? "an" : ""}" style="left:${X(m)}px">${janvier ? Math.floor(m / 12) : MOIS[m % 12]}</span>`;
    grille += `<i class="fh-g ${janvier ? "an" : ""}" style="left:${(m - debut) * W}px"></i>`;
  }
  // Dans chaque piste, les titres d'un même mois s'empilent les uns sous les autres
  const types = ["jeu", "film", "serie", "livre"];
  const H = 62;  // hauteur d'un étage (affiche + étoiles)
  const pistes = types.map(t => {
    const liste = evs.filter(e => e.type === t);
    const etage = {};
    const items = liste.map(e => {
      const k = etage[e.mois] = (etage[e.mois] || 0) + 1;
      const y = 10 + (k - 1) * H;
      const barre = e.debut != null && e.debut < e.mois
        ? `<i class="fh-barre" style="--tc:${COULEURS_TYPES[t]};left:${X(e.debut)}px;width:${X(e.mois) - X(e.debut)}px;top:${y + 26}px"></i>` : "";
      return barre + `<button class="fh-ev ${e.precision === "annee" ? "approx" : ""}" data-fiche="${e.id}" title="${echapper(e.titre)}"
        style="left:${X(e.mois) - 18}px;top:${y}px">${e.vignette}${etoiles(e.note)}</button>`;
    }).join("");
    const etages = Math.max(1, ...Object.values(etage));
    return { t, html: items, h: 20 + etages * H };
  });
  const largeur = (fin - debut + 1) * W;
  return `<div class="f-horiz">
    <div class="fh-noms"><div class="fh-tete"></div>${pistes.map(p => `<div class="fh-nom" style="height:${p.h}px"><svg class="ic"><use href="#i-${p.t}"></use></svg><span>${NOMS[p.t]}</span></div>`).join("")}</div>
    <div class="fh-defile"><div class="fh-in" style="width:${largeur}px">
      <div class="fh-axe">${axe}</div>${grille}
      <i class="fh-now" style="left:${X(moisNow) + (maintenant.getDate() / 31 - .5) * W}px"></i>
      ${pistes.map(p => `<div class="fh-piste" style="height:${p.h}px">${p.html}</div>`).join("")}
    </div></div></div>`;
}

// ---------- 3. Mur par mois ----------
function mur(evs) {
  // Groupes : un par mois (ou par saison / « dans l'année » quand la date est floue)
  const groupes = [];
  evs.forEach(e => {
    const a = Math.floor(e.mois / 12);
    const cle = e.precision === "annee" ? `${a}-annee` : e.precision === "saison" ? `${a}-${e.saison}` : `${e.mois}`;
    let g = groupes.find(x => x.cle === cle);
    if (!g) groupes.push(g = { cle, an: a, nom: e.precision === "annee" ? "année" : e.precision === "saison" ? e.saison : MOIS[e.mois % 12], evs: [] });
    g.evs.push(e);
  });
  let an = null, h = "";
  groupes.forEach(g => {
    if (g.an !== an) { an = g.an; h += `<div class="fm-an">${g.an}</div>`; }
    h += `<div class="fm-mois"><div class="fm-nom"><b>${echapper(g.nom)}</b></div><div class="fm-affiches">${g.evs.map(e =>
      `<button class="fm-ev" data-fiche="${e.id}" title="${echapper(e.titre)}">${e.vignette}
        <i class="fm-type" style="background:${COULEURS_TYPES[e.type]}"></i><span class="fm-titre">${echapper(e.titre)}</span></button>`).join("")}</div></div>`;
  });
  return `<div class="f-mur">${h}</div>`;
}

// Dessine la frise demandée (les événements doivent être triés du plus récent au plus ancien)
export function dessinerFrise(style, evs, { pc = false } = {}) {
  if (!evs.length) return `<div class="vide-page">Rien dans la frise pour l'instant : ajoute une date « Vu » dans une fiche.</div>`;
  if (style === "horiz") return horizontale([...evs].reverse(), pc ? 74 : 58);
  if (style === "mur") return mur(evs);
  return ligne(evs);
}
