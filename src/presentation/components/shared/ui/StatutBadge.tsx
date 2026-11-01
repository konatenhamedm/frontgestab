import React from 'react'
import { cn } from '@/lib/utils'

type Tone = 'neutral' | 'ok' | 'warn' | 'danger' | 'info' | 'primary'

const TONES: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  ok: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  warn: 'bg-amber-100 text-amber-800 border-amber-200',
  danger: 'bg-rose-100 text-rose-700 border-rose-200',
  info: 'bg-sky-100 text-sky-700 border-sky-200',
  primary: 'bg-orange-100 text-orange-700 border-orange-200',
}

const STATUTS: Record<string, { label: string; tone: Tone }> = {
  // Demandes
  EN_ATTENTE: { label: 'En attente', tone: 'warn' },
  VALIDEE: { label: 'Validée', tone: 'info' },
  REFUSEE: { label: 'Refusée', tone: 'danger' },
  EN_LIVRAISON: { label: 'En livraison', tone: 'primary' },
  LIVREE: { label: 'Livrée', tone: 'ok' },
  // Commandes
  BROUILLON: { label: 'Brouillon', tone: 'neutral' },
  ENVOYEE: { label: 'Envoyée', tone: 'info' },
  PARTIELLE: { label: 'Partielle', tone: 'warn' },
  RECUE: { label: 'Reçue', tone: 'ok' },
  ANNULEE: { label: 'Annulée', tone: 'danger' },
  // Factures
  NON_PAYEE: { label: 'Non payée', tone: 'danger' },
  PARTIELLEMENT_PAYEE: { label: 'Partiellement payée', tone: 'warn' },
  PAYEE: { label: 'Payée', tone: 'ok' },
  // Stock
  rupture: { label: 'Rupture', tone: 'danger' },
  alerte: { label: 'Seuil d’alerte', tone: 'warn' },
  ok: { label: 'En stock', tone: 'ok' },
}

export function Pill({ tone = 'neutral', children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-bold', TONES[tone], className)}>{children}</span>
}

export function StatutBadge({ statut }: { statut: string }) {
  const s = STATUTS[statut] ?? { label: statut, tone: 'neutral' as Tone }
  return <Pill tone={s.tone}>{s.label}</Pill>
}

export function stockStatut(quantite: number, seuil: number): 'rupture' | 'alerte' | 'ok' {
  if (quantite <= 0) return 'rupture'
  return quantite <= seuil ? 'alerte' : 'ok'
}
