import { useMemo, useState } from 'react'
import { diffLines } from 'diff'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

const A_SAMPLE = `function greet(name) {
  return "hello " + name;
}
const a = 1;`

const B_SAMPLE = `function greet(name) {
  return \`hello \${name}!\`;
}
const a = 2;
const b = 3;`

export function DiffChecker() {
  const [a, setA] = useState(A_SAMPLE)
  const [b, setB] = useState(B_SAMPLE)
  const [ignoreWs, setIgnoreWs] = useState(false)

  const parts = useMemo(
    () => diffLines(a, b, { ignoreWhitespace: ignoreWs }),
    [a, b, ignoreWs],
  )

  const stats = useMemo(() => {
    let added = 0, removed = 0
    parts.forEach((p) => {
      const n = (p.value.match(/\n/g) || []).length + (p.value.endsWith('\n') ? 0 : 1)
      if (p.added) added += p.value === '' ? 0 : n
      if (p.removed) removed += p.value === '' ? 0 : n
    })
    return { added, removed, changed: added > 0 || removed > 0 }
  }, [parts])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2">
            Diff Checker
            {stats.changed ? (
              <span className="flex gap-1">
                <Badge variant="secondary">-{stats.removed}</Badge>
                <Badge>+{stats.added}</Badge>
              </span>
            ) : (
              <Badge>identical</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Original (A)</Label>
              <Textarea value={a} onChange={(e) => setA(e.target.value)} className="min-h-[180px]" />
            </div>
            <div className="space-y-1">
              <Label>Modified (B)</Label>
              <Textarea value={b} onChange={(e) => setB(e.target.value)} className="min-h-[180px]" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => { setA(b); setB(a) }}>⇄ Swap</Button>
            <Button variant="ghost" size="sm" onClick={() => { setA(A_SAMPLE); setB(B_SAMPLE) }}>Load sample</Button>
            <Button variant="ghost" size="sm" onClick={() => { setA(''); setB('') }}>Clear</Button>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={ignoreWs} onChange={(e) => setIgnoreWs(e.target.checked)} />
              Ignore whitespace
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Unified diff (line-based)</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-md border font-mono text-xs">
            {parts.map((p, i) => {
              const cls = p.added
                ? 'bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-200'
                : p.removed
                  ? 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200'
                  : 'bg-background text-muted-foreground'
              const prefix = p.added ? '+' : p.removed ? '-' : ' '
              return (
                <div key={i} className={cls}>
                  {p.value.split('\n').flatMap((line, j, arr) =>
                    j === arr.length - 1 && line === '' ? [] : (
                      <div key={j} className="whitespace-pre-wrap break-all px-3 py-0.5">
                        {prefix} {line}
                      </div>
                    ),
                  )}
                </div>
              )
            })}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Line-based diff via the <code className="font-mono">diff</code> package — pure JS, runs locally.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
