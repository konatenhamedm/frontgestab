import { createFileRoute, Link, Navigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Bell, Boxes, ClipboardList, LayoutDashboard, Plus, ShoppingCart, TrendingUp, Wallet } from 'lucide-react'
import { useAuth } from '@/application/contexts/AuthContext'
import { usePermissions } from '@/application/contexts/PermissionContext'
import { api, apiGet } from '@/lib/apiFetch'
import { formatDate, formatMontant, formatNombre } from '@/lib/format'
import { KpiCard, PageLayout, SubHeaderButton } from '@/components/ui/page-components'
import { ListTable } from '@/components/ui/crud'
import { Badge } from '@/components/ui/badge'
import { StatutBadge } from '@/components/ui/StatutBadge'
import type { Dashboard, Demande } from '@/types'

export const Route = createFileRoute('/_dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  const { user, centre } = useAuth()
  const { hasAction, can, isSuperAdmin } = usePermissions()
  const showStats = hasAction('dashboard.stats')
  const canRequest = can('demandes', 'C')

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', centre?.id],
    queryFn: () => api<Dashboard>('/reporting/dashboard', { muteError: true }),
    enabled: showStats && !!centre,
  })
  const { data: demandes, isLoading: loadingDemandes } = useQuery({
    queryKey: ['demandes', centre?.id, 'accueil'],
    queryFn: () => apiGet<Demande[]>('/demandes'),
    enabled: can('demandes') && !!centre,
  })

  // Le super administrateur sans entreprise sélectionnée arrive sur la vue plateforme
  if (isSuperAdmin && !user?.entreprise) return <Navigate to="/plateforme" />

  const devise = stats?.devise ?? user?.entreprise?.devise ?? 'FCFA'

  return (
    <div className="space-y-4">
      {showStats && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard title="Articles" value={isLoading ? '…' : formatNombre(stats?.articles)} subtitle="Références actives du centre" icon={<Boxes className="w-4 h-4" />} />
          <KpiCard title="Commandes en cours" value={isLoading ? '…' : formatNombre(stats?.commandesEnCours)} subtitle="Brouillon, envoyées, partielles" icon={<ShoppingCart className="w-4 h-4" />} />
          <KpiCard title="Alertes seuil" value={isLoading ? '…' : formatNombre(stats?.alertesSeuil)} subtitle="Articles à réapprovisionner" icon={<Bell className="w-4 h-4" />} />
          <KpiCard title="Budget consommé" value={isLoading ? '…' : formatMontant(stats?.budgetConsomme, devise)} subtitle="Factures de l’année" icon={<Wallet className="w-4 h-4" />} />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        <PageLayout
          className="xl:col-span-2"
          title={hasAction('demandes.voir_toutes') ? 'Dernières demandes' : 'Mes demandes'}
          icon={<ClipboardList className="w-4 h-4 text-primary" />}
          description={centre ? `Centre : ${centre.nom}` : 'Aucun centre sélectionné'}
          action={canRequest ? <Link to="/demandes" search={{ nouvelle: 1 }}><SubHeaderButton onClick={() => undefined} icon={<Plus className="h-3.5 w-3.5" />}>Nouvelle demande</SubHeaderButton></Link> : undefined}
        >
          <ListTable<Demande>
            loading={loadingDemandes}
            rows={demandes?.slice(0, 7) ?? []}
            rowKey={(d) => d.id}
            emptyIcon={<ClipboardList className="w-10 h-10" />}
            emptyTitle="Aucune demande pour le moment"
            columns={[
              { header: 'N° demande', cell: (d) => <span className="font-extrabold text-gray-900">{d.numeroDemande}</span> },
              { header: 'Demandeur', cell: (d) => <span className="text-xs">{d.demandeur.nomComplet}</span> },
              { header: 'Date', cell: (d) => <span className="text-xs">{formatDate(d.dateDemande)}</span> },
              { header: 'Articles', cell: (d) => d.lignes.length },
              { header: 'Statut', cell: (d) => <StatutBadge statut={d.statut} /> },
            ]}
          />
        </PageLayout>

        {showStats ? (
          <PageLayout title="À réapprovisionner" icon={<Bell className="w-4 h-4 text-primary" />} description="Stock inférieur ou égal au seuil d’alerte" count={stats?.alertesSeuil}>
            {stats?.articlesEnAlerte.length ? (
              <ul className="divide-y divide-gray-100">
                {stats.articlesEnAlerte.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                    <div className="min-w-0">
                      <div className="truncate font-bold text-gray-900">{a.designation}</div>
                      <div className="text-xs text-gray-400">{a.codeSku} · seuil {a.seuil}</div>
                    </div>
                    <StatutBadge statut={a.statut} />
                    <span className="w-10 text-right font-black tabular-nums">{a.stock}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="flex items-center gap-2 px-5 py-8 text-sm text-gray-400"><TrendingUp className="h-4 w-4 text-emerald-500" /> Tous les stocks sont au-dessus des seuils.</p>
            )}
            {can('alertes') && <div className="border-t border-gray-100 px-5 py-3 text-right"><Link to="/alertes" className="text-xs font-bold text-primary hover:underline">Réapprovisionner →</Link></div>}
          </PageLayout>
        ) : (
          <PageLayout title="Comment ça marche ?" icon={<LayoutDashboard className="w-4 h-4 text-primary" />}>
            <ol className="space-y-3 p-5 text-sm text-gray-500">
              <li><b className="text-gray-900">1.</b> Sélectionnez vos fournitures et envoyez votre demande.</li>
              <li><b className="text-gray-900">2.</b> Le gestionnaire de stock valide ou ajuste les quantités.</li>
              <li><b className="text-gray-900">3.</b> Confirmez la réception depuis votre espace une fois servi.</li>
            </ol>
            <div className="px-5 pb-5"><Badge variant="secondary">Rôle : {user?.role?.nom ?? '—'}</Badge></div>
          </PageLayout>
        )}
      </div>

      {showStats && stats && (stats.demandesEnAttente > 0 || stats.demandesALivrer > 0 || stats.facturesEnAttente > 0) && (
        <div className="grid gap-3 md:grid-cols-3">
          <KpiCard title="Demandes à valider" value={formatNombre(stats.demandesEnAttente)} subtitle="En attente du gestionnaire" icon={<ClipboardList className="w-4 h-4" />} />
          <KpiCard title="Demandes à livrer" value={formatNombre(stats.demandesALivrer)} subtitle="Validées, bon de sortie à émettre" icon={<ClipboardList className="w-4 h-4" />} />
          <KpiCard title="Factures à payer" value={formatNombre(stats.facturesEnAttente)} subtitle={`Reste : ${formatMontant(stats.resteAPayer, devise)}`} icon={<Wallet className="w-4 h-4" />} />
        </div>
      )}
    </div>
  )
}
