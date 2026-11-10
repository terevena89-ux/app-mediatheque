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
    image: (s.image?.original || s.image?.medium || "").replace(/^http:/, "https:"),   // affiches de TVmaze : toujours en hauteur
    info: [annee(s.premiered), s.network?.name || s.webChannel?.name].filter(Boolean).join(" · ")
  }));
}

// ---------- Livres, BD, mangas : Open Library ----------
const versLivre = l => ({
  titre: l.title,
  annee: l.first_publish_year || null,
  createur: (l.author_name || []).slice(0, 2).join(", "),
  genres: trouverGenres((l.subject || []).slice(0, 15).join(" ")),
  image: l.cover_i ? `https://covers.openlibrary.org/b/id/${l.cover_i}-L.jpg` : "",   // couvertures : en hauteur
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
    prop: "pageimages|description|langlinks|pageprops", piprop: "thumbnail", pithumbsize: "500", pilicense: "any",
    lllang: "en", lllimit: "max", ppprop: "wikibase_item", redirects: "1"
  }), signal);
  return Object.values(fr.query?.pages || {}).sort((a, b) => a.index - b.index);
}

// ---------- Jeux : Wikidata + jaquettes Steam ----------
// Wikidata (la base de données de Wikipédia) connaît pour chaque jeu son studio (P178),
// ses genres (P136), sa date de sortie (P577) et souvent son numéro Steam (P1733).
// Avec ce numéro, on prend la jaquette Steam en hauteur (600 × 900), bien nette.
const wdAPI = params => "https://www.wikidata.org/w/api.php?" + new URLSearchParams({ format: "json", origin: "*", ...params });
async function entites(ids, props, signal) {
  ids = [...new Set(ids.filter(Boolean))].slice(0, 50);
  if (!ids.length) return {};
  const j = await lireJSON(wdAPI({ action: "wbgetentities", ids: ids.join("|"), props, languages: "fr|en", sitefilter: "frwiki|enwiki" }), signal);
  return j.entities || {};
}
const valeurs = (e, p) => (e?.claims?.[p] || []).map(c => c.mainsnak?.datavalue?.value).filter(Boolean);
const libelle = e => e?.labels?.fr?.value || e?.labels?.en?.value || "";
// Année de la toute première sortie (Wikidata liste aussi les ressorties, portages…)
const premiereSortie = e => { const ans = valeurs(e, "P577").map(v => +String(v.time || "").slice(1, 5)).filter(a => a > 1900); return ans.length ? Math.min(...ans) : null; };
const majuscule = t => t ? t[0].toUpperCase() + t.slice(1) : t;
// « Voir aussi » : seulement de vraies œuvres (pas d'acteurs, de licences, de franchises, de lieux…).
// Wikidata dit ce qu'est chaque page (propriété P31 « nature de l'élément ») : on garde
// les films, jeux, séries ou livres selon le type de la fiche.
const NATURES = {
  film: ["Q11424", "Q24869", "Q202866", "Q506240", "Q93204", "Q24862", "Q229390", "Q20650540", "Q17517379", "Q1054574", "Q2484376", "Q28968511"],
  jeu: ["Q7889", "Q865493", "Q4393107", "Q21125433", "Q1066707"],
  serie: ["Q5398426", "Q1259759", "Q526877", "Q63952888", "Q117467246", "Q581714", "Q15416"],
  livre: ["Q7725634", "Q8261", "Q47461344", "Q571", "Q1004", "Q14406742", "Q21198342", "Q8274", "Q725377", "Q277759", "Q1667921", "Q49084", "Q35760", "Q1760610", "Q747381", "Q10992055", "Q867335"]
};
async function seulementOeuvres(pages, type, signal) {
  try {
    const ents = await entites(pages.map(p => p.pageprops?.wikibase_item), "claims", signal);
    return pages.filter(p => {
      const e = ents[p.pageprops?.wikibase_item];
      return e && valeurs(e, "P31").some(v => NATURES[type].includes(v.id));
    });
  } catch (e) { return pages; }   // Wikidata ne répond pas : on garde le premier tri
}
const jaquetteSteam = (id, grande = true) => `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/library_600x900${grande ? "_2x" : ""}.jpg`;
// L'image existe-t-elle, et est-elle en hauteur ? (certains vieux jeux n'ont pas de jaquette Steam)
function imageEnHauteur(url) {
  return new Promise(ok => {
    const i = new Image(), fin = setTimeout(() => ok(false), 4000);
    i.onload = () => { clearTimeout(fin); ok(i.naturalHeight >= i.naturalWidth * 1.15); };
    i.onerror = () => { clearTimeout(fin); ok(false); };
    i.src = url;
  });
}
async function meilleureJaquette(steam) {
  if (!steam) return "";
  if (await imageEnHauteur(jaquetteSteam(steam))) return jaquetteSteam(steam);
  if (await imageEnHauteur(jaquetteSteam(steam, false))) return jaquetteSteam(steam, false);
  return "";
}
// Complète des résultats de jeux avec Wikidata (studio, genres, année) et la jaquette Steam
async function enrichirJeux(pages, resultats, signal) {
  const qids = pages.map(p => p.pageprops?.wikibase_item);
  const ents = await entites(qids, "claims", signal);
  const autres = [];
  qids.forEach(q => [...valeurs(ents[q], "P178"), ...valeurs(ents[q], "P136")].forEach(v => v.id && autres.push(v.id)));
  const noms = await entites(autres, "labels", signal).catch(() => ({}));
  await Promise.all(resultats.map(async (r, i) => {
    const e = ents[qids[i]];
    if (!e) return;
    const studios = valeurs(e, "P178").map(v => libelle(noms[v.id])).filter(Boolean);
    if (studios.length) r.createur = studios.slice(0, 2).join(", ");
    const genres = valeurs(e, "P136").map(v => majuscule(libelle(noms[v.id]))).filter(Boolean);
    if (genres.length) r.genres = [...new Set(genres)].slice(0, 3);
    const an = premiereSortie(e);
    if (an) r.annee = an;
    const steam = await meilleureJaquette(valeurs(e, "P1733")[0]);
    if (steam) r.image = steam;
    r.info = [r.annee, r.createur, r.genres[0]].filter(Boolean).join(" · ") || r.info;
  }));
  return resultats;
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
        piprop: "thumbnail", pithumbsize: "500", pilicense: "any", redirects: "1"
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
  const liste = (bonnes.length ? bonnes : pages).slice(0, 8);
  const res = await versResultats(liste, signal);
  // Jeux : studio, genres, année (Wikidata) et jaquette Steam
  return type === "jeu" ? enrichirJeux(liste, res, signal).catch(() => res) : res;
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
      ajoute(https(s.image?.original || s.image?.medium));
      try {
        const imgs = await lireJSON(`https://api.tvmaze.com/shows/${s.id}/images`, signal);
        imgs.filter(i => i.type === "poster").forEach(i => ajoute(https(i.resolutions?.original?.url || i.resolutions?.medium?.url)));
      } catch (e) { /* pas d'autres posters */ }
    }
  } else if (type === "livre") {
    const docs = ((await lireJSON(`https://openlibrary.org/search.json?title=${q}&fields=key,title,cover_i&limit=5`, signal)).docs || [])
      .filter(d => memeTitre(d.title, titre)).slice(0, 2);
    const couverture = c => `https://covers.openlibrary.org/b/id/${c}-L.jpg`;
    docs.forEach(d => d.cover_i && ajoute(couverture(d.cover_i)));
    for (const d of docs) {
      try {
        const ed = await lireJSON(`https://openlibrary.org${d.key}/editions.json?limit=40`, signal);
        (ed.entries || []).forEach(e => (e.covers || []).filter(c => c > 0).slice(0, 1).forEach(c => ajoute(couverture(c))));
      } catch (e) { /* pas d'éditions */ }
    }
  } else {
    // Films et jeux : chaque pays a souvent sa propre affiche (sortie en salle locale).
    // On part de la page anglaise, puis on regarde l'image de la même page dans d'autres
    // Wikipédia qui gardent les affiches (russe, ukrainienne, coréenne, hébraïque…).
    const pages = duBonType(await pagesWiki(`${titre} ${MOT_CLE[type]}`, signal, 6), type).filter(p => memeTitre(sansParentheses(p.title), titre));
    const fichiers = new Set();   // même fichier d'image = même affiche : on ne la garde qu'une fois
    const nomFichier = u => decodeURIComponent(u.split("?")[0].split("/").pop()).replace(/^\d+px-/, "").toLowerCase();
    const garder = th => {
      if (!enHauteur(th)) return;
      const f = nomFichier(th.source);
      if (fichiers.has(f)) return;
      fichiers.add(f); ajoute(th.source);
    };
    // Jeux : la jaquette Steam d'abord (en hauteur, 600 × 900)
    if (type === "jeu" && pages[0]?.pageprops?.wikibase_item) {
      const q = pages[0].pageprops.wikibase_item;
      const steam = await meilleureJaquette(valeurs((await entites([q], "claims", signal).catch(() => ({})))[q], "P1733")[0]);
      if (steam) ajoute(steam);
    }
    const anglais = pages.map(p => p.langlinks?.[0]?.["*"]).filter(Boolean)[0];
    if (anglais) {
      const en = await lireJSON(wikiAPI("en", { titles: anglais, prop: "pageimages|langlinks", lllimit: "max" }), signal);
      const p = Object.values(en.query?.pages || {})[0];
      if (p?.thumbnail) garder(p.thumbnail);
      const liens = (p?.langlinks || []).filter(l => LANGUES_AFFICHES.includes(l.lang));
      const autres = await Promise.all(liens.map(l => lireJSON(wikiAPI(l.lang, { titles: l["*"], prop: "pageimages" }), signal)
        .then(j => Object.values(j.query?.pages || {})[0]?.thumbnail).catch(() => null)));
      autres.forEach(th => th && garder(th));
    }
    pages.forEach(p => p.thumbnail && garder(p.thumbnail));
  }
  return [...new Set(urls)].slice(0, 24);
}
// Wikipédia qui gardent souvent l'affiche de leur pays
const LANGUES_AFFICHES = ["ru", "uk", "ko", "he", "zh", "vi", "pt", "hu", "sr", "el", "th", "ka", "fa", "ar", "tr", "id", "ca", "hy", "it", "pl"];
const wikiAPI = (langue, params) => `https://${langue}.wikipedia.org/w/api.php?` + new URLSearchParams({
  action: "query", format: "json", origin: "*", redirects: "1", piprop: "thumbnail", pithumbsize: "500", pilicense: "any", ...params
});

// Séries sans affiche (Wikipédia montre souvent un titre en largeur) : on demande l'affiche à TVmaze
async function completerSeries(liste, type, signal) {
  if (type !== "serie") return liste;
  await Promise.all(liste.filter(r => !r.image).map(async r => {
    try {
      const s = await lireJSON(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(r.titre)}`, signal);
      if (s?.image) r.image = (s.image.original || s.image.medium).replace(/^http:/, "https:");
    } catch (e) { /* pas trouvée : sans affiche */ }
  }));
  return liste;
}

// Pages Wikipédia → résultats complets (jeux : Wikidata + Steam ; séries : affiche TVmaze)
async function resultatsDe(pages, type, signal) {
  let res = await versResultats(pages, signal);
  if (type === "jeu") res = await enrichirJeux(pages, res, signal).catch(() => res);
  return completerSeries(res, type, signal);
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
    const similaires = (await seulementOeuvres(duBonType(await pagesWiki(`morelike:${trouvees[0].title}`, signal, 30), type, true)
      .filter(p => p.title !== trouvees[0].title), type, signal)).slice(0, 14);
    return sansDoublons(await resultatsDe(similaires, type, signal)).slice(0, 10);
  })().catch(() => []);

  // Jeux : les autres jeux du même studio, d'après Wikidata (plus fiable que le texte des pages)
  if (type === "jeu") {
    const studio = (async () => {
      const trouvees = duBonType(await pagesWiki(`${m.titre} ${motCle}`, signal, 3), type);
      const q = trouvees[0]?.pageprops?.wikibase_item;
      const dev = q && valeurs((await entites([q], "claims", signal))[q], "P178")[0]?.id;
      if (!dev) return [];
      const s = await lireJSON(wdAPI({ action: "query", list: "search", srsearch: `haswbstatement:P178=${dev} haswbstatement:P31=Q7889`, srlimit: "30" }), signal);
      const ents = await entites((s.query?.search || []).map(x => x.title), "claims|sitelinks|labels", signal);
      const studioNom = libelle((await entites([dev], "labels", signal))[dev]);
      const res = await Promise.all(Object.values(ents).map(async e => {
        const an = premiereSortie(e);
        const r = { titre: sansParentheses(e.sitelinks?.frwiki?.title || libelle(e)), annee: an, createur: studioNom, genres: [] };
        r.image = await meilleureJaquette(valeurs(e, "P1733")[0]);
        r.info = [r.annee, studioNom].filter(Boolean).join(" · ");
        return r;
      }));
      return sansDoublons(res.filter(r => r.titre).sort((a, b) => (b.annee || 0) - (a.annee || 0))).slice(0, 12);
    })().catch(() => []);
    return { proches: await proches, createur: await studio };
  }

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
    const pages = (await seulementOeuvres(duBonType(await pagesWiki(`${phrase} ${motCle}`, signal, 30), type, true), type, signal)).slice(0, 14);
    return sansDoublons(await resultatsDe(pages, type, signal)).slice(0, 10);
  })().catch(() => []);

  return { proches: await proches, createur: await createur };
}

// ---------- Copie des images ----------
// On garde dans la fiche une petite copie de l'affiche (~10 Ko), pour que l'image
// reste même si le site d'origine change son adresse un jour.
// Certains sites refusent qu'on copie leurs images : on renvoie alors "" et la fiche
// garde seulement l'adresse.
const LARGEUR = 240, HAUTEUR = 360;   // un peu plus grand qu avant : plus net (~20 Ko)
function versJPEG(img) {
  const r = Math.min(1, LARGEUR / img.naturalWidth, HAUTEUR / img.naturalHeight);
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(img.naturalWidth * r));
  c.height = Math.max(1, Math.round(img.naturalHeight * r));
  const g = c.getContext("2d");
  // Fond blanc d'abord : les logos transparents (PNG) deviendraient noirs en JPEG
  g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height);
  g.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.8);   // lève une erreur si le site refuse la copie
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
