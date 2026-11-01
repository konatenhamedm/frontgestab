import { createRootRoute, Outlet } from '@tanstack/react-router'
import { LayoutProvider } from '../presentation/layouts/LayoutContext'
import { ErrorBoundary } from '../presentation/components/shared/ErrorBoundary'

export const Route = createRootRoute({
  component: () => (
    <ErrorBoundary>
      <LayoutProvider>
        <Outlet />
      </LayoutProvider>
    </ErrorBoundary>
  ),
})
