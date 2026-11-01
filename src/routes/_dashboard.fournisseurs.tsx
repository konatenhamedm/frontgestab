import React, { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Mail, Phone, Plus, Truck } from 'lucide-react'
import { usePermissions } from '@/application/contexts/PermissionContext'
import { useFournisseurs, useInvalidate } from '@/application/hooks/useReferentiels'
import { apiDelete, apiPost, apiPut } from '@/lib/apiFetch'
import { PageLayout, SubHeaderButton } from '@/components/ui/page-components'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/input'
import { ConfirmDelete, DetailRows, FieldBox, FormFooter, ListTable, matchesSearch, PaginationFooter, RowActions, SearchFilter, TextareaField, usePagination } from '@/components/ui/crud'
import type { Fournisseur } from '@/types'

export const Route = createFileRoute('/_dashboard/fournisseurs')({
  component: FournisseursPage,
})

type ModalType = 'add' | 'edit' | 'delete' | 'view' | null

function FournisseursPage() {
  const path = '/fournisseurs'
  const { canCreate, canEdit, canDelete } = usePermissions()
  const invalidate = useInvalidate()
  const { data, isLoading } = useFournisseurs()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<ModalType>(null)
  const [selected, setSelected] = useState<Fournisseur | null>(null)
  const [form, setForm] = useState({ raisonSociale: '', contactNom: '', email: '', telephone: '', adresse: '' })

  const filtered = (data ?? []).filter((f) => matchesSearch(f, search))
  const pagination = usePagination(filtered)

  const open = (type: ModalType, item?: Fournisseur) => {
    setModal(type)
    setSelected(item ?? null)
    setForm({ raisonSociale: item?.raisonSociale ?? '', contactNom: item?.contactNom ?? '', email: item?.email ?? '', telephone: item?.telephone ?? '', adresse: item?.adresse ?? '' })
  }
  const close = () => { setModal(null); setSelected(null) }

  const save = useMutation({
    mutationFn: () => (modal === 'edit' && selected ? apiPut(`/achats/fournisseurs/${selected.id}`, form) : apiPost('/achats/fournisseurs', form)),
    onSuccess: () => { toast.success(modal === 'edit' ? 'Fournisseur mis à jour.' : 'Fournisseur créé.'); invalidate('fournisseurs'); close() },
  })
  const remove = useMutation({
    mutationFn: () => apiDelete(`/achats/fournisseurs/${selected!.id}`),
    onSuccess: () => { toast.success('Fournisseur supprimé.'); invalidate('fournisseurs'); close() },
  })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="animate-fade-in-up">
      <PageLayout
        title="Fournisseurs"
        icon={<Truck className="w-4 h-4 text-primary" />}
        count={filtered.length}
        description="Vos fournisseurs de fournitures et de consommables"
        action={canCreate(path) ? <SubHeaderButton onClick={() => open('add')} icon={<Plus className="h-3.5 w-3.5" />}>Nouveau fournisseur</SubHeaderButton> : undefined}
        filters={<SearchFilter value={search} onChange={setSearch} placeholder="Nom, contact, email, téléphone…" />}
        footer={<PaginationFooter pagination={pagination} />}
      >
        <ListTable<Fournisseur>
          loading={isLoading}
          rows={pagination.paged}
          rowKey={(f) => f.id}
          emptyIcon={<Truck className="w-10 h-10" />}
          emptyTitle="Aucun fournisseur enregistré"
          emptyDesc="Cliquez sur « Nouveau fournisseur » pour en créer un."
          columns={[
            { header: 'Raison sociale', className: 'font-extrabold text-gray-900', cell: (f) => (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-700 font-bold flex items-center justify-center text-xs">{f.raisonSociale.charAt(0).toUpperCase()}</div>
                <span>{f.raisonSociale}</span>
              </div>
            ) },
            { header: 'Contact', className: 'text-xs text-gray-700', cell: (f) => f.contactNom || '—' },
            { header: 'Téléphone', className: 'text-xs text-gray-700', cell: (f) => f.telephone ? <div className="flex items-center gap-1.5 font-medium"><Phone className="w-3 h-3 text-emerald-600" />{f.telephone}</div> : '—' },
            { header: 'Email', className: 'text-xs text-gray-600', cell: (f) => f.email ? <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-sky-600" />{f.email}</div> : '—' },
            { header: 'Adresse', className: 'text-xs text-gray-600 max-w-xs truncate', cell: (f) => f.adresse || '—' },
          ]}
          actions={(f) => (
            <RowActions
              onView={() => open('view', f)}
              onEdit={canEdit(path) ? () => open('edit', f) : undefined}
              onDelete={canDelete(path) ? () => open('delete', f) : undefined}
            />
          )}
        />
      </PageLayout>

      <Modal
        isOpen={modal === 'add' || modal === 'edit'} onClose={close} size="lg"
        title={modal === 'add' ? 'Nouveau fournisseur' : `Modifier ${selected?.raisonSociale ?? ''}`}
        footer={<FormFooter onCancel={close} formId="fournisseur-form" saving={save.isPending} />}
      >
        <form id="fournisseur-form" onSubmit={(e) => { e.preventDefault(); save.mutate() }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldBox label="Raison sociale" required span2><Input value={form.raisonSociale} onChange={set('raisonSociale')} placeholder="Ex : Papeterie Moderne SARL" required /></FieldBox>
            <FieldBox label="Contact référent"><Input value={form.contactNom} onChange={set('contactNom')} placeholder="Nom du commercial" /></FieldBox>
            <FieldBox label="Téléphone"><Input value={form.telephone} onChange={set('telephone')} placeholder="+225 07 00 00 00 00" /></FieldBox>
            <FieldBox label="Adresse email" span2><Input type="email" value={form.email} onChange={set('email')} placeholder="contact@fournisseur.com" /></FieldBox>
            <FieldBox label="Adresse" span2><TextareaField value={form.adresse} onChange={set('adresse')} placeholder="Ville, quartier, rue…" /></FieldBox>
          </div>
        </form>
      </Modal>

      {selected && modal === 'view' && (
        <Modal isOpen onClose={close} size="md" title={`Détails : ${selected.raisonSociale}`}>
          <DetailRows rows={[['Contact', selected.contactNom], ['Téléphone', selected.telephone], ['Email', selected.email], ['Adresse', selected.adresse]]} />
        </Modal>
      )}

      <ConfirmDelete isOpen={modal === 'delete'} onClose={close} loading={remove.isPending} onConfirm={() => remove.mutate()} message={`Êtes-vous sûr de vouloir supprimer le fournisseur ${selected?.raisonSociale} ?`} />
    </div>
  )
}
