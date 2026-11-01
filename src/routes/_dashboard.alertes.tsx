import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Bell, ShoppingCart, TrendingUp } from 'lucide-react'
import { useAuth } from '@/application/contexts/AuthContext'
import { usePermissions } from '@/application/contexts/PermissionContext'
import { useFournisseurs, useInvalidate } from '@/application/hooks/useReferentiels'
import { apiGet, apiPost } from '@/lib/apiFetch'
import { formatMontant, formatNombre } from '@/lib/format'
import { FilterField, PageLayout } from '@/components/ui/page-components'
import { Button } from '@/components/ui/button'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { StatutBadge, stockStatut } from '@/components/ui/StatutBadge'
import { ListTable } from '@/components/ui/crud'
import type { Reappro, ReapproLigne } from '@/types'

export const Route = createFileRoute('/_dashboard/alertes')({
  component: AlertesPage,
})

function AlertesPage() {
  const { centre } = useAuth()
  const { can } = usePermissions()
  const navigate = useNavigate()
  const invalidate = useInvalidate()
  const { data: fournisseurs } = useFournisseurs()
  const { data, isLoading } = useQuery({ queryKey: ['reappro', centre?.id], queryFn: () => apiGet<Reappro>('/reporting/reapprovisionnement'), enabled: !!centre })
  const [selection, setSelection] = useState<Set<number>>(new Set())
  const [fournisseur, setFournisseur] = useState<number | null>(null)

  // Tout est coché par défaut : « réapprovisionnez-vous en un clic »
  useEffect(() => { if (data) setSelection(new Set(data.lignes.map((l) => l.article))) }, [data])

  const commander = useMutation({
    mutationFn: () => apiPost('/achats/commandes/depuis-reapprovisionnement', { fournisseur, articles: [...selection] }),
    onSuccess: () => {
      toast.success('Commande brouillon créée. Vérifiez-la puis envoyez-la au fournisseur.')
      invalidate('commandes', 'dashboard')
      navigate({ to: '/commandes' })
    },
  })

  const toggle = (id: number) => setSelection((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n })
  const total = data?.lignes.filter((l) => selection.has(l.article)).reduce((s, l) => s + Number(l.montantEstimeHt), 0) ?? 0
  const mayOrder = can('commandes', 'C')

  return (
    <div className="animate-fade-in-up space-y-3">
      <PageLayout
        title="Alertes & réapprovisionnement"
        icon={<Bell className="w-4 h-4 text-primary" />}
        count={data?.lignes.length}
        description="Stock ≤ seuil d’alerte · Quantité à commander = seuil cible − stock actuel"
        filters={mayOrder ? (
          <FilterField label="Fournisseur de la commande" className="min-w-[260px]">
            <CustomSelect value={fournisseurs?.map((f) => ({ value: f.id, label: f.raisonSociale })).find((o) => o.value === fournisseur) ?? null} options={fournisseurs?.map((f) => ({ value: f.id, label: f.raisonSociale })) ?? []} onChange={(v: any) => setFournisseur(v?.value ?? null)} placeholder="Choisir un fournisseur…" />
          </FilterField>
        ) : undefined}
      >
        <ListTable<ReapproLigne>
          loading={isLoading}
          rows={data?.lignes ?? []}
          rowKey={(l) => l.article}
          emptyIcon={<TrendingUp className="w-10 h-10" />}
          emptyTitle="Aucune alerte"
          emptyDesc="Tous les stocks sont au-dessus des seuils."
          columns={[
            ...(mayOrder ? [{ header: '', cell: (l: ReapproLigne) => <input type="checkbox" className="h-4 w-4 accent-[#ff4a0a]" checked={selection.has(l.article)} onChange={() => toggle(l.article)} aria-label={`Sélectionner ${l.designation}`} /> }] : []),
            { header: 'Article', cell: (l) => <div><div className="font-extrabold text-gray-900">{l.designation}</div><div className="text-[11px] text-gray-400 font-mono">{l.codeSku}</div></div> },
            { header: 'Statut', cell: (l) => <StatutBadge statut={stockStatut(l.stockActuel, l.seuilAlerteMin)} /> },
            { header: 'Stock', className: 'tabular-nums font-black', cell: (l) => formatNombre(l.stockActuel) },
            { header: 'Seuil / cible', className: 'text-xs tabular-nums', cell: (l) => `${l.seuilAlerteMin} / ${l.seuilReapproCible}` },
            { header: 'À commander', cell: (l) => <b className="text-primary">{formatNombre(l.quantiteACommander)} {l.unite}</b> },
            { header: 'Montant estimé HT', className: 'text-xs', cell: (l) => formatMontant(l.montantEstimeHt) },
          ]}
        />
      </PageLayout>

      {mayOrder && !!data?.lignes.length && (
        <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-lg">
          <div className="text-sm text-gray-500">{selection.size} article(s) · Estimation : <b className="text-gray-900">{formatMontant(total)}</b> HT</div>
          <Button className="bg-primary text-white hover:bg-primary-hover" disabled={!fournisseur || selection.size === 0 || commander.isPending} onClick={() => commander.mutate()}>
            <ShoppingCart className="h-4 w-4" /> Réapprovisionner en un clic
          </Button>
        </div>
      )}
    </div>
  )
}
