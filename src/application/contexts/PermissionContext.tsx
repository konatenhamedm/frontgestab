import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { moduleForPath, PLATFORM_ROUTES } from '@/domain/constants/permissions'
import { useAuth } from './AuthContext'

interface PermissionContextType {
  /** Droit sur un module (lettre C/R/U/D). */
  can: (module: string, letter?: string) => boolean
  /** Action spéciale (ex. 'demandes.valider'). */
  hasAction: (action: string) => boolean
  /** Droits par chemin d'URL, comme dans front-web : canView('/articles'), canCreate('/articles')… */
  canView: (path: string) => boolean
  canCreate: (path: string) => boolean
  canEdit: (path: string) => boolean
  canDelete: (path: string) => boolean
  isSuperAdmin: boolean
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined)

export function PermissionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const access = user?.access
  const isSuperAdmin = !!user?.is_super_admin

  const can = useCallback((module: string, letter = 'R') => {
    if (!access) return false
    if (access.full) return true
    return (access.permissions[module] ?? '').includes(letter)
  }, [access])

  const hasAction = useCallback((action: string) => !!access && (access.full || access.actions.includes(action)), [access])

  const byPath = useCallback((letter: string) => (path: string) => {
    if (PLATFORM_ROUTES.some((p) => path === p || path.startsWith(p + '/'))) return isSuperAdmin
    const module = moduleForPath(path)
    return module ? can(module, letter) : true
  }, [can, isSuperAdmin])

  const value = useMemo<PermissionContextType>(() => ({
    can, hasAction, isSuperAdmin,
    canView: byPath('R'), canCreate: byPath('C'), canEdit: byPath('U'), canDelete: byPath('D'),
  }), [can, hasAction, isSuperAdmin, byPath])

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>
}

export function usePermissions() {
  const ctx = useContext(PermissionContext)
  if (!ctx) throw new Error('usePermissions must be used within a PermissionProvider')
  return ctx
}
