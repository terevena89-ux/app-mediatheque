// =========================================================
// Données de test : 50 vrais titres connus par type (200 en tout),
// avec des statuts, notes, dates et supports variés, pour essayer l'appli
// « en vrai ». Deux périodes très chargées (été 2025 et oct.–nov. 2026,
// une vingtaine de titres chacune) pour voir le rendu de la frise.
// Chaque fiche porte « test: true » : Réglages › Effacer les données de test
// les enlève sans toucher aux vraies fiches.
// Format d'une ligne : "Titre|année|créateur|genre, genre"
// =========================================================

const LISTES = {
  film: `Dune : Deuxième partie|2024|Denis Villeneuve|Science-fiction, Aventure
Le Voyage de Chihiro|2001|Hayao Miyazaki|Animation, Fantasy
Parasite|2019|Bong Joon-ho|Thriller, Drame
Oppenheimer|2023|Christopher Nolan|Biographie, Drame
Interstellar|2014|Christopher Nolan|Science-fiction
Inception|2010|Christopher Nolan|Science-fiction, Action
Past Lives|2023|Celine Song|Drame, Romance
Whiplash|2014|Damien Chazelle|Drame
La La Land|2016|Damien Chazelle|Comédie musicale, Romance
Mad Max: Fury Road|2015|George Miller|Action
Premier Contact|2016|Denis Villeneuve|Science-fiction
Blade Runner 2049|2017|Denis Villeneuve|Science-fiction
Le Fabuleux Destin d'Amélie Poulain|2001|Jean-Pierre Jeunet|Comédie, Romance
Everything Everywhere All at Once|2022|Daniel Kwan, Daniel Scheinert|Science-fiction, Comédie
Les Banshees d'Inisherin|2022|Martin McDonagh|Comédie dramatique
Drive|2011|Nicolas Winding Refn|Thriller
Anatomie d'une chute|2023|Justine Triet|Drame, Policier
Killers of the Flower Moon|2023|Martin Scorsese|Western, Drame
Perfect Days|2023|Wim Wenders|Drame
Aftersun|2022|Charlotte Wells|Drame
Babylon|2022|Damien Chazelle|Drame
Tenet|2020|Christopher Nolan|Action, Science-fiction
Mon voisin Totoro|1988|Hayao Miyazaki|Animation, Jeunesse
Princesse Mononoké|1997|Hayao Miyazaki|Animation, Fantasy
Le Garçon et le Héron|2023|Hayao Miyazaki|Animation, Fantasy
Spider-Man : Across the Spider-Verse|2023|Joaquim Dos Santos|Animation, Action
Intouchables|2011|Olivier Nakache, Éric Toledano|Comédie
Le Dîner de cons|1998|Francis Veber|Comédie
La Haine|1995|Mathieu Kassovitz|Drame
Portrait de la jeune fille en feu|2019|Céline Sciamma|Drame, Romance
The Grand Budapest Hotel|2014|Wes Anderson|Comédie
Her|2013|Spike Jonze|Romance, Science-fiction
Get Out|2017|Jordan Peele|Horreur, Thriller
The Social Network|2010|David Fincher|Drame
Fight Club|1999|David Fincher|Thriller
Seven|1995|David Fincher|Policier, Thriller
Pulp Fiction|1994|Quentin Tarantino|Policier
Le Seigneur des anneaux : La Communauté de l'anneau|2001|Peter Jackson|Fantasy, Aventure
Matrix|1999|Lana et Lilly Wachowski|Science-fiction, Action
Retour vers le futur|1985|Robert Zemeckis|Science-fiction, Aventure
Alien|1979|Ridley Scott|Science-fiction, Horreur
Gladiator|2000|Ridley Scott|Action, Historique
Le Parrain|1972|Francis Ford Coppola|Policier, Drame
Les Évadés|1994|Frank Darabont|Drame
Coco|2017|Lee Unkrich|Animation, Jeunesse
Vice-versa|2015|Pete Docter|Animation, Jeunesse
Top Gun : Maverick|2022|Joseph Kosinski|Action
Pauvres Créatures|2023|Yorgos Lanthimos|Fantastique, Comédie
Barbie|2023|Greta Gerwig|Comédie
La Zone d'intérêt|2023|Jonathan Glazer|Drame, Historique`,
  serie: `Breaking Bad|2008|AMC|Drame, Policier
Better Call Saul|2015|AMC|Drame, Policier
The Bear|2022|FX|Comédie dramatique
Severance|2022|Apple TV+|Thriller, Science-fiction
Succession|2018|HBO|Drame
The Office|2005|NBC|Comédie
Fleabag|2016|BBC|Comédie
Chernobyl|2019|HBO|Drame, Historique
Arcane|2021|Netflix|Animation, Fantasy
Shōgun|2024|FX|Historique, Drame
True Detective|2014|HBO|Policier
Mr. Robot|2015|USA Network|Thriller
Dark|2017|Netflix|Science-fiction, Thriller
Stranger Things|2016|Netflix|Science-fiction, Horreur
The Last of Us|2023|HBO|Drame, Science-fiction
Game of Thrones|2011|HBO|Fantasy, Drame
Le Bureau des légendes|2015|Canal+|Espionnage
Kaamelott|2005|M6|Comédie, Historique
Twin Peaks|1990|ABC|Policier, Fantastique
The Wire|2002|HBO|Policier, Drame
Les Soprano|1999|HBO|Policier, Drame
Mad Men|2007|AMC|Drame
Peaky Blinders|2013|BBC|Policier, Historique
Andor|2022|Disney+|Science-fiction
The Mandalorian|2019|Disney+|Science-fiction, Aventure
Atlanta|2016|FX|Comédie
Barry|2018|HBO|Comédie, Policier
Ted Lasso|2020|Apple TV+|Comédie
Mindhunter|2017|Netflix|Policier, Thriller
The Leftovers|2014|HBO|Drame, Fantastique
Sherlock|2010|BBC|Policier
Black Mirror|2011|Channel 4|Science-fiction
Lupin|2021|Netflix|Policier
Baron noir|2016|Canal+|Drame
Engrenages|2005|Canal+|Policier
Normal People|2020|BBC|Romance, Drame
The Crown|2016|Netflix|Historique, Drame
Fargo|2014|FX|Policier
Westworld|2016|HBO|Science-fiction
Silo|2023|Apple TV+|Science-fiction
Blue Eye Samurai|2023|Netflix|Animation, Action
Cowboy Bebop|1998|Sunrise|Animation, Science-fiction
L'Attaque des Titans|2013|MBS|Animation, Action
Frieren|2023|Nippon TV|Animation, Fantasy
Euphoria|2019|HBO|Drame
Only Murders in the Building|2021|Hulu|Comédie, Policier
The White Lotus|2021|HBO|Comédie dramatique
Slow Horses|2022|Apple TV+|Espionnage, Comédie
Dix pour cent|2015|France 2|Comédie
Hippocrate|2018|Canal+|Drame`,
  jeu: `Baldur's Gate 3|2023|Larian Studios|RPG
Hades II|2025|Supergiant Games|Roguelike, Action
Hades|2020|Supergiant Games|Roguelike, Action
Outer Wilds|2019|Mobius Digital|Aventure
The Legend of Zelda : Breath of the Wild|2017|Nintendo|Aventure
The Legend of Zelda : Tears of the Kingdom|2023|Nintendo|Aventure
Elden Ring|2022|FromSoftware|RPG, Action
Hollow Knight|2017|Team Cherry|Metroidvania
Celeste|2018|Maddy Makes Games|Plates-formes
Disco Elysium|2019|ZA/UM|RPG
The Witcher 3 : Wild Hunt|2015|CD Projekt Red|RPG
Red Dead Redemption 2|2018|Rockstar Games|Aventure, Action
Stardew Valley|2016|ConcernedApe|Simulation
Portal 2|2011|Valve|Réflexion
Half-Life 2|2004|Valve|Tir
Minecraft|2011|Mojang|Simulation
Super Mario Odyssey|2017|Nintendo|Plates-formes
Mario Kart 8 Deluxe|2017|Nintendo|Course
Animal Crossing : New Horizons|2020|Nintendo|Simulation
Hollow Knight : Silksong|2025|Team Cherry|Metroidvania
Clair Obscur : Expedition 33|2025|Sandfall Interactive|RPG
Balatro|2024|LocalThunk|Roguelike
Vampire Survivors|2022|poncle|Roguelike
Slay the Spire|2019|Mega Crit|Roguelike, Stratégie
Dead Cells|2018|Motion Twin|Roguelike, Action
Return of the Obra Dinn|2018|Lucas Pope|Réflexion
Inscryption|2021|Daniel Mullins Games|Roguelike, Horreur
Death Stranding|2019|Kojima Productions|Aventure
Final Fantasy VII Remake|2020|Square Enix|RPG
Persona 5 Royal|2019|Atlus|RPG
Sekiro : Shadows Die Twice|2019|FromSoftware|Action
Dark Souls|2011|FromSoftware|RPG, Action
Bloodborne|2015|FromSoftware|RPG, Action
God of War|2018|Santa Monica Studio|Action, Aventure
The Last of Us Part II|2020|Naughty Dog|Aventure, Action
Uncharted 4|2016|Naughty Dog|Aventure, Action
Journey|2012|thatgamecompany|Aventure
Inside|2016|Playdead|Plates-formes, Réflexion
Limbo|2010|Playdead|Plates-formes, Réflexion
Gris|2018|Nomada Studio|Plates-formes
Tunic|2022|Andrew Shouldice|Aventure
Cuphead|2017|Studio MDHR|Plates-formes, Action
Undertale|2015|Toby Fox|RPG
Terraria|2011|Re-Logic|Aventure
Factorio|2020|Wube Software|Stratégie, Simulation
Civilization VI|2016|Firaxis Games|Stratégie
Into the Breach|2018|Subset Games|Stratégie
Mass Effect 2|2010|BioWare|RPG
Metroid Dread|2021|MercurySteam|Metroidvania
Astro Bot|2024|Team Asobi|Plates-formes`,
  livre: `Le Problème à trois corps|2008|Liu Cixin|Science-fiction
Projet Dernière Chance|2021|Andy Weir|Science-fiction
Dune|1965|Frank Herbert|Science-fiction
Le Messie de Dune|1969|Frank Herbert|Science-fiction
Fondation|1951|Isaac Asimov|Science-fiction
L'Étranger|1942|Albert Camus|Roman
La Peste|1947|Albert Camus|Roman
1984|1949|George Orwell|Dystopie
La Ferme des animaux|1945|George Orwell|Roman
Le Petit Prince|1943|Antoine de Saint-Exupéry|Jeunesse
Les Misérables|1862|Victor Hugo|Roman, Historique
Le Comte de Monte-Cristo|1844|Alexandre Dumas|Aventure
Madame Bovary|1857|Gustave Flaubert|Roman
Germinal|1885|Émile Zola|Roman
Sapiens|2011|Yuval Noah Harari|Essai
Le Seigneur des anneaux|1954|J. R. R. Tolkien|Fantasy
Le Hobbit|1937|J. R. R. Tolkien|Fantasy
Harry Potter à l'école des sorciers|1997|J. K. Rowling|Fantasy, Jeunesse
Le Nom du vent|2007|Patrick Rothfuss|Fantasy
L'Assassin royal|1995|Robin Hobb|Fantasy
Les Fourmis|1991|Bernard Werber|Science-fiction
La Vérité sur l'affaire Harry Quebert|2012|Joël Dicker|Policier
Millénium|2005|Stieg Larsson|Policier, Thriller
Le Silence des agneaux|1988|Thomas Harris|Thriller
Shining|1977|Stephen King|Horreur
Ça|1986|Stephen King|Horreur
L'Amie prodigieuse|2011|Elena Ferrante|Roman
Les Années|2008|Annie Ernaux|Roman
Chanson douce|2016|Leïla Slimani|Roman
Vernon Subutex|2015|Virginie Despentes|Roman
Le Mage du Kremlin|2022|Giuliano da Empoli|Roman
Klara et le Soleil|2021|Kazuo Ishiguro|Science-fiction
Les Vestiges du jour|1989|Kazuo Ishiguro|Roman
Neuromancien|1984|William Gibson|Science-fiction
Hypérion|1989|Dan Simmons|Science-fiction
La Horde du Contrevent|2004|Alain Damasio|Science-fiction, Fantasy
Astérix le Gaulois|1961|René Goscinny, Albert Uderzo|BD
Tintin au Tibet|1960|Hergé|BD, Aventure
Blacksad|2000|Juan Díaz Canales, Juanjo Guarnido|BD, Policier
L'Arabe du futur|2014|Riad Sattouf|BD
Persepolis|2000|Marjane Satrapi|BD
Maus|1986|Art Spiegelman|BD, Historique
Watchmen|1986|Alan Moore, Dave Gibbons|BD
Les Vieux Fourneaux|2014|Wilfrid Lupano, Paul Cauuet|BD, Comédie
Blue Period|2017|Tsubasa Yamaguchi|Manga
One Piece|1997|Eiichirō Oda|Manga, Aventure
Frieren|2020|Kanehito Yamada, Tsukasa Abe|Manga, Fantasy
Vagabond|1998|Takehiko Inoue|Manga, Historique
Monster|1994|Naoki Urasawa|Manga, Thriller
L'Atelier des sorciers|2016|Kamome Shirahama|Manga, Fantasy`
};

const SUPPORTS = {
  film: ["Cinéma", "Netflix", "Canal+", "Prime Video", "Disney+", "Blu-ray", "MUBI"],
  serie: ["Netflix", "HBO Max", "Disney+", "Apple TV+", "Canal+", "Prime Video"],
  jeu: ["PC", "Switch", "PS5", "Steam Deck"],
  livre: ["Papier", "Kindle", "Bibliothèque"]
};
const TAGS = ["confort", "à montrer", "grand écran", "avec des amis", "à offrir"];
const SAISONS = ["hiver", "printemps", "ete", "automne"];

// Hasard « fixe » : les mêmes données à chaque chargement
function hasard(graine) {
  let s = graine;
  return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
}

// Fabrique la liste des fiches de test
export function genererDonneesTest(nouvelId) {
  const r = hasard(42);
  const pris = t => t[Math.floor(r() * t.length)];
  const mois = (a, m) => `${a}-${String(m + 1).padStart(2, "0")}`;
  const jour = (a, m) => `${mois(a, m)}-${String(1 + Math.floor(r() * 28)).padStart(2, "0")}`;
  // Une date de passage, plus ou moins précise
  function datePassage(a, m) {
    const p = r();
    if (p < .5) return mois(a, m);
    if (p < .72) return jour(a, m);
    if (p < .86) return `${a}-${SAISONS[Math.floor(m / 3) % 4]}`;
    return `${a}`;
  }
  const liste = [];
  let n = 0, dense = 0;
  for (const [type, texte] of Object.entries(LISTES)) {
    texte.trim().split("\n").forEach((l, i) => {
      const [titre, annee, createur, genres] = l.split("|");
      const m = {
        id: nouvelId(), type, titre, annee: +annee, createur, genres: genres.split(",").map(g => g.trim()),
        image: "", miniature: "", statut: "fini", revoir: false, note: 0, coeur: false,
        passages: [], debut: "", support: pris(SUPPORTS[type]), tags: [], avis: "",
        saisons: { actif: false, total: 0, vues: [] }, test: true, cree: Date.now() - (n++) * 60000
      };
      const p = r();
      if (p < .14) m.statut = "avoir";
      else if (p < .23) m.statut = "reserve";
      else if (p < .31) { m.statut = "encours"; m.debut = mois(2026, 8 + Math.floor(r() * 3)); }
      else if (p < .37) m.statut = "abandon";
      if (m.statut === "avoir" || m.statut === "reserve") m.support = "";

      if (m.statut === "fini" || m.statut === "abandon") {
        m.note = m.statut === "abandon" ? 1 + Math.floor(r() * 2) : 3 + Math.floor(r() * 3);
        m.coeur = m.note === 5 && r() < .45;
        // Une vingtaine de titres l'été 2025, une vingtaine en oct.–nov. 2026, le reste étalé
        let a, mo;
        if (dense < 20 && r() < .3) { a = 2025; mo = 6 + Math.floor(r() * 2); dense++; m.passages.push(jour(a, mo)); }
        else if (dense >= 20 && dense < 41 && r() < .32) { a = 2026; mo = 9 + Math.floor(r() * 2); dense++; m.passages.push(r() < .6 ? jour(a, mo) : mois(a, mo)); }
        else {
          a = Math.max(+annee, 2012 + Math.floor(r() * 14)); mo = Math.floor(r() * 12);
          if (a > 2026 || (a === 2026 && mo > 10)) { a = 2026; mo = 3; }
          m.passages.push(datePassage(a, mo));
        }
        // Jeux, séries et livres : on connaît souvent le début (barre dans la frise horizontale)
        if (type !== "film" && /^\d{4}-\d{2}/.test(m.passages[0]) && r() < .7) {
          const d = a * 12 + mo - 1 - Math.floor(r() * 3);
          m.debut = mois(Math.floor(d / 12), d % 12);
        }
        // Quelques titres revus / rejoués / relus
        if (m.statut === "fini" && r() < .12 && a < 2025) m.passages.push(mois(2025 + Math.floor(r() * 2), Math.floor(r() * 10)));
        m.revoir = m.statut === "fini" && r() < .1;
        if (r() < .25) m.tags.push(pris(TAGS));
        if (r() < .12) m.avis = "Très bon souvenir, à conseiller.";
      }
      // Quelques séries suivies par saison
      if (type === "serie" && i % 6 === 0) {
        const total = 2 + Math.floor(r() * 4);
        const vues = m.statut === "fini" ? total : m.statut === "encours" ? 1 + Math.floor(r() * (total - 1)) : 0;
        m.saisons = { actif: true, total, vues: Array.from({ length: vues }, (_, k) => k + 1) };
      }
      liste.push(m);
    });
  }
  return liste;
}
