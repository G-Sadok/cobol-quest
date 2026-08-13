// Le manifeste du programme : la PISCINE (J00 -> J10, RUSH01, RUSH02), les
// MISSIONS (M01 -> M06) et la PHASE 3.
//
// Source unique de vérité : les tableaux « BARÈME DU JOUR » des sujets de
// piscine, les tableaux « BARÈME (/N) » des missions, et le livret
// « progression/XP_ET_BADGES.md ». En cas d'écart entre les deux, le livret
// fait foi (cahier des charges, §6) : le contrôle croisé est consigné au
// JOURNAL et vérifié par les tests (src/data/programme.test.js).
//
// Forme d'une épreuve :
//   id                 identifiant stable, utilisé par la progression
//   phase              'piscine', 'missions' ou 'phase3'
//   titre              intitulé du sujet, sans le préfixe « PISCINE : »
//   chemin             clef du sujet dans data/corpus.js
//   xpBase             somme des exercices non-bonus (= livret)
//   xpBonusMax         somme des bonus (= livret)
//   seuilValidation    ligne « Validation : ≥ N XP » du sujet ; à défaut, 70 %
//                      du barème (les rushs et les missions n'en portent pas)
//   prerequis          épreuve immédiatement précédente (déblocage séquentiel)
//   badges             identifiants des badges en jeu (détails en T13)
//   surLHonneur        true quand aucune moulinette ne tranche (phase 3)
//   exercices[]        { id, titre, xp, estBonus, bertha }
//
// « bertha » est l'argument de la moulinette : ./bertha/bertha.sh <bertha>.
// Il vaut null quand BERTHA ne juge pas l'épreuve (phase 3).

/** Les épreuves de la piscine, dans l'ordre obligatoire de progression. */
export const epreuvesPiscine = [
  {
    id: 'J00',
    phase: 'piscine',
    titre: "L'embauche",
    chemin: '02_J00_INSTALLATION.md',
    xpBase: 30,
    xpBonusMax: 0,
    seuilValidation: 30,
    prerequis: null,
    badges: ['premiere-compile'],
    exercices: [
      { id: 'ex00', titre: 'Le premier jour', xp: 30, estBonus: false, bertha: 'J00/ex00' }
    ]
  },
  {
    id: 'J01',
    phase: 'piscine',
    titre: 'Les quatre divisions',
    chemin: 'piscine/J01_les_quatre_divisions.md',
    xpBase: 95,
    xpBonusMax: 30,
    seuilValidation: 70,
    prerequis: 'J00',
    badges: ['colonne-7', 'les-quatre-saisons'],
    exercices: [
      { id: 'ex00', titre: 'La carte de visite', xp: 10, estBonus: false, bertha: 'J01/ex00' },
      { id: 'ex01', titre: "L'écho du guichet", xp: 15, estBonus: false, bertha: 'J01/ex01' },
      { id: 'ex02', titre: 'Le panneau de BERTHA', xp: 15, estBonus: false, bertha: 'J01/ex02' },
      { id: 'ex03', titre: 'Quel jour sommes-nous', xp: 20, estBonus: false, bertha: 'J01/ex03' },
      { id: 'ex04', titre: "L'horodatage", xp: 20, estBonus: false, bertha: 'J01/ex04' },
      { id: 'ex05', titre: 'Le formulaire', xp: 15, estBonus: false, bertha: 'J01/ex05' },
      { id: 'bonus', titre: 'La machine à remonter le temps', xp: 30, estBonus: true, bertha: 'J01/bonus' }
    ]
  },
  {
    id: 'J02',
    phase: 'piscine',
    titre: 'La mémoire de BERTHA',
    chemin: 'piscine/J02_la_memoire_de_bertha.md',
    xpBase: 120,
    xpBonusMax: 40,
    seuilValidation: 85,
    prerequis: 'J01',
    badges: ['chasseur-de-troncatures', 'survivant-y2k'],
    exercices: [
      { id: 'ex00', titre: "L'inventaire du coffre", xp: 10, estBonus: false, bertha: 'J02/ex00' },
      { id: 'ex01', titre: 'La machine à tronquer', xp: 20, estBonus: false, bertha: 'J02/ex01' },
      { id: 'ex02', titre: 'La caisse enregistreuse', xp: 15, estBonus: false, bertha: 'J02/ex02' },
      { id: 'ex03', titre: 'La nostalgie de Marcel', xp: 20, estBonus: false, bertha: 'J02/ex03' },
      { id: 'ex04', titre: 'Le chèque de luxe', xp: 20, estBonus: false, bertha: 'J02/ex04' },
      { id: 'ex05', titre: 'Les intérêts de tatie Josiane', xp: 20, estBonus: false, bertha: 'J02/ex05' },
      { id: 'ex06', titre: "Le bug de l'an 2000", xp: 15, estBonus: false, bertha: 'J02/ex06' },
      { id: 'bonus1', titre: 'La paie en vrai', xp: 20, estBonus: true, bertha: 'J02/bonus' },
      { id: 'bonus2', titre: 'À la française', xp: 20, estBonus: true, bertha: 'J02/bonus' }
    ]
  },
  {
    id: 'J03',
    phase: 'piscine',
    titre: 'Les décisions',
    chemin: 'piscine/J03_les_decisions.md',
    xpBase: 120,
    xpBonusMax: 30,
    seuilValidation: 85,
    prerequis: 'J02',
    badges: ['s0c7', 'la-voie-du-88'],
    exercices: [
      { id: 'ex00', titre: 'Pair ou impair', xp: 10, estBonus: false, bertha: 'J03/ex00' },
      { id: 'ex01', titre: 'Le podium', xp: 15, estBonus: false, bertha: 'J03/ex01' },
      { id: 'ex02', titre: 'Le barème des frais', xp: 20, estBonus: false, bertha: 'J03/ex02' },
      { id: 'ex03', titre: 'Le vide-poche anti-S0C7', xp: 20, estBonus: false, bertha: 'J03/ex03' },
      { id: 'ex04', titre: 'Les états du compte', xp: 15, estBonus: false, bertha: 'J03/ex04' },
      { id: 'ex05', titre: 'Le distributeur', xp: 25, estBonus: false, bertha: 'J03/ex05' },
      { id: 'ex06', titre: "L'année bissextile", xp: 15, estBonus: false, bertha: 'J03/ex06' },
      { id: 'bonus', titre: 'La grille tarifaire', xp: 30, estBonus: true, bertha: 'J03/bonus' }
    ]
  },
  {
    id: 'J04',
    phase: 'piscine',
    titre: 'Les boucles du batch',
    chemin: 'piscine/J04_les_boucles_du_batch.md',
    xpBase: 130,
    xpBonusMax: 30,
    seuilValidation: 90,
    prerequis: 'J03',
    badges: ['tueur-de-go-to'],
    exercices: [
      { id: 'ex00', titre: 'Le compte à rebours', xp: 10, estBonus: false, bertha: 'J04/ex00' },
      { id: 'ex01', titre: 'La table du livret', xp: 15, estBonus: false, bertha: 'J04/ex01' },
      { id: 'ex02', titre: 'La somme des dépôts', xp: 15, estBonus: false, bertha: 'J04/ex02' },
      { id: 'ex03', titre: 'La factorielle qui déborde', xp: 20, estBonus: false, bertha: 'J04/ex03' },
      { id: 'ex04', titre: 'Marcel-Dubois', xp: 15, estBonus: false, bertha: 'J04/ex04' },
      { id: 'ex05', titre: 'La pyramide du patrimoine', xp: 20, estBonus: false, bertha: 'J04/ex05' },
      { id: 'ex06', titre: 'Le PGCD des agences', xp: 20, estBonus: false, bertha: 'J04/ex06' },
      { id: 'ex07', titre: 'Le nombre premier', xp: 15, estBonus: false, bertha: 'J04/ex07' },
      { id: 'bonus', titre: 'La conjecture de Syracuse', xp: 30, estBonus: true, bertha: 'J04/bonus' }
    ]
  },
  {
    id: 'J05',
    phase: 'piscine',
    titre: 'Les registres',
    chemin: 'piscine/J05_les_registres.md',
    xpBase: 135,
    xpBonusMax: 30,
    seuilValidation: 95,
    prerequis: 'J04',
    badges: ['maitre-des-registres'],
    exercices: [
      { id: 'ex00', titre: 'La fiche client', xp: 10, estBonus: false, bertha: 'J05/ex00' },
      { id: 'ex01', titre: 'Les deux lunettes', xp: 15, estBonus: false, bertha: 'J05/ex01' },
      { id: 'ex02', titre: "Le chiffre d'affaires", xp: 20, estBonus: false, bertha: 'J05/ex02' },
      { id: 'ex03', titre: 'Le meilleur mois', xp: 15, estBonus: false, bertha: 'J05/ex03' },
      { id: 'ex04', titre: "L'annuaire des agences", xp: 20, estBonus: false, bertha: 'J05/ex04' },
      { id: 'ex05', titre: "L'annuaire express", xp: 15, estBonus: false, bertha: 'J05/ex05' },
      { id: 'ex06', titre: 'Le tri du stagiaire', xp: 25, estBonus: false, bertha: 'J05/ex06' },
      { id: 'ex07', titre: 'La grille trimestrielle', xp: 15, estBonus: false, bertha: 'J05/ex07' },
      { id: 'bonus', titre: "L'histogramme du hall", xp: 30, estBonus: true, bertha: 'J05/bonus' }
    ]
  },
  {
    id: 'RUSH01',
    phase: 'piscine',
    titre: 'BERTHA-MIND',
    chemin: 'piscine/RUSH01_berthamind.md',
    xpBase: 120,
    xpBonusMax: 30,
    // Le rush ne porte pas de ligne « Validation : ≥ N XP » : on applique la
    // règle observée sur les journées de piscine, 70 % du barème (120 x 0,7).
    seuilValidation: 84,
    prerequis: 'J05',
    badges: [],
    exercices: [
      { id: 'c1', titre: 'Partie gagnante conforme (sorties exactes)', xp: 35, estBonus: false, bertha: 'RUSH01' },
      { id: 'c2', titre: 'Partie perdante conforme', xp: 15, estBonus: false, bertha: 'RUSH01' },
      { id: 'c3', titre: 'Comptage BIEN et MAL PLACES exact sur les cas pièges', xp: 30, estBonus: false, bertha: 'RUSH01' },
      { id: 'c4', titre: 'Saisies invalides gérées sans décompte', xp: 15, estBonus: false, bertha: 'RUSH01' },
      { id: 'c5', titre: 'Norme et découpage en paragraphes propres', xp: 25, estBonus: false, bertha: 'RUSH01' },
      { id: 'bonus1', titre: 'Historique des essais affiché à la fin', xp: 15, estBonus: true, bertha: 'RUSH01' },
      { id: 'bonus2', titre: 'Niveau de difficulté paramétrable (4 à 6 chiffres)', xp: 15, estBonus: true, bertha: 'RUSH01' }
    ]
  },
  {
    id: 'J06',
    phase: 'piscine',
    titre: 'Le langage des chaînes',
    chemin: 'piscine/J06_les_chaines.md',
    xpBase: 130,
    xpBonusMax: 25,
    seuilValidation: 90,
    prerequis: 'RUSH01',
    badges: ['le-chiffreur', 'ciseaux-d-or'],
    exercices: [
      { id: 'ex00', titre: 'La couturière', xp: 10, estBonus: false, bertha: 'J06/ex00' },
      { id: 'ex01', titre: 'Le découpeur', xp: 15, estBonus: false, bertha: 'J06/ex01' },
      { id: 'ex02', titre: 'Le compteur de voyelles', xp: 15, estBonus: false, bertha: 'J06/ex02' },
      { id: 'ex03', titre: 'Le masque', xp: 20, estBonus: false, bertha: 'J06/ex03' },
      { id: 'ex04', titre: 'La vraie longueur', xp: 15, estBonus: false, bertha: 'J06/ex04' },
      { id: 'ex05', titre: 'Le palindrome', xp: 20, estBonus: false, bertha: 'J06/ex05' },
      { id: 'ex06', titre: 'Le code de César', xp: 20, estBonus: false, bertha: 'J06/ex06' },
      { id: 'ex07', titre: 'La fiche propre', xp: 15, estBonus: false, bertha: 'J06/ex07' },
      { id: 'bonus', titre: 'Le contrôle de vraisemblance IBAN', xp: 25, estBonus: true, bertha: 'J06/bonus' }
    ]
  },
  {
    id: 'J07',
    phase: 'piscine',
    titre: 'Les fichiers séquentiels',
    chemin: 'piscine/J07_fichiers_sequentiels.md',
    xpBase: 120,
    xpBonusMax: 20,
    seuilValidation: 85,
    prerequis: 'J06',
    badges: ['maitre-des-fichiers'],
    exercices: [
      { id: 'ex00', titre: 'Le générateur', xp: 20, estBonus: false, bertha: 'J07/ex00' },
      { id: 'ex01', titre: 'Le lecteur', xp: 15, estBonus: false, bertha: 'J07/ex01' },
      { id: 'ex02', titre: 'Le trésorier', xp: 15, estBonus: false, bertha: 'J07/ex02' },
      { id: 'ex03', titre: 'Le filtre', xp: 20, estBonus: false, bertha: 'J07/ex03' },
      { id: 'ex04', titre: 'Le registre officiel', xp: 20, estBonus: false, bertha: 'J07/ex04' },
      { id: 'ex05', titre: 'La fusion des registres', xp: 15, estBonus: false, bertha: 'J07/ex05' },
      { id: 'ex06', titre: 'Les comptes dormants', xp: 15, estBonus: false, bertha: 'J07/ex06' },
      { id: 'bonus', titre: 'Le rapport confidentiel', xp: 20, estBonus: true, bertha: 'J07/bonus' }
    ]
  },
  {
    id: 'J08',
    phase: 'piscine',
    titre: 'Les fichiers indexés',
    chemin: 'piscine/J08_fichiers_indexes.md',
    xpBase: 130,
    xpBonusMax: 20,
    seuilValidation: 90,
    prerequis: 'J07',
    badges: ['gardien-des-cles', 'guichetier'],
    exercices: [
      { id: 'ex00', titre: 'Le chargeur', xp: 20, estBonus: false, bertha: 'J08/ex00' },
      { id: 'ex01', titre: 'Le guichet de consultation', xp: 15, estBonus: false, bertha: 'J08/ex01' },
      { id: 'ex02', titre: 'Dépôt et retrait', xp: 20, estBonus: false, bertha: 'J08/ex02' },
      { id: 'ex03', titre: 'La clôture', xp: 15, estBonus: false, bertha: 'J08/ex03' },
      { id: 'ex04', titre: 'Le parcours partiel', xp: 15, estBonus: false, bertha: 'J08/ex04' },
      { id: 'ex05', titre: 'La recherche par ville', xp: 20, estBonus: false, bertha: 'J08/ex05' },
      { id: 'ex06', titre: 'Le mini-guichet', xp: 25, estBonus: false, bertha: 'J08/ex06' },
      { id: 'bonus', titre: "Le journal d'audit", xp: 20, estBonus: true, bertha: 'J08/bonus' }
    ]
  },
  {
    id: 'J09',
    phase: 'piscine',
    titre: 'SORT, ruptures et sous-programmes',
    chemin: 'piscine/J09_sort_et_sous_programmes.md',
    xpBase: 130,
    xpBonusMax: 20,
    seuilValidation: 90,
    prerequis: 'J08',
    badges: ['maitre-des-ruptures', 'l-architecte'],
    exercices: [
      { id: 'ex00', titre: 'Le tri simple', xp: 15, estBonus: false, bertha: 'J09/ex00' },
      { id: 'ex01', titre: 'Le tri multi-clés', xp: 20, estBonus: false, bertha: 'J09/ex01' },
      { id: 'ex02', titre: "L'écrémage", xp: 20, estBonus: false, bertha: 'J09/ex02' },
      { id: 'ex03', titre: 'La fusion des mondes', xp: 15, estBonus: false, bertha: 'J09/ex03' },
      { id: 'ex04', titre: 'Le sous-programme CALCFRAI', xp: 20, estBonus: false, bertha: 'J09/ex04' },
      { id: 'ex05', titre: 'Le copybook', xp: 15, estBonus: false, bertha: 'J09/ex05' },
      { id: 'ex06', titre: 'La rupture', xp: 25, estBonus: false, bertha: 'J09/ex06' },
      { id: 'bonus', titre: 'La rupture enrichie', xp: 20, estBonus: true, bertha: 'J09/bonus' }
    ]
  },
  {
    id: 'RUSH02',
    phase: 'piscine',
    titre: 'La paie de la CGBA',
    chemin: 'piscine/RUSH02_la_paie.md',
    xpBase: 150,
    xpBonusMax: 30,
    // Même règle que RUSH01 : 70 % du barème (150 x 0,7 = 105).
    seuilValidation: 105,
    prerequis: 'J09',
    badges: [],
    exercices: [
      { id: 'c1', titre: 'Bulletins conformes au gabarit (les 3)', xp: 40, estBonus: false, bertha: 'RUSH02' },
      { id: 'c2', titre: 'Écran et CONTROLE OK', xp: 20, estBonus: false, bertha: 'RUSH02' },
      { id: 'c3', titre: 'Heures supplémentaires exactes', xp: 25, estBonus: false, bertha: 'RUSH02' },
      { id: 'c4', titre: 'Prime plafonnée exacte', xp: 15, estBonus: false, bertha: 'RUSH02' },
      { id: 'c5', titre: 'SORT et rupture (test sur fichier mélangé)', xp: 20, estBonus: false, bertha: 'RUSH02' },
      { id: 'c6', titre: 'Copybooks, CALCNET et Norme', xp: 30, estBonus: false, bertha: 'RUSH02' },
      { id: 'bonus1', titre: 'Matricule inconnu écrit dans REJETS.TXT', xp: 20, estBonus: true, bertha: 'RUSH02' },
      { id: 'bonus2', titre: 'Ligne NET ANNUEL PROJETE sous chaque bulletin', xp: 10, estBonus: true, bertha: 'RUSH02' }
    ]
  },
  {
    id: 'J10',
    phase: 'piscine',
    titre: "L'examen de BERTHA",
    chemin: 'piscine/J10_examen_final.md',
    xpBase: 200,
    xpBonusMax: 0,
    seuilValidation: 120,
    prerequis: 'RUSH02',
    badges: ['diplome-de-la-piscine'],
    exercices: [
      { id: 'a1', titre: 'Le tampon', xp: 15, estBonus: false, bertha: 'J10/a1' },
      { id: 'a2', titre: "L'aiguilleur", xp: 15, estBonus: false, bertha: 'J10/a2' },
      { id: 'a3', titre: "L'amortisseur", xp: 15, estBonus: false, bertha: 'J10/a3' },
      { id: 'b1', titre: 'Le vérificateur', xp: 25, estBonus: false, bertha: 'J10/b1' },
      { id: 'b2', titre: "L'éclateur", xp: 30, estBonus: false, bertha: 'J10/b2' },
      { id: 'c', titre: 'Le relevé', xp: 100, estBonus: false, bertha: 'J10/c' }
    ]
  }
]

/**
 * Les missions de la phase 2, dans l'ordre obligatoire de progression.
 *
 * Aucune mission ne porte de ligne « Validation : >= N XP » : on applique la
 * règle du cahier des charges (§6), 70 % du barème. Les critères du tableau
 * « BARÈME (/N) » tiennent lieu d'exercices : une mission se rend d'un bloc,
 * elle ne se découpe pas en exercices numérotés.
 */
export const epreuvesMissions = [
  {
    id: 'M01',
    phase: 'missions',
    titre: 'GUICHET-3000',
    chemin: 'missions/M01_GUICHET3000.md',
    xpBase: 300,
    xpBonusMax: 55,
    seuilValidation: 210,
    prerequis: 'J10',
    badges: ['guichetier-d-or'],
    exercices: [
      { id: 'c1', titre: 'Chargeur, consultation, dépôt et retrait conformes', xp: 60, estBonus: false, bertha: 'M01' },
      { id: 'c2', titre: 'Virement atomique (y compris les cas de refus)', xp: 50, estBonus: false, bertha: 'M01' },
      { id: 'c3', titre: 'Création, blocage et clôture conformes', xp: 45, estBonus: false, bertha: 'M01' },
      { id: 'c4', titre: 'Liste par ville (clé alternative)', xp: 25, estBonus: false, bertha: 'M01' },
      { id: 'c5', titre: "Journal d'audit exact (formats, refus journalisés)", xp: 45, estBonus: false, bertha: 'M01' },
      { id: 'c6', titre: 'Robustesse aux saisies folles (lettres, vide, 0, négatif)', xp: 40, estBonus: false, bertha: 'M01' },
      { id: 'c7', titre: 'Norme, copybook et découpage', xp: 35, estBonus: false, bertha: 'M01' },
      { id: 'bonus1', titre: 'SCREEN SECTION (vrai écran de guichet)', xp: 30, estBonus: true, bertha: 'M01' },
      { id: 'bonus2', titre: 'Relevé des N dernières opérations depuis le journal', xp: 25, estBonus: true, bertha: 'M01' }
    ]
  },
  {
    id: 'M02',
    phase: 'missions',
    titre: 'PAYE-MASTER',
    chemin: 'missions/M02_PAYEMASTER.md',
    xpBase: 400,
    xpBonusMax: 40,
    seuilValidation: 280,
    prerequis: 'M01',
    badges: ['architecte-de-la-paie'],
    exercices: [
      { id: 'c1', titre: 'Contrôles et rejets motivés (rien ne passe en silence)', xp: 70, estBonus: false, bertha: 'M02' },
      { id: 'c2', titre: 'Moteur : retenues, primes, tranches exactes', xp: 100, estBonus: false, bertha: 'M02' },
      { id: 'c3', titre: 'Sous-programmes CALCOTIS et CALCPRIM (aucun taux dans PAYCALC)', xp: 50, estBonus: false, bertha: 'M02' },
      { id: 'c4', titre: 'États par service (SORT et rupture) exacts', xp: 60, estBonus: false, bertha: 'M02' },
      { id: 'c5', titre: 'VIREMENTS.DAT conforme', xp: 30, estBonus: false, bertha: 'M02' },
      { id: 'c6', titre: 'Chaîne shell, codes retour et reprise étape par étape', xp: 40, estBonus: false, bertha: 'M02' },
      { id: 'c7', titre: 'Norme, copybooks et rapport de mission', xp: 50, estBonus: false, bertha: 'M02' },
      { id: 'bonus1', titre: 'Bulletin PDF-texte soigné (cadres, alignements parfaits)', xp: 20, estBonus: true, bertha: 'M02' },
      { id: 'bonus2', titre: 'Barème chargé trié et contrôlé (tranches croissantes sinon rejet)', xp: 20, estBonus: true, bertha: 'M02' }
    ]
  },
  {
    id: 'M03',
    phase: 'missions',
    titre: 'STOCKS & Cie',
    chemin: 'missions/M03_STOCKS.md',
    xpBase: 350,
    xpBonusMax: 40,
    seuilValidation: 245,
    prerequis: 'M02',
    badges: ['seigneur-du-fifo'],
    exercices: [
      { id: 'c1', titre: 'FIFO exact (exemple canonique et multi-lots)', xp: 120, estBonus: false, bertha: 'M03' },
      { id: 'c2', titre: 'Inventaire valorisé conforme', xp: 60, estBonus: false, bertha: 'M03' },
      { id: 'c3', titre: 'Rejets (rupture, inconnu) sans corruption du stock', xp: 60, estBonus: false, bertha: 'M03' },
      { id: 'c4', titre: 'Alertes et quantités de réapprovisionnement', xp: 40, estBonus: false, bertha: 'M03' },
      { id: 'c5', titre: 'Architecture (3 programmes, copybooks, table de lots propre)', xp: 40, estBonus: false, bertha: 'M03' },
      { id: 'c6', titre: 'Rapport de mission (dont le schéma de la table de lots)', xp: 30, estBonus: false, bertha: 'M03' },
      { id: 'bonus', titre: 'Méthode CUMP en option de lancement, avec comparaison des deux valorisations', xp: 40, estBonus: true, bertha: 'M03' }
    ]
  },
  {
    id: 'M04',
    phase: 'missions',
    titre: 'LA PASSERELLE',
    chemin: 'missions/M04_PASSERELLE.md',
    xpBase: 350,
    xpBonusMax: 40,
    seuilValidation: 245,
    prerequis: 'M03',
    badges: ['pontifex'],
    exercices: [
      { id: 'c1', titre: 'Export CSV exact (au caractère près)', xp: 70, estBonus: false, bertha: 'M04' },
      { id: 'c2', titre: 'Import CSV : découpage, contrôles, rejets, format fixe', xp: 90, estBonus: false, bertha: 'M04' },
      { id: 'c3', titre: 'Export JSON valide (validation prouvée) et dernier sans virgule', xp: 70, estBonus: false, bertha: 'M04' },
      { id: 'c4', titre: 'Filtre de pipeline (composable, testé en chaîne)', xp: 60, estBonus: false, bertha: 'M04' },
      { id: 'c5', titre: 'Codes retour conformes partout', xp: 30, estBonus: false, bertha: 'M04' },
      { id: 'c6', titre: "Rapport (ce que le CSV ne sait pas dire d'un fichier COBOL)", xp: 30, estBonus: false, bertha: 'M04' },
      { id: 'bonus1', titre: 'Export CSV paramétrable (séparateur en argument)', xp: 20, estBonus: true, bertha: 'M04' },
      { id: 'bonus2', titre: 'Échappement JSON des guillemets dans les noms', xp: 20, estBonus: true, bertha: 'M04' }
    ]
  },
  {
    id: 'M05',
    phase: 'missions',
    titre: 'S.O.S. LEGACY',
    chemin: 'missions/M05_SOS_LEGACY.md',
    xpBase: 400,
    xpBonusMax: 40,
    seuilValidation: 280,
    prerequis: 'M04',
    badges: ['necromancien'],
    exercices: [
      { id: 'c1', titre: 'Golden master fait avant toute modification', xp: 40, estBonus: false, bertha: 'M05' },
      { id: 'c2', titre: 'TCK-101 : cause exacte identifiée et correctif', xp: 80, estBonus: false, bertha: 'M05' },
      { id: 'c3', titre: 'TCK-102 : fenêtre de siècle correcte (cas 60 compris)', xp: 80, estBonus: false, bertha: 'M05' },
      { id: 'c4', titre: 'TCK-103 : ROUNDED, chiffres au centime', xp: 50, estBonus: false, bertha: 'M05' },
      { id: 'c5', titre: 'TCK-104 : code mort supprimé et hypothèse argumentée', xp: 20, estBonus: false, bertha: 'M05' },
      { id: 'c6', titre: 'Réécriture à la Norme, diff de preuve vide', xp: 90, estBonus: false, bertha: 'M05' },
      { id: 'c7', titre: "Rapport d'autopsie (clarté, honnêteté sur les tâtonnements)", xp: 40, estBonus: false, bertha: 'M05' },
      { id: 'bonus', titre: 'Jeu de tests de non-régression rejouable', xp: 40, estBonus: true, bertha: 'M05' }
    ]
  },
  {
    id: 'M06',
    phase: 'missions',
    titre: 'LE CŒUR BANCAIRE',
    chemin: 'missions/M06_COEUR_BANCAIRE.md',
    xpBase: 800,
    xpBonusMax: 80,
    seuilValidation: 560,
    prerequis: 'M05',
    badges: ['gardien-du-mainframe'],
    exercices: [
      { id: 'c1', titre: 'Étapes 01 et 02 (contrôles, tri stable, conservation des totaux)', xp: 120, estBonus: false, bertha: 'M06' },
      { id: 'c2', titre: 'Étape 03 (mise à jour, rejets, intérêts, agios)', xp: 180, estBonus: false, bertha: 'M06' },
      { id: 'c3', titre: 'Étape 04 (relevés conformes, alertes)', xp: 80, estBonus: false, bertha: 'M06' },
      { id: 'c4', titre: 'Étape 05 (balance exacte, double chemin, RC 8 si KO)', xp: 140, estBonus: false, bertha: 'M06' },
      { id: 'c5', titre: 'Orchestration (run_chaine.sh, log, --depuis, RC respectés)', xp: 100, estBonus: false, bertha: 'M06' },
      { id: 'c6', titre: 'Invariants tenus sur le jeu secret', xp: 80, estBonus: false, bertha: 'M06' },
      { id: 'c7', titre: "Documentation d'exploitation et rapport de mission", xp: 60, estBonus: false, bertha: 'M06' },
      { id: 'c8', titre: 'Soutenance écrite : les 5 questions de Marcel', xp: 40, estBonus: false, bertha: 'M06' },
      { id: 'bonus1', titre: 'Reprise sur incident réelle (idempotence de la chaîne)', xp: 60, estBonus: true, bertha: 'M06' },
      { id: 'bonus2', titre: 'État des anomalies consolidé multi-étapes', xp: 20, estBonus: true, bertha: 'M06' }
    ]
  }
]

/**
 * La phase 3 : le passage au vrai z/OS.
 *
 * Le livret ne lui accorde aucun XP et BERTHA ne la juge pas (elle se joue chez
 * IBM, pas sur la machine de l'apprenti). Elle vaut par ses deux badges, qui
 * ouvrent le neuvième échelon : la validation est « sur l'honneur ». Ses
 * exercices reprennent le plan de campagne en quatre semaines du sujet.
 */
export const epreuvePhase3 = {
  id: 'PHASE3',
  phase: 'phase3',
  titre: 'LE VRAI MAINFRAME',
  chemin: 'phase3/LE_VRAI_MAINFRAME.md',
  xpBase: 0,
  xpBonusMax: 0,
  seuilValidation: 0,
  prerequis: 'M06',
  badges: ['premier-jcl', 'dompteur-de-vsam'],
  surLHonneur: true,
  exercices: [
    { id: 's1', titre: 'Z Xplore Fundamentals : Zowe, TSO, datasets, premier JCL', xp: 0, estBonus: false, bertha: null },
    { id: 's2', titre: 'Porter J07 ex01, J09 ex06 et RUSH02 en datasets FB', xp: 0, estBonus: false, bertha: null },
    { id: 's3', titre: 'VSAM : J08 recréé en KSDS via IDCAMS, DFSORT sur M06', xp: 0, estBonus: false, bertha: null },
    { id: 's4', titre: 'Z Xplore Advanced, survol de Db2 et de CICS', xp: 0, estBonus: false, bertha: null }
  ]
}

/** Toutes les épreuves du programme, dans l'ordre de progression. */
export const epreuves = Object.freeze([...epreuvesPiscine, ...epreuvesMissions, epreuvePhase3])

/**
 * Les épreuves qui portent un quiz du soir (cahier des charges, §5.4) : les
 * journées J01 à J09 et les deux rushs. J00 n'a pas de mémo à réviser, J10 est
 * l'examen, et les missions se jugent au rendu. Les onze quiz sont rédigés :
 * un fichier par épreuve dans data/quiz/, embarqué par data/quiz.js.
 */
export const idsAvecQuiz = Object.freeze([
  'J01', 'J02', 'J03', 'J04', 'J05', 'RUSH01', 'J06', 'J07', 'J08', 'J09', 'RUSH02'
])

/** Vrai quand l'épreuve donnée se termine par un quiz du soir. */
export function aUnQuiz(id) {
  return idsAvecQuiz.includes(id)
}

/** Les identifiants dans l'ordre. */
export const idsEpreuves = Object.freeze(epreuves.map((e) => e.id))

/** Une épreuve par son identifiant, ou null. */
export function epreuveParId(id) {
  return epreuves.find((e) => e.id === id) ?? null
}

/** Les exercices non-bonus d'une épreuve. */
export function exercicesObligatoires(epreuve) {
  return epreuve.exercices.filter((ex) => !ex.estBonus)
}

/** Les exercices bonus d'une épreuve. */
export function exercicesBonus(epreuve) {
  return epreuve.exercices.filter((ex) => ex.estBonus)
}

/** XP maximum d'une épreuve, bonus compris. */
export function xpMaximum(epreuve) {
  return epreuve.xpBase + epreuve.xpBonusMax
}

/** Un exercice par son couple (épreuve, exercice), ou null. */
export function exerciceParId(idEpreuve, idExercice) {
  const epreuve = epreuveParId(idEpreuve)
  if (!epreuve) return null
  return epreuve.exercices.find((ex) => ex.id === idExercice) ?? null
}

/** Les épreuves d'une phase ('piscine', 'missions', 'phase3'). */
export function epreuvesDeLaPhase(phase) {
  return epreuves.filter((e) => e.phase === phase)
}

/**
 * La commande BERTHA à afficher dans la feuille de route, ou null quand la
 * moulinette ne juge pas l'exercice (phase 3).
 */
export function commandeBertha(exercice) {
  if (!exercice || !exercice.bertha) return null
  return `./bertha/bertha.sh ${exercice.bertha}`
}
