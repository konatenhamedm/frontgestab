import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Ban, Plus, Send, ShoppingCart } from 'lucide-react'
import { useAuth } from '@/application/contexts/AuthContext'
import { usePermissions } from '@/application/contexts/PermissionContext'
import { useArticles, useFournisseurs, useInvalidate } from '@/application/hooks/useReferentiels'
import { apiGet, apiPost } from '@/lib/apiFetch'
import { formatDate, formatMontant } from '@/lib/format'
import { FilterField, PageLayout, SubHeaderButton } from '@/components/ui/page-components'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/button'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { StatutBadge } from '@/components/ui/StatutBadge'
import { emptyLigne, LignesEditor, type LigneForm } from '@/components/ui/LignesEditor'
import { FieldBox, ListTable, matchesSearch, PaginationFooter, RowActions, SearchFilter, SelectField, TextareaField, usePagination } from '@/components/ui/crud'
import type { Commande } from '@/types'

export const Route = createFileRoute('/_dashboard/commandes')({
  component: CommandesPage,
})

const totalHt = (c: Commande) => c.lignes.reduce((s, l) => s + l.quantite * Number(l.prixUnitaireHt), 0)
const STATUTS = ['BROUILLON', 'ENVOYEE', 'PARTIELLE', 'RECUE', 'ANNULEE'].map((s) => ({ value: s, label: { BROUILLON: 'Brouillon', ENVOYEE: 'Envoyée', PARTIELLE: 'Partielle', RECUE: 'Reçue', ANNULEE: 'Annulée' }[s]! }))

function CommandesPage() {
  const { centre } = useAuth()
  const { canCreate } = usePermissions()
  const [creating, setCreating] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [statut, setStatut] = useState<string | null>(null)
  const { data, isLoading } = useQuery({ queryKey: ['commandes', centre?.id], queryFn: () => apiGet<Commande[]>('/achats/commandes'), enabled: !!centre })
  const filtered = (data ?? []).filter((c) => (!statut || c.statut === statut) && matchesSearch([c.numero, c.fournisseur.raisonSociale], search))
  const pagination = usePagination(filtered)
  const selected = data?.find((c) => c.id === selectedId) ?? null

  return (
    <div className="animate-fade-in-up">
      <PageLayout
        title="Commandes fournisseurs"
        icon={<ShoppingCart className="w-4 h-4 text-primary" />}
        count={filtered.length}
        description="Enregistrez vos commandes et suivez leur réception"
        action={canCreate('/commandes') ? <SubHeaderButton onClick={() => setCreating(true)} icon={<Plus className="h-3.5 w-3.5" />}>Nouvelle commande</SubHeaderButton> : undefined}
        filters={
          <>
            <SearchFilter value={search} onChange={setSearch} placeholder="N° commande, fournisseur…" />
            <FilterField label="Statut" className="min-w-[180px]"><CustomSelect value={STATUTS.find((s) => s.value === statut) ?? null} options={STATUTS} onChange={(v: any) => setStatut(v?.value ?? null)} placeholder="Tous" /></FilterField>
          </>
        }
        footer={<PaginationFooter pagination={pagination} />}
      >
        <ListTable<Commande>
          loading={isLoading}
          rows={pagination.paged}
          rowKey={(c) => c.id}
          onRowClick={(c) => setSelectedId(c.id)}
          emptyIcon={<ShoppingCart className="w-10 h-10" />}
          emptyTitle="Aucune commande"
          emptyDesc="Créez-en une ou lancez un réapprovisionnement depuis les alertes."
          actionWidth="100px"
          columns={[
            { header: 'N° commande', className: 'font-extrabold text-gray-900', cell: (c) => c.numero },
            { header: 'Fournisseur', className: 'text-xs', cell: (c) => c.fournisseur.raisonSociale },
            { header: 'Date', className: 'text-xs text-gray-600', cell: (c) => formatDate(c.dateCommande) },
            { header: 'Lignes', cell: (c) => c.lignes.length },
            { header: 'Total HT', className: 'text-xs font-bold', cell: (c) => formatMontant(totalHt(c)) },
            { header: 'Statut', cell: (c) => <StatutBadge statut={c.statut} /> },
          ]}
          actions={(c) => <RowActions onView={() => setSelectedId(c.id)} />}
        />
      </PageLayout>
      {creating && <CommandeModal onClose={() => setCreating(false)} />}
      {selected && <CommandeDetail commande={selected} onClose={() => setSelectedId(null)} />}
    </div>
  )
}

function CommandeModal({ onClose }: { onClose: () => void }) {
  const invalidate = useInvalidate()
  const { data: fournisseurs } = useFournisseurs()
  const { data: articles } = useArticles()
  const [fournisseur, setFournisseur] = useState('')
  const [notes, setNotes] = useState('')
  const [lignes, setLignes] = useState<LigneForm[]>([emptyLigne()])

  const create = useMutation({
    mutationFn: () => apiPost('/achats/commandes', { fournisseur: Number(fournisseur), notes, lignes: lignes.filter((l) => l.article).map((l) => ({ article: Number(l.article), quantite: Number(l.quantite), prixUnitaireHt: Number(l.prix) || 0 })) }),
    onSuccess: () => { toast.success('Commande créée (brouillon).'); invalidate('commandes', 'dashboard'); onClose() },
  })

  return (
    <Modal
      isOpen onClose={onClose} size="xl" title="Nouvelle commande"
      footer={<><Button variant="outline" onClick={onClose}>Annuler</Button><Button className="bg-primary text-white hover:bg-primary-hover" disabled={!fournisseur || !lignes.some((l) => l.article) || create.isPending} onClick={() => create.mutate()}>Créer la commande</Button></>}
    >
      <div className="space-y-4">
        <FieldBox label="Fournisseur" required>
          <SelectField value={fournisseur} onChange={(e) => setFournisseur(e.target.value)}>
            <option value="">— Choisir —</option>
            {fournisseurs?.map((f) => <option key={f.id} value={f.id}>{f.raisonSociale}</option>)}
          </SelectField>
        </FieldBox>
        <LignesEditor lignes={lignes} onChange={setLignes} articles={articles} />
        <FieldBox label="Notes"><TextareaField value={notes} onChange={(e) => setNotes(e.target.value)} /></FieldBox>
      </div>
    </Modal>
  )
}

function CommandeDetail({ commande, onClose }: { commande: Commande; onClose: () => void }) {
  const invalidate = useInvalidate()
  const { hasAction, can } = usePermissions()
  const refresh = () => invalidate('commandes', 'dashboard')
  const send = useMutation({ mutationFn: () => apiPost<Commande>(`/achats/commandes/${commande.id}/envoyer`), onSuccess: () => { toast.success(commande.fournisseur.email ? 'Commande envoyée au fournisseur.' : 'Commande marquée comme envoyée.'); refresh() } })
  const cancel = useMutation({ mutationFn: () => apiPost(`/achats/commandes/${commande.id}/annuler`), onSuccess: () => { toast.success('Commande annulée.'); refresh() } })

  return (
    <Modal
      isOpen onClose={onClose} size="lg" title={`Commande ${commande.numero}`} description={`${commande.fournisseur.raisonSociale} · ${formatDate(commande.dateCommande)}`}
      footer={
        <>
          {['BROUILLON', 'ENVOYEE'].includes(commande.statut) && can('commandes', 'D') && <Button variant="ghost" className="text-rose-600" onClick={() => confirm('Annuler cette commande ?') && cancel.mutate()}><Ban className="h-4 w-4" /> Annuler</Button>}
          {commande.statut === 'BROUILLON' && hasAction('commandes.envoyer') && <Button className="bg-primary text-white hover:bg-primary-hover" disabled={send.isPending} onClick={() => send.mutate()}><Send className="h-4 w-4" /> Envoyer au fournisseur</Button>}
        </>
      }
    >
      <div className="space-y-3">
        <StatutBadge statut={commande.statut} />
        {commande.notes && <p className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-gray-700">{commande.notes}</p>}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-[#1f2a37] text-[10px] font-black uppercase tracking-widest text-white/80"><tr><th className="px-4 py-2.5 text-left">Article</th><th className="px-4 py-2.5 text-right">Commandé</th><th className="px-4 py-2.5 text-right">Reçu</th><th className="px-4 py-2.5 text-right">PU HT</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {commande.lignes.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-2.5"><div className="font-bold text-gray-900">{l.article.designation}</div><div className="text-[11px] text-gray-400">{l.article.codeSku}</div></td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{l.quantite}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{l.quantiteRecue}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{formatMontant(l.prixUnitaireHt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-right text-sm text-gray-500">Total HT : <b className="text-gray-900">{formatMontant(totalHt(commande))}</b></p>
        {['ENVOYEE', 'PARTIELLE'].includes(commande.statut) && <p className="text-[11px] text-gray-400">À la livraison, enregistrez un bon de réception depuis « Réceptions » en choisissant cette commande.</p>}
      </div>
    </Modal>
  )
}
