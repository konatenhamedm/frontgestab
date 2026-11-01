import { createFileRoute } from '@tanstack/react-router'
import { Building2, History, MapPin, Network, ShieldCheck, Users } from 'lucide-react'
import { usePermissions } from '@/application/contexts/PermissionContext'
import { ParametresLayout, type NavigationCategory } from '@/presentation/components/shared/ParametresLayout'

export const Route = createFileRoute('/_dashboard/parametres')({
  component: ParametresRoute,
})

function ParametresRoute() {
  const { canView } = usePermissions()
  const icon = 'w-4 h-4'

  const categories: NavigationCategory[] = [
    {
      id: 'organisation', label: 'Organisation', icon: <Building2 className={icon} />,
      items: [
        { id: 'entreprise', label: 'Mon entreprise', path: '/parametres/entreprise', icon: <Building2 className={icon} /> },
        { id: 'centres', label: 'Centres de gestion', path: '/parametres/centres', icon: <MapPin className={icon} /> },
        { id: 'services', label: 'Services', path: '/parametres/services', icon: <Network className={icon} /> },
      ],
    },
    {
      id: 'acces', label: 'Accès & sécurité', icon: <ShieldCheck className={icon} />,
      items: [
        { id: 'utilisateurs', label: 'Utilisateurs', path: '/parametres/utilisateurs', icon: <Users className={icon} /> },
        { id: 'roles', label: 'Rôles & permissions', path: '/parametres/roles', icon: <ShieldCheck className={icon} /> },
        { id: 'journal', label: 'Journal d’activité', path: '/parametres/journal', icon: <History className={icon} /> },
      ],
    },
  ].map((c) => ({ ...c, items: c.items.filter((i) => canView(i.path)) })).filter((c) => c.items.length > 0)

  return <ParametresLayout title="Paramètres" description="Organisation, utilisateurs, rôles et permissions de votre entreprise" categories={categories} />
}
