/**
 * Signal d'expiration de session.
 *
 * Une session qui expire ne renvoie plus l'utilisateur de force sur la page de
 * connexion : il peut être en train de saisir quelque chose. On émet un signal,
 * l'interface affiche une modale, et c'est lui qui décide quand se reconnecter.
 *
 * Le signal ne part qu'une fois : plusieurs appels d'API peuvent échouer en
 * même temps, la modale ne doit pas s'empiler.
 */
type Abonne = () => void;

const abonnes = new Set<Abonne>();
let dejaSignalee = false;

export function onSessionExpiree(abonne: Abonne): () => void {
  abonnes.add(abonne);
  return () => abonnes.delete(abonne);
}

export function signalerSessionExpiree(): void {
  if (dejaSignalee) return;
  dejaSignalee = true;
  abonnes.forEach(abonne => abonne());
}

/** Remet le signal à zéro, par exemple après une reconnexion réussie. */
export function reinitialiserSessionExpiree(): void {
  dejaSignalee = false;
}

export function sessionDejaExpiree(): boolean {
  return dejaSignalee;
}
