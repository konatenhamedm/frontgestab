import React, { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Building2, Eye, Plus } from 'lucide-react'
import { useAuth } from '@/application/contexts/AuthContext'
import { useInvalidate } from '@/application/hooks/useReferentiels'
import { PLAN_LABELS } from '@/domain/constants/permissions'
import { apiGet, apiPost, apiPut } from '@/lib/apiFetch'
import { formatDate } from '@/lib/format'
import { PageLayout, SubHeaderButton } from '@/components/ui/page-components'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/input'
import { Pill } from '@/components/ui/StatutBadge'
import { FieldBox, FormFooter, IconAction, ListTable, matchesSearch, PaginationFooter, RowActions, SearchFilter, SelectField, usePagination } from '@/components/ui/crud'
import type { Entreprise, Plateforme } from '@/types'

export const Route = createFileRoute('/_dashboard/entreprises')({
  component: EntreprisesPage,
})

function EntreprisesPage() {
  const { selectEntreprise } = useAuth()
  const invalidate = useInvalidate()
  const [search, setSearch] = useState('')
  const [edited, setEdited] = useState<Entreprise | 'new' | null>(null)
  const { data, isLoading } = useQuery({ queryKey: ['entreprises'], queryFn: () => apiGet<Entreprise[]>('/organisation/entreprises') })
  const { data: plateforme } = useQuery({ queryKey: ['plateforme'], queryFn: () => apiGet<Plateforme>('/organisation/entreprises/plateforme') })
  const filtered = (data ?? []).filter((e) => matchesSearch([e.nom, e.code, e.email], search))
  const pagination = usePagination(filtered)

  const toggle = useMutation({
    mutationFn: (e: Entreprise) => apiPut(`/organisation/entreprises/${e.id}`, { isActive: !e.isActive }),
    onSuccess: () => { invalidate('entreprises', 'plateforme') },
  })

  return (
    <div className="animate-fade-in-up">
      <PageLayout
        title="Entreprises & abonnements"
        icon={<Building2 className="w-4 h-4 text-primary" />}
        count={filtered.length}
        description="Chaque entreprise dispose de son espace isolé, de ses centres et de ses rôles"
        action={<SubHeaderButton onClick={() => setEdited('new')} icon={<Plus className="h-3.5 w-3.5" />}>Nouvelle entreprise</SubHeaderButton>}
        filters={<SearchFilter value={search} onChange={setSearch} placeholder="Nom, code, email…" />}
        footer={<PaginationFooter pagination={pagination} />}
      >
        <ListTable<Entreprise>
          loading={isLoading} rows={pagination.paged} rowKey={(e) => e.id}
          emptyIcon={<Building2 className="w-10 h-10" />} emptyTitle="Aucune entreprise"
          actionWidth="130px"
          columns={[
            { header: 'Entreprise', cell: (e) => <div><div className="font-extrabold text-gray-900">{e.nom}</div><div className="text-[11px] text-gray-400 font-mono">{e.code} · {e.email ?? '—'}</div></div> },
            { header: 'Plan', cell: (e) => <Pill tone="primary">{PLAN_LABELS[e.plan] ?? e.plan}</Pill> },
            { header: 'Centres', className: 'tabular-nums text-xs', cell: (e) => `${e.nbCentres} / ${e.maxCentres}` },
            { header: 'Utilisateurs', className: 'tabular-nums text-xs', cell: (e) => `${e.nbUtilisateurs} / ${e.maxUtilisateurs}` },
            { header: 'Expiration', className: 'text-xs', cell: (e) => <span>{e.dateExpiration ? formatDate(e.dateExpiration) : 'Sans limite'} {e.expire && <Pill tone="danger">expiré</Pill>}</span> },
            { header: 'Statut', cell: (e) => <Pill tone={e.isActive ? 'ok' : 'danger'}>{e.isActive ? 'Actif' : 'Suspendu'}</Pill> },
          ]}
          actions={(e) => (
            <RowActions onEdit={() => setEdited(e)}>
              <IconAction tone="sky" title="Consulter l’espace de cette entreprise" onClick={() => selectEntreprise(e.id).then(() => toast.success(`Espace « ${e.nom} » ouvert`))}><Eye size={14} /></IconAction>
              <button type="button" className="rounded-lg border border-gray-200 px-2 py-1 text-[11px] font-bold text-gray-600 hover:bg-gray-50" onClick={() => toggle.mutate(e)}>{e.isActive ? 'Suspendre' : 'Réactiver'}</button>
            </RowActions>
          )}
        />
      </PageLayout>
      {edited && <EntrepriseModal entreprise={edited === 'new' ? null : edited} plans={plateforme?.plans} onClose={() => setEdited(null)} />}
    </div>
  )
}

function EntrepriseModal({ entreprise, plans, onClose }: { entreprise: Entreprise | null; plans?: Plateforme['plans']; onClose: () => void }) {
  const invalidate = useInvalidate()
  const [form, setForm] = useState({
    entreprise: entreprise?.nom ?? '', centre: 'Centre principal', prenom: '', nom: '', email: entreprise?.email ?? '', password: '',
    plan: entreprise?.plan ?? 'ESSAI', maxCentres: String(entreprise?.maxCentres ?? 3), maxUtilisateurs: String(entreprise?.maxUtilisateurs ?? 20), dateExpiration: entreprise?.dateExpiration ?? '',
  })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const choosePlan = (plan: string) => setForm((f) => ({ ...f, plan, maxCentres: String(plans?.[plan]?.maxCentres ?? f.maxCentres), maxUtilisateurs: String(plans?.[plan]?.maxUtilisateurs ?? f.maxUtilisateurs) }))

  const save = useMutation({
    mutationFn: () => entreprise
      ? apiPut(`/organisation/entreprises/${entreprise.id}`, { nom: form.entreprise, email: form.email, plan: form.plan, maxCentres: Number(form.maxCentres), maxUtilisateurs: Number(form.maxUtilisateurs), dateExpiration: form.dateExpiration || null })
      : apiPost('/organisation/entreprises', form),
    onSuccess: () => { toast.success('Entreprise enregistrée.'); invalidate('entreprises', 'plateforme'); onClose() },
  })

  return (
    <Modal isOpen onClose={onClose} size="lg" title={entreprise ? `Modifier ${entreprise.nom}` : 'Nouvelle entreprise'} description={entreprise ? undefined : 'Un administrateur et le rôle Administrateur sont créés en même temps.'} footer={<FormFooter onCancel={onClose} onSave={() => save.mutate()} saving={save.isPending} disabled={!form.entreprise || !form.email || (!entreprise && form.password.length < 8)} />}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FieldBox label="Entreprise" required span2><Input value={form.entreprise} onChange={set('entreprise')} /></FieldBox>
        <FieldBox label="Plan">
          <SelectField value={form.plan} onChange={(e) => choosePlan(e.target.value)}>
            {Object.entries(plans ?? { ESSAI: { label: 'Essai' } }).map(([code, p]) => <option key={code} value={code}>{p.label}</option>)}
          </SelectField>
        </FieldBox>
        <FieldBox label="Date d’expiration" hint="Vide = sans limite"><Input type="date" value={form.dateExpiration} onChange={set('dateExpiration')} /></FieldBox>
        <FieldBox label="Centres max."><Input type="number" min={1} value={form.maxCentres} onChange={set('maxCentres')} /></FieldBox>
        <FieldBox label="Utilisateurs max."><Input type="number" min={1} value={form.maxUtilisateurs} onChange={set('maxUtilisateurs')} /></FieldBox>
        {!entreprise ? (
          <>
            <FieldBox label="Premier centre" span2><Input value={form.centre} onChange={set('centre')} /></FieldBox>
            <FieldBox label="Prénom administrateur" required><Input value={form.prenom} onChange={set('prenom')} /></FieldBox>
            <FieldBox label="Nom administrateur" required><Input value={form.nom} onChange={set('nom')} /></FieldBox>
            <FieldBox label="Email administrateur" required><Input type="email" value={form.email} onChange={set('email')} /></FieldBox>
            <FieldBox label="Mot de passe" hint="8 caractères minimum" required><Input type="password" value={form.password} onChange={set('password')} /></FieldBox>
          </>
        ) : (
          <FieldBox label="Email de l’entreprise" span2><Input type="email" value={form.email} onChange={set('email')} /></FieldBox>
        )}
      </div>
    </Modal>
  )
}
