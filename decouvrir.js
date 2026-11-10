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

// Grands succès et films très vus en France depuis 1970, seulement américains et français.
// (Choix fait à la main d'après les succès en salle et les films les plus connus :
//  AlloCiné ne publie pas de liste « les plus vus » qu'on pourrait lire automatiquement.)
const POPULAIRES = `
Love Story|1970
M*A*S*H|1970
Patton|1970
Little Big Man|1970
Le Cercle rouge|1970
Borsalino|1970
Peau d'âne|1970
Le Gendarme en balade|1970
French Connection|1971
Orange mécanique|1971
L'Inspecteur Harry|1971
Charlie et la Chocolaterie|1971
La Folie des grandeurs|1971
Le Parrain|1972
Délivrance|1972
L'Aventure du Poséidon|1972
Cabaret|1972
Le Grand Blond avec une chaussure noire|1972
César et Rosalie|1972
L'Arnaque|1973
L'Exorciste|1973
American Graffiti|1973
Serpico|1973
Papillon|1973
Mean Streets|1973
Les Aventures de Rabbi Jacob|1973
La Nuit américaine|1973
Le Magnifique|1973
Mais où est donc passée la septième compagnie ?|1973
La Tour infernale|1974
Chinatown|1974
Le Parrain 2|1974
Frankenstein Junior|1974
Massacre à la tronçonneuse|1974
Les Valseuses|1974
Vincent, François, Paul… et les autres|1974
Le Retour du grand blond|1974
Les Dents de la mer|1975
Vol au-dessus d'un nid de coucou|1975
Un après-midi de chien|1975
The Rocky Horror Picture Show|1975
Les Trois Jours du Condor|1975
Barry Lyndon|1975
Le Vieux Fusil|1975
Peur sur la ville|1975
On a retrouvé la septième compagnie|1975
Cousin, cousine|1975
Le Sauvage|1975
Taxi Driver|1976
Rocky|1976
Carrie au bal du diable|1976
Les Hommes du président|1976
Network : Main basse sur la télévision|1976
La Malédiction|1976
L'Aile ou la Cuisse|1976
Le Jouet|1976
Un éléphant ça trompe énormément|1976
Star Wars, épisode IV : Un nouvel espoir|1977
Rencontres du troisième type|1977
Annie Hall|1977
La Fièvre du samedi soir|1977
L'Animal|1977
Grease|1978
Superman|1978
Halloween : La Nuit des masques|1978
Voyage au bout de l'enfer|1978
Midnight Express|1978
American College|1978
Les Bronzés|1978
La Cage aux folles|1978
La Zizanie|1978
Alien|1979
Apocalypse Now|1979
Kramer contre Kramer|1979
Manhattan|1979
Les Guerriers de la nuit|1979
L'Évadé d'Alcatraz|1979
Rocky 2 : La Revanche|1979
Les Bronzés font du ski|1979
Le Gendarme et les Extra-terrestres|1979
Flic ou Voyou|1979
I… comme Icare|1979
Star Wars, épisode V : L'Empire contre-attaque|1980
Shining|1980
Raging Bull|1980
The Blues Brothers|1980
Y a-t-il un pilote dans l'avion ?|1980
Elephant Man|1980
Fame|1980
Le Dernier Métro|1980
La Boum|1980
Inspecteur la Bavure|1980
Les Sous-doués|1980
Le Guignolo|1980
Le Coup du parapluie|1980
Les Aventuriers de l'arche perdue|1981
New York 1997|1981
Le Loup-garou de Londres|1981
Evil Dead|1981
La Chèvre|1981
Le Professionnel|1981
Les Uns et les Autres|1981
Diva|1981
E.T., l'extra-terrestre|1982
Blade Runner|1982
Rambo|1982
The Thing|1982
Tron|1982
Poltergeist|1982
Tootsie|1982
Rocky 3 : L'Œil du tigre|1982
48 heures|1982
La Boum 2|1982
Le père Noël est une ordure|1982
L'As des as|1982
Le Retour de Martin Guerre|1982
Les Sous-doués en vacances|1982
Star Wars, épisode VI : Le Retour du Jedi|1983
Scarface|1983
Flashdance|1983
Un fauteuil pour deux|1983
WarGames|1983
L'Étoffe des héros|1983
Christine|1983
Les Compères|1983
Tchao Pantin|1983
L'Été meurtrier|1983
Le Marginal|1983
Terminator|1984
S.O.S. Fantômes|1984
Gremlins|1984
Indiana Jones et le Temple maudit|1984
Le Flic de Beverly Hills|1984
Karaté Kid|1984
Les Griffes de la nuit|1984
Amadeus|1984
Il était une fois en Amérique|1984
Footloose|1984
Les Ripoux|1984
Marche à l'ombre|1984
Retour vers le futur|1985
Les Goonies|1985
Rambo 2 : La Mission|1985
Rocky 4|1985
Commando|1985
Out of Africa|1985
Witness|1985
The Breakfast Club|1985
La Couleur pourpre|1985
Subway|1985
Trois hommes et un couffin|1985
Police|1985
Les Spécialistes|1985
P.R.O.F.S.|1985
Top Gun|1986
Aliens, le retour|1986
Platoon|1986
La Mouche|1986
Stand by Me|1986
La Folle Journée de Ferris Bueller|1986
Les Aventures de Jack Burton dans les griffes du mandarin|1986
Jean de Florette|1986
Manon des sources|1986
37°2 le matin|1986
Les Fugitifs|1986
Full Metal Jacket|1987
L'Arme fatale|1987
RoboCop|1987
Predator|1987
Les Incorruptibles|1987
Dirty Dancing|1987
Wall Street|1987
Princess Bride|1987
Liaison fatale|1987
Good Morning, Vietnam|1987
La Folle Histoire de l'espace|1987
Au revoir les enfants|1987
Le Grand Chemin|1987
Piège de cristal|1988
Rain Man|1988
Qui veut la peau de Roger Rabbit|1988
Beetlejuice|1988
Big|1988
Willow|1988
Jumeaux|1988
Le Grand Bleu|1988
L'Ours|1988
La vie est un long fleuve tranquille|1988
Camille Claudel|1988
Batman|1989
Indiana Jones et la Dernière Croisade|1989
Retour vers le futur 2|1989
Le Cercle des poètes disparus|1989
Quand Harry rencontre Sally|1989
Abyss|1989
S.O.S. Fantômes 2|1989
L'Arme fatale 2|1989
Né un 4 juillet|1989
Chérie, j'ai rétréci les gosses|1989
Glory|1989
Trop belle pour toi|1989
Les Affranchis|1990
Danse avec les loups|1990
Ghost|1990
Pretty Woman|1990
Maman, j'ai raté l'avion !|1990
Total Recall|1990
Edward aux mains d'argent|1990
Le Parrain 3|1990
À la poursuite d'Octobre rouge|1990
Retour vers le futur 3|1990
Misery|1990
58 minutes pour vivre|1990
Cyrano de Bergerac|1990
Nikita|1990
La Gloire de mon père|1990
Le Château de ma mère|1990
Le Mari de la coiffeuse|1990
Terminator 2 : Le Jugement dernier|1991
Le Silence des agneaux|1991
Thelma et Louise|1991
JFK|1991
Point Break|1991
Hook ou la Revanche du capitaine Crochet|1991
Robin des Bois, prince des voleurs|1991
Les Nerfs à vif|1991
Delicatessen|1991
Tous les matins du monde|1991
L'Opération Corned-Beef|1991
La Totale !|1991
Basic Instinct|1992
Impitoyable|1992
Le Dernier des Mohicans|1992
Des hommes d'honneur|1992
Bodyguard|1992
Maman, j'ai encore raté l'avion|1992
Reservoir Dogs|1992
Dracula|1992
Sister Act|1992
Wayne's World|1992
Indochine|1992
L'Amant|1992
Les Nuits fauves|1992
Jurassic Park|1993
La Liste de Schindler|1993
Le Fugitif|1993
Philadelphia|1993
Un jour sans fin|1993
Madame Doubtfire|1993
Cliffhanger|1993
Last Action Hero|1993
True Romance|1993
Demolition Man|1993
Tombstone|1993
Nuits blanches à Seattle|1993
Hocus Pocus : Les Trois Sorcières|1993
Les Visiteurs|1993
Germinal|1993
Les Évadés|1994
Forrest Gump|1994
Pulp Fiction|1994
Le Roi lion|1994
Speed|1994
True Lies|1994
The Mask|1994
Entretien avec un vampire|1994
Dumb and Dumber|1994
Ace Ventura, détective chiens et chats|1994
Légendes d'automne|1994
Stargate, la porte des étoiles|1994
Léon|1994
La Reine Margot|1994
Les Roseaux sauvages|1994
Toy Story|1995
Seven|1995
Usual Suspects|1995
Heat|1995
Braveheart|1995
Casino|1995
Apollo 13|1995
Jumanji|1995
Une journée en enfer|1995
L'Armée des douze singes|1995
Bad Boys|1995
Waterworld|1995
Casper|1995
La Haine|1995
Gazon maudit|1995
Le bonheur est dans le pré|1995
Les Trois Frères|1995
Le Hussard sur le toit|1995
Independence Day|1996
Mission impossible|1996
Fargo|1996
Scream|1996
Rock|1996
Twister|1996
Jerry Maguire|1996
Mars Attacks!|1996
Space Jam|1996
Matilda|1996
Ridicule|1996
Un air de famille|1996
Titanic|1997
Men in Black|1997
Le Cinquième Élément|1997
Volte-face|1997
Will Hunting|1997
Le Monde perdu : Jurassic Park|1997
L.A. Confidential|1997
Bienvenue à Gattaca|1997
Boogie Nights|1997
Starship Troopers|1997
Pour le pire et pour le meilleur|1997
Air Force One|1997
Les Ailes de l'enfer|1997
The Game|1997
Le Mariage de mon meilleur ami|1997
La Vérité si je mens !|1997
Le Bossu|1997
Marius et Jeannette|1997
Didier|1997
Il faut sauver le soldat Ryan|1998
The Truman Show|1998
Armageddon|1998
The Big Lebowski|1998
Mary à tout prix|1998
American History X|1998
Godzilla|1998
Le Masque de Zorro|1998
Rush Hour|1998
La Ligne rouge|1998
Deep Impact|1998
Vous avez un message|1998
Ennemi d'État|1998
Le Dîner de cons|1998
Taxi|1998
Les Couloirs du temps : Les Visiteurs 2|1998
Matrix|1999
Fight Club|1999
Le Sixième Sens|1999
American Beauty|1999
La Ligne verte|1999
Star Wars, épisode I : La Menace fantôme|1999
Toy Story 2|1999
Sleepy Hollow|1999
Magnolia|1999
American Pie|1999
La Momie|1999
Le Projet Blair Witch|1999
Dans la peau de John Malkovich|1999
Eyes Wide Shut|1999
Astérix et Obélix contre César|1999
Jeanne d'Arc|1999
La Bûche|1999
Vénus Beauté (Institut)|1999
Gladiator|2000
Memento|2000
Seul au monde|2000
Erin Brockovich, seule contre tous|2000
Mission impossible 2|2000
X-Men|2000
Mon beau-père et moi|2000
Ce que veulent les femmes|2000
Traffic|2000
O'Brother|2000
Requiem for a Dream|2000
Incassable|2000
En pleine tempête|2000
Destination finale|2000
Le Goût des autres|2000
Taxi 2|2000
Les Rivières pourpres|2000
Shrek|2001
Harry Potter à l'école des sorciers|2001
Le Seigneur des anneaux : La Communauté de l'anneau|2001
Monstres et Cie|2001
Ocean's Eleven|2001
Un homme d'exception|2001
Pearl Harbor|2001
Fast and Furious|2001
La Chute du faucon noir|2001
Moulin Rouge|2001
Donnie Darko|2001
Training Day|2001
Zoolander|2001
Le Fabuleux Destin d'Amélie Poulain|2001
Le Pacte des loups|2001
Le Placard|2001
La Vérité si je mens ! 2|2001
La Tour Montparnasse infernale|2001
Spider-Man|2002
Harry Potter et la Chambre des secrets|2002
Le Seigneur des anneaux : Les Deux Tours|2002
Arrête-moi si tu peux|2002
Minority Report|2002
La Mémoire dans la peau|2002
Signes|2002
Gangs of New York|2002
Chicago|2002
L'Âge de glace|2002
Men in Black 2|2002
Panic Room|2002
Le Cercle|2002
Le Pianiste|2002
Astérix et Obélix : Mission Cléopâtre|2002
Huit Femmes|2002
L'Auberge espagnole|2002
Être et avoir|2002
Pirates des Caraïbes : La Malédiction du Black Pearl|2003
Le Seigneur des anneaux : Le Retour du roi|2003
Le Monde de Nemo|2003
Matrix Reloaded|2003
Matrix Revolutions|2003
Kill Bill : Volume 1|2003
X-Men 2|2003
Terminator 3 : Le Soulèvement des machines|2003
Bruce tout-puissant|2003
Mystic River|2003
Big Fish|2003
Lost in Translation|2003
Elfe|2003
Bad Boys II|2003
Comment se faire larguer en 10 leçons|2003
Taxi 3|2003
Chouchou|2003
Jeux d'enfants|2003
Shrek 2|2004
Spider-Man 2|2004
Harry Potter et le Prisonnier d'Azkaban|2004
Les Indestructibles|2004
Kill Bill : Volume 2|2004
Eternal Sunshine of the Spotless Mind|2004
Million Dollar Baby|2004
Le Terminal|2004
Troie|2004
Le Jour d'après|2004
Collatéral|2004
Aviator|2004
N'oublie jamais|2004
Mean Girls|2004
La Mort dans la peau|2004
Ocean's Twelve|2004
Saw|2004
Ray|2004
Collision|2004
Starsky et Hutch|2004
Présentateur vedette : La Légende de Ron Burgundy|2004
Les Choristes|2004
Un long dimanche de fiançailles|2004
36 quai des Orfèvres|2004
Banlieue 13|2004
Podium|2004
RRRrrrr!!!|2004
Star Wars, épisode III : La Revanche des Sith|2005
Batman Begins|2005
Harry Potter et la Coupe de feu|2005
Charlie et la Chocolaterie|2005
King Kong|2005
La Guerre des mondes|2005
Mr. et Mrs. Smith|2005
Sin City|2005
Le Monde de Narnia : Le Lion, la Sorcière blanche et l'Armoire magique|2005
Madagascar|2005
Le Secret de Brokeback Mountain|2005
Walk the Line|2005
40 ans, toujours puceau|2005
Munich|2005
Hitch, expert en séduction|2005
Brice de Nice|2005
De battre mon cœur s'est arrêté|2005
L'Empire des loups|2005
Les Poupées russes|2005
Casino Royale|2006
Pirates des Caraïbes : Le Secret du coffre maudit|2006
Les Infiltrés|2006
Le Prestige|2006
Cars|2006
Da Vinci Code|2006
Little Miss Sunshine|2006
Le diable s'habille en Prada|2006
La Nuit au musée|2006
X-Men : L'Affrontement final|2006
À la recherche du bonheur|2006
Borat|2006
Apocalypto|2006
Blood Diamond|2006
300|2006
Les Fils de l'homme|2006
Mission impossible 3|2006
The Holiday|2006
Inside Man : L'Homme de l'intérieur|2006
Rocky Balboa|2006
Lettres d'Iwo Jima|2006
OSS 117 : Le Caire, nid d'espions|2006
Ne le dis à personne|2006
Prête-moi ta main|2006
Les Bronzés 3 : Amis pour la vie|2006
Je vais bien, ne t'en fais pas|2006
Camping|2006
Arthur et les Minimoys|2006
Nos jours heureux|2006
Transformers|2007
Spider-Man 3|2007
Pirates des Caraïbes : Jusqu'au bout du monde|2007
Harry Potter et l'Ordre du phénix|2007
Ratatouille|2007
Je suis une légende|2007
La Vengeance dans la peau|2007
No Country for Old Men|2007
There Will Be Blood|2007
Into the Wild|2007
Juno|2007
Les Simpson, le film|2007
Die Hard 4 : Retour en enfer|2007
Zodiac|2007
American Gangster|2007
Il était une fois|2007
SuperGrave|2007
En cloque, mode d'emploi|2007
Paranormal Activity|2007
3h10 pour Yuma|2007
L'Assassinat de Jesse James par le lâche Robert Ford|2007
Hairspray|2007
Gone Baby Gone|2007
La Môme|2007
Le Scaphandre et le Papillon|2007
Persepolis|2007
Ensemble, c'est tout|2007
Taxi 4|2007
L'Ennemi intime|2007
The Dark Knight : Le Chevalier noir|2008
Iron Man|2008
WALL-E|2008
L'Étrange Histoire de Benjamin Button|2008
Indiana Jones et le Royaume du crâne de cristal|2008
Mamma Mia!|2008
Twilight, chapitre I : Fascination|2008
Kung Fu Panda|2008
Gran Torino|2008
Taken|2008
Tonnerre sous les tropiques|2008
Quantum of Solace|2008
Hancock|2008
Wanted : Choisis ton destin|2008
Les Noces rebelles|2008
Frangins malgré eux|2008
Bienvenue chez les Ch'tis|2008
Entre les murs|2008
Astérix aux Jeux olympiques|2008
Mesrine : L'Instinct de mort|2008
Mesrine : L'Ennemi public no 1|2008
LOL|2008
Paris|2008
Disco|2008
Avatar|2009
Very Bad Trip|2009
Là-haut|2009
Inglourious Basterds|2009
Star Trek|2009
Harry Potter et le Prince de sang-mêlé|2009
Sherlock Holmes|2009
Transformers 2 : La Revanche|2009
2012|2009
The Blind Side|2009
Démineurs|2009
Bienvenue à Zombieland|2009
Twilight, chapitre II : Tentation|2009
Watchmen : Les Gardiens|2009
Terminator Renaissance|2009
Un prophète|2009
Le Petit Nicolas|2009
OSS 117 : Rio ne répond plus|2009
Coco avant Chanel|2009
Le Concert|2009
Neuilly sa mère !|2009
Micmacs à tire-larigot|2009
Inception|2010
Toy Story 3|2010
The Social Network|2010
Shutter Island|2010
Black Swan|2010
Harry Potter et les Reliques de la Mort, partie 1|2010
Raiponce|2010
Iron Man 2|2010
Dragons|2010
Moi, moche et méchant|2010
True Grit|2010
Kick-Ass|2010
Scott Pilgrim|2010
Tron : L'Héritage|2010
127 heures|2010
Fighter|2010
The Town|2010
Insidious|2010
Twilight, chapitre III : Hésitation|2010
Des hommes et des dieux|2010
Les Petits Mouchoirs|2010
Camping 2|2010
Tout ce qui brille|2010
Fatal|2010
Harry Potter et les Reliques de la Mort, partie 2|2011
Drive|2011
Super 8|2011
La Couleur des sentiments|2011
Crazy, Stupid, Love|2011
Mes meilleures amies|2011
La Planète des singes : Les Origines|2011
Le Stratège|2011
Hugo Cabret|2011
Minuit à Paris|2011
Thor|2011
Captain America: First Avenger|2011
X-Men : Le Commencement|2011
Mission impossible : Protocole Fantôme|2011
Sherlock Holmes : Jeu d'ombres|2011
Fast and Furious 5|2011
Millénium : Les hommes qui n'aimaient pas les femmes|2011
Very Bad Trip 2|2011
Transformers 3 : La Face cachée de la Lune|2011
Pirates des Caraïbes : La Fontaine de jouvence|2011
Contagion|2011
Intouchables|2011
The Artist|2011
Rien à déclarer|2011
Polisse|2011
La guerre est déclarée|2011
Les Femmes du 6e étage|2011
Les Tuche|2011
L'Élève Ducobu|2011
Avengers|2012
The Dark Knight Rises|2012
Hunger Games|2012
Django Unchained|2012
Lincoln|2012
Argo|2012
L'Odyssée de Pi|2012
Les Misérables|2012
Happiness Therapy|2012
Looper|2012
The Amazing Spider-Man|2012
Ted|2012
Prometheus|2012
Moonrise Kingdom|2012
Zero Dark Thirty|2012
21 Jump Street|2012
Men in Black 3|2012
Le Hobbit : Un voyage inattendu|2012
De rouille et d'os|2012
Le Prénom|2012
Amour|2012
Astérix et Obélix : Au service de Sa Majesté|2012
Les Kaïra|2012
Gravity|2013
Le Loup de Wall Street|2013
12 Years a Slave|2013
La Reine des neiges|2013
Her|2013
Dallas Buyers Club|2013
Hunger Games : L'Embrasement|2013
Iron Man 3|2013
Man of Steel|2013
Insaisissables|2013
Conjuring : Les Dossiers Warren|2013
Prisoners|2013
American Bluff|2013
Rush|2013
La Vie rêvée de Walter Mitty|2013
Fast and Furious 6|2013
World War Z|2013
Pacific Rim|2013
Oblivion|2013
Moi, moche et méchant 2|2013
Le Hobbit : La Désolation de Smaug|2013
La Vie d'Adèle|2013
Les Garçons et Guillaume, à table !|2013
Les Profs|2013
Casse-tête chinois|2013
Jeune et Jolie|2013
Interstellar|2014
Les Gardiens de la Galaxie|2014
Whiplash|2014
Gone Girl|2014
The Grand Budapest Hotel|2014
Birdman|2014
Night Call|2014
Edge of Tomorrow|2014
John Wick|2014
American Sniper|2014
Nos étoiles contraires|2014
Divergente|2014
Imitation Game|2014
Captain America : Le Soldat de l'hiver|2014
X-Men: Days of Future Past|2014
La Planète des singes : L'Affrontement|2014
Les Nouveaux Héros|2014
Le Labyrinthe|2014
Fury|2014
Godzilla|2014
Boyhood|2014
Le Hobbit : La Bataille des Cinq Armées|2014
Qu'est-ce qu'on a fait au Bon Dieu ?|2014
La Famille Bélier|2014
Samba|2014
Lucy|2014
Hippocrate|2014
Les Combattants|2014
Babysitting|2014
Supercondriaque|2014
Astérix : Le Domaine des dieux|2014
Les Vacances du petit Nicolas|2014
Yves Saint Laurent|2014
Barbecue|2014
Mad Max: Fury Road|2015
Star Wars, épisode VII : Le Réveil de la Force|2015
Jurassic World|2015
Vice-versa|2015
Seul sur Mars|2015
The Revenant|2015
Spotlight|2015
Les Huit Salopards|2015
Fast and Furious 7|2015
Creed : L'Héritage de Rocky Balboa|2015
Sicario|2015
The Big Short : Le Casse du siècle|2015
Avengers : L'Ère d'Ultron|2015
Ant-Man|2015
Les Minions|2015
Le Pont des espions|2015
Mission impossible : Rogue Nation|2015
Mustang|2015
Dheepan|2015
La Loi du marché|2015
Mon roi|2015
Babysitting 2|2015
Les Profs 2|2015
Deadpool|2016
La La Land|2016
Premier Contact|2016
Moonlight|2016
Zootopie|2016
Rogue One: A Star Wars Story|2016
Les Animaux fantastiques|2016
Doctor Strange|2016
Suicide Squad|2016
Tu ne tueras point|2016
Manchester by the Sea|2016
Les Figures de l'ombre|2016
Comancheria|2016
Split|2016
Captain America: Civil War|2016
Vaiana : La Légende du bout du monde|2016
Comme des bêtes|2016
Tous en scène|2016
Passengers|2016
Fences|2016
Elle|2016
Divines|2016
Demain tout commence|2016
Les Tuche 2 : Le Rêve américain|2016
Grave|2016
Frantz|2016
Victoria|2016
Get Out|2017
Wonder Woman|2017
Dunkerque|2017
Blade Runner 2049|2017
Ça|2017
Coco|2017
Logan|2017
Baby Driver|2017
3 Billboards : Les Panneaux de la vengeance|2017
La Forme de l'eau|2017
Lady Bird|2017
Call Me by Your Name|2017
Spider-Man: Homecoming|2017
Jumanji : Bienvenue dans la jungle|2017
The Greatest Showman|2017
Wonder|2017
Thor : Ragnarok|2017
Kong: Skull Island|2017
Star Wars, épisode VIII : Les Derniers Jedi|2017
Le Sens de la fête|2017
120 battements par minute|2017
Au revoir là-haut|2017
Petit Paysan|2017
Le Brio|2017
Patients|2017
Alibi.com|2017
Raid dingue|2017
Avengers: Infinity War|2018
Black Panther|2018
Bohemian Rhapsody|2018
A Star Is Born|2018
Green Book : Sur les routes du sud|2018
Sans un bruit|2018
Spider-Man: New Generation|2018
Mission impossible : Fallout|2018
Ready Player One|2018
Les Indestructibles 2|2018
Hérédité|2018
Venom|2018
Creed II|2018
Jurassic World: Fallen Kingdom|2018
Les Animaux fantastiques : Les Crimes de Grindelwald|2018
Le Grand Bain|2018
Jusqu'à la garde|2018
La Ch'tite Famille|2018
Les Tuche 3|2018
Un homme pressé|2018
Astérix : Le Secret de la potion magique|2018
Les Vieux Fourneaux|2018
Joker|2019
Avengers: Endgame|2019
Once Upon a Time… in Hollywood|2019
1917|2019
Le Mans 66|2019
À couteaux tirés|2019
The Irishman|2019
Marriage Story|2019
Toy Story 4|2019
Le Roi lion|2019
Midsommar|2019
Uncut Gems|2019
Les Filles du docteur March|2019
Jojo Rabbit|2019
Us|2019
Ça : Chapitre 2|2019
Rocketman|2019
Les Misérables|2019
Hors normes|2019
Portrait de la jeune fille en feu|2019
Le Chant du loup|2019
J'accuse|2019
La Belle Époque|2019
Qu'est-ce qu'on a encore fait au Bon Dieu ?|2019
Mon inconnue|2019
Tenet|2020
Soul|2020
Nomadland|2020
Bad Boys for Life|2020
Adieu les cons|2020
Bac Nord|2020
Tout simplement noir|2020
Un triomphe|2020
Dune|2021
Spider-Man: No Way Home|2021
Don't Look Up : Déni cosmique|2021
Encanto : La Fantastique Famille Madrigal|2021
Licorice Pizza|2021
Free Guy|2021
Mourir peut attendre|2021
The Power of the Dog|2021
Matrix Resurrections|2021
CODA|2021
Titane|2021
L'Événement|2021
Illusions perdues|2021
Aline|2021
OSS 117 : Alerte rouge en Afrique noire|2021
Kaamelott : Premier Volet|2021
Les Choses humaines|2021
Délicieux|2021
Top Gun : Maverick|2022
Avatar : La Voie de l'eau|2022
Everything Everywhere All at Once|2022
The Batman|2022
The Fabelmans|2022
Elvis|2022
Babylon|2022
The Whale|2022
Glass Onion|2022
Nope|2022
Smile|2022
La Nuit du 12|2022
Simone, le voyage du siècle|2022
Novembre|2022
En corps|2022
L'Innocent|2022
Saint Omer|2022
Barbie|2023
Oppenheimer|2023
Killers of the Flower Moon|2023
Super Mario Bros, le film|2023
Spider-Man : Across the Spider-Verse|2023
John Wick : Chapitre 4|2023
Les Gardiens de la Galaxie Vol. 3|2023
Winter Break|2023
M3GAN|2023
Anatomie d'une chute|2023
Le Règne animal|2023
Les Trois Mousquetaires : D'Artagnan|2023
Les Trois Mousquetaires : Milady|2023
Astérix et Obélix : L'Empire du milieu|2023
Je verrai toujours vos visages|2023
Le Procès Goldman|2023
Alibi.com 2|2023
Dune : Deuxième partie|2024
Pauvres Créatures|2024
Deadpool et Wolverine|2024
Vice-versa 2|2024
Wicked|2024
Gladiator 2|2024
Civil War|2024
Anora|2024
The Brutalist|2024
Challengers|2024
Twisters|2024
The Substance|2024
Longlegs|2024
Conclave|2024
Le Comte de Monte-Cristo|2024
L'Amour ouf|2024
Un p'tit truc en plus|2024
Emilia Pérez|2024
En fanfare|2024
L'Histoire de Souleymane|2024
Monsieur Aznavour|2024
Vingt Dieux|2024
Miséricorde|2024
Sinners|2025
Une bataille après l'autre|2025
Mission: Impossible – The Final Reckoning|2025
Superman|2025
F1|2025
Les Dents de la mer 2|1978
Superman 2|1980
Rocky 5|1990
Le Flic de Beverly Hills 2|1987
L'Arme fatale 3|1992
Indiana Jones et le Cadran de la destinée|2023
Jurassic Park 3|2001
Jurassic World : Le Monde d'après|2022
Men in Black International|2019
Fast and Furious 8|2017
Le Labyrinthe : La Terre brûlée|2015
Hunger Games : La Révolte, partie 1|2014
Hunger Games : La Révolte, partie 2|2015
Divergente 2 : L'Insurrection|2015
Twilight, chapitre IV : Révélation, partie 1|2011
Twilight, chapitre V : Révélation, partie 2|2012
The Amazing Spider-Man : Le Destin d'un héros|2014
Spider-Man: Far From Home|2019
Les Gardiens de la Galaxie Vol. 2|2017
Black Widow|2021
Thor : Le Monde des ténèbres|2013
Avengers : Doomsday|2026
Aquaman|2018
Justice League|2017
Batman v Superman : L'Aube de la justice|2016
Venom : Let There Be Carnage|2021
Morbius|2022
Jumanji: Next Level|2019
Le Bon Gros Géant|2016
La Belle et la Bête|2017
Aladdin|2019
Cendrillon|2015
Maléfique|2014
Le Livre de la jungle|2016
Mary Poppins Returns|2018
Les Croods|2013
Shrek le troisième|2007
Madagascar 2|2008
L'Âge de glace 2|2006
Moi, moche et méchant 3|2017
Les Minions 2 : Il était une fois Gru|2022
Kung Fu Panda 2|2011
Dragons 2|2014
Ralph 2.0|2018
La Reine des neiges 2|2019
Elio|2025
Pinocchio|2022
Wonka|2023
Matilda|2022
Le Grinch|2000
Chérie, nous avons été rétrécis|1997
Flubber|1997
Le Professeur Foldingue|1996
Docteur Dolittle|1998
Menteur, menteur|1997
The Truman Show|1998
Yes Man|2008
Bruce tout-puissant|2003
Click : Télécommandez votre vie|2006
Rush Hour 2|2001
Ocean's Thirteen|2007
Ocean's 8|2018
La Nuit au musée 2|2009
Sherlock Holmes|2009
Kingsman : Services secrets|2014
Bad Boys 2|2003
Le Transporteur|2002
Taken 2|2012
Lucy|2014
Valérian et la Cité des mille planètes|2017
Arthur 3 : La Guerre des deux mondes|2010
Le Petit Prince|2015
Ballerina|2016
Ernest et Célestine|2012
Les Triplettes de Belleville|2003
Le Jour où la Terre s'arrêta|2008
Cloverfield|2008
I, Robot|2004
Minority Report|2002
A.I. Intelligence artificielle|2001
La Planète des singes|2001
Interstellar|2014
Ad Astra|2019
Seul sur Mars|2015
Don't Worry Darling|2022
Le Majordome|2013
Spotlight|2015
Le Loup de Wall Street|2013
Molly's Game|2017
Moneyball|2011
The Holdovers|2023
Past Lives|2023
Les Bodin's en Thaïlande|2021
Les Segpa|2022
Le Dîner de cons|1998
Les Visiteurs : La Révolution|2016
Les Bronzés font du ski|1979
Ducobu 3|2020
Les Blagues de Toto|2020
L'Appel de la forêt|2020
Belle et Sébastien|2013
Le Grand Méchant Renard et autres contes|2017
Mia et le Lion blanc|2018
Donne-moi des ailes|2019
Le Loup et le Lion|2021
Notre-Dame brûle|2022
Mon crime|2023
Chien et Chat|2024
Ni chaînes ni maîtres|2024
Le Larbin|2024
L'Abbé Pierre : Une vie de combats|2023
Mon inconnue|2019
La Daronne|2020
Boîte noire|2021
Mascarade|2022
Une année difficile|2023
Le Deuxième Acte|2024`;

const lire = texte => texte.trim().split("\n").map(l => { const [titre, annee] = l.split("|"); return { titre: titre.trim(), annee: +annee }; });

// Les catégories, dans l'ordre de l'écran de choix
export const CATEGORIES = [
  { id: "populaires", nom: "Films populaires 1970+ (US et France)", films: lire(POPULAIRES) },
  { id: "disney",    nom: "Disney, Pixar et remakes",            films: lire(DISNEY) },
  { id: "animes",     nom: "DreamWorks et autres animés (1990+)", films: lire(ANIMES) },
  { id: "ghibli",     nom: "Studio Ghibli",                       films: lire(GHIBLI) },
  { id: "mcu",        nom: "Marvel (MCU)",                        films: lire(MCU) },
  { id: "dc",         nom: "DC",                                  films: lire(DC) },
  { id: "action",     nom: "Films d'action (1990+)",              films: lire(ACTION) },
  { id: "starwars",   nom: "Star Wars",                           films: lire(STAR_WARS) },
  { id: "classiques", nom: "Les classiques",                      films: lire(CLASSIQUES) },
  { id: "francais",   nom: "Meilleurs films français",            films: lire(FRANCAIS) }
];
