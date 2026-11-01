import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatMontant(value: string | number | null | undefined, devise = 'FCFA'): string {
  const n = typeof value === 'string' ? parseFloat(value) : (value ?? 0)
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number.isFinite(n) ? n : 0)} ${devise}`
}

export function formatNombre(value: number | string | null | undefined): string {
  const n = typeof value === 'string' ? parseFloat(value) : (value ?? 0)
  return new Intl.NumberFormat('fr-FR').format(Number.isFinite(n) ? n : 0)
}

export function formatDate(value: string | null | undefined, withTime = false): string {
  if (!value) return '—'
  try {
    return format(parseISO(value), withTime ? "dd/MM/yyyy 'à' HH:mm" : 'dd/MM/yyyy', { locale: fr })
  } catch {
    return value
  }
}

export const today = () => format(new Date(), 'yyyy-MM-dd')
