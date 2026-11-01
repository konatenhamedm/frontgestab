import React, { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CheckCircle2, ClipboardList, PackageCheck, Plus, Printer, Trash2, Truck, XCircle } from 'lucide-react'
import { useAuth } from '@/application/contexts/AuthContext'
import { usePermissions } from '@/application/contexts/PermissionContext'
import { useArticles, useInvalidate } from '@/application/hooks/useReferentiels'
import { apiDelete, apiGet, apiPost } from '@/lib/apiFetch'
import { formatDate } from '@/lib/format'
import { FilterField, PageLayout, SubHeaderButton } from '@/components/ui/page-components'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { StatutBadge } from '@/components/ui/StatutBadge'
import { FieldBox, IconAction, ListTable, matchesSearch, PaginationFooter, RowActions, SearchFilter, SelectField, TextareaField, usePagination } from '@/components/ui/crud'
import type { Demande } from '@/types'

export const Route = createFileRoute('/_dashboard/demandes')({
  validateSearch: (search: Record<string, unknown>): { nouvelle?: number } => ({ nouvelle: search.nouvelle ? 1 : undefined }),
  component: DemandesPage,
})

const OUVERTES = ['EN_ATTENTE', 'VALIDEE', 'EN_LIVRAISON']
const STATUTS = [
  { value: 'EN_ATTENTE', label: 'En attente' }, { value: 'VALIDEE', label: 'Validée' }, { value: 'EN_LIVRAISON', label: 'En livraison' },
  { value: 'LIVREE', label: 'Livrée' }, { value: 'REFUSEE', label: 'Refusée' },
]

function DemandesPage() {
  const { nouvelle } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { centre } = useAuth()
  const { can, hasAction } = usePermissions()
  const seeAll = hasAction('demandes.voir_toutes')
  const [search, setSearch] = useState('')
  const [statut, setStatut] = useState<string | null>(seeAll ? 'OUVERTES' : null)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { data, isLoading } = useQuery({ queryKey: ['demandes', centre?.id, 'liste'], queryFn: () => apiGet<Demande[]>('/demandes'), enabled: !!centre })

  const filtered = useMemo(() => (data ?? []).filter((d) => {
    if (statut === 'OUVERTES' && !OUVERTES.includes(d.statut)) return false
    if (statut && statut !== 'OUVERTES' && d.statut !== statut) return false
    return matchesSearch([d.numeroDemande, d.demandeur.nomComplet, d.service?.nom, d.motif], search)
  }), [data, statut, search])
  const pagination = usePagination(filtered)
  const selected = data?.find((d) => d.id === selectedId) ?? null

  const options = [...(seeAll ? [{ value: 'OUVERTES', label: 'À traiter (ouvertes)' }] : []), ...STATUTS]

  return (
    <div className="animate-fade-in-up">
      <PageLayout
        title={seeAll ? 'Demandes & sorties de stock' : 'Mes demandes de fournitures'}
        icon={<ClipboardList className="w-4 h-4 text-primary" />}
        count={filtered.length}
        description="Saisie, validation, livraison et accusé de réception"
        action={can('demandes', 'C') ? <SubHeaderButton onClick={() => navigate({ search: { nouvelle: 1 } })} icon={<Plus className="h-3.5 w-3.5" />}>Nouvelle demande</SubHeaderButton> : undefined}
        filters={
          <>
            <SearchFilter value={search} onChange={setSearch} placeholder="N° demande, demandeur, service…" />
            <FilterField label="Statut" className="min-w-[200px]">
              <CustomSelect value={options.find((o) => o.value === statut) ?? null} options={options} onChange={(v: any) => setStatut(v?.value ?? null)} placeholder="Tous les statuts" />
            </FilterField>
          </>
        }
        footer={<PaginationFooter pagination={pagination} />}
      >
        <ListTable<Demande>
          loading={isLoading}
          rows={pagination.paged}
          rowKey={(d) => d.id}
          onRowClick={(d) => setSelectedId(d.id)}
          emptyIcon={<ClipboardList className="w-10 h-10" />}
          emptyTitle="Aucune demande"
          columns={[
            { header: 'N° demande', className: 'font-extrabold text-gray-900', cell: (d) => d.numeroDemande },
            { header: 'Demandeur', cell: (d) => <div className="text-xs"><div className="font-bold text-gray-800">{d.demandeur.nomComplet}</div><div className="text-gray-400">{d.service?.nom ?? '—'}</div></div> },
            { header: 'Date', className: 'text-xs text-gray-600', cell: (d) => formatDate(d.dateDemande, true) },
            { header: 'Articles', className: 'tabular-nums', cell: (d) => d.lignes.length },
            { header: 'Statut', cell: (d) => <StatutBadge statut={d.statut} /> },
          ]}
          actions={(d) => <RowActions onView={() => setSelectedId(d.id)} />}
          actionWidth="100px"
        />
      </PageLayout>

      {nouvelle && <NouvelleDemandeModal onClose={() => navigate({ search: {} })} />}
      {selected && <DemandeModal demande={selected} onClose={() => setSelectedId(null)} />}
    </div>
  )
}

function useRefreshDemandes() {
  const invalidate = useInvalidate()
  return () => invalidate('demandes', 'articles', 'dashboard', 'mouvements')
}

function NouvelleDemandeModal({ onClose }: { onClose: () => void }) {
  const refresh = useRefreshDemandes()
  const { data: articles } = useArticles()
  const [motif, setMotif] = useState('')
  const [lignes, setLignes] = useState<{ article: string; quantite: string }[]>([{ article: '', quantite: '1' }])

  const create = useMutation({
    mutationFn: () => apiPost('/demandes', { motif, lignes: lignes.filter((l) => l.article).map((l) => ({ article: Number(l.article), quantiteDemandee: Number(l.quantite) })) }),
    onSuccess: () => { toast.success('Demande envoyée au gestionnaire de stock.'); refresh(); onClose() },
  })

  const update = (i: number, patch: Partial<{ article: string; quantite: string }>) => setLignes((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)))
  const valid = lignes.some((l) => l.article && Number(l.quantite) > 0)

  return (
    <Modal
      isOpen onClose={onClose} size="lg" title="Nouvelle demande de fournitures"
      footer={<><Button variant="outline" onClick={onClose}>Annuler</Button><Button className="bg-primary text-white hover:bg-primary-hover" onClick={() => create.mutate()} disabled={!valid || create.isPending}>{create.isPending ? 'Envoi…' : 'Envoyer la demande'}</Button></>}
    >
      <div className="space-y-3">
        <div className="hidden grid-cols-[1fr_100px_36px] gap-2 text-xs font-bold text-gray-700 md:grid"><span>Fourniture</span><span>Quantité</span><span /></div>
        {lignes.map((l, i) => {
          const art = articles?.find((a) => String(a.id) === l.article)
          return (
            <div key={i} className="space-y-1">
              <div className="grid grid-cols-[1fr_90px_36px] items-center gap-2 md:grid-cols-[1fr_100px_36px]">
                <SelectField value={l.article} onChange={(e) => update(i, { article: e.target.value })} aria-label="Fourniture">
                  <option value="">— Choisir une fourniture —</option>
                  {articles?.filter((a) => a.id === art?.id || !lignes.some((x) => x.article === String(a.id))).map((a) => <option key={a.id} value={a.id}>{a.designation} ({a.codeSku})</option>)}
                </SelectField>
                <Input type="number" min={1} value={l.quantite} onChange={(e) => update(i, { quantite: e.target.value })} aria-label="Quantité" />
                <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-40" disabled={lignes.length === 1} onClick={() => setLignes((ls) => ls.filter((_, idx) => idx !== i))} aria-label="Retirer la ligne"><Trash2 size={14} /></button>
              </div>
              {art && <p className="text-[11px] text-gray-400">Disponible : {art.quantiteStock} {art.unite}</p>}
            </div>
          )
        })}
        <Button type="button" variant="outline" size="sm" onClick={() => setLignes((ls) => [...ls, { article: '', quantite: '1' }])}><Plus className="h-4 w-4" /> Ajouter une fourniture</Button>
        <FieldBox label="Motif / commentaire"><TextareaField value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Précisez l’usage ou l’urgence (facultatif)" /></FieldBox>
      </div>
    </Modal>
  )
}

function DemandeModal({ demande, onClose }: { demande: Demande; onClose: () => void }) {
  const { user } = useAuth()
  const { can, hasAction } = usePermissions()
  const refresh = useRefreshDemandes()
  const isOwner = demande.demandeur.id === user?.id
  const mayValidate = hasAction('demandes.valider')
  const mayDeliver = hasAction('demandes.livrer')
  const seeAll = hasAction('demandes.voir_toutes')
  const [accordees, setAccordees] = useState<Record<number, string>>(
    () => Object.fromEntries(demande.lignes.map((l) => [l.id, String(Math.min(l.quantiteDemandee, Math.max(0, l.article.quantiteStock)))]))
  )
  const [refusing, setRefusing] = useState(false)
  const [motifRefus, setMotifRefus] = useState('')

  const done = (message: string) => () => { toast.success(message); refresh() }
  const valider = useMutation({ mutationFn: () => apiPost(`/demandes/${demande.id}/valider`, { lignes: demande.lignes.map((l) => ({ id: l.id, quantiteAccordee: Number(accordees[l.id] ?? 0) })) }), onSuccess: done('Demande validée.') })
  const refuser = useMutation({ mutationFn: () => apiPost(`/demandes/${demande.id}/refuser`, { motif: motifRefus }), onSuccess: () => { done('Demande refusée.')(); setRefusing(false) } })
  const livrer = useMutation({ mutationFn: () => apiPost(`/demandes/${demande.id}/livrer`), onSuccess: done('Bon de sortie émis.') })
  const accuser = useMutation({ mutationFn: () => apiPost(`/demandes/${demande.id}/accuse-reception`, { confirmation: `Réception confirmée par ${user?.prenom} ${user?.nom}` }), onSuccess: done('Réception confirmée, stock mis à jour.') })
  const annuler = useMutation({ mutationFn: () => apiDelete(`/demandes/${demande.id}`), onSuccess: () => { done('Demande annulée.')(); onClose() } })

  const pending = demande.statut === 'EN_ATTENTE'
  const editable = pending && mayValidate
  const bon = demande.bonsSortie[demande.bonsSortie.length - 1]

  return (
    <Modal
      isOpen onClose={onClose} size="lg"
      title={`Demande ${demande.numeroDemande}`}
      description={`${demande.demandeur.nomComplet} · ${formatDate(demande.dateDemande, true)}`}
      footer={
        <>
          {bon && <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" /> Imprimer le bon</Button>}
          {pending && (isOwner || seeAll) && can('demandes', 'D') && !refusing && <Button variant="ghost" className="text-rose-600" onClick={() => confirm('Annuler cette demande ?') && annuler.mutate()}>Annuler la demande</Button>}
          {editable && !refusing && (
            <>
              <Button variant="destructive" onClick={() => setRefusing(true)}><XCircle className="h-4 w-4" /> Refuser</Button>
              <Button className="bg-emerald-600 text-white hover:bg-emerald-700" disabled={valider.isPending} onClick={() => valider.mutate()}><CheckCircle2 className="h-4 w-4" /> Valider</Button>
            </>
          )}
          {demande.statut === 'VALIDEE' && mayDeliver && <Button className="bg-primary text-white hover:bg-primary-hover" disabled={livrer.isPending} onClick={() => livrer.mutate()}><Truck className="h-4 w-4" /> Émettre le bon de sortie</Button>}
          {demande.statut === 'EN_LIVRAISON' && (isOwner || seeAll) && <Button className="bg-emerald-600 text-white hover:bg-emerald-700" disabled={accuser.isPending} onClick={() => accuser.mutate()}><PackageCheck className="h-4 w-4" /> Confirmer la réception</Button>}
        </>
      }
    >
      <div className="print-area space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <StatutBadge statut={demande.statut} />
          {demande.service && <span>Service : {demande.service.nom}</span>}
          {demande.valideur && <span>· Traitée par {demande.valideur.nomComplet}</span>}
        </div>

        {demande.motif && <p className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-gray-700"><b>Motif :</b> {demande.motif}</p>}
        {demande.motifRefus && <p className="rounded-lg bg-rose-50 border border-rose-100 px-3 py-2 text-xs text-rose-700"><b>Motif du refus :</b> {demande.motifRefus}</p>}

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-[#1f2a37] text-[10px] font-black uppercase tracking-widest text-white/80">
              <tr>
                <th className="px-4 py-2.5 text-left">Fourniture</th>
                <th className="px-4 py-2.5 text-right">Demandé</th>
                {editable && <th className="px-4 py-2.5 text-right">Stock</th>}
                <th className="px-4 py-2.5 text-right">Accordé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {demande.lignes.map((l) => {
                const manque = editable && Number(accordees[l.id] ?? 0) > l.article.quantiteStock
                return (
                  <tr key={l.id}>
                    <td className="px-4 py-2.5"><div className="font-bold text-gray-900">{l.article.designation}</div><div className="text-[11px] text-gray-400">{l.article.codeSku} · {l.article.unite}</div></td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{l.quantiteDemandee}</td>
                    {editable && <td className={`px-4 py-2.5 text-right tabular-nums ${l.article.quantiteStock < l.quantiteDemandee ? 'text-rose-600 font-bold' : ''}`}>{l.article.quantiteStock}</td>}
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {editable ? (
                        <Input type="number" min={0} max={l.article.quantiteStock} value={accordees[l.id] ?? ''} onChange={(e) => setAccordees((a) => ({ ...a, [l.id]: e.target.value }))} className={`ml-auto !w-24 text-right ${manque ? 'border-rose-500' : ''}`} aria-label={`Quantité accordée ${l.article.designation}`} />
                      ) : (
                        l.quantiteAccordee ?? '—'
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {editable && <p className="text-[11px] text-gray-400">Ajustez à la baisse selon la disponibilité : le stock n’est décrémenté qu’à l’accusé de réception.</p>}

        {refusing && (
          <div className="space-y-2 rounded-xl border border-gray-200 p-3">
            <FieldBox label="Motif du refus" required><TextareaField value={motifRefus} onChange={(e) => setMotifRefus(e.target.value)} autoFocus /></FieldBox>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setRefusing(false)}>Retour</Button>
              <Button variant="destructive" size="sm" disabled={!motifRefus.trim() || refuser.isPending} onClick={() => refuser.mutate()}>Confirmer le refus</Button>
            </div>
          </div>
        )}

        {bon && (
          <div className="rounded-xl border border-gray-200 px-3 py-2 text-xs">
            <div className="font-bold text-gray-900">Bon de sortie {bon.numeroBon}</div>
            <div className="text-gray-400">Livraison : {formatDate(bon.dateLivraison, true)}</div>
            <div className="text-gray-400">{bon.dateAccuseReception ? `Accusé de réception : ${formatDate(bon.dateAccuseReception, true)} — ${bon.confirmation ?? ''}` : 'En attente d’accusé de réception'}</div>
          </div>
        )}
      </div>
    </Modal>
  )
}
