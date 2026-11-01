import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { MainLayout } from '@/presentation/layouts/MainLayout'
import { PermissionGuard } from '@/presentation/components/shared/PermissionGuard'
import { session } from '@/lib/sessionStorage'
import type { SessionUser } from '@/types'

export const Route = createFileRoute('/_dashboard')({
  beforeLoad: ({ location }) => {
    if (!session.getToken()) {
      throw redirect({ to: '/login' })
    }
    const user = session.getUser<SessionUser>()
    if (user?.must_change_password && location.pathname !== '/mot-de-passe') {
      throw redirect({ to: '/mot-de-passe' })
    }
  },
  component: () => (
    <MainLayout>
      <PermissionGuard>
        <Outlet />
      </PermissionGuard>
    </MainLayout>
  ),
})
