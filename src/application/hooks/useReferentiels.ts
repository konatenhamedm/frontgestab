import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/application/contexts/AuthContext'
import { usePermissions } from '@/application/contexts/PermissionContext'
import { apiGet } from '@/lib/apiFetch'
import type { Article, Categorie, Fournisseur, Ref } from '@/types'

/** Données de référence : mises en cache par centre / entreprise (le cache est vidé au changement de centre). */
export function useArticles(params?: Record<string, string | number | undefined>) {
  const { centre } = useAuth()
  const { can } = usePermissions()
  return useQuery({
    queryKey: ['articles', centre?.id, params ?? {}],
    queryFn: () => apiGet<Article[]>('/stock/articles', params),
    enabled: !!centre && (can('articles') || can('demandes', 'C')),
  })
}

export function useCategories() {
  const { user } = useAuth()
  const { can } = usePermissions()
  return useQuery({
    queryKey: ['categories', user?.entreprise?.id],
    queryFn: () => apiGet<Categorie[]>('/stock/categories'),
    enabled: can('articles') || can('demandes', 'C'),
  })
}

export function useFournisseurs() {
  const { user } = useAuth()
  const { can } = usePermissions()
  return useQuery({
    queryKey: ['fournisseurs', user?.entreprise?.id],
    queryFn: () => apiGet<Fournisseur[]>('/achats/fournisseurs'),
    enabled: can('fournisseurs') || can('commandes', 'C') || can('receptions', 'C') || can('factures', 'C'),
  })
}

export function useServices() {
  const { user } = useAuth()
  const { can } = usePermissions()
  return useQuery({
    queryKey: ['services', user?.entreprise?.id],
    queryFn: () => apiGet<Ref[]>('/organisation/services'),
    enabled: can('services') || can('utilisateurs', 'C') || can('utilisateurs', 'U'),
  })
}

export function useCentres() {
  const { user } = useAuth()
  const { can } = usePermissions()
  return useQuery({
    queryKey: ['centres', user?.entreprise?.id],
    queryFn: () => apiGet<Ref[]>('/organisation/centres'),
    enabled: can('centres') || can('utilisateurs', 'C') || can('utilisateurs', 'U'),
  })
}

/** Invalide plusieurs familles de requêtes (ex. après une réception : stock, commandes, tableau de bord…). */
export function useInvalidate() {
  const queryClient = useQueryClient()
  return (...keys: string[]) => keys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }))
}
