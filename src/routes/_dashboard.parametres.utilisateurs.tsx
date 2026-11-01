import React, { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Copy, Plus, Users } from 'lucide-react'
import { usePermissions } from '@/application/contexts/PermissionContext'
import { useCentres, useInvalidate, useServices } from '@/application/hooks/useReferentiels'
import { api, apiGet, apiPut } from '@/lib/apiFetch'
import { formatDate } from '@/lib/format'
import { FilterField, PageLayout, SubHeaderButton } from '@/components/ui/page-components'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { Pill } from '@/components/ui/StatutBadge'
import { FieldBox, FormFooter, ListTable, matchesSearch, PaginationFooter, RowActions, SearchFilter, SelectField, usePagination } from '@/components/ui/crud'
import type { Role, Utilisateur } from '@/types'

export const Route = createFileRoute('/_dashboard/parametres/utilisateurs')({
  component: UtilisateursPage,
})

function UtilisateursPage() {
  const path = '/parametres/utilisateurs'
  const { canCreate, canEdit } = usePermissions()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<number | null>(null)
  const [edited, setEdited] = useState<Utilisateur | 'new' | null>(null)
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null)

  const { data, isLoading } = useQuery({ queryKey: ['utilisateurs'], queryFn: () => apiGet<Utilisateur[]>('/organisation/utilisateurs') })
  const { data: roles } = useQuery({ queryKey: ['roles'], queryFn: () => apiGet<Role[]>('/security/roles') })
  const filtered = (data ?? []).filter((u) => (!roleFilter || u.role?.id === roleFilter) && matchesSearch([u.nomComplet, u.email, u.service?.nom, u.role?.nom], search))
  const pagination = usePagination(filtered)

  return (
    <div className="animate-fade-in-up">
      <PageLayout
        title="Utilisateurs"
        icon={<Users className="w-4 h-4 text-primary" />}
        count={filtered.length}
        description="Comptes de l’entreprise, rôles et centres accessibles"
        action={canCreate(path) ? <SubHeaderButton onClick={() => setEdited('new')} icon={<Plus className="h-3.5 w-3.5" />}>Nouvel utilisateur</SubHeaderButton> : undefined}
        filters={
          <>
            <SearchFilter value={search} onChange={setSearch} placeholder="Nom, email, service…" />
            <FilterField label="Rôle" className="min-w-[220px]">
              <CustomSelect value={roles?.map((r) => ({ value: r.id, label: r.nom })).find((o) => o.value === roleFilter) ?? null} options={roles?.map((r) => ({ value: r.id, label: r.nom })) ?? []} onChange={(v: any) => setRoleFilter(v?.value ?? null)} placeholder="Tous les rôles" />
            </FilterField>
          </>
        }
        footer={<PaginationFooter pagination={pagination} />}
      >
        <ListTable<Utilisateur>
          loading={isLoading} rows={pagination.paged} rowKey={(u) => u.id}
          emptyIcon={<Users className="w-10 h-10" />} emptyTitle="Aucun utilisateur"
          actionWidth="90px"
          columns={[
            { header: 'Utilisateur', cell: (u) => (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-600 to-orange-400 text-white text-[11px] font-black flex items-center justify-center">{u.prenom[0]}{u.nom[0]}</div>
                <div><div className="font-extrabold text-gray-900">{u.nomComplet}</div><div className="text-[11px] text-gray-400">{u.email}</div></div>
              </div>
            ) },
            { header: 'Rôle', cell: (u) => u.role ? <Pill tone="primary">{u.role.nom}</Pill> : '—' },
            { header: 'Centres', className: 'text-xs text-gray-600', cell: (u) => (u.centres.length ? u.centres.map((c) => c.nom).join(', ') : 'Tous les centres') },
            { header: 'Service', className: 'text-xs text-gray-600', cell: (u) => u.service?.nom ?? '—' },
            { header: 'Dernière connexion', className: 'text-xs text-gray-500', cell: (u) => (u.lastLoginAt ? formatDate(u.lastLoginAt, true) : 'Jamais') },
            { header: 'Statut', cell: (u) => <Pill tone={u.isActive === false ? 'danger' : 'ok'}>{u.isActive === false ? 'Désactivé' : 'Actif'}</Pill> },
          ]}
          actions={(u) => <RowActions onEdit={canEdit(path) ? () => setEdited(u) : undefined} />}
        />
      </PageLayout>

      {edited && <UtilisateurModal utilisateur={edited === 'new' ? null : edited} roles={roles ?? []} onClose={() => setEdited(null)} onCreated={setCreated} />}
      {created && (
        <Modal isOpen onClose={() => setCreated(null)} size="sm" title="Utilisateur créé" footer={<Button onClick={() => setCreated(null)} className="bg-primary text-white">J’ai noté le mot de passe</Button>}>
          <p className="text-xs text-gray-500">Communiquez ces identifiants à l’utilisateur. Il devra changer son mot de passe à la première connexion.</p>
          <div className="mt-3 flex items-start justify-between gap-2 rounded-lg bg-slate-50 border border-slate-200 p-3 font-mono text-sm">
            <div><div>{created.email}</div><div className="font-black">{created.password}</div></div>
            <button type="button" title="Copier" className="text-gray-400 hover:text-primary" onClick={() => navigator.clipboard?.writeText(`${created.email} / ${created.password}`).then(() => toast.success('Copié'))}><Copy className="h-4 w-4" /></button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function UtilisateurModal({ utilisateur, roles, onClose, onCreated }: { utilisateur: Utilisateur | null; roles: Role[]; onClose: () => void; onCreated: (c: { email: string; password: string }) => void }) {
  const invalidate = useInvalidate()
  const { data: centres } = useCentres()
  const { data: services } = useServices()
  const [form, setForm] = useState({
    prenom: utilisateur?.prenom ?? '', nom: utilisateur?.nom ?? '', email: utilisateur?.email ?? '', telephone: utilisateur?.telephone ?? '',
    role: utilisateur?.role?.id ? String(utilisateur.role.id) : '', service: utilisateur?.service?.id ? String(utilisateur.service.id) : '',
    centres: utilisateur?.centres.map((c) => c.id) ?? [] as number[], isActive: utilisateur?.isActive ?? true, password: '',
  })
  const set = (k: 'prenom' | 'nom' | 'email' | 'telephone' | 'role' | 'service' | 'password') => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const toggleCentre = (id: number) => setForm((f) => ({ ...f, centres: f.centres.includes(id) ? f.centres.filter((c) => c !== id) : [...f.centres, id] }))

  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form, role: Number(form.role), service: form.service ? Number(form.service) : null, password: form.password || undefined }
      if (utilisateur) return apiPut(`/organisation/utilisateurs/${utilisateur.id}`, payload)
      const res = await api<{ password_provisoire: string }>('/organisation/utilisateurs', { method: 'POST', data: payload })
      onCreated({ email: form.email, password: res.password_provisoire })
      return res
    },
    onSuccess: () => { toast.success('Utilisateur enregistré.'); invalidate('utilisateurs', 'roles'); onClose() },
  })

  return (
    <Modal isOpen onClose={onClose} size="lg" title={utilisateur ? `Modifier ${utilisateur.nomComplet}` : 'Nouvel utilisateur'} footer={<FormFooter onCancel={onClose} formId="user-form" saving={save.isPending} disabled={!form.role} />}>
      <form id="user-form" onSubmit={(e) => { e.preventDefault(); save.mutate() }} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FieldBox label="Prénom" required><Input value={form.prenom} onChange={set('prenom')} required /></FieldBox>
        <FieldBox label="Nom" required><Input value={form.nom} onChange={set('nom')} required /></FieldBox>
        <FieldBox label="Email" required><Input type="email" value={form.email} onChange={set('email')} required disabled={!!utilisateur} /></FieldBox>
        <FieldBox label="Téléphone"><Input value={form.telephone} onChange={set('telephone')} /></FieldBox>
        <FieldBox label="Rôle" required hint="Les droits viennent de la matrice du rôle (Paramètres › Rôles & permissions)">
          <SelectField value={form.role} onChange={set('role')} required>
            <option value="">— Choisir un rôle —</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.nom}</option>)}
          </SelectField>
        </FieldBox>
        <FieldBox label="Service">
          <SelectField value={form.service} onChange={set('service')}>
            <option value="">— Aucun —</option>
            {services?.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
          </SelectField>
        </FieldBox>
        <FieldBox label="Centres accessibles" hint="Aucun coché = accès à tous les centres de l’entreprise" span2>
          <div className="flex flex-wrap gap-2">
            {centres?.map((c) => (
              <label key={c.id} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold ${form.centres.includes(c.id) ? 'border-primary bg-orange-50 text-primary' : 'border-gray-200 text-gray-600'}`}>
                <input type="checkbox" className="accent-[#ff4a0a]" checked={form.centres.includes(c.id)} onChange={() => toggleCentre(c.id)} />{c.nom}
              </label>
            ))}
          </div>
        </FieldBox>
        {utilisateur && (
          <>
            <FieldBox label="Nouveau mot de passe" hint="Laisser vide pour ne pas le changer"><Input type="password" value={form.password} onChange={set('password')} autoComplete="new-password" /></FieldBox>
            <label className="flex items-center gap-2 self-end pb-2 text-sm font-semibold text-gray-700"><input type="checkbox" className="h-4 w-4 accent-[#ff4a0a]" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} /> Compte actif</label>
          </>
        )}
      </form>
    </Modal>
  )
}
