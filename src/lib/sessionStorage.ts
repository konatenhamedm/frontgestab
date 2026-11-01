const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'
const CENTRE_KEY = 'selectedCentreId'
const ENTREPRISE_KEY = 'selectedEntrepriseId'

export const session = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  getUser: <T,>(): T | null => {
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? (JSON.parse(raw) as T) : null
    } catch {
      return null
    }
  },
  getCentreId: (): string | null => localStorage.getItem(CENTRE_KEY),
  getEntrepriseId: (): string | null => localStorage.getItem(ENTREPRISE_KEY),
  /** Super administrateur : entreprise dont il consulte l'espace. */
  setEntrepriseId: (id: number | null) => {
    if (id) localStorage.setItem(ENTREPRISE_KEY, String(id))
    else localStorage.removeItem(ENTREPRISE_KEY)
  },
  setAuth: (token: string, user: unknown) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  setUser: (user: unknown) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  setCentreId: (id: number | null) => {
    if (id) localStorage.setItem(CENTRE_KEY, String(id))
    else localStorage.removeItem(CENTRE_KEY)
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(CENTRE_KEY)
    localStorage.removeItem(ENTREPRISE_KEY)
  },
}
