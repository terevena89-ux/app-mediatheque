// =========================================================
// Service worker : un petit « gardien » qui tourne en arrière-plan.
// Il garde une copie des fichiers de l'appli pour qu'elle s'ouvre
// même sans réseau. (Les données, elles, sont gérées par Firebase.)
// À CHAQUE NOUVELLE VERSION : changer le numéro ci-dessous.
// =========================================================
const CACHE = "mediatheque-v0.13.0";
// Bibliothèques à version fixe : cache à part, gardé d'une version à l'autre
// (sinon elles sont effacées à chaque mise à jour et l'appli ne s'ouvre plus hors ligne juste après — audit B11).
// Changer ce nom seulement si on change de version de Firebase ou d'ExcelJS.
const LIBS = "mediatheque-libs-v1";

// Fichiers de l'appli à garder dès l'installation
const FICHIERS = [
  "./", "index.html", "style.css", "app.js", "sources.js", "frise.js",
  "decouvrir.js", "outils.js", "champs-mobile.js", "notes-idees.js", "excel-style.js", "firebase-config.js",
  "manifest.json", "icones/icone.svg", "icones/icone-192.png"
];
const BIBLIOTHEQUES = [
  "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js",
  "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js",
  "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js",
  "https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js"
];

// IMPORTANT : GitHub autorise le téléphone à garder chaque fichier 10 minutes
// sans revérifier. On demande donc toujours au serveur (« reload » / « no-cache »).
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(FICHIERS.map(f => new Request(f, { cache: "reload" }))))
      // bibliothèques : en bonus, une erreur de CDN ne bloque pas l'installation
      .then(() => caches.open(LIBS)).then(c => Promise.all(BIBLIOTHEQUES.map(u =>
        c.match(u).then(deja => deja || c.add(u).catch(() => {})))))
      .then(() => self.skipWaiting())
  );
});

// Supprime les copies des anciennes versions (pas les bibliothèques)
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(noms => Promise.all(noms.filter(n => n !== CACHE && n !== LIBS).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Bibliothèques (Firebase, ExcelJS) et polices : versions fixes, on peut garder la copie
  if (["www.gstatic.com", "cdnjs.cloudflare.com", "fonts.googleapis.com", "fonts.gstatic.com"].includes(url.hostname)) {
    e.respondWith(
      caches.match(req).then(copie => copie || fetch(req).then(rep => {
        // jamais de page d'erreur en cache (« opaque » = script chargé sans CORS, statut illisible mais normal)
        if (rep.ok || rep.type === "opaque") { const clone = rep.clone(); caches.open(LIBS).then(c => c.put(req, clone)); }
        return rep;
      }))
    );
    return;
  }

  // Fichiers de l'appli : réseau d'abord (dernière version), copie en secours hors ligne.
  // « ignoreSearch » : un lien partagé (…/?title=…) ouvre quand même l'appli hors ligne.
  // On ne garde que les bonnes réponses : une erreur 404/500 ou la page d'un wifi public
  // ne doit pas remplacer la bonne copie (audit B10).
  if (url.origin === location.origin) {
    e.respondWith(
      fetch(req.url, { cache: "no-cache" }).then(rep => {
        if (rep.ok && rep.type === "basic" && !url.search) {
          const clone = rep.clone();
          caches.open(CACHE).then(c => c.put(req, clone));
        }
        return rep;
      }).catch(() => caches.match(req, { ignoreSearch: true }))
    );
  }
  // Le reste (connexion Google, base de données, recherche en ligne, affiches) passe sans être touché.
});
