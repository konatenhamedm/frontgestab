import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AlertTriangle, Banknote, CalendarClock, Plus, Wallet } from 'lucide-react'
import { useAuth } from '@/application/contexts/AuthContext'
import { usePermissions } from '@/application/contexts/PermissionContext'
import { useFournisseurs, useInvalidate } from '@/application/hooks/useReferentiels'
import { apiGet, apiPost } from '@/lib/apiFetch'
import { formatDate, formatMontant, today } from '@/lib/format'
import { FilterField, KpiCard, PageLayout, SubHeaderButton } from '@/components/ui/page-components'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { Pill, StatutBadge } from '@/components/ui/StatutBadge'
import { FieldBox, FormFooter, IconAction, ListTable, matchesSearch, PaginationFooter, RowActions, SearchFilter, SelectField, usePagination } from '@/components/ui/crud'
import type { BonReception, Echeancier, Facture } from '@/types'

export const Route = createFileRoute('/_dashboard/factures')({
  component: FacturesPage,
})

const STATUTS = [{ value: 'NON_PAYEE', label: 'Non payées' }, { value: 'PARTIELLEMENT_PAYEE', label: 'Partiellement payées' }, { value: 'PAYEE', label: 'Payées' }]
const MODES = [['VIREMENT', 'Virement'], ['CHEQUE', 'Chèque'], ['ESPECES', 'Espèces'], ['MOBILE_MONEY', 'Mobile money'], ['AUTRE', 'Autre']]

function FacturesPage() {
  const { user } = useAuth()
  const { canCreate, hasAction } = usePermissions()
  const devise = user?.entreprise?.devise ?? 'FCFA'
  const [vue, setVue] = useState<'factures' | 'echeancier'>('factures')
  const [statut, setStatut] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { data: factures, isLoading } = useQuery({ queryKey: ['factures', statut], queryFn: () => apiGet<Facture[]>('/achats/factures', { statut: statut ?? undefined }) })
  const { data: echeancier, isLoading: loadingEch } = useQuery({ queryKey: ['echeancier'], queryFn: () => apiGet<Echeancier>('/reporting/echeancier') })
  const filtered = (factures ?? []).filter((f) => matchesSearch([f.numeroFacture, f.fournisseur.raisonSociale], search))
  const pagination = usePagination(filtered)
  const selected = factures?.find((f) => f.id === selectedId) ?? null

  return (
    <div className="animate-fade-in-up space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiCard title="Reste à payer" value={formatMontant(echeancier?.totalAPayer, devise)} subtitle="Toutes factures en attente" icon={<Wallet className="w-4 h-4" />} />
        <KpiCard title="Dont en retard" value={formatMontant(echeancier?.totalEnRetard, devise)} subtitle="Échéance dépassée" icon={<AlertTriangle className="w-4 h-4" />} />
        <KpiCard title="Factures en attente" value={echeancier?.lignes.length ?? '…'} subtitle="Non soldées" icon={<CalendarClock className="w-4 h-4" />} />
      </div>

      <PageLayout
        title="Factures fournisseurs & budget"
        icon={<Wallet className="w-4 h-4 text-primary" />}
        count={vue === 'factures' ? filtered.length : echeancier?.lignes.length}
        description="Saisie des factures, règlements et échéancier"
        action={
          <>
            <SubHeaderButton variant={vue === 'factures' ? 'primary' : 'secondary'} onClick={() => setVue('factures')}>Factures</SubHeaderButton>
            <SubHeaderButton variant={vue === 'echeancier' ? 'primary' : 'secondary'} onClick={() => setVue('echeancier')}>Échéancier fournisseurs</SubHeaderButton>
            {canCreate('/factures') && <SubHeaderButton onClick={() => setCreating(true)} icon={<Plus className="h-3.5 w-3.5" />}>Nouvelle facture</SubHeaderButton>}
          </>
        }
        filters={vue === 'factures' ? (
          <>
            <SearchFilter value={search} onChange={setSearch} placeholder="N° facture, fournisseur…" />
            <FilterField label="Statut de paiement" className="min-w-[220px]"><CustomSelect value={STATUTS.find((s) => s.value === statut) ?? null} options={STATUTS} onChange={(v: any) => setStatut(v?.value ?? null)} placeholder="Tous" /></FilterField>
          </>
        ) : undefined}
        footer={vue === 'factures' ? <PaginationFooter pagination={pagination} /> : undefined}
      >
        {vue === 'factures' ? (
          <ListTable<Facture>
            loading={isLoading}
            rows={pagination.paged}
            rowKey={(f) => f.id}
            onRowClick={(f) => setSelectedId(f.id)}
            emptyIcon={<Wallet className="w-10 h-10" />}
            emptyTitle="Aucune facture"
            actionWidth="110px"
            columns={[
              { header: 'N° facture', className: 'font-extrabold text-gray-900', cell: (f) => f.numeroFacture },
              { header: 'Fournisseur', className: 'text-xs', cell: (f) => f.fournisseur.raisonSociale },
              { header: 'Date', className: 'text-xs text-gray-600', cell: (f) => formatDate(f.dateFacture) },
              { header: 'Échéance', className: 'text-xs text-gray-600', cell: (f) => formatDate(f.dateEcheance) },
              { header: 'Montant', className: 'text-xs font-bold', cell: (f) => formatMontant(f.montantTotal, devise) },
              { header: 'Reste à payer', className: 'text-xs', cell: (f) => formatMontant(f.resteAPayer, devise) },
              { header: 'Statut', cell: (f) => <StatutBadge statut={f.statutPaiement} /> },
            ]}
            actions={(f) => (
              <RowActions onView={() => setSelectedId(f.id)}>
                {hasAction('factures.payer') && f.statutPaiement !== 'PAYEE' && <IconAction tone="emerald" title="Enregistrer un règlement" onClick={() => setSelectedId(f.id)}><Banknote size={14} /></IconAction>}
              </RowActions>
            )}
          />
        ) : (
          <div className="grid gap-0 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <ListTable<Echeancier['lignes'][number]>
                loading={loadingEch}
                rows={echeancier?.lignes ?? []}
                rowKey={(l) => l.id}
                emptyIcon={<CalendarClock className="w-10 h-10" />}
                emptyTitle="Aucune facture en attente"
                columns={[
                  { header: 'Facture', cell: (l) => <div><div className="font-extrabold text-gray-900">{l.numeroFacture}</div><div className="text-[11px] text-gray-400">{l.fournisseur}</div></div> },
                  { header: 'Échéance', className: 'text-xs', cell: (l) => <span>{formatDate(l.dateEcheance)} {l.enRetard && <Pill tone="danger">{l.joursRetard} j de retard</Pill>}</span> },
                  { header: 'Reste à payer', className: 'font-bold', cell: (l) => formatMontant(l.resteAPayer, devise) },
                ]}
              />
            </div>
            <div className="border-t border-gray-100 p-4 xl:border-l xl:border-t-0">
              <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-gray-400">Par fournisseur</h3>
              <ul className="divide-y divide-gray-100 text-sm">
                {echeancier?.parFournisseur.map((p) => <li key={p.fournisseur} className="flex items-center justify-between gap-2 py-2"><span className="truncate">{p.fournisseur}</span><b className="tabular-nums">{formatMontant(p.resteAPayer, devise)}</b></li>)}
                {echeancier?.parFournisseur.length === 0 && <li className="py-4 text-center text-gray-400">Rien à payer.</li>}
              </ul>
            </div>
          </div>
        )}
      </PageLayout>

      {creating && <FactureModal onClose={() => setCreating(false)} />}
      {selected && <FactureDetail facture={selected} devise={devise} onClose={() => setSelectedId(null)} />}
    </div>
  )
}

const useRefreshFactures = () => { const invalidate = useInvalidate(); return () => invalidate('factures', 'echeancier', 'dashboard') }

function FactureModal({ onClose }: { onClose: () => void }) {
  const refresh = useRefreshFactures()
  const { centre } = useAuth()
  const { data: fournisseurs } = useFournisseurs()
  const { data: bons } = useQuery({ queryKey: ['bons-reception', centre?.id], queryFn: () => apiGet<BonReception[]>('/achats/bons-reception'), enabled: !!centre })
  const [form, setForm] = useState({ numeroFacture: '', fournisseur: '', bonReception: '', montantTotal: '', dateFacture: today(), dateEcheance: '' })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const chooseBon = (id: string) => {
    const bon = bons?.find((b) => String(b.id) === id)
    setForm((f) => ({ ...f, bonReception: id, fournisseur: bon ? String(bon.fournisseur.id) : f.fournisseur, montantTotal: bon ? String(bon.lignes.reduce((s, l) => s + l.quantiteRecue * Number(l.prixUnitaireHt), 0)) : f.montantTotal }))
  }

  const create = useMutation({
    mutationFn: () => apiPost('/achats/factures', { ...form, fournisseur: Number(form.fournisseur), bonReception: form.bonReception ? Number(form.bonReception) : null, montantTotal: Number(form.montantTotal), dateEcheance: form.dateEcheance || null }),
    onSuccess: () => { toast.success('Facture enregistrée.'); refresh(); onClose() },
  })

  return (
    <Modal isOpen onClose={onClose} size="lg" title="Nouvelle facture fournisseur" footer={<FormFooter onCancel={onClose} onSave={() => create.mutate()} saving={create.isPending} disabled={!form.numeroFacture || !form.fournisseur || !(Number(form.montantTotal) > 0)} />}>
      <div className="grid gap-4 md:grid-cols-2">
        <FieldBox label="Bon de réception lié" span2>
          <SelectField value={form.bonReception} onChange={(e) => chooseBon(e.target.value)}>
            <option value="">— Aucun —</option>
            {bons?.map((b) => <option key={b.id} value={b.id}>{b.numeroBon} — {b.fournisseur.raisonSociale}</option>)}
          </SelectField>
        </FieldBox>
        <FieldBox label="N° de facture" required><Input value={form.numeroFacture} onChange={set('numeroFacture')} /></FieldBox>
        <FieldBox label="Fournisseur" required>
          <SelectField value={form.fournisseur} onChange={set('fournisseur')} disabled={!!form.bonReception}>
            <option value="">— Choisir —</option>
            {fournisseurs?.map((f) => <option key={f.id} value={f.id}>{f.raisonSociale}</option>)}
          </SelectField>
        </FieldBox>
        <FieldBox label="Montant total" required><Input type="number" min={0} step="0.01" value={form.montantTotal} onChange={set('montantTotal')} /></FieldBox>
        <FieldBox label="Date de facture"><Input type="date" value={form.dateFacture} onChange={set('dateFacture')} /></FieldBox>
        <FieldBox label="Date d’échéance"><Input type="date" value={form.dateEcheance} onChange={set('dateEcheance')} /></FieldBox>
      </div>
    </Modal>
  )
}

function FactureDetail({ facture, devise, onClose }: { facture: Facture; devise: string; onClose: () => void }) {
  const refresh = useRefreshFactures()
  const { hasAction } = usePermissions()
  const [paying, setPaying] = useState(false)
  const [form, setForm] = useState({ montantRegle: facture.resteAPayer, modePaiement: 'VIREMENT', datePaiement: today(), reference: '' })
  const pay = useMutation({
    mutationFn: () => apiPost(`/achats/factures/${facture.id}/paiements`, { ...form, montantRegle: Number(form.montantRegle) }),
    onSuccess: () => { toast.success('Règlement enregistré.'); refresh(); setPaying(false) },
  })

  return (
    <Modal
      isOpen onClose={onClose} size="lg" title={`Facture ${facture.numeroFacture}`} description={`${facture.fournisseur.raisonSociale} · ${formatDate(facture.dateFacture)}`}
      footer={facture.statutPaiement !== 'PAYEE' && !paying && hasAction('factures.payer') ? <Button className="bg-primary text-white hover:bg-primary-hover" onClick={() => setPaying(true)}><Banknote className="h-4 w-4" /> Enregistrer un règlement</Button> : undefined}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3"><div className="text-[10px] font-black uppercase text-gray-400">Montant</div><div className="font-black">{formatMontant(facture.montantTotal, devise)}</div></div>
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3"><div className="text-[10px] font-black uppercase text-gray-400">Réglé</div><div className="font-black text-emerald-600">{formatMontant(facture.montantPaye, devise)}</div></div>
          <div className="rounded-xl bg-rose-50 border border-rose-100 p-3"><div className="text-[10px] font-black uppercase text-gray-400">Reste</div><div className="font-black text-rose-600">{formatMontant(facture.resteAPayer, devise)}</div></div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500"><StatutBadge statut={facture.statutPaiement} /> Échéance : {formatDate(facture.dateEcheance)} {facture.bonReception && <span>· Bon de réception {facture.bonReception.numeroBon}</span>}</div>

        {paying && (
          <div className="grid gap-3 rounded-xl border border-gray-200 p-3 md:grid-cols-2">
            <FieldBox label="Montant réglé" required><Input type="number" min={0} step="0.01" value={form.montantRegle} onChange={(e) => setForm((f) => ({ ...f, montantRegle: e.target.value }))} /></FieldBox>
            <FieldBox label="Mode de paiement"><SelectField value={form.modePaiement} onChange={(e) => setForm((f) => ({ ...f, modePaiement: e.target.value }))}>{MODES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</SelectField></FieldBox>
            <FieldBox label="Date"><Input type="date" value={form.datePaiement} onChange={(e) => setForm((f) => ({ ...f, datePaiement: e.target.value }))} /></FieldBox>
            <FieldBox label="Référence"><Input value={form.reference} onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))} placeholder="N° virement, chèque…" /></FieldBox>
            <div className="flex justify-end gap-2 md:col-span-2">
              <Button variant="outline" size="sm" onClick={() => setPaying(false)}>Annuler</Button>
              <Button size="sm" className="bg-primary text-white" disabled={pay.isPending || !(Number(form.montantRegle) > 0)} onClick={() => pay.mutate()}>Valider le règlement</Button>
            </div>
          </div>
        )}

        <div>
          <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-gray-400">Historique des règlements</h3>
          {facture.paiements.length === 0 ? <p className="text-xs text-gray-400">Aucun règlement.</p> : (
            <ul className="divide-y divide-gray-100 text-sm">
              {facture.paiements.map((p) => <li key={p.id} className="flex items-center justify-between py-2"><span>{formatDate(p.datePaiement)} · {MODES.find(([v]) => v === p.modePaiement)?.[1] ?? p.modePaiement}{p.reference && ` · ${p.reference}`}</span><b>{formatMontant(p.montantRegle, devise)}</b></li>)}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  )
}
