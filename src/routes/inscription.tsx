import { useState, type FormEvent } from 'react'
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/application/contexts/AuthContext'
import { api, ApiError } from '@/lib/apiFetch'
import { session } from '@/lib/sessionStorage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldBox } from '@/components/ui/crud'
import { GestadLogo } from '@/presentation/components/Sidebar'
import type { SessionUser } from '@/types'

export const Route = createFileRoute('/inscription')({
  beforeLoad: () => {
    if (session.getToken()) throw redirect({ to: '/' })
  },
  component: RegisterPage,
})

function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ entreprise: '', centre: 'Centre principal', prenom: '', nom: '', email: '', telephone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await api<{ token: string; user: SessionUser }>('/auth/register', { method: 'POST', data: form, muteError: true })
      login(data.token, data.user)
      navigate({ to: '/' })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Inscription impossible.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-color)] px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 inline-block rounded-xl bg-[#1f2a37] px-4 py-3"><GestadLogo /></div>
        <h1 className="text-2xl font-black text-gray-900">Créer votre espace entreprise</h1>
        <p className="mb-6 mt-1 text-sm text-gray-500">Essai gratuit de 30 jours. Vous serez l’administrateur : vous pourrez ensuite créer des centres, des services, des rôles et des utilisateurs.</p>

        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <FieldBox label="Nom de l’entreprise" required span2><Input value={form.entreprise} onChange={set('entreprise')} required autoFocus /></FieldBox>
          <FieldBox label="Premier centre de gestion" span2><Input value={form.centre} onChange={set('centre')} /></FieldBox>
          <FieldBox label="Prénom" required><Input value={form.prenom} onChange={set('prenom')} required /></FieldBox>
          <FieldBox label="Nom" required><Input value={form.nom} onChange={set('nom')} required /></FieldBox>
          <FieldBox label="Email" required><Input type="email" value={form.email} onChange={set('email')} required /></FieldBox>
          <FieldBox label="Téléphone"><Input value={form.telephone} onChange={set('telephone')} /></FieldBox>
          <FieldBox label="Mot de passe" hint="8 caractères minimum" required span2><Input type="password" minLength={8} value={form.password} onChange={set('password')} required autoComplete="new-password" /></FieldBox>
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 md:col-span-2">{error}</p>}
          <Button type="submit" disabled={loading} className="bg-primary text-white hover:bg-primary-hover md:col-span-2">{loading ? 'Création…' : 'Créer mon espace'}</Button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">Déjà inscrit ? <Link to="/login" className="font-bold text-primary hover:underline">Se connecter</Link></p>
      </div>
    </div>
  )
}
