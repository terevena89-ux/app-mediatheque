// =========================================================
// Mode « Découvrir » (bêta) : listes de films connus, par catégorie.
// Chaque ligne = « Titre français | année de sortie ».
// Les titres sont ceux de Wikipédia en français (pour que la recherche
// trouve l'affiche et pour reconnaître les films déjà dans ma liste).
// Pour ajouter un film : une ligne de plus dans la bonne catégorie.
// =========================================================

const DISNEY = `
Blanche-Neige et les Sept Nains|1937
Pinocchio|1940
Fantasia|1940
Dumbo|1941
Bambi|1942
Saludos Amigos|1942
Les Trois Caballeros|1944
La Boîte à musique|1946
Coquin de printemps|1947
Mélodie Cocktail|1948
Le Crapaud et le Maître d'école|1949
Cendrillon|1950
Alice au pays des merveilles|1951
Peter Pan|1953
La Belle et le Clochard|1955
La Belle au bois dormant|1959
Les 101 Dalmatiens|1961
Merlin l'Enchanteur|1963
Le Livre de la jungle|1967
Les Aristochats|1970
Robin des Bois|1973
Les Aventures de Winnie l'ourson|1977
Les Aventures de Bernard et Bianca|1977
Rox et Rouky|1981
Taram et le Chaudron magique|1985
Basil, détective privé|1986
Oliver et Compagnie|1988
La Petite Sirène|1989
Bernard et Bianca au pays des kangourous|1990
La Belle et la Bête|1991
Aladdin|1992
Le Roi lion|1994
Pocahontas : Une légende indienne|1995
Le Bossu de Notre-Dame|1996
Hercule|1997
Mulan|1998
Tarzan|1999
Fantasia 2000|1999
Dinosaure|2000
Kuzco, l'empereur mégalo|2000
Atlantide, l'empire perdu|2001
Lilo et Stitch|2002
La Planète au trésor : Un nouvel univers|2002
Frère des ours|2003
La ferme se rebelle|2004
Chicken Little|2005
Bienvenue chez les Robinson|2007
Volt, star malgré lui|2008
La Princesse et la Grenouille|2009
Raiponce|2010
Winnie l'ourson|2011
Les Mondes de Ralph|2012
La Reine des neiges|2013
Les Nouveaux Héros|2014
Zootopie|2016
Vaiana : La Légende du bout du monde|2016
Ralph 2.0|2018
La Reine des neiges 2|2019
Raya et le Dernier Dragon|2021
Encanto : La Fantastique Famille Madrigal|2021
Avalonia, l'étrange voyage|2022
Wish : Asha et la Bonne Étoile|2023
Vaiana 2|2024
Zootopie 2|2025
Toy Story|1995
1001 pattes|1998
Toy Story 2|1999
Monstres et Cie|2001
Le Monde de Nemo|2003
Les Indestructibles|2004
Cars|2006
Ratatouille|2007
WALL-E|2008
Là-haut|2009
Toy Story 3|2010
Cars 2|2011
Rebelle|2012
Monstres Academy|2013
Vice-versa|2015
Le Voyage d'Arlo|2015
Le Monde de Dory|2016
Cars 3|2017
Coco|2017
Les Indestructibles 2|2018
Toy Story 4|2019
En avant|2020
Soul|2020
Luca|2021
Alerte rouge|2022
Buzz l'Éclair|2022
Élémentaire|2023
Vice-versa 2|2024
Elio|2025
Alice au pays des merveilles|2010
Maléfique|2014
Cendrillon|2015
Le Livre de la jungle|2016
Peter et Elliott le dragon|2016
La Belle et la Bête|2017
Jean-Christophe et Winnie|2018
Dumbo|2019
Aladdin|2019
Le Roi lion|2019
Maléfique : Le Pouvoir du mal|2019
Mulan|2020
Cruella|2021
Pinocchio|2022
La Petite Sirène|2023
Mufasa : Le Roi lion|2024
Blanche-Neige|2025
Lilo et Stitch|2025`;

const ANIMES = `
L'Étrange Noël de monsieur Jack|1993
Ghost in the Shell|1995
Anastasia|1997
Perfect Blue|1997
Fourmiz|1998
Le Prince d'Égypte|1998
Kirikou et la Sorcière|1998
Le Géant de fer|1999
Chicken Run|2000
La Route d'Eldorado|2000
Shrek|2001
L'Âge de glace|2002
Spirit, l'étalon des plaines|2002
Sinbad : La Légende des sept mers|2003
Les Triplettes de Belleville|2003
Shrek 2|2004
Gang de requins|2004
Madagascar|2005
Wallace et Gromit : Le Mystère du lapin-garou|2005
Les Noces funèbres|2005
Nos voisins, les hommes|2006
Souris City|2006
Paprika|2006
Persepolis|2007
Shrek le troisième|2007
Kung Fu Panda|2008
Coraline|2009
Fantastic Mr. Fox|2009
Tempête de boulettes géantes|2009
Monstres contre Aliens|2009
Dragons|2010
Moi, moche et méchant|2010
Megamind|2010
Shrek 4 : Il était une fin|2010
Kung Fu Panda 2|2011
Le Chat potté|2011
Rio|2011
Les Cinq Légendes|2012
L'Étrange Pouvoir de Norman|2012
Hôtel Transylvanie|2012
Ernest et Célestine|2012
Les Enfants loups, Ame et Yuki|2012
Les Croods|2013
Moi, moche et méchant 2|2013
Dragons 2|2014
La Grande Aventure Lego|2014
Le Chant de la mer|2014
Les Minions|2015
Shaun le mouton, le film|2015
Le Garçon et la Bête|2015
Kung Fu Panda 3|2016
Kubo et l'Armure magique|2016
Comme des bêtes|2016
Tous en scène|2016
Les Trolls|2016
Ma vie de Courgette|2016
Silent Voice|2016
Baby Boss|2017
Spider-Man: New Generation|2018
Dragons 3 : Le Monde caché|2019
J'ai perdu mon corps|2019
Les Enfants du temps|2019
Les Mitchell contre les machines|2021
Le Chat potté 2 : La Dernière Quête|2022
Les Bad Guys|2022
Suzume|2022
The First Slam Dunk|2022
Super Mario Bros, le film|2023
Le Robot sauvage|2024
Flow, le chat qui n'avait plus peur de l'eau|2024
Kung Fu Panda 4|2024
KPop Demon Hunters|2025`;

const GHIBLI = `
Nausicaä de la Vallée du Vent|1984
Le Château dans le ciel|1986
Le Tombeau des lucioles|1988
Mon voisin Totoro|1988
Kiki la petite sorcière|1989
Souvenirs goutte à goutte|1991
Porco Rosso|1992
Je peux entendre l'océan|1993
Pompoko|1994
Si tu tends l'oreille|1995
Princesse Mononoké|1997
Mes voisins les Yamada|1999
Le Voyage de Chihiro|2001
Le Royaume des chats|2002
Le Château ambulant|2004
Les Contes de Terremer|2006
Ponyo sur la falaise|2008
Arrietty, le petit monde des chapardeurs|2010
La Colline aux coquelicots|2011
Le vent se lève|2013
Le Conte de la princesse Kaguya|2013
Souvenirs de Marnie|2014
La Tortue rouge|2016
Aya et la Sorcière|2020
Le Garçon et le Héron|2023`;

const MCU = `
Iron Man|2008
L'Incroyable Hulk|2008
Iron Man 2|2010
Thor|2011
Captain America: First Avenger|2011
Avengers|2012
Iron Man 3|2013
Thor : Le Monde des ténèbres|2013
Captain America : Le Soldat de l'hiver|2014
Les Gardiens de la Galaxie|2014
Avengers : L'Ère d'Ultron|2015
Ant-Man|2015
Captain America: Civil War|2016
Doctor Strange|2016
Les Gardiens de la Galaxie Vol. 2|2017
Spider-Man: Homecoming|2017
Thor : Ragnarok|2017
Black Panther|2018
Avengers: Infinity War|2018
Ant-Man et la Guêpe|2018
Captain Marvel|2019
Avengers: Endgame|2019
Spider-Man: Far From Home|2019
Black Widow|2021
Shang-Chi et la Légende des Dix Anneaux|2021
Les Éternels|2021
Spider-Man: No Way Home|2021
Doctor Strange in the Multiverse of Madness|2022
Thor: Love and Thunder|2022
Black Panther: Wakanda Forever|2022
Ant-Man et la Guêpe : Quantumania|2023
Les Gardiens de la Galaxie Vol. 3|2023
The Marvels|2023
Deadpool et Wolverine|2024
Captain America: Brave New World|2025
Thunderbolts*|2025
Les 4 Fantastiques : Premiers Pas|2025`;

const DC = `
Superman|1978
Batman|1989
Batman : Le Défi|1992
Batman Forever|1995
Batman et Robin|1997
Batman Begins|2005
Constantine|2005
V pour Vendetta|2005
Superman Returns|2006
The Dark Knight : Le Chevalier noir|2008
Watchmen : Les Gardiens|2009
Green Lantern|2011
The Dark Knight Rises|2012
Man of Steel|2013
Batman v Superman : L'Aube de la justice|2016
Suicide Squad|2016
Wonder Woman|2017
Justice League|2017
Aquaman|2018
Shazam!|2019
Joker|2019
Birds of Prey et la fantabuleuse histoire de Harley Quinn|2020
Wonder Woman 1984|2020
Zack Snyder's Justice League|2021
The Suicide Squad|2021
The Batman|2022
Black Adam|2022
The Flash|2023
Blue Beetle|2023
Aquaman et le Royaume perdu|2023
Joker : Folie à deux|2024
Superman|2025`;

const ACTION = `
Terminator 2 : Le Jugement dernier|1991
Point Break|1991
Le Fugitif|1993
Jurassic Park|1993
Speed|1994
True Lies|1994
Léon|1994
Heat|1995
Une journée en enfer|1995
Bad Boys|1995
Mission impossible|1996
Rock|1996
Volte-face|1997
Le Cinquième Élément|1997
Ronin|1998
Ennemi d'État|1998
Matrix|1999
Gladiator|2000
Tigre et Dragon|2000
Fast and Furious|2001
La Mémoire dans la peau|2002
Kill Bill : Volume 1|2003
Pirates des Caraïbes : La Malédiction du Black Pearl|2003
La Mort dans la peau|2004
Collatéral|2004
Sin City|2005
Casino Royale|2006
300|2006
Die Hard 4 : Retour en enfer|2007
La Vengeance dans la peau|2007
Taken|2008
Avatar|2009
Inception|2010
The Raid|2011
Skyfall|2012
Edge of Tomorrow|2014
John Wick|2014
Kingsman : Services secrets|2014
Mad Max: Fury Road|2015
Mission impossible : Rogue Nation|2015
Fast and Furious 7|2015
Baby Driver|2017
Atomic Blonde|2017
John Wick 2|2017
Mission impossible : Fallout|2018
John Wick Parabellum|2019
1917|2019
Tyler Rake|2020
Dune|2021
Top Gun : Maverick|2022
RRR|2022
John Wick : Chapitre 4|2023
Mission: Impossible – Dead Reckoning Partie 1|2023
Furiosa : Une saga Mad Max|2024
F1|2025`;

const STAR_WARS = `
Star Wars, épisode IV : Un nouvel espoir|1977
Star Wars, épisode V : L'Empire contre-attaque|1980
Star Wars, épisode VI : Le Retour du Jedi|1983
Star Wars, épisode I : La Menace fantôme|1999
Star Wars, épisode II : L'Attaque des clones|2002
Star Wars, épisode III : La Revanche des Sith|2005
Star Wars: The Clone Wars|2008
Star Wars, épisode VII : Le Réveil de la Force|2015
Rogue One: A Star Wars Story|2016
Star Wars, épisode VIII : Les Derniers Jedi|2017
Solo: A Star Wars Story|2018
Star Wars, épisode IX : L'Ascension de Skywalker|2019`;

const CLASSIQUES = `
Metropolis|1927
Les Temps modernes|1936
Le Magicien d'Oz|1939
Autant en emporte le vent|1939
Citizen Kane|1941
Casablanca|1942
La vie est belle|1946
Le Voleur de bicyclette|1948
Le Troisième Homme|1949
Boulevard du crépuscule|1950
Rashōmon|1950
Ève|1950
Chantons sous la pluie|1952
Le train sifflera trois fois|1952
Voyage à Tokyo|1953
Les Sept Samouraïs|1954
Fenêtre sur cour|1954
Sur les quais|1954
La Fureur de vivre|1955
La Prisonnière du désert|1956
Douze Hommes en colère|1957
Les Sentiers de la gloire|1957
Le Septième Sceau|1957
Les Fraises sauvages|1957
Sueurs froides|1958
La Mort aux trousses|1959
Certains l'aiment chaud|1959
Ben-Hur|1959
La dolce vita|1960
Psychose|1960
La Garçonnière|1960
Diamants sur canapé|1961
Lawrence d'Arabie|1962
Huit et demi|1963
Le Guépard|1963
Les Oiseaux|1963
Docteur Folamour|1964
La Mélodie du bonheur|1965
Le Bon, la Brute et le Truand|1966
Le Lauréat|1967
Bonnie et Clyde|1967
2001, l'Odyssée de l'espace|1968
Il était une fois dans l'Ouest|1968
La Planète des singes|1968
Easy Rider|1969
Orange mécanique|1971
Le Parrain|1972
L'Exorciste|1973
Chinatown|1974
Le Parrain 2|1974
Vol au-dessus d'un nid de coucou|1975
Les Dents de la mer|1975
Barry Lyndon|1975
Taxi Driver|1976
Rocky|1976
Annie Hall|1977
Rencontres du troisième type|1977
Voyage au bout de l'enfer|1978
Apocalypse Now|1979
Alien|1979
Manhattan|1979
Shining|1980
Raging Bull|1980
Les Aventuriers de l'arche perdue|1981
E.T., l'extra-terrestre|1982
Blade Runner|1982
The Thing|1982
Scarface|1983
Il était une fois en Amérique|1984
Terminator|1984
Amadeus|1984
Ran|1985
Retour vers le futur|1985
Brazil|1985
Aliens, le retour|1986
Platoon|1986
Full Metal Jacket|1987
Princess Bride|1987
Piège de cristal|1988
Cinema Paradiso|1988
Le Cercle des poètes disparus|1989
Les Affranchis|1990
Danse avec les loups|1990
Le Silence des agneaux|1991
Thelma et Louise|1991
Impitoyable|1992
La Liste de Schindler|1993
Les Évadés|1994
Forrest Gump|1994
Pulp Fiction|1994
Usual Suspects|1995
Seven|1995
Fargo|1996
Titanic|1997
La vie est belle|1997
The Big Lebowski|1998
Il faut sauver le soldat Ryan|1998
American Beauty|1999
Fight Club|1999
Le Sixième Sens|1999
Memento|2000
Requiem for a Dream|2000
In the Mood for Love|2000
Mulholland Drive|2001
Le Pianiste|2002
La Cité de Dieu|2002
Old Boy|2003
Eternal Sunshine of the Spotless Mind|2004
No Country for Old Men|2007
There Will Be Blood|2007`;

const FRANCAIS = `
La Grande Illusion|1937
La Règle du jeu|1939
Les Enfants du paradis|1945
La Belle et la Bête|1946
Jour de fête|1949
Le Salaire de la peur|1953
Les Vacances de monsieur Hulot|1953
Touchez pas au grisbi|1954
Les Diaboliques|1955
Mon oncle|1958
Les Quatre Cents Coups|1959
Hiroshima mon amour|1959
À bout de souffle|1960
Jules et Jim|1962
Cléo de 5 à 7|1962
Le Mépris|1963
Les Tontons flingueurs|1963
Les Parapluies de Cherbourg|1964
Le Corniaud|1965
Pierrot le Fou|1965
La Grande Vadrouille|1966
Le Samouraï|1967
Les Demoiselles de Rochefort|1967
Playtime|1967
L'Armée des ombres|1969
Le Cercle rouge|1970
La Folie des grandeurs|1971
Les Aventures de Rabbi Jacob|1973
La Planète sauvage|1973
Les Valseuses|1974
Le Vieux Fusil|1975
L'Aile ou la Cuisse|1976
La Cage aux folles|1978
Les Bronzés font du ski|1979
Le Dernier Métro|1980
Diva|1981
Le père Noël est une ordure|1982
Trois hommes et un couffin|1985
Jean de Florette|1986
Manon des sources|1986
Au revoir les enfants|1987
Le Grand Bleu|1988
La vie est un long fleuve tranquille|1988
Cyrano de Bergerac|1990
Nikita|1990
Delicatessen|1991
Les Visiteurs|1993
Trois Couleurs : Bleu|1993
Trois Couleurs : Rouge|1994
La Reine Margot|1994
La Haine|1995
La Cité des enfants perdus|1995
Le bonheur est dans le pré|1995
Ridicule|1996
Un air de famille|1996
Le Dîner de cons|1998
Taxi|1998
Le Goût des autres|2000
Le Fabuleux Destin d'Amélie Poulain|2001
Le Pacte des loups|2001
Astérix et Obélix : Mission Cléopâtre|2002
Huit Femmes|2002
Les Choristes|2004
Un long dimanche de fiançailles|2004
De battre mon cœur s'est arrêté|2005
OSS 117 : Le Caire, nid d'espions|2006
Ne le dis à personne|2006
La Môme|2007
Le Scaphandre et le Papillon|2007
Bienvenue chez les Ch'tis|2008
Entre les murs|2008
Un prophète|2009
Des hommes et des dieux|2010
Les Petits Mouchoirs|2010
The Artist|2011
Intouchables|2011
Polisse|2011
Amour|2012
Le Prénom|2012
La Vie d'Adèle|2013
Les Garçons et Guillaume, à table !|2013
Timbuktu|2014
La Famille Bélier|2014
Mustang|2015
Mon roi|2015
Divines|2016
Elle|2016
120 battements par minute|2017
Au revoir là-haut|2017
Petit Paysan|2017
Le Grand Bain|2018
Jusqu'à la garde|2018
Les Misérables|2019
Portrait de la jeune fille en feu|2019
Grâce à Dieu|2019
Hors normes|2019
Adieu les cons|2020
Titane|2021
L'Événement|2021
Illusions perdues|2021
Anatomie d'une chute|2023
Le Règne animal|2023
La Passion de Dodin Bouffant|2023
Les Trois Mousquetaires : D'Artagnan|2023
Le Comte de Monte-Cristo|2024
L'Amour ouf|2024`;

const lire = texte => texte.trim().split("\n").map(l => { const [titre, annee] = l.split("|"); return { titre: titre.trim(), annee: +annee }; });

// Les catégories, dans l'ordre de l'écran de choix
export const CATEGORIES = [
  { id: "disney",     nom: "Disney, Pixar et remakes",            films: lire(DISNEY) },
  { id: "animes",     nom: "DreamWorks et autres animés (1990+)", films: lire(ANIMES) },
  { id: "ghibli",     nom: "Studio Ghibli",                       films: lire(GHIBLI) },
  { id: "mcu",        nom: "Marvel (MCU)",                        films: lire(MCU) },
  { id: "dc",         nom: "DC",                                  films: lire(DC) },
  { id: "action",     nom: "Films d'action (1990+)",              films: lire(ACTION) },
  { id: "starwars",   nom: "Star Wars",                           films: lire(STAR_WARS) },
  { id: "classiques", nom: "Les classiques",                      films: lire(CLASSIQUES) },
  { id: "francais",   nom: "Meilleurs films français",            films: lire(FRANCAIS) }
];
