import React, { useEffect, useMemo, useState } from 'react'
import * as Icons from 'lucide-react'
import { ArrowLeft, ChevronRight, Building2, Layers } from 'lucide-react'
import { Link, useRouterState } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useLayoutContext } from '../layouts/LayoutContext'
import { useAuth } from '@/application/contexts/AuthContext'
import { usePermissions } from '@/application/contexts/PermissionContext'
import { api, apiGet } from '@/lib/apiFetch'
import { CustomSelect } from './shared/ui/CustomSelect'
import type { Dashboard, Entreprise, MenuGroup } from '@/types'

// Rend une icône lucide à partir de son nom (les modules du menu viennent du backend)
const DynamicIcon = ({ name, className }: { name: string | null; className?: string }) => {
  if (!name) return <Layers className={className} />
  const IconComponent = (Icons as any)[name]
  return IconComponent ? <IconComponent className={className} /> : <Layers className={className} />
}

export const GestadLogo = ({ collapsed = false }: { collapsed?: boolean }) => (
  <Link to="/" className={`flex items-center gap-3 transition-all duration-300 ${collapsed ? 'justify-center w-full' : ''}`}>
    <div className="relative flex items-center justify-center shrink-0">
      <svg viewBox="0 0 64 64" className="w-9 h-9" aria-hidden>
        <path d="M32 4 46 18 32 32 18 18Z" fill="#ff5a14" />
        <path d="M46 18 60 32 46 46 32 32Z" fill="#ff5a14" opacity=".72" />
        <path d="M18 18 32 32 18 46 4 32Z" fill="#ffffff" opacity=".92" />
        <path d="M32 32 46 46 32 60 18 46Z" fill="#ffffff" opacity=".6" />
      </svg>
    </div>
    {!collapsed && (
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[19px] font-black tracking-tight text-white leading-none">
            GEST<span className="text-primary font-black">AD</span>
          </span>
          <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase bg-primary/20 text-orange-300 rounded-md border border-primary/30">
            SaaS
          </span>
        </div>
        <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase leading-none mt-1">
          Stocks administratifs
        </span>
      </div>
    )}
  </Link>
)

const PLATFORM_GROUP: MenuGroup = {
  code: 'plateforme', titre: 'Plateforme', icon: 'ShieldCheck',
  modules: [
    { code: 'plateforme', titre: 'Tableau de bord plateforme', lien: '/plateforme', icon: 'Gauge' },
    { code: 'entreprises', titre: 'Entreprises & abonnements', lien: '/entreprises', icon: 'Building2' },
  ],
}

const ACTIVE = 'bg-gradient-to-r from-teal-600 to-orange-500 text-white shadow-lg shadow-orange-900/30 font-semibold'
const INACTIVE = 'text-slate-300 hover:text-orange-300 hover:bg-slate-800/60'

export const Sidebar: React.FC = () => {
  const { isSidebarOpen, isMobileSidebarOpen, closeMobileSidebar } = useLayoutContext()
  const { user, centre, entrepriseId, selectEntreprise } = useAuth()
  const { hasAction } = usePermissions()
  const currentPath = useRouterState().location.pathname
  const [activeGroupCode, setActiveGroupCode] = useState<string | null>(null)

  const isSuper = !!user?.is_super_admin

  const { data: entreprises } = useQuery({
    queryKey: ['entreprises', 'select'],
    queryFn: () => apiGet<Entreprise[]>('/organisation/entreprises'),
    enabled: isSuper,
  })

  // Pastilles (alertes de seuil, demandes à traiter)
  const { data: stats } = useQuery({
    queryKey: ['dashboard', centre?.id],
    queryFn: () => api<Dashboard>('/reporting/dashboard', { muteError: true }),
    enabled: !!centre && hasAction('dashboard.stats'),
  })
  const badges: Record<string, number> = { alertes: stats?.alertesSeuil ?? 0, demandes: stats?.demandesEnAttente ?? 0 }

  const groups: MenuGroup[] = useMemo(() => {
    const base = user?.access.menu ?? []
    return isSuper ? [...base, PLATFORM_GROUP] : base
  }, [user, isSuper])

  // Groupe actif déduit de l'URL
  useEffect(() => {
    if (currentPath === '/') return
    const match = groups.find((g) => g.modules.length > 1 && g.modules.some((m) => m.lien !== '/' && (currentPath === m.lien || currentPath.startsWith(m.lien + '/'))))
    if (match) setActiveGroupCode(match.code)
  }, [currentPath, groups])

  useEffect(() => { closeMobileSidebar() }, [currentPath])

  useEffect(() => {
    document.body.style.overflow = isMobileSidebarOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMobileSidebarOpen])

  const activeGroup = groups.find((g) => g.code === activeGroupCode && g.modules.length > 1) ?? null
  const entrepriseName = user?.entreprise?.nom ?? 'Plateforme GESTAD'

  const NavLink = ({ lien, titre, icon, isOpen, small }: { lien: string; titre: string; icon: string; isOpen: boolean; small?: boolean }) => {
    const code = groups.flatMap((g) => g.modules).find((m) => m.lien === lien)?.code ?? ''
    const badge = badges[code] ?? 0
    return (
      <Link
        to={lien}
        activeOptions={{ exact: lien === '/' || !!small }}
        className={`flex items-center gap-3 px-3 ${small ? 'py-2' : 'py-2.5'} rounded-xl group transition-all duration-150 text-sm font-medium ${!isOpen ? 'justify-center' : ''}`}
        activeProps={{ className: ACTIVE }}
        inactiveProps={{ className: INACTIVE }}
        onClick={() => { if (!small) setActiveGroupCode(null) }}
        title={!isOpen ? titre : undefined}
      >
        <DynamicIcon name={icon} className={`${small ? 'w-[15px] h-[15px]' : 'w-[18px] h-[18px]'} shrink-0`} />
        {isOpen && <span className={`${small ? 'text-[12.5px]' : 'text-[13px] font-bold'} truncate flex-1`}>{titre}</span>}
        {isOpen && badge > 0 && <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-black text-primary">{badge}</span>}
      </Link>
    )
  }

  const sidebarContent = (isOpen: boolean) => (
    <>
      <div className={`h-[70px] flex items-center ${isOpen ? 'px-5' : 'justify-center'} border-b border-slate-800/80 overflow-hidden shrink-0 bg-[#17202b]`}>
        <GestadLogo collapsed={!isOpen} />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-3 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {/* Entreprise (espace SaaS) */}
        {isOpen && (
          <div className="mb-2">
            {!isSuper ? (
              <div className="px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-2.5 shadow-inner">
                <div className="w-7 h-7 rounded-lg bg-primary/20 text-orange-300 flex items-center justify-center shrink-0 border border-primary/30">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] uppercase font-black text-orange-300/80 tracking-wider leading-none">Entreprise</p>
                  <p className="text-xs font-bold text-white truncate mt-1" title={entrepriseName}>{entrepriseName}</p>
                </div>
              </div>
            ) : (
              <CustomSelect
                placeholder="Choisir une entreprise…"
                value={entrepriseId}
                options={(entreprises ?? []).map((e) => ({ value: e.id, label: e.nom }))}
                onChange={(v: any) => { selectEntreprise(v?.value ?? v ?? null) }}
                isClearable
              />
            )}
          </div>
        )}
        {!isOpen && (
          <div className="flex justify-center mb-2">
            <div className="w-9 h-9 rounded-xl bg-slate-800/90 border border-primary/30 flex items-center justify-center text-orange-300" title={entrepriseName}>
              <Building2 className="w-4 h-4" />
            </div>
          </div>
        )}

        {isSuper && !user?.entreprise && isOpen && (
          <p className="px-3 text-[11px] text-slate-400">Choisissez une entreprise pour consulter son espace, ou utilisez les outils de plateforme ci-dessous.</p>
        )}

        {activeGroup ? (
          <div className="space-y-3 pt-1">
            {isOpen ? (
              <div className="p-2.5 bg-gradient-to-r from-orange-950/60 to-slate-900 rounded-xl border border-primary/30 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-primary/20 border border-orange-400/30 flex items-center justify-center text-orange-300 shrink-0">
                    <DynamicIcon name={activeGroup.icon} className="w-4 h-4" />
                  </div>
                  <span className="text-[11.5px] font-black text-orange-300 uppercase tracking-wider truncate">{activeGroup.titre}</span>
                </div>
                <button
                  onClick={() => setActiveGroupCode(null)}
                  className="text-[10px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors shrink-0 flex items-center gap-1 font-bold"
                  title="Afficher tous les modules"
                >
                  <ArrowLeft className="w-3 h-3" /><span>Tous</span>
                </button>
              </div>
            ) : (
              <button onClick={() => setActiveGroupCode(null)} className="w-full flex justify-center py-2 text-slate-400 hover:text-white" title="Retour aux modules">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="space-y-1">
              {activeGroup.modules.map((m) => <NavLink key={m.code} lien={m.lien} titre={m.titre} icon={m.icon} isOpen={isOpen} small />)}
            </div>
          </div>
        ) : (
          <div className="space-y-1.5 pt-1">
            {isOpen && <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Modules principaux</p>}
            {groups.map((g) =>
              g.modules.length === 1 ? (
                <NavLink key={g.code} lien={g.modules[0].lien} titre={g.modules[0].titre} icon={g.modules[0].icon} isOpen={isOpen} />
              ) : (
                <button
                  key={g.code}
                  onClick={() => setActiveGroupCode(g.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl group transition-all duration-150 text-sm font-medium text-slate-300 hover:text-orange-300 hover:bg-slate-800/80 ${!isOpen ? 'justify-center' : 'justify-between'}`}
                  title={g.titre}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 text-orange-300 group-hover:bg-primary/20">
                      <DynamicIcon name={g.icon} className="w-4 h-4" />
                    </div>
                    {isOpen && <span className="text-[13px] font-semibold truncate text-left">{g.titre}</span>}
                  </div>
                  {isOpen && <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-orange-300 transition-transform shrink-0" />}
                </button>
              )
            )}
          </div>
        )}
      </nav>

      {isOpen && (
        <div className="px-4 py-3 border-t border-slate-800/80 bg-[#17202b] flex items-center justify-between">
          <p className="text-[10px] font-semibold text-slate-400 tracking-wide">GESTAD v1.0 · SaaS</p>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Système en ligne" />
        </div>
      )}
    </>
  )

  return (
    <>
      {/* Desktop */}
      <aside className={`${isSidebarOpen ? 'w-[270px]' : 'w-[72px]'} bg-[#1f2a37] text-slate-200 border-r border-slate-800/80 hidden md:flex flex-col transition-all duration-300 ease-in-out z-20 shrink-0 shadow-[4px_0_24px_0_rgba(0,0,0,0.12)]`}>
        {sidebarContent(isSidebarOpen)}
      </aside>

      {/* Mobile */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${isMobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeMobileSidebar}
        aria-hidden="true"
      />
      <aside className={`fixed top-0 left-0 h-full w-[280px] bg-[#1f2a37] text-slate-200 flex flex-col z-50 md:hidden transition-transform duration-300 ease-in-out shadow-[4px_0_24px_0_rgba(0,0,0,0.3)] ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent(true)}
      </aside>
    </>
  )
}
