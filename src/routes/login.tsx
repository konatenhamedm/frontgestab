import { useState, type FormEvent } from 'react'
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { PackageCheck, Bell, ShoppingCart, Wallet } from 'lucide-react'
import { useAuth } from '@/application/contexts/AuthContext'
import { api, ApiError } from '@/lib/apiFetch'
import { SHOW_DEMO_ACCOUNTS } from '@/lib/environment'
import { session } from '@/lib/sessionStorage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GestadLogo } from '@/presentation/components/Sidebar'
import type { SessionUser } from '@/types'

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    if (session.getToken()) throw redirect({ to: '/' })
  },
  component: LoginPage,
})

const DEMOS = [
  { label: 'Administrateur', email: 'admin@demo.gestad.app' },
  { label: 'Gestionnaire de stock', email: 'stock@demo.gestad.app' },
  { label: 'Comptable', email: 'compta@demo.gestad.app' },
  { label: 'Responsable (rôle perso)', email: 'responsable@demo.gestad.app' },
  { label: 'Employé', email: 'employe@demo.gestad.app' },
  { label: 'Super administrateur', email: 'superadmin@gestad.app' },
]
const DEMO_PASSWORD = 'Gestad@2026'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e?: FormEvent, creds = { email, password }) => {
    e?.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await api<{ token: string; user: SessionUser }>('/login', { method: 'POST', data: creds, muteError: true })
      login(data.token, data.user)
      navigate({ to: data.user.must_change_password ? '/mot-de-passe' : data.user.is_super_admin ? '/plateforme' : '/' })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Connexion impossible.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-[#1f2a37] p-10 text-white lg:flex">
        <GestadLogo />
        <div>
          <h1 className="text-4xl font-extrabold leading-tight">
            Gérez vos fournitures et consommables <span className="text-primary">simplement</span>.
          </h1>
          <p className="mt-4 max-w-md text-slate-300">Demandes, validations, entrées de stock, factures fournisseurs : tout est tracé, entreprise par entreprise, centre par centre.</p>
          <ul className="mt-8 grid max-w-md grid-cols-2 gap-4 text-sm text-slate-200">
            <li className="flex items-center gap-2"><PackageCheck className="h-5 w-5 text-primary" /> Suivi des sorties de stock</li>
            <li className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /> Seuils d’alerte</li>
            <li className="flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-primary" /> Réappro en un clic</li>
            <li className="flex items-center gap-2"><Wallet className="h-5 w-5 text-primary" /> Budget maîtrisé</li>
          </ul>
        </div>
        <p className="text-xs text-slate-400">Gagnez du temps et faites des économies !</p>
      </div>

      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 rounded-xl bg-[#1f2a37] px-4 py-3 lg:hidden"><GestadLogo /></div>
          <h2 className="text-2xl font-black text-gray-900">Connexion</h2>
          <p className="mb-6 mt-1 text-sm text-gray-500">Accédez à votre espace de gestion.</p>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Adresse email <span className="text-red-500">*</span></label>
              <Input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Mot de passe <span className="text-red-500">*</span></label>
              <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full bg-primary text-white hover:bg-primary-hover">{loading ? 'Connexion…' : 'Se connecter'}</Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Nouvelle entreprise ? <Link to="/inscription" className="font-bold text-primary hover:underline">Créer un espace</Link>
          </p>

          {SHOW_DEMO_ACCOUNTS && (
            <div className="mt-8 rounded-xl border border-dashed border-gray-300 p-4">
              <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-gray-400">Comptes de démonstration</p>
              <div className="grid grid-cols-2 gap-2">
                {DEMOS.map((d) => (
                  <Button key={d.email} variant="outline" size="sm" disabled={loading} onClick={() => submit(undefined, { email: d.email, password: DEMO_PASSWORD })}>
                    {d.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
