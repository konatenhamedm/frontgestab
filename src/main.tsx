import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import './lib/i18n'
import { Toaster } from 'sonner'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { AuthProvider } from './application/contexts/AuthContext'
import { PermissionProvider } from './application/contexts/PermissionContext'
import { SessionExpireeModal } from './presentation/components/shared/SessionExpireeModal'

// Create a new router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PermissionProvider>
          <RouterProvider router={router} />
          <SessionExpireeModal />
          <Toaster position="top-right" richColors closeButton />
        </PermissionProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
