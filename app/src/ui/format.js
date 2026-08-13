// Le formatage des nombres affiches. Un seul endroit pour tout le monde : la
// barre laterale et le tableau de bord ecrivent les memes XP, ils doivent les
// ecrire de la meme facon.
//
// Module PUR : pas de React, pas de DOM.

/**
 * Un nombre avec ses milliers separes. L'espace est fine et insecable : le
 * nombre ne se coupe jamais en fin de ligne.
 */
export function espacerMilliers(nombre) {
  return String(nombre).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
