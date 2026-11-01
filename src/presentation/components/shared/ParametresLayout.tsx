import React from 'react';
import { Settings, ChevronRight } from 'lucide-react';
import { useLocation, Outlet, Link } from '@tanstack/react-router';
import { usePermissions } from "../../../application/contexts/PermissionContext";
import { Unauthorized } from "./ui/Unauthorized";

export type NavigationItem = {
  id: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
  roles?: string[];
};

export type NavigationCategory = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  items: NavigationItem[];
};

type ParametresLayoutProps = {
  title?: string;
  description?: string;
  categories: NavigationCategory[];
  showSidebar?: boolean;
  showTabs?: boolean;
  headerRight?: React.ReactNode;
  children?: React.ReactNode;
};

export const ParametresLayout: React.FC<ParametresLayoutProps> = ({
  title = "Configuration",
  description = "Paramètres généraux du système",
  categories,
  showSidebar = true,
  showTabs = true,
  headerRight,
  children,
}) => {
  const location = useLocation();
  const pathname = location.pathname;
  const { canView } = usePermissions();
  const userRoles: string[] = [];

  const filteredCategories = categories.map(cat => ({
    ...cat,
    items: cat.items.filter(item => {
      if (!item.roles || item.roles.length === 0) return true;
      return item.roles.some(role => userRoles.includes(role));
    })
  })).filter(cat => cat.items.length > 0);

  let activeCategory = filteredCategories[0]?.id;
  let activeItem = '';

  for (const cat of filteredCategories) {
    for (const item of cat.items) {
      if (pathname === item.path || pathname.startsWith(item.path + '/')) {
        activeCategory = cat.id;
        activeItem = item.id;
        break;
      }
    }
  }

  const currentCategory = filteredCategories.find(c => c.id === activeCategory) || filteredCategories[0];

  return (
    <div className="animate-fade-in-up flex flex-col min-h-full gap-4 pb-10">

      {/* ── Top Header & Category Tabs (Separated Top Block) ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Title row */}
        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800/80 bg-gray-50/40 dark:bg-slate-800/30">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0 bg-gradient-to-tr from-teal-600 to-orange-500">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{title}</h1>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 font-medium">{description}</p>
            </div>
          </div>
          {headerRight && <div className="shrink-0">{headerRight}</div>}
        </div>

        {/* Horizontal Category Tabs Bar (Supports unlimited tabs with smooth horizontal scroll) */}
        {showTabs && (
          <div className="px-4 py-2.5 bg-white dark:bg-slate-900 overflow-x-auto custom-scrollbar flex items-center gap-2">
            {filteredCategories.map(cat => {
              const isActive = activeCategory === cat.id;
              return (
                <Link
                  key={cat.id}
                  to={cat.items[0]?.path}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all duration-200 whitespace-nowrap rounded-xl shrink-0 ${
                    isActive 
                      ? 'bg-primary text-white shadow-xs font-bold' 
                      : 'text-gray-600 dark:text-slate-300 hover:text-primary hover:bg-gray-100/70 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-gray-400'}>
                    {cat.icon}
                  </span>
                  {cat.label.toUpperCase()}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Bottom Content Card Block (Separated Bottom Block) ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col lg:flex-row flex-1">

        {/* ── Left vertical sidebar ── */}
        {showSidebar && (
          <aside className="w-full lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-900/40">
            <div className="p-3.5">
              {/* Sidebar accent header */}
              <div className="px-3 py-2 mb-2.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/30 flex items-center gap-2">
                <div className="w-4 h-4 rounded text-primary flex items-center justify-center">
                  {currentCategory?.icon || <Settings className="w-3.5 h-3.5" />}
                </div>
                <p className="text-[11px] font-black uppercase tracking-wider text-primary">
                  {currentCategory?.label}
                </p>
              </div>

              <nav className="space-y-1">
                {currentCategory?.items.map(item => {
                  const isActive = activeItem === item.id || pathname === item.path || pathname.startsWith(item.path + '/');
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                        isActive
                          ? 'bg-primary text-white shadow-xs'
                          : 'text-gray-600 dark:text-slate-300 hover:text-primary hover:bg-gray-100/80 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span className={`shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary'}`}>
                        {item.icon}
                      </span>
                      <span className="truncate flex-1">{item.label}</span>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-80" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>
        )}

        {/* ── Main content area ── */}
        <div className="flex-1 min-w-0 p-5 md:p-6">
          {!canView(pathname) ? <Unauthorized /> : (children ?? <Outlet />)}
        </div>
      </div>

    </div>
  );
};
