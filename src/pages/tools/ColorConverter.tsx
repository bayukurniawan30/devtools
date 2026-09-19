import { useMemo, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function normalizeHex(raw: string): string | null {
  let h = raw.trim().replace(/^#/, '')
  if (/^[0-9a-fA-F]{3}$/.test(h)) h = h.split('').map((c) => c + c).join('')
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null
  return '#' + h.toLowerCase()
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => Math.min(255, Math.max(0, Math.round(v))).toString(16).padStart(2, '0')).join('')
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, Math.round(l * 100)]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0))
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  return [Math.round(h * 60), Math.round(s * 100), Math.round(l * 100)]
}

// WCAG relative luminance + contrast ratio
function luminance(r: number, g: number, b: number): number {
  const f = (v: number) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

function contrast(hexA: string, hexB: string): number | null {
  const a = normalizeHex(hexA), b = normalizeHex(hexB)
  if (!a || !b) return null
  const [r1, g1, b1] = hexToRgb(a)
  const [r2, g2, b2] = hexToRgb(b)
  const l1 = luminance(r1, g1, b1), l2 = luminance(r2, g2, b2)
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

export function ColorConverter() {
  const [hexInput, setHexInput] = useState('#6366f1')
  const [fg, setFg] = useState('#ffffff')
  const [bg, setBg] = useState('#6366f1')

  const hex = normalizeHex(hexInput)
  const rgb = useMemo(() => (hex ? hexToRgb(hex) : null), [hex])
  const hsl = useMemo(() => (rgb ? rgbToHsl(...rgb) : null), [rgb])
  const ratio = useMemo(() => contrast(fg, bg), [fg, bg])

  const setRgb = (i: number, v: number) => {
    if (!rgb) return
    const next: [number, number, number] = [rgb[0], rgb[1], rgb[2]]
    next[i] = Math.min(255, Math.max(0, v || 0))
    setHexInput(rgbToHex(...next))
  }

  const copy = (s: string) => navigator.clipboard.writeText(s)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Color Converter</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1">
              <Label>Picker</Label>
              <HexColorPicker
                color={hex ?? '#000000'}
                onChange={setHexInput}
                style={{ width: 200, height: 160 }}
              />
            </div>
            <div className="min-w-40 flex-1 space-y-3">
              <div className="space-y-1">
                <Label>HEX</Label>
                <Input value={hexInput} onChange={(e) => setHexInput(e.target.value)} className="font-mono" />
              </div>
              {hex && (
                <div className="h-9 rounded-md border" style={{ background: hex }} title={hex} />
              )}
              {!hex && <p className="text-sm text-red-600">Invalid hex — use #rgb or #rrggbb.</p>}
            </div>
          </div>

          {rgb && hsl && hex && (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-md bg-muted p-3 font-mono text-xs">
                <p className="mb-1 font-sans font-semibold">RGB</p>
                <p>{`rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`}</p>
                <div className="mt-2 flex gap-1">
                  {rgb.map((v, i) => (
                    <Input
                      key={i}
                      type="number"
                      min={0}
                      max={255}
                      value={v}
                      onChange={(e) => setRgb(i, Number(e.target.value))}
                      className="font-mono"
                    />
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="mt-1" onClick={() => copy(`rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`)}><Copy /> Copy</Button>
              </div>
              <div className="rounded-md bg-muted p-3 font-mono text-xs">
                <p className="mb-1 font-sans font-semibold">HSL</p>
                <p>{`hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`}</p>
                <Button variant="ghost" size="sm" className="mt-1" onClick={() => copy(`hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`)}><Copy /> Copy</Button>
              </div>
              <div className="rounded-md bg-muted p-3 font-mono text-xs">
                <p className="mb-1 font-sans font-semibold">HEX</p>
                <p>{hex}</p>
                <Button variant="ghost" size="sm" className="mt-1" onClick={() => copy(hex)}><Copy /> Copy</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Contrast checker (WCAG)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1">
              <Label>Text</Label>
              <HexColorPicker
                color={normalizeHex(fg) ?? '#000000'}
                onChange={setFg}
                style={{ width: 160, height: 130 }}
              />
              <Input value={fg} onChange={(e) => setFg(e.target.value)} className="w-40 font-mono" />
            </div>
            <div className="space-y-1">
              <Label>Background</Label>
              <HexColorPicker
                color={normalizeHex(bg) ?? '#000000'}
                onChange={setBg}
                style={{ width: 160, height: 130 }}
              />
              <Input value={bg} onChange={(e) => setBg(e.target.value)} className="w-40 font-mono" />
            </div>
            {ratio !== null && (
              <div className="self-end rounded-md px-4 py-2 font-mono text-sm font-bold" style={{ color: fg, background: bg }}>
                Aa
              </div>
            )}
          </div>
          {ratio === null ? (
            <p className="text-sm text-red-600">Enter two valid hex colors.</p>
          ) : (
            <div className="space-y-1 text-sm">
              <p className="font-mono font-bold">Ratio: {ratio.toFixed(2)}:1</p>
              <p className={ratio >= 4.5 ? 'text-green-600' : 'text-red-600'}>
                {ratio >= 7 ? 'AAA pass (normal + large text)' : ratio >= 4.5 ? 'AA pass (AAA needs 7:1)' : 'Fail — needs 4.5:1 for normal text'}
              </p>
              <p className="text-xs text-muted-foreground">Large text needs 3:1 for AA.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
