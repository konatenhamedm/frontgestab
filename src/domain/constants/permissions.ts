/**
 * Droits dynamiques : chaque rôle d'entreprise attribue, par module, une combinaison de lettres
 * C (créer) · R (lire) · U (modifier) · D (supprimer), plus des actions spéciales (ex. demandes.valider).
 * Le catalogue des modules vient du backend (/security/catalogue) ; ici seulement la correspondance route → module.
 */
export const ROUTE_MODULES: [string, string][] = [
  ['/parametres/entreprise', 'entreprise'],
  ['/parametres/centres', 'centres'],
  ['/parametres/services', 'services'],
  ['/parametres/utilisateurs', 'utilisateurs'],
  ['/parametres/roles', 'roles'],
  ['/parametres/journal', 'journal'],
  ['/demandes', 'demandes'],
  ['/articles', 'articles'],
  ['/alertes', 'alertes'],
  ['/mouvements', 'mouvements'],
  ['/fournisseurs', 'fournisseurs'],
  ['/commandes', 'commandes'],
  ['/receptions', 'receptions'],
  ['/factures', 'factures'],
  ['/rapports', 'rapports'],
]

/** Routes réservées au super administrateur de la plateforme. */
export const PLATFORM_ROUTES = ['/plateforme', '/entreprises']

export function moduleForPath(path: string): string | null {
  const clean = path.replace(/\/$/, '') || '/'
  if (clean === '/') return 'dashboard'
  return ROUTE_MODULES.find(([prefix]) => clean === prefix || clean.startsWith(prefix + '/'))?.[1] ?? null
}

export const LETTER_LABELS: Record<string, string> = { R: 'Lire', C: 'Créer', U: 'Modifier', D: 'Supprimer' }
export const LETTER_ORDER = ['R', 'C', 'U', 'D']

export const PLAN_LABELS: Record<string, string> = {
  ESSAI: 'Essai gratuit',
  STARTER: 'Starter',
  PRO: 'Pro',
  ENTREPRISE: 'Entreprise',
}
