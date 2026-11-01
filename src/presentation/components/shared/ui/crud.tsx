/**
 * Briques communes des pages de liste, reprises du motif de front-web
 * (PageLayout + Table + TableHeaderCustom + actions colorées + Pagination + Modal).
 */
import React, { useMemo, useState } from 'react'
import { Eye, Edit, Trash2, Search, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Table, TableBody, TableCell, TableRow } from './table'
import { TableHeaderCustom } from './TableHeaderCustom'
import { Pagination } from './pagination'
import { Modal } from './Modal'
import { Button } from './button'
import { Input } from './input'
import { FilterField } from './page-components'

// ── Actions de ligne (voir / modifier / supprimer) : mêmes boutons colorés que front-web ──
const ICON_BTN = 'inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-all hover:scale-105'

export function RowActions({ onView, onEdit, onDelete, children }: { onView?: () => void; onEdit?: () => void; onDelete?: () => void; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {children}
      {onView && <button type="button" className={cn(ICON_BTN, 'bg-sky-50 text-sky-600 hover:bg-sky-100 border-sky-100')} onClick={(e) => { e.stopPropagation(); onView() }} title="Voir détails"><Eye size={14} /></button>}
      {onEdit && <button type="button" className={cn(ICON_BTN, 'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-100')} onClick={(e) => { e.stopPropagation(); onEdit() }} title="Modifier"><Edit size={14} /></button>}
      {onDelete && <button type="button" className={cn(ICON_BTN, 'bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-100')} onClick={(e) => { e.stopPropagation(); onDelete() }} title="Supprimer"><Trash2 size={14} /></button>}
    </div>
  )
}

/** Bouton d'action personnalisé de même style (ex. valider, livrer, payer). */
export function IconAction({ tone = 'emerald', title, onClick, children }: { tone?: 'emerald' | 'sky' | 'amber' | 'rose' | 'orange' | 'slate'; title: string; onClick: () => void; children: React.ReactNode }) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-100',
    sky: 'bg-sky-50 text-sky-600 hover:bg-sky-100 border-sky-100',
    amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-100',
    orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-100',
    slate: 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200',
  }
  return <button type="button" className={cn(ICON_BTN, tones[tone])} onClick={(e) => { e.stopPropagation(); onClick() }} title={title}>{children}</button>
}

// ── Pagination côté client ──
export function usePagination<T>(items: T[] | undefined, initialPerPage = 50) {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(initialPerPage)
  const total = items?.length ?? 0
  const lastPage = Math.max(1, Math.ceil(total / perPage))
  const current = Math.min(page, lastPage)
  const paged = useMemo(() => (items ?? []).slice((current - 1) * perPage, current * perPage), [items, current, perPage])
  return { page: current, setPage, perPage, setPerPage, total, paged }
}

export function PaginationFooter({ pagination }: { pagination: ReturnType<typeof usePagination<any>> }) {
  if (pagination.total === 0) return null
  return (
    <div className="flex justify-end">
      <Pagination
        currentPage={pagination.page}
        totalItems={pagination.total}
        itemsPerPage={pagination.perPage}
        pageSizeOptions={[10, 30, 50, 100]}
        onPageChange={pagination.setPage}
        onItemsPerPageChange={(n) => { pagination.setPerPage(n); pagination.setPage(1) }}
      />
    </div>
  )
}

// ── Recherche rapide ──
export function SearchFilter({ value, onChange, placeholder = 'Rechercher…', label = 'Recherche rapide' }: { value: string; onChange: (v: string) => void; placeholder?: string; label?: string }) {
  return (
    <FilterField label={label}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <Input placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="pl-9 h-9 text-sm focus-visible:ring-primary border-gray-200" />
      </div>
    </FilterField>
  )
}

/** Filtre texte libre sur toutes les valeurs d'un objet. */
export function matchesSearch(item: unknown, term: string): boolean {
  if (!term) return true
  const needle = term.toLowerCase()
  const visit = (v: unknown): boolean => {
    if (v === null || v === undefined) return false
    if (typeof v === 'object') return Object.values(v as object).some(visit)
    return String(v).toLowerCase().includes(needle)
  }
  return visit(item)
}

// ── Tableau ──
export interface ListColumn<T> {
  header: string
  cell: (row: T) => React.ReactNode
  className?: string
}

interface ListTableProps<T> {
  columns: ListColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string | number
  loading?: boolean
  actions?: (row: T) => React.ReactNode
  actionWidth?: string
  emptyIcon?: React.ReactNode
  emptyTitle?: string
  emptyDesc?: string
  onRowClick?: (row: T) => void
}

export function ListTable<T>({ columns, rows, rowKey, loading, actions, actionWidth = '130px', emptyIcon, emptyTitle = 'Aucune donnée', emptyDesc, onRowClick }: ListTableProps<T>) {
  const colSpan = columns.length + (actions ? 1 : 0)
  return (
    <Table>
      <TableHeaderCustom items={columns.map((c) => c.header)} afficheAction={!!actions} actionWidth={actionWidth} />
      <TableBody>
        {loading ? (
          <TableRow><TableCell colSpan={colSpan} className="py-10 text-center text-gray-400">
            <div className="inline-flex flex-col items-center gap-2">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-xs">Chargement…</span>
            </div>
          </TableCell></TableRow>
        ) : rows.length === 0 ? (
          <TableRow><TableCell colSpan={colSpan} className="py-12 text-center text-gray-400">
            <div className="mx-auto mb-2 flex justify-center opacity-30">{emptyIcon ?? <Inbox className="w-10 h-10" />}</div>
            <p className="text-sm font-semibold">{emptyTitle}</p>
            {emptyDesc && <p className="text-xs">{emptyDesc}</p>}
          </TableCell></TableRow>
        ) : (
          rows.map((row) => (
            <TableRow key={rowKey(row)} onClick={onRowClick ? () => onRowClick(row) : undefined} className={cn('hover:bg-primary/[0.02] transition-colors border-b border-gray-50 last:border-0 text-sm', onRowClick && 'cursor-pointer')}>
              {columns.map((c) => <TableCell key={c.header} className={c.className}>{c.cell(row)}</TableCell>)}
              {actions && <TableCell className="w-1 whitespace-nowrap text-right">{actions(row)}</TableCell>}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

// ── Formulaires ──
export function FieldBox({ label, required, span2, hint, children }: { label: string; required?: boolean; span2?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className={cn('space-y-1', span2 && 'col-span-1 md:col-span-2')}>
      <label className="text-xs font-bold text-gray-700">{label}{required && <span className="text-red-500"> *</span>}</label>
      {children}
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  )
}

/** <select> natif au style des champs du template (pour les listes simples dans les formulaires). */
export const SelectField = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function SelectField({ className, children, ...rest }, ref) {
  return (
    <select ref={ref} className={cn('flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20 disabled:opacity-50', className)} {...rest}>
      {children}
    </select>
  )
})

export const TextareaField = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function TextareaField({ className, ...rest }, ref) {
  return <textarea ref={ref} rows={3} className={cn('flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20 disabled:opacity-50', className)} {...rest} />
})

export function FormFooter({ onCancel, formId, onSave, saving, saveLabel = 'Enregistrer', disabled }: { onCancel: () => void; formId?: string; onSave?: () => void; saving?: boolean; saveLabel?: string; disabled?: boolean }) {
  return (
    <>
      <Button variant="outline" onClick={onCancel} disabled={saving}>Annuler</Button>
      <Button type={onSave ? 'button' : 'submit'} form={formId} onClick={onSave} className="bg-primary text-white hover:bg-primary-hover" disabled={saving || disabled}>
        {saving ? 'Enregistrement…' : saveLabel}
      </Button>
    </>
  )
}

export function ConfirmDelete({ isOpen, onClose, onConfirm, loading, title = 'Confirmer la suppression', message }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; loading?: boolean; title?: string; message: React.ReactNode }) {
  return (
    <Modal
      isOpen={isOpen} onClose={onClose} title={title} size="sm"
      footer={<><Button variant="outline" onClick={onClose} disabled={loading}>Annuler</Button><Button onClick={onConfirm} className="bg-rose-600 hover:bg-rose-700 text-white" disabled={loading}>{loading ? 'Suppression…' : 'Supprimer'}</Button></>}
    >
      <p className="text-xs text-gray-600">{message}</p>
    </Modal>
  )
}

export function DetailRows({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-200 text-xs">
      {rows.map(([label, value], i) => (
        <div key={label} className={cn('flex justify-between gap-4 py-1', i < rows.length - 1 && 'border-b border-slate-200')}>
          <span className="text-gray-500 font-bold shrink-0">{label}</span>
          <span className="text-right">{value ?? '—'}</span>
        </div>
      ))}
    </div>
  )
}
