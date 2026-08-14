// LE GUIDE : le mode d'emploi de l'application, ecrit pour quelqu'un qui vient
// de l'ouvrir pour la premiere fois.
//
// Il n'est PAS un texte fige. Chaque chapitre lit l'etat de l'apprenti et parle
// de sa situation a lui : la salle ou il en est, la commande BERTHA du moment,
// la seance du soir qui l'attend ou qui lui est encore fermee, ce qui lui reste
// avant l'echelon suivant. Un guide qui dit « cliquez sur la salle disponible »
// ne vaut pas un guide qui dit « ouvrez J01, les quatre divisions ».
//
// Module PUR (comme ui/carte.js, ui/lecteur.js, ui/livret.js) : il derive tout
// de l'etat, sans toucher a React ni au DOM. L'ecran ne fait que poser le
// resultat et rendre les gestes au contexte.
//
// Un « geste » est ce que le chapitre propose de faire tout de suite :
//   { type: 'ecran', cible }   changer d'ecran (aller)
//   { type: 'sujet', cible }   ouvrir une epreuve dans le lecteur (ouvrirSujet)

import { idsBadges } from '../data/badges.js'
import { commandeBertha, epreuveParId, idsAvecQuiz, idsEpreuves } from '../data/programme.js'
import {
  badgesObtenus,
  epreuveValidee,
  exerciceCoche,
  quizReussi
} from '../store/progression.js'
import { ecrans } from './ecrans.js'
import { epreuveDeLaSeance, seance } from './quiz.js'
import { carriere, epreuveDuMoment, lieuEpreuve, salles } from './tableauDeBord.js'

/** Le chemin reel du dossier de l'apprenti, tel que l'ecrit main.cjs. */
export const CHEMIN_DOSSIER = '~/Library/Application Support/cobol-quest/progression.json'

/** Les decorations que l'application ne sait pas juger seule (data/badges.js). */
const DECORATIONS_SUR_L_HONNEUR = 5

/**
 * La ligne d'etat d'un chapitre : ce que l'apprenti a sous les yeux en ce
 * moment. Le ton colore la pastille, comme partout ailleurs dans le design.
 */
function ligne(texte, ton = 'neutre') {
  return { texte, ton }
}

/**
 * Ce qu'il y a a faire maintenant, en une phrase et un geste. C'est le bloc de
 * tete du guide, et la reponse a la seule question que se pose quelqu'un qui
 * ouvre l'application : « bon, je fais quoi ? »
 */
export function prochainPas(etat) {
  const moment = epreuveDuMoment(etat)
  const epreuve = moment.epreuve
  const toutValide = idsEpreuves.every((id) => epreuveValidee(etat, id))

  if (toutValide) {
    return {
      texte: 'Tout le programme est validé, les 19 salles et la phase 3. Marcel peut prendre sa retraite.',
      ton: 'oui',
      geste: { libelle: 'Revoir le livret', type: 'ecran', cible: 'livret' }
    }
  }

  // La seance du soir se passe APRES la journee : c'est donc elle qui reste a
  // faire quand la salle qu'elle revise est deja validee. Le reste du temps,
  // il y a une salle a cocher, et c'est elle qui presse.
  const duSoir = seanceEnRetard(etat)
  if (duSoir) {
    return {
      texte: `${duSoir} est validé, mais sa séance du soir n’est pas encore réussie : 8 questions, 10 XP à la clé.`,
      ton: 'encours',
      geste: { libelle: 'Passer au quiz du soir', type: 'ecran', cible: 'quiz' }
    }
  }

  const reste = moment.total - moment.faits
  return {
    texte: `Ouvrez ${epreuve.id}, ${epreuve.titre}, et cochez ce que BERTHA a accepté. Il reste ${reste} ${moment.unite} pour valider la salle.`,
    ton: 'encours',
    geste: { libelle: `Ouvrir ${epreuve.id}`, type: 'sujet', cible: epreuve.id }
  }
}

/**
 * La plus ancienne seance du soir due a une salle DEJA validee, ou null.
 *
 * On ne peut pas s'en remettre a `epreuveDeLaSeance` : celle-la suit le sujet
 * pose sur le pupitre, qui a deja avance a la salle suivante des que la
 * precedente est validee. Ce qu'on cherche ici, c'est la journee finie dont le
 * memo n'a pas encore ete revise, aussi loin en arriere qu'il le faut.
 */
function seanceEnRetard(etat) {
  return idsAvecQuiz.find((id) => epreuveValidee(etat, id) && !quizReussi(etat, id)) ?? null
}

/** Chapitre 1 : par ou commencer, et ce que sont les salles. */
function chapitrePremiersPas(etat) {
  const moment = epreuveDuMoment(etat)
  const epreuve = moment.epreuve
  const compte = salles(etat)
  const vierge = compte.validees === 0

  return {
    id: 'premiers-pas',
    label: 'PAR OU COMMENCER',
    titre: 'Le plan des sous-sols',
    resume: 'Une salle à la fois, dans l’ordre, comme à la CGBA.',
    etat: ligne(
      vierge
        ? `Rien n’est encore coché. Votre première salle est ${epreuve.id}, ${epreuve.titre}.`
        : `Vous en êtes à ${epreuve.id}, ${epreuve.titre} (${lieuEpreuve(epreuve)}). ${compte.validees} salle${compte.validees > 1 ? 's' : ''} validée${compte.validees > 1 ? 's' : ''} sur ${compte.total}.`,
      vierge ? 'neutre' : 'encours'
    ),
    points: [
      'La carte montre les 19 salles du cursus : le couloir de la piscine, les bureaux des missions, et la salle machine au fond.',
      'Une salle a quatre états : verrouillée, disponible, en cours, validée. Une salle verrouillée dit dans son infobulle ce qui l’ouvrira.',
      'Le programme est séquentiel : une salle s’ouvre quand la précédente est validée. Rien ne se saute.',
      'Une salle validée reste ouverte : on peut toujours y revenir relire le sujet.'
    ],
    geste: { libelle: `Ouvrir ${epreuve.id}`, type: 'sujet', cible: epreuve.id }
  }
}

/** Chapitre 2 : la feuille de route, et qui juge vraiment. */
function chapitreCocher(etat) {
  const moment = epreuveDuMoment(etat)
  const epreuve = moment.epreuve
  const commande = moment.commande ?? commandeBertha(moment.prochainExercice)

  return {
    id: 'cocher',
    label: 'BERTHA FAIT FOI',
    titre: 'Cocher un exercice',
    resume: 'L’application enregistre un verdict, elle ne le rend pas.',
    etat: ligne(
      moment.validee
        ? `${epreuve.id} est validé : ${moment.faits} ${moment.unite} au compteur, le seuil était à ${moment.total}.`
        : `${moment.faits} ${moment.unite} sur les ${moment.total} qu’il faut pour valider ${epreuve.id}.`,
      moment.validee ? 'oui' : 'encours'
    ),
    commande,
    points: [
      'Faites l’exercice sur votre machine, puis faites-le juger par la moulinette dans votre Terminal. La commande exacte est rappelée ci-dessus et dans le volet de droite du sujet.',
      'Cochez la case seulement quand BERTHA a dit oui. L’application ne compile rien : elle vous croit sur parole, et c’est BERTHA qui fait foi.',
      'Les XP tombent à la coche et repartent à la décoche : une case rendue reprend ses points, et peut refermer la salle suivante.',
      'La jauge porte un repère ambre : c’est le seuil du jour. Les exercices bonus rapportent des XP mais ne comptent pas dans ce seuil.',
      'Au seuil, la salle passe VALIDE et la suivante s’ouvre.'
    ],
    geste: { libelle: `Ouvrir la feuille de route de ${epreuve.id}`, type: 'sujet', cible: epreuve.id }
  }
}

/** Chapitre 3 : la seance du soir, ses 10 XP, et son unicité. */
function chapitreQuiz(etat) {
  const propose = epreuveDeLaSeance(etat)
  const fiche = propose ? seance(etat, propose) : null
  const epreuve = propose ? epreuveParId(propose) : null
  const prerequis = epreuve?.prerequis ? epreuveParId(epreuve.prerequis) : null
  const reussis = idsAvecQuiz.filter((id) => quizReussi(etat, id)).length

  const etatLigne = !fiche
    ? ligne('Aucune séance du soir n’est encore ouverte.')
    : !fiche.ouverte
      ? ligne(
          `La séance de ${fiche.id} s’ouvrira quand ${prerequis ? prerequis.id : 'la salle précédente'} sera validé.`,
          'verrou'
        )
      : fiche.xpCredite
        ? ligne(
            `${fiche.id} est réussi (meilleur score ${fiche.meilleurScore} sur ${fiche.questions}) : les 10 XP sont au dossier.`,
            'oui'
          )
        : ligne(
            `La séance de ${fiche.id} vous attend : ${fiche.questions} questions, ${fiche.tentatives} tentative${fiche.tentatives > 1 ? 's' : ''} pour l’instant.`,
            'encours'
          )

  return {
    id: 'quiz',
    label: 'AVANT DE RENDRE LE PUPITRE',
    titre: 'Le quiz du soir',
    resume: `${reussis} séance${reussis > 1 ? 's' : ''} réussie${reussis > 1 ? 's' : ''} sur les ${idsAvecQuiz.length} du programme.`,
    etat: etatLigne,
    points: [
      'Huit questions à quatre réponses, tirées du mémo de la journée que vous venez de lire. Rien n’y demande une connaissance générale du COBOL.',
      'Une réponse posée ne se reprend pas : la correction commentée s’affiche aussitôt, et on passe à la suivante.',
      'Six bonnes réponses sur huit rapportent 10 XP, une seule fois par épreuve. Les re-tentatives sont libres et ne rapportent plus rien.',
      'Ces 10 XP comptent dans votre total et dans votre échelon, mais pas dans le seuil de validation de la salle : celui-là se gagne aux exercices.',
      'Une séance abandonnée en cours de route ne laisse aucune trace. La note ne part au dossier qu’à la huitième réponse.'
    ],
    geste: { libelle: 'Ouvrir la séance du soir', type: 'ecran', cible: 'quiz' }
  }
}

/** Chapitre 4 : les decorations et les neuf echelons. */
function chapitreCarriere(etat) {
  const service = carriere(etat)
  const obtenues = badgesObtenus(etat).length

  return {
    id: 'carriere',
    label: 'LA CARRIERE',
    titre: 'Décorations et échelons',
    resume: 'Ce que la CGBA retient de vous.',
    etat: ligne(
      `${obtenues} décoration${obtenues > 1 ? 's' : ''} sur ${idsBadges.length}, échelon ${service.echelon.niveau} (${service.echelon.titre}).` +
        (service.suivant
          ? ` Il manque ${service.xpAvant} XP pour ${service.suivant.titre}.`
          : ' C’est le dernier barreau de l’échelle.'),
      obtenues > 0 ? 'oui' : 'neutre'
    ),
    points: [
      `${idsBadges.length - DECORATIONS_SUR_L_HONNEUR} décorations tombent toutes seules : leur condition se lit entièrement dans les exercices cochés et les XP.`,
      `Les ${DECORATIONS_SUR_L_HONNEUR} autres se cochent sur l’honneur, parce qu’elles demandent un jugement que l’application ne peut pas porter (aucun GO TO, des prédictions justes, du premier coup).`,
      'Une décoration automatique se déduit de votre état : elle se reprend d’elle-même si vous décochez l’exercice qui l’avait donnée.',
      'Un échelon ne s’achète pas qu’avec des XP : le livret exige aussi des épreuves validées. On peut avoir les points sans avoir le grade.'
    ],
    geste: { libelle: 'Ouvrir le livret', type: 'ecran', cible: 'livret' }
  }
}

/** Chapitre 5 : le dossier, ou il vit, et comment le déplacer. */
function chapitreDossier(etat) {
  const compte = salles(etat)
  const exercices = idsEpreuves.reduce((cumul, id) => {
    const epreuve = epreuveParId(id)
    return cumul + epreuve.exercices.filter((ex) => exerciceCoche(etat, id, ex.id)).length
  }, 0)

  return {
    id: 'dossier',
    label: 'VOTRE DOSSIER',
    titre: 'La progression est un vrai fichier',
    resume: 'Sur votre disque, à vous, et nulle part ailleurs.',
    etat: ligne(
      `${compte.validees} salle${compte.validees > 1 ? 's' : ''} validée${compte.validees > 1 ? 's' : ''} sur ${compte.total} et ${exercices} exercice${exercices > 1 ? 's' : ''} coché${exercices > 1 ? 's' : ''} dans votre dossier.`,
      'neutre'
    ),
    chemin: CHEMIN_DOSSIER,
    points: [
      'Le fichier est écrit une demi-seconde après chaque changement, et une dernière fois quand vous quittez l’application. Il n’y a rien à enregistrer à la main.',
      'Exporter en fait une copie où vous voulez : c’est la façon de passer votre progression d’un Mac à un autre, ou d’en garder une sauvegarde.',
      'Importer relit une copie et remplace la progression en cours. Un fichier qui n’a pas été produit par l’application est refusé sans rien abîmer.',
      'La remise à zéro demande deux confirmations, et vos réglages (thème, rythme) survivent à l’effacement.',
      'Rien ne part sur un réseau : pas de compte, pas de mise à jour, pas de statistiques.'
    ],
    geste: { libelle: 'Ouvrir les réglages', type: 'ecran', cible: 'reglages' }
  }
}

/**
 * Chapitre 6 : les raccourcis, tires du registre des ecrans. Ils ne peuvent
 * donc pas mentir : ajouter un ecran ajoute sa ligne ici.
 */
function chapitreSousLaMain() {
  return {
    id: 'sous-la-main',
    label: 'SOUS LA MAIN',
    titre: 'Raccourcis et dépannage',
    resume: 'Tout l’écran se rejoint au clavier.',
    etat: null,
    raccourcis: ecrans.map((ecran, rang) => ({
      touche: `Cmd + ${rang + 1}`,
      libelle: ecran.libelle,
      precision: ecran.precision
    })),
    points: [
      'Le bouton lune ou soleil, en haut à droite, bascule le thème clair et sombre. Le choix est retenu dans votre dossier.',
      'Les effets de phosphore (le balayage des blocs sombres) se coupent dans les réglages, pour les yeux sensibles.',
      'La fenêtre ne descend pas sous 1280 x 800 points, mais s’agrandit autant que vous voulez.',
      'Si un sujet s’affiche comme introuvable, c’est le corpus embarqué qui manque : il faut recompiler l’application depuis les sources.',
      'Un bandeau rouge en haut de la fenêtre annonce un fichier de progression illisible, avec la raison exacte. La session continue alors en mémoire.'
    ],
    geste: { libelle: 'Revenir au terminal', type: 'ecran', cible: 'terminal' }
  }
}

/**
 * Les six chapitres du guide, dans l'ordre ou on les lit le premier soir : le
 * plan, la feuille de route, la seance du soir, la carriere, le dossier, puis
 * ce qui tombe sous la main.
 */
export function chapitres(etat) {
  return [
    chapitrePremiersPas(etat),
    chapitreCocher(etat),
    chapitreQuiz(etat),
    chapitreCarriere(etat),
    chapitreDossier(etat),
    chapitreSousLaMain()
  ].map((chapitre, rang) => ({ ...chapitre, numero: rang + 1 }))
}

/**
 * Le chapitre a ouvrir en arrivant : celui qui parle de ce que l'apprenti a a
 * faire maintenant. Un dossier vierge ouvre sur le plan, une salle en cours sur
 * la feuille de route, une salle validee sur la seance du soir.
 */
export function chapitreDuMoment(etat) {
  if (seanceEnRetard(etat)) return 'quiz'
  const moment = epreuveDuMoment(etat)
  if (moment.faits > 0) return 'cocher'
  return 'premiers-pas'
}
