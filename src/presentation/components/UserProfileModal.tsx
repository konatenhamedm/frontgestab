import React from 'react'
import { Building2, Mail, MapPin, Network, Phone, ShieldCheck } from 'lucide-react'
import { Modal } from './shared/ui/Modal'
import { useAuth } from '@/application/contexts/AuthContext'
import { PLAN_LABELS } from '@/domain/constants/permissions'

const Row = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-teal-50 text-primary flex items-center justify-center shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-800 truncate">{value || '—'}</p>
    </div>
  </div>
)

export const UserProfileModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user, centre } = useAuth()
  if (!user) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mon profil" description="Informations de votre compte" size="md">
      <div>
        <Row icon={<Mail className="w-4 h-4" />} label="Email" value={user.email} />
        <Row icon={<Phone className="w-4 h-4" />} label="Téléphone" value={user.telephone} />
        <Row icon={<ShieldCheck className="w-4 h-4" />} label="Rôle" value={user.is_super_admin ? 'Super administrateur' : user.role?.nom} />
        <Row icon={<Building2 className="w-4 h-4" />} label="Entreprise" value={user.entreprise ? `${user.entreprise.nom} — plan ${PLAN_LABELS[user.entreprise.plan] ?? user.entreprise.plan}` : 'Plateforme'} />
        <Row icon={<MapPin className="w-4 h-4" />} label="Centre actif" value={centre?.nom} />
        <Row icon={<Network className="w-4 h-4" />} label="Service" value={user.service?.nom} />
      </div>
    </Modal>
  )
}
