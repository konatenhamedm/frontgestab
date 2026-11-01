import { useState, type FormEvent } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { KeyRound } from 'lucide-react'
import { useAuth } from '@/application/contexts/AuthContext'
import { apiPost } from '@/lib/apiFetch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageLayout } from '@/components/ui/page-components'
import { FieldBox } from '@/components/ui/crud'

export const Route = createFileRoute('/_dashboard/mot-de-passe')({
  component: PasswordPage,
})

function PasswordPage() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const forced = user?.must_change_password
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (next !== confirm) return toast.error('La confirmation ne correspond pas.')
    setLoading(true)
    try {
      await apiPost('/auth/change-password', { current_password: current, new_password: next })
      if (user) updateUser({ ...user, must_change_password: false })
      toast.success('Mot de passe modifié.')
      navigate({ to: '/' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageLayout title="Changer le mot de passe" icon={<KeyRound className="w-4 h-4 text-primary" />} description={forced ? 'Vous devez définir un nouveau mot de passe pour continuer.' : 'Choisissez un mot de passe d’au moins 8 caractères.'}>
      <form onSubmit={submit} className="max-w-md space-y-4 p-5">
        {!forced && <FieldBox label="Mot de passe actuel" required><Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required autoComplete="current-password" /></FieldBox>}
        <FieldBox label="Nouveau mot de passe" required><Input type="password" minLength={8} value={next} onChange={(e) => setNext(e.target.value)} required autoComplete="new-password" /></FieldBox>
        <FieldBox label="Confirmation" required><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" /></FieldBox>
        <Button type="submit" disabled={loading} className="bg-primary text-white hover:bg-primary-hover">{loading ? 'Enregistrement…' : 'Enregistrer'}</Button>
      </form>
    </PageLayout>
  )
}
