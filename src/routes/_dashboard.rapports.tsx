import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { format, startOfYear } from 'date-fns'
import { useAuth } from '@/application/contexts/AuthContext'
import { apiGet } from '@/lib/apiFetch'
import { formatNombre, today } from '@/lib/format'
import { BarChart3 } from 'lucide-react'
import { PageLayout, FilterField } from '@/components/ui/page-components'
import { Input } from '@/components/ui/input'
import { ListTable } from '@/components/ui/crud'
import type { Consommation } from '@/types'

export const Route = createFileRoute('/_dashboard/rapports')({
  component: RapportsPage,
})

function RapportsPage() {
  const { centre } = useAuth()
  const [du, setDu] = useState(format(startOfYear(new Date()), 'yyyy-MM-dd'))
  const [au, setAu] = useState(today())
  const { data, isLoading } = useQuery({ queryKey: ['consommation', centre?.id, du, au], queryFn: () => apiGet<Consommation>('/reporting/consommation', { du, au }), enabled: !!centre })

  const chartTooltip = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }

  return (
    <div className="animate-fade-in-up space-y-4">
      <PageLayout
        title="Analyse de consommation"
        icon={<BarChart3 className="w-4 h-4 text-primary" />}
        description="Calculée sur les demandes livrées de la période"
        filters={
          <>
            <FilterField label="Du"><Input type="date" value={du} max={au} onChange={(e) => setDu(e.target.value)} className="h-9 text-sm" /></FilterField>
            <FilterField label="Au"><Input type="date" value={au} min={du} onChange={(e) => setAu(e.target.value)} className="h-9 text-sm" /></FilterField>
          </>
        }
      >
        <div className="grid gap-4 p-4 xl:grid-cols-2">
          <section className="rounded-xl border border-gray-100 p-4">
            <h2 className="mb-3 text-xs font-black uppercase tracking-wider text-gray-500">Articles les plus consommés</h2>
            {data?.topArticles.length ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topArticles} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="designation" width={130} tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={chartTooltip} />
                    <Bar dataKey="quantite" name="Quantité" fill="#ff4a0a" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <p className="py-10 text-center text-sm text-gray-400">{isLoading ? 'Chargement…' : 'Aucune consommation sur la période.'}</p>}
          </section>

          <section className="rounded-xl border border-gray-100 p-4">
            <h2 className="mb-3 text-xs font-black uppercase tracking-wider text-gray-500">Services les plus consommateurs</h2>
            {data?.topServices.length ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topServices} margin={{ left: 0, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="nom" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={chartTooltip} />
                    <Bar dataKey="quantite" name="Quantité" fill="#1f2a37" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <p className="py-10 text-center text-sm text-gray-400">{isLoading ? 'Chargement…' : 'Aucune donnée.'}</p>}
          </section>

          <section className="rounded-xl border border-gray-100 overflow-hidden">
            <h2 className="border-b border-gray-100 px-4 py-3 text-xs font-black uppercase tracking-wider text-gray-500">Employés les plus consommateurs</h2>
            <ListTable<Consommation['topDemandeurs'][number]>
              loading={isLoading} rows={data?.topDemandeurs ?? []} rowKey={(d) => d.id} emptyTitle="Aucune donnée"
              columns={[
                { header: 'Employé', className: 'font-bold text-gray-900', cell: (d) => d.nom },
                { header: 'Demandes', cell: (d) => d.demandes },
                { header: 'Quantité', cell: (d) => <b>{formatNombre(d.quantite)}</b> },
              ]}
            />
          </section>

          <section className="rounded-xl border border-gray-100 overflow-hidden">
            <h2 className="border-b border-gray-100 px-4 py-3 text-xs font-black uppercase tracking-wider text-gray-500">Écarts demandé / accordé</h2>
            <ListTable<Consommation['ecarts'][number]>
              loading={isLoading} rows={data?.ecarts ?? []} rowKey={(e) => e.id} emptyTitle="Aucun écart" emptyDesc="Toutes les demandes ont été accordées en totalité."
              columns={[
                { header: 'Article', className: 'font-bold text-gray-900', cell: (e) => e.designation },
                { header: 'Demandé', cell: (e) => e.demande },
                { header: 'Accordé', cell: (e) => e.accorde },
                { header: 'Écart', cell: (e) => <b className={e.ecart < 0 ? 'text-rose-600' : 'text-emerald-600'}>{e.ecart > 0 ? '+' : ''}{e.ecart}</b> },
              ]}
            />
          </section>
        </div>
      </PageLayout>
    </div>
  )
}
