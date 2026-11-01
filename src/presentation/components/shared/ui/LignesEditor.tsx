import { Plus, Trash2 } from 'lucide-react'
import { Button } from './button'
import { Input } from './input'
import { SelectField } from './crud'
import type { Article } from '@/types'

export interface LigneForm { article: string; quantite: string; prix: string }
export const emptyLigne = (): LigneForm => ({ article: '', quantite: '1', prix: '' })

/** Lignes « article / quantité / prix unitaire HT » (commandes fournisseur, bons de réception). */
export function LignesEditor({ lignes, onChange, articles, quantiteLabel = 'Quantité' }: {
  lignes: LigneForm[]
  onChange: (lignes: LigneForm[]) => void
  articles: Article[] | undefined
  quantiteLabel?: string
}) {
  const update = (i: number, patch: Partial<LigneForm>) => onChange(lignes.map((l, idx) => (idx === i ? { ...l, ...patch } : l)))

  const pick = (i: number, id: string) => {
    const art = articles?.find((a) => String(a.id) === id)
    update(i, { article: id, prix: lignes[i].prix || (art ? String(Math.round(Number(art.prixMoyenHt))) : '') })
  }

  const total = lignes.reduce((s, l) => s + (Number(l.quantite) || 0) * (Number(l.prix) || 0), 0)

  return (
    <div className="space-y-2">
      <div className="hidden grid-cols-[1fr_100px_130px_36px] gap-2 text-xs font-bold text-gray-700 md:grid">
        <span>Article</span><span>{quantiteLabel}</span><span>Prix unitaire HT</span><span />
      </div>
      {lignes.map((l, i) => (
        <div key={i} className="grid grid-cols-[1fr_90px_36px] items-center gap-2 md:grid-cols-[1fr_100px_130px_36px]">
          <SelectField value={l.article} onChange={(e) => pick(i, e.target.value)} aria-label="Article">
            <option value="">— Choisir un article —</option>
            {articles?.filter((a) => String(a.id) === l.article || !lignes.some((x) => x.article === String(a.id))).map((a) => (
              <option key={a.id} value={a.id}>{a.designation} ({a.codeSku})</option>
            ))}
          </SelectField>
          <Input type="number" min={1} value={l.quantite} onChange={(e) => update(i, { quantite: e.target.value })} aria-label={quantiteLabel} />
          <Input type="number" min={0} step="0.01" value={l.prix} onChange={(e) => update(i, { prix: e.target.value })} aria-label="Prix unitaire HT" className="hidden md:flex" />
          <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-40" disabled={lignes.length === 1} onClick={() => onChange(lignes.filter((_, idx) => idx !== i))} aria-label="Retirer la ligne"><Trash2 size={14} /></button>
        </div>
      ))}
      <div className="flex items-center justify-between pt-1">
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...lignes, emptyLigne()])}><Plus className="h-4 w-4" /> Ajouter une ligne</Button>
        <span className="text-sm text-gray-500">Total HT : <b className="text-gray-900">{new Intl.NumberFormat('fr-FR').format(total)}</b></span>
      </div>
    </div>
  )
}
