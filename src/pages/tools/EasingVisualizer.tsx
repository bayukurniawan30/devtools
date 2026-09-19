import { useEffect, useRef, useState } from 'react'
import { Copy, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const PRESETS: { name: string; v: [number, number, number, number] }[] = [
  { name: 'linear', v: [0, 0, 1, 1] },
  { name: 'ease', v: [0.25, 0.1, 0.25, 1] },
  { name: 'ease-in', v: [0.42, 0, 1, 1] },
  { name: 'ease-out', v: [0, 0, 0.58, 1] },
  { name: 'ease-in-out', v: [0.42, 0, 0.58, 1] },
  { name: 'snap', v: [0.85, 0, 0.15, 1] },
  { name: 'bounce-ish', v: [0.34, 1.56, 0.64, 1] },
]

const W = 200, H = 160, PAD = 12
const px = (x: number) => PAD + x * (W - 2 * PAD)
const py = (y: number) => H - PAD - y * (H - 2 * PAD)

export function EasingVisualizer() {
  const [x1, setX1] = useState(0.25)
  const [y1, setY1] = useState(0.1)
  const [x2, setX2] = useState(0.25)
  const [y2, setY2] = useState(1)
  const [duration, setDuration] = useState(1.2)
  const [go, setGo] = useState(false)
  const [noAnim, setNoAnim] = useState(true)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const bez = `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`
  const d = `M ${px(0)} ${py(0)} C ${px(x1)} ${py(y1)}, ${px(x2)} ${py(y2)}, ${px(1)} ${py(1)}`

  const play = () => {
    if (timer.current) clearTimeout(timer.current)
    // Instant snap back (no transition), then animate forward on the next tick
    setNoAnim(true)
    setGo(false)
    timer.current = setTimeout(() => {
      setNoAnim(false)
      setGo(true)
    }, 80)
  }

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  useEffect(() => { play() }, [bez, duration]) // eslint-disable-line react-hooks/exhaustive-deps

  const clampX = (n: number) => Math.min(1, Math.max(0, n))

  const field = (label: string, value: number, set: (n: number) => void, clamp = false) => (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input
        type="number"
        step={0.01}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value)
          set(clamp ? clampX(n) : n)
        }}
        className="font-mono"
      />
    </div>
  )

  return (
    <Card>
      <CardHeader><CardTitle>Easing / Cubic-bezier Visualizer</CardTitle></CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {field('x1', x1, (n) => setX1(clampX(n)), true)}
            {field('y1', y1, setY1)}
            {field('x2', x2, (n) => setX2(clampX(n)), true)}
            {field('y2', y2, setY2)}
          </div>
          <div className="flex flex-wrap gap-1">
            {PRESETS.map((p) => (
              <Button
                key={p.name}
                size="sm"
                variant="outline"
                onClick={() => { setX1(p.v[0]); setY1(p.v[1]); setX2(p.v[2]); setY2(p.v[3]); }}
              >
                {p.name}
              </Button>
            ))}
          </div>
          <div className="space-y-1">
            <Label>Duration: {duration.toFixed(1)}s</Label>
            <input type="range" min={0.3} max={3} step={0.1} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full" />
          </div>
          <div className="rounded-md bg-muted p-3 font-mono text-xs">transition-timing-function: {bez};</div>
          <div className="flex gap-2">
            <Button size="sm" onClick={play}><Play /> Replay</Button>
            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(`transition: all ${duration}s ${bez};`)}>
              <Copy /> Copy CSS
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label>Curve</Label>
            <svg viewBox={`0 0 ${W} ${H}`} className="mt-1 w-full rounded-md border bg-muted/40">
              <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="currentColor" strokeOpacity={0.2} />
              <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="currentColor" strokeOpacity={0.2} />
              <line x1={px(0)} y1={py(0)} x2={px(x1)} y2={py(y1)} stroke="#ec4899" strokeDasharray="3 3" />
              <line x1={px(1)} y1={py(1)} x2={px(x2)} y2={py(y2)} stroke="#ec4899" strokeDasharray="3 3" />
              <path d={d} fill="none" stroke="#6366f1" strokeWidth={2.5} />
              <circle cx={px(x1)} cy={py(y1)} r={4} fill="#ec4899" />
              <circle cx={px(x2)} cy={py(y2)} r={4} fill="#ec4899" />
            </svg>
          </div>
          <div>
            <Label>Live preview</Label>
            <div className="relative mt-1 h-16 overflow-hidden rounded-md border bg-muted/40">
              <div
                className="absolute top-4 h-8 w-8 rounded-md bg-primary"
                style={{
                  left: go ? 'calc(100% - 40px)' : '8px',
                  transition: noAnim ? 'none' : `left ${duration}s ${bez}`,
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
