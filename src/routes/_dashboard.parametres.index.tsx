import { createFileRoute, redirect } from '@tanstack/react-router'
import { session } from '@/lib/sessionStorage'
import type { SessionUser } from '@/types'

const ORDER = [['entreprise', '/parametres/entreprise'], ['centres', '/parametres/centres'], ['services', '/parametres/services'], ['utilisateurs', '/parametres/utilisateurs'], ['roles', '/parametres/roles'], ['journal', '/parametres/journal']]

export const Route = createFileRoute('/_dashboard/parametres/')({
  beforeLoad: () => {
    const access = session.getUser<SessionUser>()?.access
    const target = ORDER.find(([module]) => access?.full || access?.permissions[module]?.includes('R'))
    throw redirect({ to: target?.[1] ?? '/' })
  },
})
