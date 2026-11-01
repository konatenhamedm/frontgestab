import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { History } from 'lucide-react'
import { apiGet } from '@/lib/apiFetch'
import { formatDate } from '@/lib/format'
import { FilterField, PageLayout } from '@/components/ui/page-components'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { Pill } from '@/components/ui/StatutBadge'
import { ListTable, matchesSearch, PaginationFooter, SearchFilter, usePagination } from '@/components/ui/crud'
import type { JournalEntry } from '@/types'

export const Route = createFileRoute('/_dashboard/parametres/journal')({
  component: JournalPage,
})

const METHODES = ['POST', 'PUT', 'PATCH', 'DELETE'].map((m) => ({ value: m, label: m }))
const TONE: Record<string, 'ok' | 'info' | 'warn' | 'danger'> = { POST: 'ok', PUT: 'info', PATCH: 'info', DELETE: 'danger' }

function JournalPage() {
  const [methode, setMethode] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const { data, isLoading } = useQuery({ queryKey: ['journal', methode], queryFn: () => apiGet<JournalEntry[]>('/security/journal', { methode: methode ?? undefined, limit: 500 }) })
  const filtered = (data ?? []).filter((j) => matchesSearch([j.utilisateur, j.email, j.chemin, j.centre], search))
  const pagination = usePagination(filtered)

  return (
    <div className="animate-fade-in-up">
      <PageLayout
        title="Journal d’activité"
        icon={<History className="w-4 h-4 text-primary" />}
        count={filtered.length}
        description="Toutes les actions d’écriture réalisées dans votre entreprise"
        filters={
          <>
            <SearchFilter value={search} onChange={setSearch} placeholder="Utilisateur, action, centre…" />
            <FilterField label="Méthode" className="min-w-[160px]"><CustomSelect value={METHODES.find((m) => m.value === methode) ?? null} options={METHODES} onChange={(v: any) => setMethode(v?.value ?? null)} placeholder="Toutes" /></FilterField>
          </>
        }
        footer={<PaginationFooter pagination={pagination} />}
      >
        <ListTable<JournalEntry>
          loading={isLoading} rows={pagination.paged} rowKey={(j) => j.id}
          emptyIcon={<History className="w-10 h-10" />} emptyTitle="Aucune activité enregistrée"
          columns={[
            { header: 'Date', className: 'text-xs text-gray-600', cell: (j) => formatDate(j.date, true) },
            { header: 'Utilisateur', cell: (j) => <div><div className="font-bold text-gray-900 text-xs">{j.utilisateur ?? '—'}</div><div className="text-[11px] text-gray-400">{j.email}</div></div> },
            { header: 'Centre', className: 'text-xs', cell: (j) => j.centre ?? '—' },
            { header: 'Action', cell: (j) => <div className="flex items-center gap-2"><Pill tone={TONE[j.methode] ?? 'neutral'}>{j.methode}</Pill><span className="font-mono text-[11px] text-gray-600">{j.chemin.replace('/api', '')}</span></div> },
            { header: 'Résultat', cell: (j) => <Pill tone={j.statut < 400 ? 'ok' : 'danger'}>{j.statut}</Pill> },
            { header: 'IP', className: 'text-[11px] font-mono text-gray-400', cell: (j) => j.ip ?? '—' },
          ]}
        />
      </PageLayout>
    </div>
  )
}
