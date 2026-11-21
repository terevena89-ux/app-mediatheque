# Médiathèque — journal des nouveautés

## v0.13.1 — 2026-11-21
- Mode Boîtes : quand le jeu a sa vraie boîte (colonne « Image boîte »), plus de bandeau ni de tranche dessinés par-dessus (la boîte a déjà son logo PS1, Switch…) ; l'image remplit la coque. Les boîtes PC gardent leur tranche.
- Reflet plus discret sur ces vraies boîtes.

## v0.13.0 — 2026-11-20
- **Excel : 2 colonnes pour les jeux**, « Image boîte » (la vraie boîte du jeu) et « Image cartouche » (étiquette de cartouche, disque, ou icône pour les jeux PC). Elles s'exportent et se réimportent ; même adresse qu'avant = la copie déjà faite est gardée. Un ancien fichier sans ces colonnes ne touche pas aux images.
- Après l'import, une petite copie de chaque nouvelle image est faite en arrière-plan (3 essais au plus).
- Copie des images : si un site refuse la copie (LaunchBox, Steam…), 2e essai via le relais gratuit wsrv.nl.
- Import : corrige un plantage avec l'onglet « Sagas » quand l'appli n'avait encore aucune saga.

## v0.12.0 — 2026-11-20
- **Nouvel ajout de date** (fiche, saisons, Trier › Compléter) : bandeau d'années à faire glisser + grille des 12 mois. Un mois touché = la date ; un 2e mois = la période (« oct. – déc. 2023 ») ; un 3e = on recommence. Liens Toute l'année, Jour (grille des jours du mois), Saisons (rangées), En cours. Plus de lignes De / À ni de calendrier du téléphone.
- **Case à taper** en haut : « mars 24 », « 3/24 », « 12/03/2019 », « 2019 », « été 2023 », « oct - déc 23 »… La grille suit ce qui est tapé ; Entrée ajoute.
- Aperçu de la date choisie à côté du bouton Ajouter, petit « pop » et vibration à chaque mois touché.
- **Dates en pastilles arrondies** dans la fiche et dans Trier : « oct. – déc. 2023 », « déc. 24 – févr. 25 », « depuis sept. 2026 » (violet, avec un point). L'Excel garde l'ancien format.

## v0.11.1 — 2026-11-18
- Fiche : la ligne « Tags » est alignée comme les autres, et « + tag » a l'allure d'une petite pastille.
- PC : plus de note au clavier (touches 0 à 5), trop facile à toucher par erreur.
- Tableau PC : changer le statut d'une série suivie par saison n'est plus annulé tout seul.
- Ajouter : « Annuler » après un changement de statut remet aussi les dates.
- Affiches : une copie ratée (réseau instable) est retentée aux lancements suivants (3 fois au plus) ; les adresses « http: » passent en « https: » ; les sites des affiches ne reçoivent plus l'adresse de l'appli.
- La mise à jour automatique n'interrompt plus une saisie en cours (case du tableau, Notes, petite fenêtre…).
- Coulisses : identifiants de fiche plus sûrs, petits outils communs regroupés (outils.js), code inutile retiré.

## v0.11.0 — 2026-11-18
- **Ouvrir la fiche depuis Ajouter et Voir aussi** : toucher un titre déjà dans ta liste ouvre sa fiche pour la compléter. En la refermant, tu retrouves ta recherche (Ajouter) ou la liste Voir aussi, telles que tu les avais laissées.
- **Réglages › Apparence › Voir aussi** Oui / Non : sur Non, plus de bouton Voir aussi (fiche et Découvrir) et plus aucune recherche de suggestions en arrière-plan. Réglage gardé sur chaque appareil.
- **Fenêtres maison** à la place des fenêtres grises du navigateur : nom et numéro de saga, nouveau support, image d'une saison (avec bouton Coller), confirmation de déconnexion et d'import. Sur téléphone, panneau en bas ; sur PC, petite carte centrée. Le bouton retour du téléphone l'annule.
- Annuler la saisie du nom ou du numéro de saga ne modifie plus la fiche.

## v0.10.7 — 2026-11-17
- Téléphone : boutons plus faciles à toucher (icônes du haut, Tags, tri, vues, piles, choix et pastilles de couleur des Réglages), sans rien faire déborder à 384 px.
- Le libellé du tri se termine par « … » quand la place manque (petits écrans) au lieu d'être coupé net.
- Page vide : un bouton « Ajouter » sous « Rien ici pour l'instant ».
- Le rassemblement automatique des sagas se fait en silence (plus de message par-dessus la fiche au démarrage) ; un message seulement s'il a trouvé des sagas.

## v0.10.6 — 2026-11-17
- « Chargement… » au démarrage au lieu d'un écran vide ; si la base ne répond pas : un message clair (serveur lent, hors ligne au tout premier lancement, ou lecture refusée).
- Indicateur de synchro plus honnête : « Synchronisé » seulement après une vraie réponse du serveur (sinon « Connexion au serveur… »).
- Se déconnecter prévient s'il reste des modifications pas encore envoyées.
- Message d'échec d'enregistrement plus clair.
- Hors ligne plus solide : Firebase et ExcelJS gardés dans une copie à part qui n'est plus effacée à chaque mise à jour ; une page d'erreur (ou d'un wifi public) ne remplace plus la bonne copie de l'appli.
- Session perdue (déconnecté depuis un autre onglet) : l'appli se recharge proprement.

## v0.10.5 — 2026-11-17
- Choisir « Ajouter un support… » puis annuler ne vide plus le support de la fiche.
- Ajouter : un remake (ex. « Le Roi lion » 2019) n'est plus confondu avec l'original (1994) qu'on a déjà.
- Frise : les **courts** apparaissent enfin dans la frise horizontale (leur propre ligne « Courts », seulement s'il y en a), et ont une couleur dans les autres frises.
- Un lien abîmé (adresse tronquée après le #) ouvre l'accueil au lieu d'une page blanche.
- « En réserve » retrouve son icône de carton (elle affichait la boîte de jeu depuis la v0.10.3).
- Sécurité : l'identifiant d'une fiche n'est plus jamais collé dans du code de la page.

## v0.10.4 — 2026-11-17
- **Import Excel sûr** : les fiches du fichier sont d'abord toutes envoyées, par petits paquets, et les anciennes ne sont supprimées qu'ensuite. Si l'envoi échoue en route, rien n'est supprimé (message « Import interrompu »). Import refusé hors ligne.
- L'import garde la qualité des miniatures (plus de retéléchargement de toutes les affiches après un import).
- **« Annuler » reste 10 secondes** (au lieu de 5) et n'est plus chassé par un autre message.

## v0.10.3 — 2026-11-14
- **Jeux : trois façons de les montrer**, avec un nouveau bouton dans la barre d'outils (à gauche des vues) qui passe de l'une à l'autre :
  - **Cartouches et disques** : la cartouche (Switch, DS, Game Boy…) ou le disque (PlayStation, Wii, Xbox, PC…) ;
  - **Boîtes** : le boîtier ou la boîte en carton du support (boîtier Switch, DS noir, 3DS blanc, carton Game Boy / Super Nintendo, grande boîte PC…) ;
  - **Affiches** : la jaquette toute simple, comme avant.
- **Une image par façon** : fiche d'un jeu › toucher l'affiche › onglets « Affiche », « Cartouche / disque », « Boîte ». Chaque onglet a sa propre image (recherche, Google Images, Coller, Fichier, « enlever ») ; sans image, c'est l'affiche qui sert.
- **Réglages › Jeux** : « Formes » Oui / Non (sur Non, tout redevient de simples affiches et le bouton disparaît) et « Relief » Penché / Au survol / Non.
- Cartouche Switch plus petite.
- **Plus de relief** en mosaïque : cartouches légèrement tournées (vraie perspective), tranche plus épaisse, ombre portée. À la souris, la cartouche survolée se soulève et penche en suivant le pointeur, avec un reflet qui bouge ; au doigt, elle bascule quand on appuie.

## v0.10.2 — 2026-11-14
- **Jeux en cartouches** : dans les listes (Liste, Compacte, Mosaïque, tableau PC, piles de sagas), chaque jeu prend la forme de son support, avec sa jaquette en guise d'étiquette :
  - Switch (carte sombre, rouge pour la Switch 2), DS / 3DS, Game Boy, Game Boy Advance, vieilles consoles à cartouche ;
  - PS1 (boîtier CD), PS2 à PS5, Wii, Wii U, GameCube, Xbox (boîtier avec le nom du support sur le bandeau) ;
  - PC (grande boîte), Téléphone (icône d'appli).
- Petit effet de relief : épaisseur de la coque, lumière en haut à gauche, étiquette légèrement enfoncée avec un reflet.
- Le support est reconnu d'après son nom (les supports ajoutés dans Réglages marchent aussi : « Xbox 360 », « Steam Deck »…). Sans support, ou avec « Autres » : jaquette normale, comme avant.

## v0.10.1 — 2026-11-11
- **Sagas** (livres, films, jeux, anthologies) :
  - les tomes d'une même série sont repérés tout seuls (Wikidata « fait partie de la série », puis titres numérotés comme « Toy Story 2 ») ;
  - au premier lancement, les fiches déjà là sont rassemblées en arrière-plan ; Réglages › « Rassembler les sagas » (bêta) relance la recherche ;
  - affichage en **pile** (couverture + cartes décalées + nombre de tomes + petite barre d'avancement) ; toucher la pile la déroule sur place ;
  - chaque saga a sa note et son affiche (par défaut celle du tome 1) ;
  - fiche › ⋯ › « Saga… » : ranger dans une saga, en sortir, changer le numéro ; pile déroulée › ⋯ : renommer, défaire.
- **Bouton pile** dans la barre d'outils : groupé (piles, séries d'un bloc) ou séparé (chaque tome, chaque saison à part).
- **Séries saison par saison** : chaque saison a son statut (vue, en cours, à voir, pas vue en gris), sa note, son image (TVmaze) et ses dates ; une série apparaît dans chaque page concernée (dès qu'une saison est vue : dans Vues), avec un bandeau d'une case par saison et un petit résumé (« S1–2 vues · S3 en cours ») ; les dates des saisons vont dans la frise.
- **Courts & anthologies** : nouveau type caché sous l'onglet Séries (appui long sur l'onglet : Séries / Courts & anthologies / mélanger les courts dans les séries). Chaque court métrage ou épisode d'anthologie est une fiche notée seule ; les épisodes d'une anthologie forment une pile.
- Excel : colonnes « Saga » et « Tome », onglets « Sagas » et « Saisons » (relus à l'import).

## v0.10.0 — 2026-11-11
- Trier mes fiches › nouvel onglet **Vérifier** : je colle une liste (une ligne par titre : `Type | Titre | Année | Statut | Note | Date | Avis`, seul le titre est obligatoire).
  - Chaque ligne devient une fiche « à vérifier », cachée partout ailleurs (listes, recherche, frise, tri).
  - Les titres déjà dans ma liste sont écartés ; le bilan dit lesquels, et les lignes illisibles.
  - L'appli cherche les infos de base comme pour un ajout normal (affiche, créateur, genres).
  - Cartes : glisser à droite = **Ajouter** (la fiche rejoint ma médiathèque), à gauche = **Ignorer** (effacée), « Retour » pour revenir en arrière ; toucher la carte ouvre la vraie fiche pour tout compléter.
- Réglages › « Trier mes fiches » affiche le nombre de titres à vérifier. Excel : colonne « À vérifier ».

## v0.9.5 — 2026-11-11
- Zoom fluide : en pinçant, la liste grossit ou rétrécit en suivant les doigts, puis se cale en douceur sur le niveau le plus proche.
- Étoiles du mode Trier : plus d'animation (juste une petite vibration).
- Bouton « ? » à côté des étoiles (fiche et mode Trier) : « je noterai plus tard » ; le mode Trier ne redemande plus la note. Excel : colonne « Note plus tard ».
- Ménage : plus de données de test (Charger / Effacer, filtre « Fiches de test », « Garder et réinitialiser », colonne Excel « Test », fichier test.js) et quelques morceaux de code qui ne servaient plus.

## v0.9.4 — 2026-11-11
- Tri plus agréable :
  - vibrations différentes selon le choix (Vu, Pas intéressé, À voir, Réserve), une petite quand la carte a assez glissé ;
  - étoiles qui s'allument en vague, avec une vibration par étoile et des éclats ;
  - avis : petite coche « Enregistré » quand il est sauvé.
- Trier › Compléter : un seul type de média à la fois (toucher « Jeux » garde seulement les jeux).
- Trier › Compléter : toucher l'affiche ou le titre ouvre la fiche ; en la fermant, on revient à la même carte.
- Découvrir : bouton « Retour » toujours là ; il annule le dernier choix et fait revenir la carte, autant de fois qu'on veut (aussi depuis l'écran de fin).

## v0.9.3 — 2026-11-11
- Zoom des listes en pinçant à deux doigts (sur PC : Ctrl + molette) :
  - Liste et Compacte : grande / normale / petite / deux colonnes ;
  - Mosaïque : de 2 à 6 colonnes.
  Le niveau est gardé pour chaque type (sur chaque appareil).
- Les listes sont coupées en étapes selon le tri : par note (★★★★★…), par année, par lettre (titre), par année de visionnage (dernier vu), par mois d'ajout.
- Téléphone : barre de défilement rapide à droite (apparaît quand on fait défiler une longue liste) ; on attrape la poignée et une bulle montre l'étape (★★★★, 2019, M…).

## v0.9.2 — 2026-11-11
- Films : plus de statut « En cours » (2 pages : À voir, Vus). Les films qui étaient en cours passent en « Vu », leur date de début devient la date de visionnage.
- Dates : raccourcis « À sa sortie » (cherche le mois de sortie en France, sinon la 1re sortie ; remplit la case, à ajuster), « Vu aujourd'hui » et « Commencé aujourd'hui » (remplissent les cases ; « Commencé » passe le titre en cours, pas pour les films), « Enfance » (ajouté tout de suite).
- Frise : bloc « Enfance » tout au début (avant les années).
- Google Images s'ouvre dans le navigateur principal du téléphone (plus dans une fenêtre de l'appli).
- Réglages : « Trier mes fiches » remonté tout en haut (section « À trier »).
- Icônes : engrenage pour les Réglages, pendule qui remonte le temps pour la Frise.
- Onglets du bas : seulement le style « Bloc ». Retirés (pour mémoire) : « Cases » (T1), « Classeur » (T3), « Tuiles » (T4).

## v0.9.1 — 2026-11-10
- Mode Trier (Compléter) › Note : bouton « À revoir / À rejouer / À relire » à côté des étoiles, et une case « Avis » juste dessous (enregistrée toute seule).

## v0.9.0 — 2026-11-10
- Découvrir : nouvelle catégorie « Films populaires 1970+ (US et France) » — environ 1 000 grands succès et films très connus, américains et français, sortis depuis 1970 (choisis à la main d'après les succès en salle).
- Découvrir : les cartes passent dans l'ordre alphabétique (au lieu du hasard).

## v0.8.3 — 2026-11-10
- Chaque fiche retient si son affiche a été choisie à la main (Choisir l'affiche, Trier, Découvrir, Modifier) ou trouvée automatiquement. Rien de visible pour l'instant (servira à passer en revue les affiches automatiques). Excel : colonne « Affiche choisie ».

## v0.8.2 — 2026-11-10
- Téléphone : dans les fenêtres plein écran (Trier, Découvrir…), le message « Annuler » s'affiche tout en bas, plus par-dessus les boutons.

## v0.8.1 — 2026-11-10
- Découvrir : les infos et affiches des 5 films suivants sont chargées à l'avance (les cartes s'affichent sans attendre).
- Sur l'affiche de la carte : petite croix = enlever cette affiche (pas la bonne), petit crayon = en choisir une autre sous la carte (affiches trouvées, Google Images, Coller). La fiche créée garde l'affiche choisie.

## v0.8.0 — 2026-11-10
- (bêta) « Trier mes fiches » › onglet **Découvrir** : des films connus qui ne sont pas encore dans ma liste, par catégories à cocher (Disney + Pixar + remakes, DreamWorks et autres animés, Ghibli, Marvel, DC, action, Star Wars, classiques, meilleurs films français — ~470 films). Grande affiche ; glisser à droite = Vu, à gauche = Pas intéressé ; boutons À voir / Réserve ; « Voir aussi » sous la carte ; « Annuler » après chaque choix.
- « Pas intéressé » : caché partout (recherche, Voir aussi, Découvrir), gardé dans un onglet « Pas intéressés » de l'export Excel (relu à l'import).
- Recherche et Voir aussi : jusqu'à 20 résultats.
- Appui long sur un résultat : petite bulle avec le titre complet (sur PC : au survol).

## v0.7.0 — 2026-11-10
- Dates « Vu » : une période « De … À … » (chaque bout en jour, mois ou année), ou une date seule (« À » vide). Bouton « Grille » : on touche le mois de début puis celui de fin.
- Saisons = raccourci qui remplit la période (hiver 2025 = déc. 2024 → févr. 2025). Les anciennes dates « été 2024 » deviennent « juin → août 2024 ».
- « Commencé » disparaît : passer en « En cours » ouvre « depuis [ce mois] … » (pastille violette), passer en « Vu » ou « Abandonné » la ferme au mois actuel. Toucher une date : Modifier ou Enlever.
- Frise : les périodes donnent les barres de durée (frise horizontale) et « oct. → déc. » dans la ligne du temps.
- Mode Trier : la carte ne passe plus toute seule et ne se glisse plus ; boutons « Précédent » / « Suivant ». La date s'y saisit comme dans la fiche.
- Excel : colonne « Commencé » retirée (les périodes sont dans « Vu ») ; les anciens fichiers se réimportent toujours.

## v0.6.0 — 2026-11-10
- (bêta) Réglages › « Trier mes fiches » : les fiches incomplètes défilent une par une ; je choisis les types et quoi compléter (note, date pour la frise, affiche, tags). La carte passe toute seule quand tout est rempli ; glisser à gauche = passer, à droite = revenir.
- Choisir l'affiche (et Trier) : bouton « Google Images » (recherche « titre affiche / jaquette / couverture ») + « Coller » qui met l'adresse d'image copiée.
- Fiche d'un titre « à voir » ou « en réserve » : plus de note ni de dates (l'avis reste).
- Les catégories de la page À voir passent dans le menu Tags, avec « Catégories à la suite » (par défaut) ou « Tout mélangé » (grisés et petits mots gardés).
- Recherche d'affiches et « Voir aussi » : titres comparés sans la ponctuation, titre exact en premier (ex. « Animal Crossing : New Horizons » ne tombe plus sur la série).

## v0.5.0 — 2026-11-10
- Jeux : « Infini ∞ » (déjà joué mais toujours bon pour une petite partie). Dans la fiche, le petit bouton à côté du statut propose au choix « À rejouer » ou « Infini ».
- Page « À voir / À jouer / À lire » : catégories séparées (À voir, À revoir/rejouer, Infini, En réserve) avec des pastilles en haut pour en mélanger plusieurs. Les titres à revoir / infinis y apparaissent aussi.
- (bêta) Menu Tags › Filtres : fiches de test, sans affiche, sans note, sans date, sans genre, sans tag, sans créateur, sans année, sans support.
- « Voir aussi » est cherché dès l'ouverture de la fiche (le bouton ne fait qu'afficher), et ne montre plus que de vraies œuvres (Wikidata) : plus d'acteurs, de franchises ou de personnages.
- Excel : colonne « Infini ».

## v0.4.0 — 2026-11-10
- Jeux : recherche complétée par Wikidata (studio, genres, année de 1re sortie) et jaquette Steam en hauteur (600 × 900). « Voir aussi › Même studio » d'après Wikidata ; jaquette Steam en tête de « Choisir l'affiche ».
- (bêta) Fiche › ⋯ › « Garder et réinitialiser » sur une fiche de test : on choisit le statut, tout le perso est effacé, la fiche est gardée pour de bon.
- Réglages › Données : nombre de fiches (par type), images gardées, poids et part de l'espace gratuit, fiches de test.
- Fiche : statut (grande pastille avec son icône) et « À revoir / À rejouer / À relire » (petit, discret) sur la même ligne.
- Fiche : « Voir aussi » devient un bouton en bas qui déplie la fiche ; les suggestions ne sont cherchées qu'à ce moment-là.
- « Support » seulement pour les jeux. Liste de départ : PC, Téléphone, Switch, Switch 2, Wii, NDS, Game Boy, PS1 à PS5, Autres (+ « Ajouter un support… »). L'ancienne liste est remplacée une fois (les supports ajoutés à la main sont gardés).

## v0.3.1 — 2026-11-10
- Choisir l'affiche : films et jeux proposent maintenant les affiches des autres pays (Wikipédia russe, coréenne, ukrainienne…), ex. 9 pour Midsommar, 12 pour Oppenheimer. Images en largeur retirées de la grille.
- Affiches plus nettes : la fiche affiche l'image du site en pleine qualité (la copie gardée sert de secours hors ligne), copies gardées plus grandes (240 × 360), images plus grandes demandées aux sites.
- Les anciennes copies sont refaites en meilleure qualité, tranquillement en arrière-plan.

## v0.3.0 — 2026-11-10
- Ajouter : 4 petites icônes de statut à côté de chaque résultat (À voir, En cours, Vu, Réserve). Un titre déjà dans la médiathèque montre son statut (plus de doublons).
- Fiche : section « Voir aussi » — titres proches (Wikipédia) et même réalisateur / studio / auteur / chaîne, ajout direct avec le statut.
- Toucher l'affiche de la fiche : « Choisir l'affiche » (posters TVmaze pour les séries, couvertures des éditions pour les livres, Wikipédia pour films et jeux), photo / fichier, ou lien.
- Seulement des images au format affiche (en hauteur) : les logos et captures en largeur sont écartés.
- PC : deux curseurs dans Réglages — « Texte » (taille de l'écran) et « Jaquettes » (taille des affiches) — à la place de « Taille ».
- PC : on élargit la barre de gauche, le panneau de la fiche et les colonnes du tableau en attrapant leur bord (double-clic = largeur de départ ; Réglages › Largeurs › Remettre).

## v0.2.0 — 2026-11-10
- Films et jeux : la recherche prend maintenant la vraie affiche (Wikipédia anglais) au lieu du logo du titre.
- Modifier › « Chercher l'affiche » : choisir la bonne affiche parmi celles trouvées en ligne (pour corriger les fiches déjà ajoutées).
- PC : réglage « Taille » (Normale / Grande / Très grande), « Grande » par défaut.

## v0.1.0 — 2026-11-10
Première version.
- Jeux, films, séries, livres (+ BD et mangas) : 3 pages par type — À voir (+ en réserve en bas), En cours, Vus (+ abandonnés en bas).
- Téléphone : on glisse la liste pour changer de page, ou on appuie sur le titre et on glisse jusqu'au choix. Petite vibration.
- PC : barre de gauche (recherche Ctrl K), statuts en onglets, fiche dans un panneau à droite, vue Tableau modifiable.
- Vues Liste / Compacte / Mosaïque (+ Tableau sur PC), tri, filtre par tags et genres.
- Fiche : statut, étoiles, coup de cœur, « à revoir », dates de passage souples (jour, mois, saison, année), saisons des séries en option, support, tags, avis.
- Ajout avec recherche en ligne (TVmaze, Open Library, Wikipédia) et copie réduite de l'affiche gardée dans la fiche ; ajout à la main ; partage Android.
- Frise : ligne du temps, horizontale par type, mur par mois.
- Réglages : thème, 5 couleurs d'accent, 4 styles d'onglets du bas, 3 styles de fiche PC, police PC, animations, vibrations, supports, notes.
- Export / import Excel (avec miniatures), données de test (200 titres) à charger et effacer.
