import React, { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Boxes, History, Plus, Scale, Tags, Trash2 } from 'lucide-react'
import { usePermissions } from '@/application/contexts/PermissionContext'
import { useArticles, useCategories, useInvalidate } from '@/application/hooks/useReferentiels'
import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/apiFetch'
import { formatDate, formatMontant, formatNombre } from '@/lib/format'
import { FilterField, PageLayout, SubHeaderButton } from '@/components/ui/page-components'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { Pill, StatutBadge, stockStatut } from '@/components/ui/StatutBadge'
import { ConfirmDelete, DetailRows, FieldBox, FormFooter, IconAction, ListTable, PaginationFooter, RowActions, SearchFilter, SelectField, TextareaField, usePagination } from '@/components/ui/crud'
import type { Article, Categorie, Mouvement } from '@/types'

export const Route = createFileRoute('/_dashboard/articles')({
  component: ArticlesPage,
})

export const MOUVEMENT_LABELS: Record<Mouvement['type'], { label: string; tone: 'ok' | 'danger' | 'info' }> = {
  ENTREE_ACHAT: { label: 'Entrée (achat)', tone: 'ok' },
  SORTIE_DEMANDE: { label: 'Sortie (demande)', tone: 'danger' },
  AJUSTEMENT: { label: 'Ajustement', tone: 'info' },
}

type ModalType = 'add' | 'edit' | 'delete' | 'view' | 'ajust' | 'history' | 'categories' | null

function ArticlesPage() {
  const path = '/articles'
  const { canCreate, canEdit, canDelete, hasAction } = usePermissions()
  const invalidate = useInvalidate()
  const [search, setSearch] = useState('')
  const [statut, setStatut] = useState('')
  const [categorie, setCategorie] = useState<number | null>(null)
  const [modal, setModal] = useState<ModalType>(null)
  const [selected, setSelected] = useState<Article | null>(null)

  const { data, isLoading } = useArticles({ search: search || undefined, statut: statut || undefined, categorie: categorie ?? undefined })
  const { data: categories } = useCategories()
  const pagination = usePagination(data)

  const open = (type: ModalType, item?: Article) => { setModal(type); setSelected(item ?? null) }
  const close = () => { setModal(null); setSelected(null) }

  const remove = useMutation({
    mutationFn: () => apiDelete(`/stock/articles/${selected!.id}`),
    onSuccess: () => { toast.success('Article supprimé.'); invalidate('articles', 'dashboard'); close() },
  })

  return (
    <div className="animate-fade-in-up">
      <PageLayout
        title="Articles"
        icon={<Boxes className="w-4 h-4 text-primary" />}
        count={data?.length}
        description="Référentiel des fournitures et consommables du centre"
        action={
          <>
            {canEdit(path) && <SubHeaderButton variant="secondary" onClick={() => open('categories')} icon={<Tags className="h-3.5 w-3.5" />}>Catégories</SubHeaderButton>}
            {canCreate(path) && <SubHeaderButton onClick={() => open('add')} icon={<Plus className="h-3.5 w-3.5" />}>Nouvel article</SubHeaderButton>}
          </>
        }
        filters={
          <>
            <SearchFilter value={search} onChange={setSearch} placeholder="Désignation ou code article…" />
            <FilterField label="Catégorie" className="min-w-[200px]">
              <CustomSelect value={categories?.map((c) => ({ value: c.id, label: c.nom })).find((o) => o.value === categorie) ?? null} options={categories?.map((c) => ({ value: c.id, label: c.nom })) ?? []} onChange={(v: any) => setCategorie(v?.value ?? null)} placeholder="Toutes" />
            </FilterField>
            <FilterField label="Statut du stock" className="min-w-[180px]">
              <CustomSelect
                value={[{ value: 'ok', label: 'En stock' }, { value: 'alerte', label: 'Seuil d’alerte' }, { value: 'rupture', label: 'Rupture' }].find((o) => o.value === statut) ?? null}
                options={[{ value: 'ok', label: 'En stock' }, { value: 'alerte', label: 'Seuil d’alerte' }, { value: 'rupture', label: 'Rupture' }]}
                onChange={(v: any) => setStatut(v?.value ?? '')} placeholder="Tous"
              />
            </FilterField>
          </>
        }
        footer={<PaginationFooter pagination={pagination} />}
      >
        <ListTable<Article>
          loading={isLoading}
          rows={pagination.paged}
          rowKey={(a) => a.id}
          emptyIcon={<Boxes className="w-10 h-10" />}
          emptyTitle="Aucun article"
          emptyDesc="Créez votre premier article pour démarrer."
          actionWidth="190px"
          columns={[
            { header: 'Désignation', cell: (a) => <div><div className="font-extrabold text-gray-900">{a.designation}</div><div className="text-[11px] text-gray-400 font-mono">{a.codeSku}{a.categorie && ` · ${a.categorie.nom}`}</div></div> },
            { header: 'Unité', className: 'text-xs text-gray-600', cell: (a) => a.unite },
            { header: 'Stock', cell: (a) => <span className="font-black tabular-nums">{formatNombre(a.quantiteStock)}</span> },
            { header: 'Seuil / cible', className: 'text-xs text-gray-600 tabular-nums', cell: (a) => `${a.seuilAlerteMin} / ${a.seuilReapproCible}` },
            { header: 'Prix moyen HT', className: 'text-xs', cell: (a) => formatMontant(a.prixMoyenHt) },
            { header: 'Statut', cell: (a) => <StatutBadge statut={stockStatut(a.quantiteStock, a.seuilAlerteMin)} /> },
          ]}
          actions={(a) => (
            <RowActions
              onView={() => open('view', a)}
              onEdit={canEdit(path) ? () => open('edit', a) : undefined}
              onDelete={canDelete(path) ? () => open('delete', a) : undefined}
            >
              <IconAction tone="slate" title="Historique des mouvements" onClick={() => open('history', a)}><History size={14} /></IconAction>
              {hasAction('stock.ajuster') && <IconAction tone="orange" title="Ajuster le stock (inventaire)" onClick={() => open('ajust', a)}><Scale size={14} /></IconAction>}
            </RowActions>
          )}
        />
      </PageLayout>

      {(modal === 'add' || modal === 'edit') && <ArticleForm article={modal === 'edit' ? selected : null} categories={categories ?? []} onClose={close} />}
      {modal === 'ajust' && selected && <AjustementModal article={selected} onClose={close} />}
      {modal === 'history' && selected && <MouvementsModal article={selected} onClose={close} />}
      {modal === 'categories' && <CategoriesModal onClose={close} />}
      {modal === 'view' && selected && (
        <Modal isOpen onClose={close} size="md" title={`Détails : ${selected.designation}`} footer={<Button onClick={close}>Fermer</Button>}>
          <DetailRows rows={[
            ['Code article', <span className="font-mono font-bold">{selected.codeSku}</span>], ['Catégorie', selected.categorie?.nom], ['Unité', selected.unite],
            ['Stock actuel', <b>{selected.quantiteStock}</b>], ['Seuil d’alerte', selected.seuilAlerteMin], ['Seuil de réappro. cible', selected.seuilReapproCible],
            ['Prix moyen HT', formatMontant(selected.prixMoyenHt)], ['Description', selected.description],
          ]} />
        </Modal>
      )}
      <ConfirmDelete isOpen={modal === 'delete'} onClose={close} loading={remove.isPending} onConfirm={() => remove.mutate()} message={`Êtes-vous sûr de vouloir supprimer l’article « ${selected?.designation} » ?`} />
    </div>
  )
}

function ArticleForm({ article, categories, onClose }: { article: Article | null; categories: Categorie[]; onClose: () => void }) {
  const invalidate = useInvalidate()
  const [form, setForm] = useState({
    codeSku: article?.codeSku ?? '', designation: article?.designation ?? '', unite: article?.unite ?? 'Unité',
    categorie: article?.categorie?.id ? String(article.categorie.id) : '', quantiteStock: '0',
    seuilAlerteMin: String(article?.seuilAlerteMin ?? 0), seuilReapproCible: String(article?.seuilReapproCible ?? 0),
    prixMoyenHt: article?.prixMoyenHt ?? '0', description: article?.description ?? '',
  })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const save = useMutation({
    mutationFn: () => {
      const payload = { ...form, categorie: form.categorie ? Number(form.categorie) : null, quantiteStock: Number(form.quantiteStock), seuilAlerteMin: Number(form.seuilAlerteMin), seuilReapproCible: Number(form.seuilReapproCible) }
      return article ? apiPut(`/stock/articles/${article.id}`, payload) : apiPost('/stock/articles', payload)
    },
    onSuccess: () => { toast.success(article ? 'Article modifié.' : 'Article créé.'); invalidate('articles', 'dashboard'); onClose() },
  })

  return (
    <Modal isOpen onClose={onClose} size="lg" title={article ? `Modifier ${article.designation}` : 'Nouvel article'} footer={<FormFooter onCancel={onClose} formId="article-form" saving={save.isPending} />}>
      <form id="article-form" onSubmit={(e) => { e.preventDefault(); save.mutate() }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldBox label="Code article (SKU)" required><Input value={form.codeSku} onChange={set('codeSku')} required /></FieldBox>
        <FieldBox label="Désignation" required><Input value={form.designation} onChange={set('designation')} required /></FieldBox>
        <FieldBox label="Catégorie">
          <SelectField value={form.categorie} onChange={set('categorie')}>
            <option value="">— Aucune —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </SelectField>
        </FieldBox>
        <FieldBox label="Unité" hint="Rame, cartouche, boîte…"><Input value={form.unite} onChange={set('unite')} /></FieldBox>
        {!article && <FieldBox label="Stock initial"><Input type="number" min={0} value={form.quantiteStock} onChange={set('quantiteStock')} /></FieldBox>}
        <FieldBox label="Prix moyen HT"><Input type="number" min={0} step="0.01" value={form.prixMoyenHt} onChange={set('prixMoyenHt')} /></FieldBox>
        <FieldBox label="Seuil d’alerte" hint="Alerte dès que stock ≤ seuil"><Input type="number" min={0} value={form.seuilAlerteMin} onChange={set('seuilAlerteMin')} /></FieldBox>
        <FieldBox label="Seuil de réapprovisionnement cible" hint="Besoin = cible − stock actuel"><Input type="number" min={0} value={form.seuilReapproCible} onChange={set('seuilReapproCible')} /></FieldBox>
        <FieldBox label="Description" span2><TextareaField value={form.description} onChange={set('description')} /></FieldBox>
      </form>
    </Modal>
  )
}

function AjustementModal({ article, onClose }: { article: Article; onClose: () => void }) {
  const invalidate = useInvalidate()
  const [quantite, setQuantite] = useState(String(article.quantiteStock))
  const [commentaire, setCommentaire] = useState('')
  const delta = (Number(quantite) || 0) - article.quantiteStock

  const save = useMutation({
    mutationFn: () => apiPost(`/stock/articles/${article.id}/ajustement`, { quantiteComptee: Number(quantite), commentaire }),
    onSuccess: () => { toast.success('Stock ajusté.'); invalidate('articles', 'dashboard', 'mouvements'); onClose() },
  })

  return (
    <Modal isOpen onClose={onClose} size="sm" title="Ajustement d’inventaire" description={`${article.designation} — stock actuel : ${article.quantiteStock} ${article.unite}`}
      footer={<FormFooter onCancel={onClose} onSave={() => save.mutate()} saving={save.isPending} saveLabel="Ajuster" disabled={delta === 0} />}
    >
      <div className="space-y-4">
        <FieldBox label="Quantité comptée" required><Input type="number" min={0} value={quantite} onChange={(e) => setQuantite(e.target.value)} autoFocus /></FieldBox>
        <FieldBox label="Motif / commentaire"><TextareaField value={commentaire} onChange={(e) => setCommentaire(e.target.value)} placeholder="Inventaire du mois, casse, perte…" /></FieldBox>
        <p className="text-xs text-gray-400">Un mouvement « Ajustement » de <b>{delta >= 0 ? '+' : ''}{delta}</b> sera tracé.</p>
      </div>
    </Modal>
  )
}

function MouvementsModal({ article, onClose }: { article: Article; onClose: () => void }) {
  const { data, isLoading } = useQuery({ queryKey: ['mouvements', article.id], queryFn: () => apiGet<Mouvement[]>(`/stock/articles/${article.id}/mouvements`) })
  return (
    <Modal isOpen onClose={onClose} size="lg" title="Historique des mouvements" description={`${article.designation} (${article.codeSku})`}>
      <ListTable<Mouvement>
        loading={isLoading} rows={data ?? []} rowKey={(m) => m.id} emptyTitle="Aucun mouvement enregistré"
        columns={[
          { header: 'Date', className: 'text-xs', cell: (m) => formatDate(m.dateMouvement, true) },
          { header: 'Type', cell: (m) => <Pill tone={MOUVEMENT_LABELS[m.type].tone}>{MOUVEMENT_LABELS[m.type].label}</Pill> },
          { header: 'Quantité', cell: (m) => <b className={m.quantite > 0 ? 'text-emerald-600' : 'text-rose-600'}>{m.quantite > 0 ? '+' : ''}{m.quantite}</b> },
          { header: 'Stock après', cell: (m) => m.stockApres },
          { header: 'Référence', className: 'text-xs font-mono', cell: (m) => m.referenceDocument ?? '—' },
        ]}
      />
    </Modal>
  )
}

function CategoriesModal({ onClose }: { onClose: () => void }) {
  const invalidate = useInvalidate()
  const { data: categories } = useCategories()
  const [nom, setNom] = useState('')
  const add = useMutation({ mutationFn: () => apiPost('/stock/categories', { nom }), onSuccess: () => { setNom(''); invalidate('categories') } })
  const remove = useMutation({ mutationFn: (c: Categorie) => apiDelete(`/stock/categories/${c.id}`), onSuccess: () => invalidate('categories') })

  return (
    <Modal isOpen onClose={onClose} size="sm" title="Catégories d’articles">
      <form onSubmit={(e) => { e.preventDefault(); if (nom.trim()) add.mutate() }} className="mb-4 flex gap-2">
        <Input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nouvelle catégorie" aria-label="Nom de la catégorie" />
        <Button type="submit" disabled={add.isPending} className="bg-primary text-white"><Plus className="h-4 w-4" /></Button>
      </form>
      <ul className="divide-y divide-gray-100">
        {categories?.map((c) => (
          <li key={c.id} className="flex items-center justify-between py-2 text-sm">
            {c.nom}
            <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100" onClick={() => remove.mutate(c)} aria-label={`Supprimer ${c.nom}`}><Trash2 size={14} /></button>
          </li>
        ))}
        {categories?.length === 0 && <li className="py-4 text-center text-sm text-gray-400">Aucune catégorie.</li>}
      </ul>
    </Modal>
  )
}
