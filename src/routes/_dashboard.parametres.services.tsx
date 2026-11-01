import React, { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Network, Plus } from 'lucide-react'
import { usePermissions } from '@/application/contexts/PermissionContext'
import { useServices as useList, useInvalidate } from '@/application/hooks/useReferentiels'
import { apiDelete, apiPost, apiPut } from '@/lib/apiFetch'
import { PageLayout, SubHeaderButton } from '@/components/ui/page-components'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/input'
import { ConfirmDelete, FieldBox, FormFooter, ListTable, matchesSearch, PaginationFooter, RowActions, SearchFilter, usePagination } from '@/components/ui/crud'
import type { Ref } from '@/types'

export const Route = createFileRoute('/_dashboard/parametres/services')({
  component: Page,
})

function Page() {
  const path = '/parametres/services'
  const { canCreate, canEdit, canDelete } = usePermissions()
  const invalidate = useInvalidate()
  const { data, isLoading } = useList()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null)
  const [selected, setSelected] = useState<Ref | null>(null)
  const [form, setForm] = useState({ nom: '', code: '' })

  const filtered = (data ?? []).filter((r) => matchesSearch(r, search))
  const pagination = usePagination(filtered)
  const open = (type: 'add' | 'edit' | 'delete', item?: Ref) => { setModal(type); setSelected(item ?? null); setForm({ nom: item?.nom ?? '', code: item?.code ?? '' }) }
  const close = () => { setModal(null); setSelected(null) }
  const refresh = async () => { invalidate('services', 'utilisateurs') }

  const save = useMutation({
    mutationFn: () => (modal === 'edit' && selected ? apiPut(`/organisation/services/${selected.id}`, form) : apiPost('/organisation/services', form)),
    onSuccess: async () => { toast.success('Enregistré.'); await refresh(); close() },
  })
  const remove = useMutation({ mutationFn: () => apiDelete(`/organisation/services/${selected!.id}`), onSuccess: async () => { toast.success('Supprimé.'); await refresh(); close() } })

  return (
    <div className="animate-fade-in-up">
      <PageLayout
        title="Services"
        icon={<Network className="w-4 h-4 text-primary" />}
        count={filtered.length}
        description="Services ou départements demandeurs de fournitures"
        action={canCreate(path) ? <SubHeaderButton onClick={() => open('add')} icon={<Plus className="h-3.5 w-3.5" />}>Nouveau service</SubHeaderButton> : undefined}
        filters={<SearchFilter value={search} onChange={setSearch} />}
        footer={<PaginationFooter pagination={pagination} />}
      >
        <ListTable<Ref>
          loading={isLoading} rows={pagination.paged} rowKey={(r) => r.id}
          emptyIcon={<Network className="w-10 h-10" />} emptyTitle="Aucun service"
          columns={[
            { header: 'Nom', className: 'font-extrabold text-gray-900', cell: (r) => r.nom },
            { header: 'Code', className: 'text-xs font-mono text-gray-600', cell: (r) => r.code ?? '—' },
          ]}
          actions={(r) => <RowActions onEdit={canEdit(path) ? () => open('edit', r) : undefined} onDelete={canDelete(path) ? () => open('delete', r) : undefined} />}
          actionWidth="100px"
        />
      </PageLayout>

      <Modal isOpen={modal === 'add' || modal === 'edit'} onClose={close} size="sm" title={modal === 'add' ? 'Nouveau service' : 'Modifier le service'} footer={<FormFooter onCancel={close} formId="ref-form" saving={save.isPending} />}>
        <form id="ref-form" onSubmit={(e) => { e.preventDefault(); save.mutate() }} className="space-y-4">
          <FieldBox label="Nom" required><Input value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))} required autoFocus /></FieldBox>
          <FieldBox label="Code"><Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} /></FieldBox>
        </form>
      </Modal>
      <ConfirmDelete isOpen={modal === 'delete'} onClose={close} loading={remove.isPending} onConfirm={() => remove.mutate()} message={`Supprimer « ${selected?.nom} » ?`} />
    </div>
  )
}
