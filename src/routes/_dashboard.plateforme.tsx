import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Building2, Gauge, MapPin, Users } from 'lucide-react'
import { apiGet } from '@/lib/apiFetch'
import { KpiCard, PageLayout } from '@/components/ui/page-components'
import { Pill } from '@/components/ui/StatutBadge'
import { PLAN_LABELS } from '@/domain/constants/permissions'
import type { Plateforme } from '@/types'

export const Route = createFileRoute('/_dashboard/plateforme')({
  component: PlateformePage,
})

function PlateformePage() {
  const { data } = useQuery({ queryKey: ['plateforme'], queryFn: () => apiGet<Plateforme>('/organisation/entreprises/plateforme') })

  return (
    <div className="animate-fade-in-up space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Entreprises" value={data?.entreprises ?? '…'} subtitle={`${data?.entreprisesActives ?? 0} actives`} icon={<Building2 className="w-4 h-4" />} />
        <KpiCard title="Centres de gestion" value={data?.centres ?? '…'} subtitle="Tous espaces confondus" icon={<MapPin className="w-4 h-4" />} />
        <KpiCard title="Utilisateurs actifs" value={data?.utilisateurs ?? '…'} subtitle="Toute la plateforme" icon={<Users className="w-4 h-4" />} />
        <KpiCard title="Abonnements à surveiller" value={(data?.entreprisesExpirees ?? 0) + (data?.expirentBientot ?? 0)} subtitle={`${data?.entreprisesExpirees ?? 0} expirés · ${data?.expirentBientot ?? 0} sous 14 jours`} icon={<AlertTriangle className="w-4 h-4" />} />
      </div>

      <PageLayout title="Plateforme GESTAD" icon={<Gauge className="w-4 h-4 text-primary" />} description="Administration SaaS : chaque entreprise dispose de son espace isolé, de ses centres, de ses rôles et de ses données">
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <section>
            <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-gray-400">Répartition par plan</h3>
            <ul className="divide-y divide-gray-100 text-sm">
              {data?.repartitionPlans.map((p) => (
                <li key={p.plan} className="flex items-center justify-between py-2">
                  <span className="flex items-center gap-2"><Pill tone="primary">{PLAN_LABELS[p.plan] ?? p.plan}</Pill><span className="text-xs text-gray-400">{data.plans[p.plan] ? `${data.plans[p.plan].maxCentres} centres · ${data.plans[p.plan].maxUtilisateurs} utilisateurs max.` : ''}</span></span>
                  <b>{p.n}</b>
                </li>
              ))}
            </ul>
          </section>
          <section className="text-sm text-gray-500">
            <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-gray-400">Comment utiliser</h3>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Créez, suspendez ou faites évoluer les entreprises depuis <Link to="/entreprises" className="font-bold text-primary hover:underline">Entreprises &amp; abonnements</Link>.</li>
              <li>Choisissez une entreprise dans le menu de gauche pour consulter son espace avec tous les droits.</li>
              <li>Chaque entreprise gère ses centres, services, utilisateurs et rôles de façon autonome.</li>
            </ul>
          </section>
        </div>
      </PageLayout>
    </div>
  )
}
