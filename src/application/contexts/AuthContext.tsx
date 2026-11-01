import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/apiFetch'
import { reinitialiserSessionExpiree } from '@/lib/sessionExpiree'
import { session } from '@/lib/sessionStorage'
import type { Ref, SessionUser } from '@/types'

interface AuthContextType {
  token: string | null
  user: SessionUser | null
  isAuthenticated: boolean
  isLoading: boolean
  /** Centre de gestion actif (header X-Centre-Id). */
  centre: Ref | null
  /** Super administrateur : entreprise dont il consulte l'espace (null = vue plateforme). */
  entrepriseId: number | null
  login: (token: string, user: SessionUser) => void
  updateUser: (user: SessionUser) => void
  /** Recharge la session (droits, centres, plan…) depuis /auth/me. */
  refreshSession: () => Promise<void>
  selectCentre: (centre: Ref) => void
  selectEntreprise: (id: number | null) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [token, setToken] = useState<string | null>(() => session.getToken())
  const [user, setUser] = useState<SessionUser | null>(() => (session.getToken() ? session.getUser<SessionUser>() : null))
  const [centreId, setCentreId] = useState<number | null>(() => Number(session.getCentreId()) || null)
  const [entrepriseId, setEntrepriseIdState] = useState<number | null>(() => Number(session.getEntrepriseId()) || null)
  const [isLoading, setIsLoading] = useState(true)

  const apply = useCallback((u: SessionUser) => {
    session.setUser(u)
    setUser(u)
    // Le centre mémorisé doit rester accessible, sinon on retombe sur le premier centre
    const stored = Number(session.getCentreId())
    const next = u.centres.find((c) => c.id === stored)?.id ?? u.centres[0]?.id ?? null
    session.setCentreId(next)
    setCentreId(next)
  }, [])

  const refreshSession = useCallback(async () => {
    const fresh = await api<SessionUser>('/auth/me', { muteError: true })
    apply(fresh)
  }, [apply])

  // Au chargement : on rafraîchit les droits (le rôle a pu changer depuis la dernière visite)
  useEffect(() => {
    if (!session.getToken()) {
      setIsLoading(false)
      return
    }
    refreshSession().catch(() => undefined).finally(() => setIsLoading(false))
  }, [refreshSession])

  const logout = useCallback(() => {
    session.clear()
    queryClient.clear()
    setToken(null)
    setUser(null)
    setCentreId(null)
    setEntrepriseIdState(null)
    window.location.href = '/login'
  }, [queryClient])

  const login = useCallback((newToken: string, newUser: SessionUser) => {
    session.clear()
    session.setAuth(newToken, newUser)
    queryClient.clear()
    reinitialiserSessionExpiree()
    setToken(newToken)
    setEntrepriseIdState(null)
    apply(newUser)
  }, [queryClient, apply])

  const updateUser = useCallback((u: SessionUser) => {
    session.setUser(u)
    setUser(u)
  }, [])

  const selectCentre = useCallback((centre: Ref) => {
    session.setCentreId(centre.id)
    setCentreId(centre.id)
    queryClient.clear() // toutes les données sont propres à un centre
  }, [queryClient])

  const selectEntreprise = useCallback(async (id: number | null) => {
    session.setEntrepriseId(id)
    session.setCentreId(null)
    setEntrepriseIdState(id)
    queryClient.clear()
    await refreshSession()
  }, [queryClient, refreshSession])

  const centre = useMemo(() => user?.centres.find((c) => c.id === centreId) ?? user?.centres[0] ?? null, [user, centreId])

  const value = useMemo<AuthContextType>(() => ({
    token, user, isAuthenticated: !!token, isLoading, centre, entrepriseId,
    login, updateUser, refreshSession, selectCentre, selectEntreprise, logout,
  }), [token, user, isLoading, centre, entrepriseId, login, updateUser, refreshSession, selectCentre, selectEntreprise, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
