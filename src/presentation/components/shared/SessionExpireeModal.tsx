import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import { onSessionExpiree } from '../../../lib/sessionExpiree';

/**
 * Affichée quand le serveur refuse le jeton de session.
 *
 * L'utilisateur n'est pas renvoyé de force sur la page de connexion : il garde
 * sa page sous les yeux et décide lui-même quand se reconnecter. La session
 * n'est nettoyée qu'au moment où il clique.
 */
export function SessionExpireeModal() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => onSessionExpiree(() => setVisible(true)), []);

  if (!visible) return null;

  const seReconnecter = () => {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      sessionStorage.removeItem('session_workspace_confirmed');
    } catch {
      // Un navigateur qui refuse le stockage ne doit pas empêcher la redirection.
    }
    // On revient sur la page quittée après la reconnexion.
    const retour = window.location.pathname + window.location.search;
    const suffixe = retour && retour !== '/' ? `?retour=${encodeURIComponent(retour)}` : '';
    window.location.href = `/login${suffixe}`;
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-expiree-titre"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"
    >
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-800 shadow-2xl px-8 py-10 text-center">
        <span className="mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-full border-[3px] border-amber-400">
          <AlertCircle className="h-12 w-12 text-amber-400" strokeWidth={2.5} />
        </span>

        <h2
          id="session-expiree-titre"
          className="text-2xl font-black text-slate-700 dark:text-slate-100"
        >
          {t('session.expiree_titre', 'Session expirée')}
        </h2>

        <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-300">
          {t('session.expiree_message', 'Votre session a expiré. Veuillez vous reconnecter.')}
        </p>

        <button
          type="button"
          autoFocus
          onClick={seReconnecter}
          className="mt-8 rounded-xl bg-[#d4674f] px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-[#c25a43] focus:outline-none focus:ring-2 focus:ring-[#d4674f]/50"
        >
          {t('session.se_reconnecter', 'Se reconnecter')}
        </button>
      </div>
    </div>
  );
}
