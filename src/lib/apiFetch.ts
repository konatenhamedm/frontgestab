import { toast } from 'sonner'
import { BASE_URL } from './environment'
import { session } from './sessionStorage'
import { signalerSessionExpiree } from './sessionExpiree'

export interface ApiEnvelope<T> {
  code: number
  message: string
  data: T
  errors: string[]
  meta?: Record<string, unknown>
}

export class ApiError extends Error {
  status: number
  errors: string[]
  constructor(message: string, status: number, errors: string[] = []) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  data?: unknown
  params?: Record<string, string | number | boolean | null | undefined>
  /** N'affiche pas de toast en cas d'erreur (le composant gère l'erreur lui-même). */
  muteError?: boolean
}


/** Appelle l'API et renvoie l'enveloppe complète { code, message, data, errors, meta }. */
export async function apiEnvelope<T = unknown>(path: string, options: ApiOptions = {}): Promise<ApiEnvelope<T>> {
  const { method = 'GET', data, params, muteError = false } = options

  const headers: Record<string, string> = {
    'X-APP-SECURITY-CODE': import.meta.env.VITE_APP_SECURITY_CODE ?? '',
    Accept: 'application/json',
  }
  const token = session.getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  const centreId = session.getCentreId()
  if (centreId) headers['X-Centre-Id'] = centreId
  const entrepriseId = session.getEntrepriseId()
  if (entrepriseId) headers['X-Entreprise-Id'] = entrepriseId
  if (data !== undefined) headers['Content-Type'] = 'application/json'

  const query = new URLSearchParams()
  Object.entries(params ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') query.set(k, String(v))
  })
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}${query.size ? `?${query}` : ''}`

  let response: Response
  try {
    response = await fetch(url, { method, headers, body: data !== undefined ? JSON.stringify(data) : undefined })
  } catch {
    const message = 'Impossible de joindre le serveur. Vérifiez votre connexion.'
    if (!muteError) toast.error(message)
    throw new ApiError(message, 0)
  }

  let payload: ApiEnvelope<T> | null = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok || !payload) {
    const status = response.status
    const message = payload?.message || (status >= 500 ? 'Une erreur serveur est survenue.' : 'Une erreur est survenue.')

    if (status === 401 && token && !path.startsWith('/login')) {
      // Pas de redirection brutale : la modale « session expirée » prend le relais
      signalerSessionExpiree()
    } else if (!muteError) {
      toast.error(message)
    }
    throw new ApiError(message, status, payload?.errors ?? [])
  }

  return payload
}

/** Appelle l'API et renvoie directement `data`. */
export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  return (await apiEnvelope<T>(path, options)).data
}

export const apiGet = <T,>(path: string, params?: ApiOptions['params']) => api<T>(path, { params })
export const apiPost = <T,>(path: string, data?: unknown, options: ApiOptions = {}) => api<T>(path, { ...options, method: 'POST', data: data ?? {} })
export const apiPut = <T,>(path: string, data?: unknown) => api<T>(path, { method: 'PUT', data: data ?? {} })
export const apiDelete = <T,>(path: string) => api<T>(path, { method: 'DELETE' })
