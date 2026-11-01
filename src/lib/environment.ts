/**
 * URL de l'API : VITE_API_URL en priorité (build / .env.local), sinon déduction depuis le hostname.
 */
export function getBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_URL as string | undefined
  if (fromEnv) return fromEnv.replace(/\/$/, '')

  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    // Production : l'API suit le protocole de la page (http tant que le certificat du backend n'est pas actif)
    if (host.endsWith('gestad.myresy.site')) return `${window.location.protocol}//backgestad.myresy.site/api`
    if (host === 'localhost' || host === '127.0.0.1') return 'http://127.0.0.1:8010/api'
    if (/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(host)) return `http://${host}:8010/api`
  }
  return '/api'
}

export const BASE_URL = getBaseUrl()
export const SHOW_DEMO_ACCOUNTS = (import.meta.env.VITE_SHOW_DEMO_ACCOUNTS ?? 'true') !== 'false'
