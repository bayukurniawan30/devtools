import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { tools, categories } from '@/tools/registry'

export function Home() {
  const [q, setQ] = useState('')
  const filtered = tools.filter(
    (t) => t.name.toLowerCase().includes(q.toLowerCase()) || t.description.toLowerCase().includes(q.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Everyday dev tools, zero trust required</h1>
        <p className="text-sm text-muted-foreground">Free forever · no signup · no server. Everything runs locally — your data never leaves this page.</p>
        <Input placeholder="Search tools… (e.g. json, base64, password)" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-md" />
      </div>
      {categories.map((cat) => {
        const list = filtered.filter((t) => t.category === cat)
        if (!list.length) return null
        return (
          <div key={cat} className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{cat}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((t) => (
                <Link key={t.id} to="/t/$toolId" params={{ toolId: t.id }}>
                  <Card className="h-full transition-colors hover:border-primary">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-base">
                        {t.name}
                        {t.status === 'ready' ? <Badge>ready</Badge> : <Badge variant="secondary">soon</Badge>}
                      </CardTitle>
                      <CardDescription>{t.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <span className="text-xs text-muted-foreground">Open →</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
