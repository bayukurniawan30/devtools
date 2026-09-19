import { useMemo, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { Copy, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type GradType = 'linear' | 'radial' | 'conic'

interface Stop {
  id: number
  color: string
  pos: number
}

let nextId = 3

export function GradientGenerator() {
  const [type, setType] = useState<GradType>('linear')
  const [angle, setAngle] = useState(135)
  const [stops, setStops] = useState<Stop[]>([
    { id: 1, color: '#6366f1', pos: 0 },
    { id: 2, color: '#ec4899', pos: 100 },
  ])
  const [selected, setSelected] = useState(1)

  const css = useMemo(() => {
    const sorted = [...stops].sort((a, b) => a.pos - b.pos)
    const list = sorted.map((s) => `${s.color} ${Math.round(s.pos)}%`).join(', ')
    if (type === 'linear') return `linear-gradient(${angle}deg, ${list})`
    if (type === 'radial') return `radial-gradient(circle, ${list})`
    return `conic-gradient(from ${angle}deg, ${list})`
  }, [stops, type, angle])

  const patch = (id: number, p: Partial<Stop>) =>
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, ...p } : s)))

  const addStop = () => {
    if (stops.length >= 6) return
    const id = nextId++
    setStops((prev) => [...prev, { id, color: '#22c55e', pos: 50 }])
    setSelected(id)
  }

  const removeStop = () => {
    if (stops.length <= 2) return
    setStops((prev) => {
      const next = prev.filter((s) => s.id !== selected)
      setSelected(next[0].id)
      return next
    })
  }

  const current = stops.find((s) => s.id === selected) ?? stops[0]

  return (
    <Card>
      <CardHeader><CardTitle>Gradient Generator</CardTitle></CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex gap-1">
            {(['linear', 'radial', 'conic'] as GradType[]).map((t) => (
              <Button key={t} size="sm" variant={type === t ? 'default' : 'outline'} onClick={() => setType(t)}>
                {t}
              </Button>
            ))}
          </div>
          {type !== 'radial' && (
            <div className="space-y-1">
              <Label>Angle: {angle}°</Label>
              <input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full" />
            </div>
          )}
          <div className="space-y-2">
            <Label>Color stops ({stops.length}/6)</Label>
            {[...stops].sort((a, b) => a.pos - b.pos).map((s) => (
              <div
                key={s.id}
                onClick={() => setSelected(s.id)}
                className={`flex cursor-pointer items-center gap-2 rounded-md border p-2 ${s.id === selected ? 'border-primary' : ''}`}
              >
                <span className="h-6 w-6 rounded border" style={{ background: s.color }} />
                <span className="font-mono text-xs">{s.color} · {Math.round(s.pos)}%</span>
              </div>
            ))}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={addStop} disabled={stops.length >= 6}><Plus /> Add</Button>
              <Button variant="ghost" size="sm" onClick={removeStop} disabled={stops.length <= 2}><Trash2 /> Remove</Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1">
              <Label>Selected stop color</Label>
              <HexColorPicker color={current.color} onChange={(c) => patch(current.id, { color: c })} style={{ width: 160, height: 130 }} />
            </div>
            <div className="min-w-36 flex-1 space-y-1">
              <Label>Position: {Math.round(current.pos)}%</Label>
              <input type="range" min={0} max={100} value={current.pos} onChange={(e) => patch(current.id, { pos: Number(e.target.value) })} className="w-full" />
              <Input value={current.color} onChange={(e) => patch(current.id, { color: e.target.value })} className="font-mono" />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <Label>Preview</Label>
          <div className="h-56 rounded-md border" style={{ background: css }} />
          <div className="rounded-md bg-muted p-3 font-mono text-xs">background: {css};</div>
          <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(`background: ${css};`)}>
            <Copy /> Copy CSS
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
