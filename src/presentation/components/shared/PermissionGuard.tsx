import React from 'react'
import { useLocation } from '@tanstack/react-router'
import { usePermissions } from '@/application/contexts/PermissionContext'
import { Unauthorized } from './ui/Unauthorized'

/** Bloque l'accès aux pages dont le module n'est pas autorisé pour le rôle de l'utilisateur. */
export const PermissionGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation()
  const { canView } = usePermissions()

  if (pathname !== '/mot-de-passe' && !canView(pathname)) {
    return <Unauthorized />
  }
  return <>{children}</>
}
