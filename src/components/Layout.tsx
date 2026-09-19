import { Link } from '@tanstack/react-router'
import { Wrench } from 'lucide-react'
import { tools, categories } from '@/tools/registry'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Wrench size={16} />
            </span>
            DevTools
          </Link>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="sticky top-20 space-y-4">
            {categories.map((cat) => (
              <div key={cat}>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{cat}</p>
                <ul className="space-y-0.5">
                  {tools
                    .filter((t) => t.category === cat)
                    .map((t) => (
                      <li key={t.id}>
                        <Link
                          to="/t/$toolId"
                          params={{ toolId: t.id }}
                          className="block rounded-md px-2 py-1 text-sm hover:bg-muted [&.active]:bg-muted [&.active]:font-medium"
                        >
                          {t.name}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
