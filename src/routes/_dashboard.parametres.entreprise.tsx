import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Building2 } from 'lucide-react'
import { useAuth } from '@/application/contexts/AuthContext'
import { usePermissions } from '@/application/contexts/PermissionContext'
import { apiGet, apiPut } from '@/lib/apiFetch'
import { formatDate } from '@/lib/format'
import { PLAN_LABELS } from '@/domain/constants/permissions'
import { SubHeader } from '@/components/ui/page-components'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pill } from '@/components/ui/StatutBadge'
import { FieldBox, TextareaField } from '@/components/ui/crud'
import type { Entreprise } from '@/types'

export const Route = createFileRoute('/_dashboard/parametres/entreprise')({
  component: EntrepriseSettings,
})

function EntrepriseSettings() {
  const { user, refreshSession } = useAuth()
  const { canEdit } = usePermissions()
  const { data } = useQuery({ queryKey: ['entreprise', user?.entreprise?.id], queryFn: () => apiGet<Entreprise>('/organisation/entreprise') })
  const [form, setForm] = useState({ nom: '', email: '', telephone: '', adresse: '', devise: 'FCFA' })
  const readOnly = !canEdit('/parametres/entreprise')

  useEffect(() => {
    if (data) setForm({ nom: data.nom, email: data.email ?? '', telephone: data.telephone ?? '', adresse: data.adresse ?? '', devise: data.devise })
  }, [data])

  const save = useMutation({
    mutationFn: () => apiPut('/organisation/entreprise', form),
    onSuccess: async () => { toast.success('Entreprise mise à jour.'); await refreshSession() },
  })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="space-y-5">
      <SubHeader title="Mon entreprise" icon={<Building2 className="w-4 h-4" />} description="Informations de l’entreprise et de son abonnement" />

      {data && (
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-gray-100 bg-slate-50 p-3"><div className="text-[10px] font-black uppercase text-gray-400">Plan</div><div className="font-black">{PLAN_LABELS[data.plan] ?? data.plan}</div></div>
          <div className="rounded-xl border border-gray-100 bg-slate-50 p-3"><div className="text-[10px] font-black uppercase text-gray-400">Expiration</div><div className="font-black">{data.dateExpiration ? formatDate(data.dateExpiration) : 'Sans limite'} {data.expire && <Pill tone="danger">expiré</Pill>}</div></div>
          <div className="rounded-xl border border-gray-100 bg-slate-50 p-3"><div className="text-[10px] font-black uppercase text-gray-400">Centres</div><div className="font-black">{data.nbCentres} / {data.maxCentres}</div></div>
          <div className="rounded-xl border border-gray-100 bg-slate-50 p-3"><div className="text-[10px] font-black uppercase text-gray-400">Utilisateurs</div><div className="font-black">{data.nbUtilisateurs} / {data.maxUtilisateurs}</div></div>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); save.mutate() }} className="grid max-w-3xl gap-4 md:grid-cols-2">
        <FieldBox label="Nom de l’entreprise" required span2><Input value={form.nom} onChange={set('nom')} required disabled={readOnly} /></FieldBox>
        <FieldBox label="Email"><Input type="email" value={form.email} onChange={set('email')} disabled={readOnly} /></FieldBox>
        <FieldBox label="Téléphone"><Input value={form.telephone} onChange={set('telephone')} disabled={readOnly} /></FieldBox>
        <FieldBox label="Devise" hint="Affichée sur les montants (ex. FCFA, EUR)"><Input value={form.devise} onChange={set('devise')} disabled={readOnly} /></FieldBox>
        <FieldBox label="Adresse" span2><TextareaField value={form.adresse} onChange={set('adresse')} disabled={readOnly} /></FieldBox>
        {!readOnly && <div className="md:col-span-2"><Button type="submit" disabled={save.isPending} className="bg-primary text-white hover:bg-primary-hover">{save.isPending ? 'Enregistrement…' : 'Enregistrer'}</Button></div>}
      </form>
    </div>
  )
}
