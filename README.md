# GESTAD — Frontend (React 19 + Vite + TanStack Router/Query + Tailwind v4)

Même arborescence que front-web : `src/{application,domain,lib,presentation,routes,types}`, routes fichiers `_dashboard.*`.

```bash
pnpm install
pnpm dev        # http://localhost:5173 — API par défaut : http://127.0.0.1:8010/api (VITE_API_URL)
pnpm build
```
Variables : `VITE_API_URL`, `VITE_APP_SECURITY_CODE` (doit égaler `APP_SECURITY_CODE` du backend),
`VITE_SHOW_DEMO_ACCOUNTS=false` pour masquer les comptes de démo sur la page de connexion.
