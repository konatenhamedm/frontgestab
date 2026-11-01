import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeftRight } from 'lucide-react'
import { useAuth } from '@/application/contexts/AuthContext'
import { apiGet } from '@/lib/apiFetch'
import { formatDate } from '@/lib/format'
import { FilterField, PageLayout } from '@/components/ui/page-components'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { Pill } from '@/components/ui/StatutBadge'
import { ListTable, matchesSearch, PaginationFooter, SearchFilter, usePagination } from '@/components/ui/crud'
import type { Mouvement } from '@/types'

export const Route = createFileRoute('/_dashboard/mouvements')({
  component: MouvementsPage,
})

const TYPES = [
  { value: 'ENTREE_ACHAT', label: 'Entrées (achats)' },
  { value: 'SORTIE_DEMANDE', label: 'Sorties (demandes)' },
  { value: 'AJUSTEMENT', label: 'Ajustements' },
]
const TONE = { ENTREE_ACHAT: ['ok', 'Entrée (achat)'], SORTIE_DEMANDE: ['danger', 'Sortie (demande)'], AJUSTEMENT: ['info', 'Ajustement'] } as const

function MouvementsPage() {
  const { centre } = useAuth()
  const [type, setType] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const { data, isLoading } = useQuery({
    queryKey: ['mouvements', centre?.id, type],
    queryFn: () => apiGet<Mouvement[]>('/stock/mouvements', { type: type ?? undefined, limit: 500 }),
    enabled: !!centre,
  })
  const filtered = (data ?? []).filter((m) => matchesSearch([m.article.designation, m.article.codeSku, m.referenceDocument, m.commentaire], search))
  const pagination = usePagination(filtered)

  return (
    <div className="animate-fade-in-up">
      <PageLayout
        title="Mouvements de stock"
        icon={<ArrowLeftRight className="w-4 h-4 text-primary" />}
        count={filtered.length}
        description="Traçabilité complète : entrées d’achat, sorties de demandes, ajustements d’inventaire"
        filters={
          <>
            <SearchFilter value={search} onChange={setSearch} placeholder="Article, référence document…" />
            <FilterField label="Type de mouvement" className="min-w-[220px]">
              <CustomSelect value={TYPES.find((t) => t.value === type) ?? null} options={TYPES} onChange={(v: any) => setType(v?.value ?? null)} placeholder="Tous" />
            </FilterField>
          </>
        }
        footer={<PaginationFooter pagination={pagination} />}
      >
        <ListTable<Mouvement>
          loading={isLoading}
          rows={pagination.paged}
          rowKey={(m) => m.id}
          emptyIcon={<ArrowLeftRight className="w-10 h-10" />}
          emptyTitle="Aucun mouvement"
          columns={[
            { header: 'Date', className: 'text-xs text-gray-600', cell: (m) => formatDate(m.dateMouvement, true) },
            { header: 'Article', cell: (m) => <div><div className="font-extrabold text-gray-900">{m.article.designation}</div><div className="text-[11px] text-gray-400 font-mono">{m.article.codeSku}</div></div> },
            { header: 'Type', cell: (m) => <Pill tone={TONE[m.type][0]}>{TONE[m.type][1]}</Pill> },
            { header: 'Quantité', cell: (m) => <b className={m.quantite > 0 ? 'text-emerald-600' : 'text-rose-600'}>{m.quantite > 0 ? '+' : ''}{m.quantite}</b> },
            { header: 'Stock après', className: 'tabular-nums', cell: (m) => m.stockApres },
            { header: 'Référence', className: 'text-xs font-mono', cell: (m) => m.referenceDocument ?? '—' },
            { header: 'Commentaire', className: 'text-xs text-gray-500', cell: (m) => m.commentaire ?? '—' },
          ]}
        />
      </PageLayout>
    </div>
  )
}
