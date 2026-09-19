import { useMemo, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full, 16)
  if (isNaN(n)) return `rgba(0,0,0,${alpha})`
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`
}

export function BoxShadowGenerator() {
  const [x, setX] = useState(0)
  const [y, setY] = useState(8)
  const [blur, setBlur] = useState(24)
  const [spread, setSpread] = useState(0)
  const [color, setColor] = useState('#000000')
  const [boxColor, setBoxColor] = useState('#ffffff')
  const [opacity, setOpacity] = useState(0.18)
  const [inset, setInset] = useState(false)

  const css = useMemo(
    () => `${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px ${hexToRgba(color, opacity)}`,
    [x, y, blur, spread, color, opacity, inset],
  )

  const num = (label: string, value: number, set: (n: number) => void, min: number, max: number) => (
    <div className="space-y-1">
      <Label>{label}: {value}px</Label>
      <div className="flex gap-2">
        <input type="range" min={min} max={max} value={value} onChange={(e) => set(Number(e.target.value))} className="flex-1" />
        <Input type="number" value={value} onChange={(e) => set(Number(e.target.value))} className="w-20 font-mono" />
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Box-shadow Generator</CardTitle></CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            {num('Offset X', x, setX, -100, 100)}
            {num('Offset Y', y, setY, -100, 100)}
            {num('Blur', blur, setBlur, 0, 150)}
            {num('Spread', spread, setSpread, -50, 50)}
            <div className="space-y-1">
              <Label>Opacity: {opacity.toFixed(2)}</Label>
              <input type="range" min={0} max={1} step={0.01} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Shadow color</Label>
                <HexColorPicker color={color} onChange={setColor} style={{ width: '100%', height: 120 }} />
                <Input value={color} onChange={(e) => setColor(e.target.value)} className="font-mono" />
              </div>
              <div className="space-y-1">
                <Label>Box color</Label>
                <HexColorPicker color={boxColor} onChange={setBoxColor} style={{ width: '100%', height: 120 }} />
                <Input value={boxColor} onChange={(e) => setBoxColor(e.target.value)} className="font-mono" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={inset} onChange={(e) => setInset(e.target.checked)} /> inset
            </label>
          </div>
          <div className="space-y-3">
            <Label>Preview</Label>
            <div className="flex h-56 items-center justify-center rounded-md border bg-[repeating-conic-gradient(#f3f4f6_0_25%,#fff_0_50%)] bg-[length:24px_24px]">
              <div className="h-24 w-40 rounded-lg" style={{ boxShadow: css, background: boxColor }} />
            </div>
            <div className="rounded-md bg-muted p-3 font-mono text-xs">box-shadow: {css};</div>
            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(`box-shadow: ${css};`)}>
              <Copy /> Copy CSS
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
