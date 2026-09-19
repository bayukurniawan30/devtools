import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, RefreshCw } from 'lucide-react'

export function UuidGenerator() {
  const [count, setCount] = useState(5)
  const [ids, setIds] = useState<string[]>(() =>
    Array.from({ length: 5 }, () => crypto.randomUUID()),
  )

  const regen = () =>
    setIds(Array.from({ length: Math.min(Math.max(count, 1), 100) }, () => crypto.randomUUID()))

  const copyAll = () => navigator.clipboard.writeText(ids.join('\n'))

  return (
    <Card>
      <CardHeader><CardTitle>UUID Generator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Label>Count (1–100)</Label>
          <Input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-24"
          />
          <Button onClick={regen}><RefreshCw /> Generate</Button>
          <Button variant="outline" onClick={copyAll}><Copy /> Copy all</Button>
        </div>
        <ul className="space-y-1">
          {ids.map((id) => (
            <li
              key={id}
              className="flex cursor-pointer items-center justify-between rounded-md bg-muted px-3 py-1.5 font-mono text-xs hover:bg-muted/70"
              onClick={() => navigator.clipboard.writeText(id)}
              title="Click to copy"
            >
              {id}
              <Copy size={12} className="shrink-0 opacity-50" />
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">UUID v4 via crypto.randomUUID — click any row to copy.</p>
      </CardContent>
    </Card>
  )
}
