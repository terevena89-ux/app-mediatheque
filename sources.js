// =========================================================
// Recherche en ligne, « Voir aussi », copie des images.
// Services gratuits, sans compte ni clé :
//   - Séries : TVmaze (api.tvmaze.com)
//   - Livres / BD / mangas : Open Library (openlibrary.org)
//   - Films et jeux (et « Voir aussi ») : Wikipédia en français,
//     et en anglais pour les affiches
// Si un service ne répond pas, on renvoie une liste vide :
// on peut toujours ajouter « à la main ».
// On ne garde que des images au FORMAT AFFICHE (plus hautes que larges) :
// les logos et captures en largeur sont écartés.
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
const simplifier = t => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
// Une image au format affiche : nettement plus haute que large
const enHauteur = th => th && th.width && th.height && th.height >= th.width * 1.15;

// ---------- Séries : TVmaze ----------
async function series(q, signal) {
  const res = await lireJSON(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`, signal);
  return res.slice(0, 10).map(({ show: s }) => ({
    titre: s.name,
    annee: annee(s.premiered),
    createur: s.network?.name || s.webChannel?.name || "",
    genres: trouverGenres((s.genres || []).join(" ")),
    image: (s.image?.medium || "").replace(/^http:/, "https:"),   // affiches de TVmaze : toujours en hauteur
    info: [annee(s.premiered), s.network?.name || s.webChannel?.name].filter(Boolean).join(" · ")
  }));
}

// ---------- Livres, BD, mangas : Open Library ----------
const versLivre = l => ({
  titre: l.title,
  annee: l.first_publish_year || null,
  createur: (l.author_name || []).slice(0, 2).join(", "),
  genres: trouverGenres((l.subject || []).slice(0, 15).join(" ")),
  image: l.cover_i ? `https://covers.openlibrary.org/b/id/${l.cover_i}-M.jpg` : "",   // couvertures : en hauteur
  info: [l.first_publish_year, (l.author_name || [])[0]].filter(Boolean).join(" · ")
});
const CHAMPS_OL = "title,author_name,first_publish_year,cover_i,subject";
async function livres(q, signal) {
  const res = await lireJSON(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&fields=${CHAMPS_OL}&limit=10`, signal);
  return (res.docs || []).map(versLivre);
}

// ---------- Wikipédia (films, jeux, et « Voir aussi ») ----------
// Mot ajouté à la recherche pour tomber sur la bonne page, et mots attendus dans la description
const MOT_CLE = { film: "film", jeu: "jeu vidéo", serie: "série télévisée", livre: "roman" };
const ATTENDU = { film: /film|téléfilm/i, jeu: /jeu/i, serie: /série|feuilleton/i, livre: /roman|livre|nouvelle|bande dessinée|manga|essai|récit/i };
// Pages à écarter : personnages, lieux, saisons, épisodes…
const PAS_UNE_OEUVRE = /personnage|lieu fictif|famille fictive|planète|organisation|univers de fiction|^épisode/i;

// Pages Wikipédia en français pour une recherche (avec description et lien vers la page anglaise)
async function pagesWiki(recherche, signal, limite = 10) {
  const fr = await lireJSON("https://fr.wikipedia.org/w/api.php?" + new URLSearchParams({
    action: "query", format: "json", origin: "*", generator: "search", gsrsearch: recherche, gsrlimit: String(limite),
    prop: "pageimages|description|langlinks", piprop: "thumbnail", pithumbsize: "300", pilicense: "any",
    lllang: "en", lllimit: "max", redirects: "1"
  }), signal);
  return Object.values(fr.query?.pages || {}).sort((a, b) => a.index - b.index);
}
// Garde les pages qui parlent bien du bon type d'œuvre (d'après la description) ;
// écarte les pages « liste », « 2025 en jeu vidéo »…
function duBonType(pages, type, strict = false) {
  if (strict) pages = pages.filter(p => p.description);   // « Voir aussi » : seulement les pages bien décrites
  return pages.filter(p => !/^(liste|saison \d|épisode|\d{4} en )/i.test(p.title) && !/év[éè]nements|^liste/i.test(p.description || "")
    && !PAS_UNE_OEUVRE.test(p.description || "")
    && (!p.description || ATTENDU[type].test(p.description)));
}
// Transforme des pages en résultats, avec une affiche EN HAUTEUR quand il y en a une.
// Le Wikipédia français n'a souvent pas le droit de garder les affiches (il montre le logo
// du titre) : on regarde d'abord l'image de la page anglaise, puis la française.
async function versResultats(liste, signal) {
  const anglais = liste.filter(p => p.langlinks?.[0]?.["*"]).map(p => p.langlinks[0]["*"]);
  const imagesEn = {};
  if (anglais.length) {
    try {
      const en = await lireJSON("https://en.wikipedia.org/w/api.php?" + new URLSearchParams({
        action: "query", format: "json", origin: "*", titles: anglais.slice(0, 40).join("|"), prop: "pageimages",
        piprop: "thumbnail", pithumbsize: "300", pilicense: "any", redirects: "1"
      }), signal);
      // Les titres ont pu être « normalisés » ou redirigés : on retrouve le titre d'origine
      const vers = {};
      [...(en.query?.normalized || []), ...(en.query?.redirects || [])].forEach(n => { vers[n.to] = n.from; });
      Object.values(en.query?.pages || {}).forEach(p => {
        let t = p.title; while (vers[t]) t = vers[t];
        if (p.thumbnail) imagesEn[t] = p.thumbnail;
      });
    } catch (e) { /* pas grave : sans affiche */ }
  }
  return liste.map(p => {
    const desc = p.description || "";
    // « Dune : Deuxième partie (film) » → « Dune : Deuxième partie »
    const titre = p.title.replace(/\s*\((film|jeu vidéo|série télévisée|roman|manga|bande dessinée)[^)]*\)\s*$/i, "");
    // « film américain réalisé par Denis Villeneuve… » → créateur
    const m = desc.match(/(?:réalisé par|de|développé par|édité par|écrit par)\s+([A-ZÉÈ][^,;()]+?)(?:\s+(?:sorti|et|en|paru|publié)\b|[,;(]|$)/);
    const en = imagesEn[p.langlinks?.[0]?.["*"]];
    const image = enHauteur(en) ? en.source : enHauteur(p.thumbnail) ? p.thumbnail.source : "";
    return { titre, annee: annee(desc), createur: m ? m[1].trim() : "", genres: trouverGenres(desc), image, info: desc, page: p.title };
  });
}
async function wikipedia(q, type, signal) {
  const pages = await pagesWiki(`${q} ${MOT_CLE[type]}`, signal);
  const bonnes = duBonType(pages, type);
  return versResultats((bonnes.length ? bonnes : pages).slice(0, 8), signal);
}

// Point d'entrée de la recherche : selon le type (jeu, film, serie, livre)
export async function chercherEnLigne(type, texte, signal) {
  const q = String(texte || "").trim();
  if (q.length < 2) return [];
  if (type === "serie") return series(q, signal);
  if (type === "livre") return livres(q, signal);
  return wikipedia(q, type, signal);
}

// ---------- Autres affiches d'un même titre (« Choisir l'affiche ») ----------
// Séries : les posters de TVmaze ; livres : les couvertures des éditions (Open Library) ;
// films et jeux : les affiches des Wikipédia anglais et français (en hauteur seulement).
const memeTitre = (a, b) => { const x = simplifier(a), y = simplifier(b); return x === y || x.includes(y) || y.includes(x); };
const sansParentheses = t => t.replace(/\s*\([^)]*\)\s*$/, "");
const https = u => (u || "").replace(/^http:/, "https:");
export async function chercherAffiches(type, titre, signal) {
  const urls = [];
  const ajoute = u => { if (u && !urls.includes(u)) urls.push(u); };
  const q = encodeURIComponent(titre);
  if (type === "serie") {
    const shows = (await lireJSON(`https://api.tvmaze.com/search/shows?q=${q}`, signal)).map(r => r.show).filter(s => memeTitre(s.name, titre)).slice(0, 2);
    for (const s of shows) {
      ajoute(https(s.image?.medium));
      try {
        const imgs = await lireJSON(`https://api.tvmaze.com/shows/${s.id}/images`, signal);
        imgs.filter(i => i.type === "poster").forEach(i => ajoute(https(i.resolutions?.medium?.url || i.resolutions?.original?.url)));
      } catch (e) { /* pas d'autres posters */ }
    }
  } else if (type === "livre") {
    const docs = ((await lireJSON(`https://openlibrary.org/search.json?title=${q}&fields=key,title,cover_i&limit=5`, signal)).docs || [])
      .filter(d => memeTitre(d.title, titre)).slice(0, 2);
    const couverture = c => `https://covers.openlibrary.org/b/id/${c}-M.jpg`;
    docs.forEach(d => d.cover_i && ajoute(couverture(d.cover_i)));
    for (const d of docs) {
      try {
        const ed = await lireJSON(`https://openlibrary.org${d.key}/editions.json?limit=40`, signal);
        (ed.entries || []).forEach(e => (e.covers || []).filter(c => c > 0).slice(0, 1).forEach(c => ajoute(couverture(c))));
      } catch (e) { /* pas d'éditions */ }
    }
  } else {
    const pages = duBonType(await pagesWiki(`${titre} ${MOT_CLE[type]}`, signal, 6), type).filter(p => memeTitre(sansParentheses(p.title), titre));
    pages.forEach(p => { if (enHauteur(p.thumbnail)) ajoute(p.thumbnail.source); });
    const anglais = pages.map(p => p.langlinks?.[0]?.["*"]).filter(Boolean);
    if (anglais.length) {
      const en = await lireJSON("https://en.wikipedia.org/w/api.php?" + new URLSearchParams({
        action: "query", format: "json", origin: "*", titles: anglais.join("|"), prop: "pageimages",
        piprop: "thumbnail", pithumbsize: "300", pilicense: "any", redirects: "1"
      }), signal);
      Object.values(en.query?.pages || {}).forEach(p => { if (enHauteur(p.thumbnail)) urls.unshift(p.thumbnail.source); });
    }
  }
  return [...new Set(urls)].slice(0, 24);
}

// Séries sans affiche (Wikipédia montre souvent un titre en largeur) : on demande l'affiche à TVmaze
async function completerSeries(liste, type, signal) {
  if (type !== "serie") return liste;
  await Promise.all(liste.filter(r => !r.image).map(async r => {
    try {
      const s = await lireJSON(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(r.titre)}`, signal);
      if (s?.image?.medium) r.image = s.image.medium.replace(/^http:/, "https:");
    } catch (e) { /* pas trouvée : sans affiche */ }
  }));
  return liste;
}

// ---------- « Voir aussi » ----------
// proches  : pages Wikipédia « similaires » (fonction morelike de Wikipédia)
// createur : autres œuvres du même réalisateur / studio / auteur / chaîne
// m = la fiche (type, titre, createur, genres)
export async function voirAussi(m, signal) {
  const type = m.type;
  const motCle = type === "livre" && m.genres.includes("Manga") ? "manga" : type === "livre" && m.genres.includes("BD") ? "bande dessinée" : MOT_CLE[type];
  const pareil = r => simplifier(r.titre) === simplifier(m.titre);
  const sansDoublons = liste => liste.filter((r, i, t) => !pareil(r) && t.findIndex(x => simplifier(x.titre) === simplifier(r.titre)) === i);

  const proches = (async () => {
    // 1. Retrouver la page Wikipédia de ce titre
    const trouvees = duBonType(await pagesWiki(`${m.titre} ${motCle}`, signal, 3), type);
    if (!trouvees.length) return [];
    // 2. Pages similaires, du même type
    const similaires = duBonType(await pagesWiki(`morelike:${trouvees[0].title}`, signal, 20), type, true)
      .filter(p => p.title !== trouvees[0].title);
    return completerSeries(sansDoublons(await versResultats(similaires.slice(0, 14), signal)).slice(0, 10), type, signal);
  })().catch(() => []);

  const createur = (async () => {
    const c = String(m.createur || "").split(",")[0].trim();
    if (!c) return [];
    if (type === "livre") {
      const res = await lireJSON(`https://openlibrary.org/search.json?author=${encodeURIComponent(c)}&fields=${CHAMPS_OL}&limit=20&sort=editions`, signal);
      // (seulement les livres où l'auteur figure vraiment)
      const deLui = (res.docs || []).filter(l => (l.author_name || []).some(a => simplifier(a).includes(simplifier(c))));
      return sansDoublons(deLui.map(versLivre)).slice(0, 10);
    }
    // Phrase exacte dans le texte des pages : « réalisé par Ari Aster »…
    const phrase = { film: `"réalisé par ${c}"`, jeu: `"développé par ${c}"`, serie: `"diffusée sur ${c}"` }[type];
    const pages = duBonType(await pagesWiki(`${phrase} ${motCle}`, signal, 20), type, true);
    return completerSeries(sansDoublons(await versResultats(pages.slice(0, 14), signal)).slice(0, 10), type, signal);
  })().catch(() => []);

  return { proches: await proches, createur: await createur };
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
