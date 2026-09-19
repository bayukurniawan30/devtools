import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import { Layout } from '@/components/Layout'
import { Home } from '@/pages/Home'
import { ToolPage } from '@/pages/ToolPage'

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
})

const toolRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/t/$toolId',
  component: function ToolRoute() {
    const { toolId } = toolRoute.useParams()
    return <ToolPage toolId={toolId} />
  },
})

const routeTree = rootRoute.addChildren([indexRoute, toolRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
