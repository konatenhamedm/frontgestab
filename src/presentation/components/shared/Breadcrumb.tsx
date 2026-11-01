import React from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { ChevronRight, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface RouteMeta {
  section?: string;
  title: string;
  parent?: { label: string; path: string };
}


/** Clé de catalogue dérivée d'un libellé français. Doit rester alignée sur la
 *  génération des clés `breadcrumb.*` dans les fichiers de traduction. */
const cleBreadcrumb = (texte: string) =>
  'breadcrumb.' + texte.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

const ROUTE_LABELS: Record<string, RouteMeta> = {
  '/demandes': { section: 'Demandes & sorties', title: 'Demandes de fournitures' },
  '/articles': { section: 'Stock', title: 'Articles' },
  '/alertes': { section: 'Stock', title: 'Alertes & réapprovisionnement' },
  '/mouvements': { section: 'Stock', title: 'Mouvements de stock' },
  '/fournisseurs': { section: 'Achats', title: 'Fournisseurs' },
  '/commandes': { section: 'Achats', title: 'Commandes fournisseurs' },
  '/receptions': { section: 'Achats', title: 'Réceptions & entrées de stock' },
  '/factures': { section: 'Finance', title: 'Factures & budget' },
  '/rapports': { section: 'Rapports', title: 'Analyse de consommation' },
  '/parametres/entreprise': { section: 'Administration', title: 'Mon entreprise' },
  '/parametres/centres': { section: 'Administration', title: 'Centres de gestion' },
  '/parametres/services': { section: 'Administration', title: 'Services' },
  '/parametres/utilisateurs': { section: 'Administration', title: 'Utilisateurs' },
  '/parametres/roles': { section: 'Administration', title: 'Rôles & permissions' },
  '/parametres/journal': { section: 'Administration', title: "Journal d'activité" },
  '/mot-de-passe': { section: 'Mon compte', title: 'Mot de passe' },
  '/plateforme': { section: 'Plateforme', title: 'Tableau de bord plateforme' },
  '/entreprises': { section: 'Plateforme', title: 'Entreprises & abonnements' },
}

export const Breadcrumb: React.FC = () => {
  const { t } = useTranslation();
  const tr = (txt?: string) => (txt ? t(cleBreadcrumb(txt), txt) : txt);
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  // Don't display breadcrumbs on home dashboard
  if (pathname === '/' || pathname === '') {
    return null;
  }

  // Look for direct match or segment match
  const matchedRoute = ROUTE_LABELS[pathname] || 
    Object.entries(ROUTE_LABELS).find(([path]) => pathname.startsWith(path))?.[1];


  const sectionName = matchedRoute?.section || 'Section';
  const pageTitle = matchedRoute?.title || pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'Page';

  return (
    <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3 px-1">
      <Link
        to="/"
        className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors py-1 px-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <Home className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
        <span>{tr('Accueil')}</span>
      </Link>

      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

      {matchedRoute?.parent ? (
        <Link
          to={matchedRoute.parent.path}
          className="font-semibold text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors px-1.5 py-0.5 rounded bg-slate-100/80 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 hover:bg-slate-200"
        >
          {tr(matchedRoute.parent.label)}
        </Link>
      ) : (
        <span className="font-semibold text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded bg-slate-100/80 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
          {tr(sectionName)}
        </span>
      )}

      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

      <span className="font-bold text-teal-700 dark:text-teal-300 truncate max-w-[280px]">
        {tr(pageTitle)}
      </span>
    </nav>
  );
};
