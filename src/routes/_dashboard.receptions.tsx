import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PackageCheck, Plus } from 'lucide-react'
import { useAuth } from '@/application/contexts/AuthContext'
import { usePermissions } from '@/application/contexts/PermissionContext'
import { useArticles, useFournisseurs, useInvalidate } from '@/application/hooks/useReferentiels'
import { apiGet, apiPost } from '@/lib/apiFetch'
import { formatDate, formatMontant, today } from '@/lib/format'
import { PageLayout, SubHeaderButton } from '@/components/ui/page-components'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { emptyLigne, LignesEditor, type LigneForm } from '@/components/ui/LignesEditor'
import { FieldBox, FormFooter, ListTable, matchesSearch, PaginationFooter, RowActions, SearchFilter, SelectField, TextareaField, usePagination } from '@/components/ui/crud'
import type { BonReception, Commande } from '@/types'

export const Route = createFileRoute('/_dashboard/receptions')({
  component: ReceptionsPage,
})

const totalHt = (b: BonReception) => b.lignes.reduce((s, l) => s + l.quantiteRecue * Number(l.prixUnitaireHt), 0)

function ReceptionsPage() {
  const { centre } = useAuth()
  const { canCreate } = usePermissions()
  const [creating, setCreating] = useState(false)
  const [selected, setSelected] = useState<BonReception | null>(null)
  const [search, setSearch] = useState('')
  const { data, isLoading } = useQuery({ queryKey: ['bons-reception', centre?.id], queryFn: () => apiGet<BonReception[]>('/achats/bons-reception'), enabled: !!centre })
  const filtered = (data ?? []).filter((b) => matchesSearch([b.numeroBon, b.numeroBonLivraison, b.fournisseur.raisonSociale, b.commande?.numero], search))
  const pagination = usePagination(filtered)

  return (
    <div className="animate-fade-in-up">
      <PageLayout
        title="Réceptions & entrées de stock"
        icon={<PackageCheck className="w-4 h-4 text-primary" />}
        count={filtered.length}
        description="Chaque bon de réception incrémente immédiatement le stock"
        action={canCreate('/receptions') ? <SubHeaderButton onClick={() => setCreating(true)} icon={<Plus className="h-3.5 w-3.5" />}>Nouvelle réception</SubHeaderButton> : undefined}
        filters={<SearchFilter value={search} onChange={setSearch} placeholder="N° bon, BL fournisseur, fournisseur…" />}
        footer={<PaginationFooter pagination={pagination} />}
      >
        <ListTable<BonReception>
          loading={isLoading}
          rows={pagination.paged}
          rowKey={(b) => b.id}
          onRowClick={setSelected}
          emptyIcon={<PackageCheck className="w-10 h-10" />}
          emptyTitle="Aucune réception enregistrée"
          actionWidth="100px"
          columns={[
            { header: 'N° bon', className: 'font-extrabold text-gray-900', cell: (b) => b.numeroBon },
            { header: 'Fournisseur', className: 'text-xs', cell: (b) => b.fournisseur.raisonSociale },
            { header: 'BL fournisseur', className: 'text-xs font-mono', cell: (b) => b.numeroBonLivraison ?? '—' },
            { header: 'Date', className: 'text-xs text-gray-600', cell: (b) => formatDate(b.dateEntree) },
            { header: 'Commande', className: 'text-xs font-mono', cell: (b) => b.commande?.numero ?? '—' },
            { header: 'Montant HT', className: 'text-xs font-bold', cell: (b) => formatMontant(totalHt(b)) },
          ]}
          actions={(b) => <RowActions onView={() => setSelected(b)} />}
        />
      </PageLayout>

      {creating && <ReceptionModal onClose={() => setCreating(false)} />}
      {selected && (
        <Modal isOpen onClose={() => setSelected(null)} size="lg" title={`Bon de réception ${selected.numeroBon}`} description={`${selected.fournisseur.raisonSociale} · ${formatDate(selected.dateEntree)}`} footer={<Button onClick={() => setSelected(null)}>Fermer</Button>}>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-[#1f2a37] text-[10px] font-black uppercase tracking-widest text-white/80"><tr><th className="px-4 py-2.5 text-left">Article</th><th className="px-4 py-2.5 text-right">Reçu</th><th className="px-4 py-2.5 text-right">PU HT</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {selected.lignes.map((l) => (
                  <tr key={l.id}>
                    <td className="px-4 py-2.5"><div className="font-bold text-gray-900">{l.article.designation}</div><div className="text-[11px] text-gray-400">{l.article.codeSku}</div></td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{l.quantiteRecue}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{formatMontant(l.prixUnitaireHt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selected.commentaire && <p className="mt-3 text-xs text-gray-500">{selected.commentaire}</p>}
        </Modal>
      )}
    </div>
  )
}

function ReceptionModal({ onClose }: { onClose: () => void }) {
  const invalidate = useInvalidate()
  const { centre } = useAuth()
  const { data: fournisseurs } = useFournisseurs()
  const { data: articles } = useArticles()
  const { data: commandes } = useQuery({ queryKey: ['commandes', centre?.id], queryFn: () => apiGet<Commande[]>('/achats/commandes'), enabled: !!centre })

  const [fournisseur, setFournisseur] = useState('')
  const [commande, setCommande] = useState('')
  const [numeroBl, setNumeroBl] = useState('')
  const [dateEntree, setDateEntree] = useState(today())
  const [commentaire, setCommentaire] = useState('')
  const [lignes, setLignes] = useState<LigneForm[]>([emptyLigne()])

  const ouvertes = useMemo(() => commandes?.filter((c) => ['ENVOYEE', 'PARTIELLE'].includes(c.statut) && (!fournisseur || String(c.fournisseur.id) === fournisseur)) ?? [], [commandes, fournisseur])

  // Choisir une commande préremplit fournisseur et lignes avec le reste à recevoir
  const chooseCommande = (id: string) => {
    setCommande(id)
    const c = commandes?.find((x) => String(x.id) === id)
    if (!c) return
    setFournisseur(String(c.fournisseur.id))
    const restantes = c.lignes.filter((l) => l.quantite > l.quantiteRecue)
    setLignes(restantes.length ? restantes.map((l) => ({ article: String(l.article.id), quantite: String(l.quantite - l.quantiteRecue), prix: String(Math.round(Number(l.prixUnitaireHt))) })) : [emptyLigne()])
  }

  const create = useMutation({
    mutationFn: () => apiPost('/achats/bons-reception', {
      fournisseur: Number(fournisseur), commande: commande ? Number(commande) : null, numeroBonLivraison: numeroBl, dateEntree, commentaire,
      lignes: lignes.filter((l) => l.article).map((l) => ({ article: Number(l.article), quantiteRecue: Number(l.quantite), prixUnitaireHt: Number(l.prix) || 0 })),
    }),
    onSuccess: () => { toast.success('Réception enregistrée : le stock est à jour.'); invalidate('bons-reception', 'commandes', 'articles', 'dashboard', 'mouvements'); onClose() },
  })

  return (
    <Modal isOpen onClose={onClose} size="xl" title="Nouvelle réception" footer={<FormFooter onCancel={onClose} onSave={() => create.mutate()} saving={create.isPending} saveLabel="Valider l’entrée en stock" disabled={!fournisseur || !lignes.some((l) => l.article)} />}>
      <div className="grid gap-4 md:grid-cols-2">
        <FieldBox label="Commande liée (facultatif)">
          <SelectField value={commande} onChange={(e) => chooseCommande(e.target.value)}>
            <option value="">— Réception sans commande —</option>
            {ouvertes.map((c) => <option key={c.id} value={c.id}>{c.numero} — {c.fournisseur.raisonSociale}</option>)}
          </SelectField>
        </FieldBox>
        <FieldBox label="Fournisseur" required>
          <SelectField value={fournisseur} onChange={(e) => setFournisseur(e.target.value)} disabled={!!commande}>
            <option value="">— Choisir —</option>
            {fournisseurs?.map((f) => <option key={f.id} value={f.id}>{f.raisonSociale}</option>)}
          </SelectField>
        </FieldBox>
        <FieldBox label="N° bon de livraison fournisseur"><Input value={numeroBl} onChange={(e) => setNumeroBl(e.target.value)} /></FieldBox>
        <FieldBox label="Date d’entrée"><Input type="date" value={dateEntree} onChange={(e) => setDateEntree(e.target.value)} /></FieldBox>
        <div className="md:col-span-2"><LignesEditor lignes={lignes} onChange={setLignes} articles={articles} quantiteLabel="Qté reçue" /></div>
        <FieldBox label="Commentaire" span2><TextareaField value={commentaire} onChange={(e) => setCommentaire(e.target.value)} /></FieldBox>
      </div>
    </Modal>
  )
}
