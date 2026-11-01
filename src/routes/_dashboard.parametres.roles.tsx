import React, { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Copy, Lock, Plus, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/application/contexts/AuthContext'
import { usePermissions } from '@/application/contexts/PermissionContext'
import { useInvalidate } from '@/application/hooks/useReferentiels'
import { LETTER_LABELS, LETTER_ORDER } from '@/domain/constants/permissions'
import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/apiFetch'
import { PageLayout, SubHeaderButton } from '@/components/ui/page-components'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/input'
import { Pill } from '@/components/ui/StatutBadge'
import { ConfirmDelete, FieldBox, FormFooter, IconAction, ListTable, RowActions, TextareaField } from '@/components/ui/crud'
import type { Catalogue, Role } from '@/types'

export const Route = createFileRoute('/_dashboard/parametres/roles')({
  component: RolesPage,
})

function RolesPage() {
  const path = '/parametres/roles'
  const { canCreate, canEdit, canDelete } = usePermissions()
  const invalidate = useInvalidate()
  const { data: roles, isLoading } = useQuery({ queryKey: ['roles'], queryFn: () => apiGet<Role[]>('/security/roles') })
  const [edited, setEdited] = useState<Role | 'new' | null>(null)
  const [toDelete, setToDelete] = useState<Role | null>(null)

  const duplicate = useMutation({ mutationFn: (r: Role) => apiPost(`/security/roles/${r.id}/dupliquer`), onSuccess: () => { toast.success('Rôle dupliqué.'); invalidate('roles') } })
  const remove = useMutation({ mutationFn: () => apiDelete(`/security/roles/${toDelete!.id}`), onSuccess: () => { toast.success('Rôle supprimé.'); invalidate('roles'); setToDelete(null) } })

  const count = (r: Role) => Object.keys(r.permissions).length

  return (
    <div className="animate-fade-in-up">
      <PageLayout
        title="Rôles & permissions"
        icon={<ShieldCheck className="w-4 h-4 text-primary" />}
        count={roles?.length}
        description="Définissez, pour votre entreprise, ce que chaque rôle peut voir et faire"
        action={canCreate(path) ? <SubHeaderButton onClick={() => setEdited('new')} icon={<Plus className="h-3.5 w-3.5" />}>Nouveau rôle</SubHeaderButton> : undefined}
      >
        <ListTable<Role>
          loading={isLoading} rows={roles ?? []} rowKey={(r) => r.id}
          emptyIcon={<ShieldCheck className="w-10 h-10" />} emptyTitle="Aucun rôle"
          actionWidth="130px"
          columns={[
            { header: 'Rôle', cell: (r) => (
              <div className="flex items-center gap-2">
                {r.systeme && <Lock className="h-3.5 w-3.5 text-amber-500" />}
                <div><div className="font-extrabold text-gray-900">{r.nom}</div><div className="text-[11px] text-gray-400 max-w-[280px] truncate" title={r.description ?? undefined}>{r.description}</div></div>
              </div>
            ) },
            { header: 'Modules accessibles', className: 'text-xs', cell: (r) => r.systeme ? <Pill tone="warn">Accès complet</Pill> : `${count(r)} module(s) · ${r.actions.length} action(s)` },
            { header: 'Utilisateurs', className: 'tabular-nums', cell: (r) => r.utilisateurs },
          ]}
          actions={(r) => (
            <RowActions onView={!canEdit(path) || r.systeme ? () => setEdited(r) : undefined} onEdit={canEdit(path) && !r.systeme ? () => setEdited(r) : undefined} onDelete={canDelete(path) && !r.systeme ? () => setToDelete(r) : undefined}>
              {canCreate(path) && <IconAction tone="slate" title="Dupliquer" onClick={() => duplicate.mutate(r)}><Copy size={14} /></IconAction>}
            </RowActions>
          )}
        />
      </PageLayout>

      {edited && <RoleEditor role={edited === 'new' ? null : edited} onClose={() => setEdited(null)} />}
      <ConfirmDelete isOpen={!!toDelete} onClose={() => setToDelete(null)} loading={remove.isPending} onConfirm={() => remove.mutate()} message={`Supprimer le rôle « ${toDelete?.nom} » ?`} />
    </div>
  )
}

/** Éditeur de rôle : matrice module × (lire / créer / modifier / supprimer) + actions spéciales. */
function RoleEditor({ role, onClose }: { role: Role | null; onClose: () => void }) {
  const invalidate = useInvalidate()
  const { refreshSession } = useAuth()
  const { canEdit, canCreate } = usePermissions()
  const { data: catalogue } = useQuery({ queryKey: ['catalogue'], queryFn: () => apiGet<Catalogue>('/security/catalogue'), staleTime: Infinity })
  const locked = role?.systeme === true || (role ? !canEdit('/parametres/roles') : !canCreate('/parametres/roles'))

  const [nom, setNom] = useState(role?.nom ?? '')
  const [description, setDescription] = useState(role?.description ?? '')
  const [permissions, setPermissions] = useState<Record<string, string>>(role?.permissions ?? {})
  const [actions, setActions] = useState<string[]>(role?.actions ?? [])

  useEffect(() => { if (role) { setPermissions(role.permissions); setActions(role.actions) } }, [role])

  const allModules = useMemo(() => catalogue?.groupes.flatMap((g) => g.modules) ?? [], [catalogue])
  const has = (module: string, letter: string) => role?.systeme || (permissions[module] ?? '').includes(letter)

  const toggle = (module: string, letter: string) => {
    if (locked) return
    setPermissions((prev) => {
      const set = new Set((prev[module] ?? '').split('').filter(Boolean))
      if (set.has(letter)) set.delete(letter); else set.add(letter)
      // R est requis dès qu'une autre lettre est cochée ; décocher R retire tout
      if (letter === 'R' && !set.has('R')) set.clear()
      if (letter !== 'R' && set.size > 0) set.add('R')
      const next = { ...prev }
      if (set.size === 0) delete next[module]
      else next[module] = LETTER_ORDER.filter((l) => set.has(l)).join('')
      return next
    })
  }
  const toggleAll = (module: string, letters: string[], on: boolean) => {
    if (locked) return
    setPermissions((prev) => {
      const next = { ...prev }
      if (on) next[module] = LETTER_ORDER.filter((l) => letters.includes(l)).join('')
      else delete next[module]
      return next
    })
  }
  const toggleAction = (code: string) => { if (!locked) setActions((a) => (a.includes(code) ? a.filter((x) => x !== code) : [...a, code])) }

  const save = useMutation({
    mutationFn: () => {
      const payload = { nom, description, permissions, actions }
      return role ? apiPut(`/security/roles/${role.id}`, payload) : apiPost('/security/roles', payload)
    },
    onSuccess: async () => { toast.success('Rôle enregistré.'); invalidate('roles'); await refreshSession(); onClose() },
  })

  return (
    <Modal
      isOpen onClose={onClose} size="4xl" title={role ? (locked ? `Rôle : ${role.nom}` : `Modifier le rôle ${role.nom}`) : 'Nouveau rôle'}
      description={role?.systeme ? 'Le rôle Administrateur a toujours accès à tout : il n’est pas modifiable.' : 'Cochez ce que le rôle peut faire dans chaque module. « Lire » est requis pour accéder au module.'}
      footer={locked ? undefined : <FormFooter onCancel={onClose} onSave={() => save.mutate()} saving={save.isPending} disabled={!nom.trim()} />}
    >
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <FieldBox label="Nom du rôle" required><Input value={nom} onChange={(e) => setNom(e.target.value)} disabled={locked} placeholder="Ex : Responsable logistique" /></FieldBox>
          <FieldBox label="Description"><Input value={description} onChange={(e) => setDescription(e.target.value)} disabled={locked} placeholder="À quoi sert ce rôle ?" /></FieldBox>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-[#1f2a37] text-[10px] font-black uppercase tracking-widest text-white/80">
              <tr>
                <th className="px-4 py-2.5 text-left">Module</th>
                {LETTER_ORDER.map((l) => <th key={l} className="px-3 py-2.5 text-center">{LETTER_LABELS[l]}</th>)}
                <th className="px-3 py-2.5 text-center">Tout</th>
              </tr>
            </thead>
            <tbody>
              {catalogue?.groupes.map((g) => (
                <React.Fragment key={g.code}>
                  <tr className="bg-orange-50/60"><td colSpan={LETTER_ORDER.length + 2} className="px-4 py-1.5 text-[10px] font-black uppercase tracking-wider text-primary">{g.titre}</td></tr>
                  {g.modules.map((m) => {
                    const everything = m.letters.every((l) => has(m.code, l))
                    return (
                      <React.Fragment key={m.code}>
                        <tr className="border-b border-gray-100">
                          <td className="px-4 py-2 font-semibold text-gray-800">{m.titre}</td>
                          {LETTER_ORDER.map((l) => (
                            <td key={l} className="px-3 py-2 text-center">
                              {m.letters.includes(l)
                                ? <input type="checkbox" className="h-4 w-4 accent-[#ff4a0a] disabled:opacity-50" checked={!!has(m.code, l)} disabled={locked} onChange={() => toggle(m.code, l)} aria-label={`${m.titre} : ${LETTER_LABELS[l]}`} />
                                : <span className="text-gray-300">—</span>}
                            </td>
                          ))}
                          <td className="px-3 py-2 text-center"><input type="checkbox" className="h-4 w-4 accent-[#ff4a0a] disabled:opacity-50" checked={everything} disabled={locked} onChange={(e) => toggleAll(m.code, m.letters, e.target.checked)} aria-label={`${m.titre} : tout`} /></td>
                        </tr>
                        {m.actions.map((a) => (
                          <tr key={a.code} className="border-b border-gray-50 bg-slate-50/50">
                            <td colSpan={LETTER_ORDER.length + 2} className="px-4 py-1.5 pl-10">
                              <label className="flex items-center gap-2 text-xs text-gray-600">
                                <input type="checkbox" className="h-3.5 w-3.5 accent-[#ff4a0a] disabled:opacity-50" checked={!!role?.systeme || actions.includes(a.code)} disabled={locked} onChange={() => toggleAction(a.code)} />
                                {a.libelle}
                              </label>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    )
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {allModules.length > 0 && <p className="text-[11px] text-gray-400">Les droits s’appliquent à tous les centres auxquels l’utilisateur a accès. Les modifications prennent effet à la prochaine requête de chaque utilisateur.</p>}
      </div>
    </Modal>
  )
}
