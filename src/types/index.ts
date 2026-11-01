export interface Ref { id: number; nom: string; code?: string | null }

export interface MenuModule { code: string; titre: string; lien: string; icon: string }
export interface MenuGroup { code: string; titre: string; icon: string; modules: MenuModule[] }

export interface Access {
  full: boolean
  /** module → lettres CRUD (ex. { articles: 'CRUD', demandes: 'CR' }) */
  permissions: Record<string, string>
  /** actions spéciales (ex. 'demandes.valider') */
  actions: string[]
  menu: MenuGroup[]
}

export interface SessionUser {
  id: number
  email: string
  nom: string
  prenom: string
  telephone: string | null
  is_super_admin: boolean
  role: { id: number; code: string; nom: string; systeme: boolean } | null
  access: Access
  entreprise: { id: number; nom: string; code: string; devise: string; plan: string; dateExpiration: string | null } | null
  centre: Ref | null
  centres: Ref[]
  service: { id: number; nom: string } | null
  must_change_password: boolean
}

export interface Categorie { id: number; nom: string; description?: string | null }

export interface Article {
  id: number
  codeSku: string
  designation: string
  unite: string
  categorie: Categorie | null
  quantiteStock: number
  seuilAlerteMin: number
  seuilReapproCible: number
  prixMoyenHt: string
  description?: string | null
}

export interface Mouvement {
  id: number
  article: Pick<Article, 'id' | 'codeSku' | 'designation' | 'unite'>
  type: 'ENTREE_ACHAT' | 'SORTIE_DEMANDE' | 'AJUSTEMENT'
  quantite: number
  stockApres: number
  dateMouvement: string
  referenceDocument: string | null
  commentaire: string | null
}

export interface Fournisseur {
  id: number
  raisonSociale: string
  contactNom: string | null
  email: string | null
  telephone: string | null
  adresse: string | null
}

export interface LigneCommande { id: number; article: Article; quantite: number; quantiteRecue: number; prixUnitaireHt: string }
export interface Commande {
  id: number
  numero: string
  statut: 'BROUILLON' | 'ENVOYEE' | 'PARTIELLE' | 'RECUE' | 'ANNULEE'
  dateCommande: string
  dateEnvoi: string | null
  notes: string | null
  fournisseur: Fournisseur
  lignes: LigneCommande[]
}

export interface LigneBonReception { id: number; article: Article; quantiteRecue: number; prixUnitaireHt: string }
export interface BonReception {
  id: number
  numeroBon: string
  numeroBonLivraison: string | null
  dateEntree: string
  statut: string
  commentaire: string | null
  fournisseur: Fournisseur
  commande: { id: number; numero: string } | null
  lignes: LigneBonReception[]
}

export interface Paiement { id: number; datePaiement: string; montantRegle: string; modePaiement: string; reference: string | null }
export interface Facture {
  id: number
  numeroFacture: string
  fournisseur: Fournisseur
  bonReception: { id: number; numeroBon: string } | null
  montantTotal: string
  montantPaye: string
  resteAPayer: string
  dateFacture: string
  dateEcheance: string | null
  statutPaiement: 'NON_PAYEE' | 'PARTIELLEMENT_PAYEE' | 'PAYEE'
  paiements: Paiement[]
}

export interface LigneDemande { id: number; article: Article; quantiteDemandee: number; quantiteAccordee: number | null }
export interface BonSortie {
  id: number
  numeroBon: string
  dateLivraison: string
  dateAccuseReception: string | null
  confirmation: string | null
}
export interface Demande {
  id: number
  numeroDemande: string
  statut: 'EN_ATTENTE' | 'VALIDEE' | 'REFUSEE' | 'EN_LIVRAISON' | 'LIVREE'
  dateDemande: string
  motif: string | null
  motifRefus: string | null
  dateValidation: string | null
  demandeur: { id: number; nomComplet: string; email: string }
  valideur: { id: number; nomComplet: string } | null
  service: Ref | null
  lignes: LigneDemande[]
  bonsSortie: BonSortie[]
}

export interface Role {
  id: number
  code: string
  nom: string
  description: string | null
  systeme: boolean
  permissions: Record<string, string>
  actions: string[]
  utilisateurs: number
}

export interface Utilisateur {
  id: number
  email: string
  nom: string
  prenom: string
  nomComplet: string
  telephone: string | null
  isActive?: boolean
  role: { id: number; code: string; nom: string } | null
  centres: Ref[]
  service: Ref | null
  mustChangePassword: boolean
  lastLoginAt: string | null
}

export interface Entreprise {
  id: number
  nom: string
  code: string
  email: string | null
  telephone: string | null
  adresse: string | null
  devise: string
  isActive: boolean
  plan: string
  maxCentres: number
  maxUtilisateurs: number
  dateExpiration: string | null
  expire: boolean
  nbCentres: number
  nbUtilisateurs: number
  createdAt: string | null
}

export interface Plateforme {
  entreprises: number
  entreprisesActives: number
  entreprisesExpirees: number
  expirentBientot: number
  centres: number
  utilisateurs: number
  plans: Record<string, { label: string; maxCentres: number; maxUtilisateurs: number; jours: number | null }>
  repartitionPlans: { plan: string; n: string | number }[]
}

export interface JournalEntry {
  id: number
  date: string
  utilisateur: string | null
  email: string | null
  centre: string | null
  methode: string
  chemin: string
  route: string | null
  statut: number
  ip: string | null
}

export interface Catalogue {
  groupes: {
    code: string
    titre: string
    icon: string
    modules: { code: string; titre: string; lien: string; icon: string; letters: string[]; actions: { code: string; libelle: string }[] }[]
  }[]
}

export interface Dashboard {
  articles: number
  commandesEnCours: number
  alertesSeuil: number
  budgetConsomme: string
  demandesEnAttente: number
  demandesALivrer: number
  facturesEnAttente: number
  resteAPayer: string
  devise: string
  articlesEnAlerte: { id: number; codeSku: string; designation: string; stock: number; seuil: number; statut: 'rupture' | 'alerte' }[]
}

export interface ReapproLigne {
  article: number
  codeSku: string
  designation: string
  unite: string
  stockActuel: number
  seuilAlerteMin: number
  seuilReapproCible: number
  quantiteACommander: number
  prixMoyenHt: string
  montantEstimeHt: string
}
export interface Reappro { lignes: ReapproLigne[]; montantTotalEstimeHt: string }

export interface Consommation {
  periode: { du: string; au: string }
  topArticles: { id: number; codeSku: string; designation: string; unite: string; quantite: number }[]
  topDemandeurs: { id: number; nom: string; quantite: number; demandes: number }[]
  topServices: { nom: string; quantite: number; demandes: number }[]
  ecarts: { id: number; designation: string; demande: number; accorde: number; ecart: number }[]
}

export interface Echeancier {
  lignes: {
    id: number; numeroFacture: string; fournisseur: string; dateFacture: string; dateEcheance: string | null
    montantTotal: string; montantPaye: string; resteAPayer: string; statutPaiement: string; enRetard: boolean; joursRetard: number
  }[]
  totalAPayer: string
  totalEnRetard: string
  parFournisseur: { fournisseur: string; resteAPayer: string }[]
}
