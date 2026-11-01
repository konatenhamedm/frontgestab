import React, { useEffect, useRef, useState } from 'react'
import { Bell, LogOut, Menu, User, ChevronDown, KeyRound } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useLayoutContext } from '../layouts/LayoutContext'
import { useAuth } from '@/application/contexts/AuthContext'
import { usePermissions } from '@/application/contexts/PermissionContext'
import { api } from '@/lib/apiFetch'
import { PLAN_LABELS } from '@/domain/constants/permissions'
import { CustomSelect } from './shared/ui/CustomSelect'
import { UserProfileModal } from './UserProfileModal'
import type { Dashboard } from '@/types'

export const Header: React.FC = () => {
  const { isSidebarOpen, toggleSidebar, toggleMobileSidebar } = useLayoutContext()
  const { user, centre, selectCentre, logout } = useAuth()
  const { hasAction } = usePermissions()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setIsUserMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const { data: stats } = useQuery({
    queryKey: ['dashboard', centre?.id],
    queryFn: () => api<Dashboard>('/reporting/dashboard', { muteError: true }),
    enabled: !!centre && hasAction('dashboard.stats'),
  })
  const alertes = stats?.alertesSeuil ?? 0

  const centreOptions = (user?.centres ?? []).map((c) => ({ value: c.id, label: c.nom }))
  const selectedCentre = centreOptions.find((o) => o.value === centre?.id) ?? null
  const initials = `${user?.prenom?.[0] ?? ''}${user?.nom?.[0] ?? ''}`.toUpperCase()
  const roleLabel = user?.is_super_admin ? 'Super administrateur' : user?.role?.nom ?? 'Utilisateur'
  const plan = user?.entreprise?.plan
  const expiration = user?.entreprise?.dateExpiration
  const joursRestants = expiration ? Math.ceil((new Date(expiration).getTime() - Date.now()) / 86_400_000) : null

  const centrePicker = (
    <CustomSelect
      options={centreOptions}
      value={selectedCentre}
      onChange={(v: any) => { const c = user?.centres.find((x) => x.id === (v?.value ?? v)); if (c) selectCentre(c) }}
      isSearchable={centreOptions.length > 6}
      isDisabled={centreOptions.length <= 1}
      isClearable={false}
      className="header-select-control"
      containerClassName="!space-y-0"
      placeholder="Sélectionner un centre"
    />
  )

  return (
    <header className="relative z-40 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-300 shrink-0 shadow-xs">
      <div className="h-[56px] md:h-[70px] flex items-center justify-between pl-3 pr-4 lg:pr-6">
        <div className="flex items-center gap-3">
          <button onClick={toggleSidebar} title={isSidebarOpen ? 'Masquer le menu' : 'Afficher le menu'} className="hidden md:flex p-2 rounded-xl text-slate-600 hover:text-primary hover:bg-teal-50/70 transition-all border border-slate-200/80 shadow-2xs hover:scale-105 active:scale-95 items-center justify-center">
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
          <button onClick={toggleMobileSidebar} title="Ouvrir le menu" className="md:hidden p-2 rounded-xl text-slate-600 hover:text-primary hover:bg-teal-50/70 transition-all border border-slate-200/80 shadow-2xs active:scale-95 flex items-center justify-center">
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
          {plan && (
            <span className={`hidden lg:inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${joursRestants !== null && joursRestants <= 14 ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
              Plan {PLAN_LABELS[plan] ?? plan}
              {joursRestants !== null && <span className="font-medium">· {joursRestants > 0 ? `${joursRestants} j restants` : 'expiré'}</span>}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {centreOptions.length > 0 && <div className="hidden md:block w-[230px]">{centrePicker}</div>}

          <div className="h-6 w-px bg-slate-200 hidden md:block mx-1" />

          {hasAction('dashboard.stats') && (
            <Link to="/alertes" title="Alertes de stock" className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 bg-slate-50 hover:text-primary hover:bg-teal-50/60 transition-all border border-slate-200/80 shadow-2xs">
              <Bell className="w-4 h-4" />
              {alertes > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-primary text-[9px] font-black text-white flex items-center justify-center ring-2 ring-white">{alertes}</span>}
            </Link>
          )}

          <div className="relative z-50 ml-1" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`flex items-center gap-2.5 p-1.5 rounded-xl border transition-all duration-150 cursor-pointer ${isUserMenuOpen ? 'border-primary/50 bg-teal-50/60 shadow-xs' : 'border-slate-200/80 bg-white hover:bg-slate-50'}`}
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-600 to-orange-400 text-white text-xs font-black flex items-center justify-center border-2 border-primary/30 shadow-2xs">{initials}</div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              {user && (
                <div className="hidden sm:flex flex-col text-left min-w-[90px]">
                  <span className="text-xs font-bold text-slate-800 leading-tight truncate">{user.prenom} {user.nom}</span>
                  <span className="text-[10px] text-slate-400 font-medium leading-none mt-0.5 truncate">{roleLabel}</span>
                </div>
              )}
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180 text-primary' : ''}`} />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200/80 shadow-2xl py-1.5 z-50 animate-fade-in-up">
                {user && (
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50 rounded-t-xl">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-600 to-orange-400 text-white text-sm font-black flex items-center justify-center shrink-0">{initials}</div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-slate-900 truncate">{user.prenom} {user.nom}</span>
                      <span className="text-xs text-slate-400 truncate">{user.email}</span>
                    </div>
                  </div>
                )}
                <div className="p-1 space-y-0.5">
                  <button onClick={() => { setIsUserMenuOpen(false); setIsProfileModalOpen(true) }} className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:text-primary hover:bg-teal-50/70 rounded-xl transition-all group cursor-pointer">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-primary flex items-center justify-center group-hover:scale-105 transition-transform"><User className="w-4 h-4" /></div>
                    <span>Mon profil</span>
                  </button>
                  <Link to="/mot-de-passe" onClick={() => setIsUserMenuOpen(false)} className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:text-primary hover:bg-teal-50/70 rounded-xl transition-all group">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-primary flex items-center justify-center group-hover:scale-105 transition-transform"><KeyRound className="w-4 h-4" /></div>
                    <span>Changer le mot de passe</span>
                  </Link>
                  <button onClick={() => { setIsUserMenuOpen(false); logout() }} className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all group cursor-pointer">
                    <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform"><LogOut className="w-4 h-4" /></div>
                    <span>Déconnexion</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {centreOptions.length > 0 && (
        <div className="md:hidden border-t border-slate-100 px-3 py-2">{centrePicker}</div>
      )}

      <UserProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </header>
  )
}
