// =========================================================
// Recherche en ligne + copie des images.
// Services gratuits, sans compte ni clé :
//   - Séries : TVmaze (api.tvmaze.com)
//   - Livres / BD / mangas : Open Library (openlibrary.org)
//   - Films et jeux : Wikipédia en français (et en anglais pour l'affiche si besoin)
// Si un service ne répond pas, la recherche renvoie une liste vide :
// on peut toujours ajouter « à la main ».
// =========================================================

// Un résultat = { titre, annee, createur, genres: [], image, info }

// Délai maximum d'attente d'un service (sinon on abandonne)
const DELAI = 8000;
async function lireJSON(url, signal) {
  const minuteur = new AbortController();
  const fin = setTimeout(() => minuteur.abort(), DELAI);
  if (signal) signal.addEventListener("abort", () => minuteur.abort());
  try {
    const rep = await fetch(url, { signal: minuteur.signal });
    if (!rep.ok) throw new Error("réponse " + rep.status);
    return await rep.json();
  } finally { clearTimeout(fin); }
}

// Genres reconnus (mots à chercher → nom affiché).
// Sert pour Wikipédia (on lit la petite description) et pour Open Library / TVmaze.
const GENRES = [
  [/science[- ]fiction|sci-fi|science fiction/i, "Science-fiction"], [/fantasy|heroic fantasy/i, "Fantasy"],
  [/fantastique|supernatural|surnaturel/i, "Fantastique"], [/horreur|horror|épouvante/i, "Horreur"],
  [/thriller/i, "Thriller"], [/policier|crime|detective|mystery|polar/i, "Policier"],
  [/comédie dramatique|dramedy/i, "Comédie dramatique"], [/comédie musicale|musical/i, "Comédie musicale"],
  [/comédie|comedy|humou?r/i, "Comédie"], [/drame|drama/i, "Drame"], [/romance|romantique|romantic|love stories/i, "Romance"],
  [/animation|anime|animé/i, "Animation"], [/aventure|adventure/i, "Aventure"], [/action/i, "Action"],
  [/guerre|war\b/i, "Guerre"], [/western/i, "Western"], [/documentaire|documentary/i, "Documentaire"],
  [/biographi|biopic|biography/i, "Biographie"], [/histori/i, "Historique"], [/espionnage|espionage|spy/i, "Espionnage"],
  [/jeu de rôle|rpg|role-playing/i, "RPG"], [/plates?-formes?|platform/i, "Plates-formes"], [/roguelike|rogue-lite/i, "Roguelike"],
  [/stratégie|strategy/i, "Stratégie"], [/simulation/i, "Simulation"], [/réflexion|puzzle/i, "Réflexion"],
  [/course|racing/i, "Course"], [/combat|fighting/i, "Combat"], [/tir|shooter|fps/i, "Tir"], [/metroidvania/i, "Metroidvania"],
  [/bande dessinée|comics|graphic novel|bd\b/i, "BD"], [/manga/i, "Manga"], [/essai|essays?/i, "Essai"],
  [/poésie|poetry/i, "Poésie"], [/dystopi/i, "Dystopie"], [/famille|family|children/i, "Jeunesse"]
];
function trouverGenres(...textes) {
  const t = textes.filter(Boolean).join(" ");
  const res = [];
  for (const [motif, nom] of GENRES) if (motif.test(t) && !res.includes(nom)) res.push(nom);
  return res.slice(0, 3);
}
const annee = t => { const m = String(t || "").match(/\b(1[89]\d\d|20\d\d)\b/); return m ? +m[1] : null; };

// ---------- Séries : TVmaze ----------
async function series(q, signal) {
  const res = await lireJSON(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`, signal);
  return res.slice(0, 10).map(({ show: s }) => ({
    titre: s.name,
    annee: annee(s.premiered),
    createur: s.network?.name || s.webChannel?.name || "",
    genres: trouverGenres((s.genres || []).join(" ")),
    image: (s.image?.medium || "").replace(/^http:/, "https:"),
    info: [annee(s.premiered), s.network?.name || s.webChannel?.name].filter(Boolean).join(" · ")
  }));
}

// ---------- Livres, BD, mangas : Open Library ----------
async function livres(q, signal) {
  const champs = "title,author_name,first_publish_year,cover_i,subject";
  const res = await lireJSON(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&fields=${champs}&limit=10`, signal);
  return (res.docs || []).map(l => ({
    titre: l.title,
    annee: l.first_publish_year || null,
    createur: (l.author_name || []).slice(0, 2).join(", "),
    genres: trouverGenres((l.subject || []).slice(0, 15).join(" ")),
    image: l.cover_i ? `https://covers.openlibrary.org/b/id/${l.cover_i}-M.jpg` : "",
    info: [l.first_publish_year, (l.author_name || [])[0]].filter(Boolean).join(" · ")
  }));
}

// ---------- Films et jeux : Wikipédia ----------
// 1. Recherche dans Wikipédia en français (titres français, petite description).
// 2. Les affiches manquent souvent en français : on les demande à la version anglaise.
async function wikipedia(q, type, signal) {
  const motCle = type === "jeu" ? "jeu vidéo" : "film";
  const fr = await lireJSON("https://fr.wikipedia.org/w/api.php?" + new URLSearchParams({
    action: "query", format: "json", origin: "*", generator: "search", gsrsearch: `${q} ${motCle}`, gsrlimit: "10",
    prop: "pageimages|description|langlinks", piprop: "thumbnail", pithumbsize: "300", pilicense: "any",
    lllang: "en", lllimit: "max", redirects: "1"
  }), signal);
  const pages = Object.values(fr.query?.pages || {}).sort((a, b) => a.index - b.index);
  // On garde les pages qui parlent bien d'un film / d'un jeu (d'après la description)
  // (on écarte les pages « liste », « 2025 en jeu vidéo »…)
  const bonnes = pages.filter(p => !/^(liste|\d{4} en )/i.test(p.title) && !/év[éè]nements|^liste/i.test(p.description || "")
    && (!p.description || new RegExp(type === "jeu" ? "jeu" : "film|téléfilm", "i").test(p.description)));
  const liste = (bonnes.length ? bonnes : pages).slice(0, 8);

  // Affiches manquantes : on regarde la page anglaise correspondante
  const anglais = liste.filter(p => !p.thumbnail && p.langlinks?.[0]?.["*"]).map(p => p.langlinks[0]["*"]);
  let imagesEn = {};
  if (anglais.length) {
    try {
      const en = await lireJSON("https://en.wikipedia.org/w/api.php?" + new URLSearchParams({
        action: "query", format: "json", origin: "*", titles: anglais.join("|"), prop: "pageimages",
        piprop: "thumbnail", pithumbsize: "300", pilicense: "any", redirects: "1"
      }), signal);
      // Les titres ont pu être « normalisés » ou redirigés : on retrouve le titre d'origine
      const vers = {};
      [...(en.query?.normalized || []), ...(en.query?.redirects || [])].forEach(n => { vers[n.to] = n.from; });
      Object.values(en.query?.pages || {}).forEach(p => {
        let t = p.title; while (vers[t]) t = vers[t];
        if (p.thumbnail) imagesEn[t] = p.thumbnail.source;
      });
    } catch (e) { /* pas grave : sans affiche */ }
  }
  return liste.map(p => {
    const desc = p.description || "";
    // « Dune : Deuxième partie (film) » → « Dune : Deuxième partie »
    const titre = p.title.replace(/\s*\((film|jeu vidéo|série télévisée)[^)]*\)\s*$/i, "");
    // « film américain réalisé par Denis Villeneuve… » → créateur
    const m = desc.match(/(?:réalisé par|de|développé par|édité par)\s+([A-ZÉÈ][^,;()]+?)(?:\s+(?:sorti|et|en|paru|publié)\b|[,;(]|$)/);
    return {
      titre, annee: annee(desc), createur: m ? m[1].trim() : "",
      genres: trouverGenres(desc),
      image: p.thumbnail?.source || imagesEn[p.langlinks?.[0]?.["*"]] || "",
      info: desc
    };
  });
}

// Point d'entrée : cherche selon le type (jeu, film, serie, livre)
export async function chercherEnLigne(type, texte, signal) {
  const q = String(texte || "").trim();
  if (q.length < 2) return [];
  if (type === "serie") return series(q, signal);
  if (type === "livre") return livres(q, signal);
  return wikipedia(q, type, signal);
}

// ---------- Copie des images ----------
// On garde dans la fiche une petite copie de l'affiche (~10 Ko), pour que l'image
// reste même si le site d'origine change son adresse un jour.
// Certains sites refusent qu'on copie leurs images : on renvoie alors "" et la fiche
// garde seulement l'adresse.
const LARGEUR = 160, HAUTEUR = 240;
function versJPEG(img) {
  const r = Math.min(1, LARGEUR / img.naturalWidth, HAUTEUR / img.naturalHeight);
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(img.naturalWidth * r));
  c.height = Math.max(1, Math.round(img.naturalHeight * r));
  const g = c.getContext("2d");
  // Fond blanc d'abord : les logos transparents (PNG) deviendraient noirs en JPEG
  g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height);
  g.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.72);   // lève une erreur si le site refuse la copie
}
export function copierImage(url) {
  return new Promise(ok => {
    if (!/^https:\/\//i.test(url || "")) return ok("");
    const img = new Image();
    img.crossOrigin = "anonymous";
    const fin = setTimeout(() => ok(""), DELAI);
    img.onload = () => { clearTimeout(fin); try { ok(versJPEG(img)); } catch (e) { ok(""); } };
    img.onerror = () => { clearTimeout(fin); ok(""); };
    img.src = url;
  });
}
// Image choisie sur le téléphone / le PC : réduite de la même façon
export async function reduireFichier(fichier) {
  const url = URL.createObjectURL(fichier);
  try {
    const img = await new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = url; });
    return versJPEG(img);
  } finally { URL.revokeObjectURL(url); }
}
