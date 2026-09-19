import { useMemo, useState } from 'react'
import { ArrowLeftRight, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LinearCategory {
  kind: 'linear'
  label: string
  units: { id: string; label: string; toBase: number }[]
}

interface TempCategory {
  kind: 'temp'
  label: string
  units: { id: string; label: string }[]
}

type Category = LinearCategory | TempCategory

const CATEGORIES: Record<string, Category> = {
  length: {
    kind: 'linear',
    label: 'Length / Distance',
    units: [
      { id: 'km', label: 'Kilometers (km)', toBase: 1000 },
      { id: 'm', label: 'Meters (m)', toBase: 1 },
      { id: 'cm', label: 'Centimeters (cm)', toBase: 0.01 },
      { id: 'mm', label: 'Millimeters (mm)', toBase: 0.001 },
      { id: 'mi', label: 'Miles (mi)', toBase: 1609.344 },
      { id: 'yd', label: 'Yards (yd)', toBase: 0.9144 },
      { id: 'ft', label: 'Feet (ft)', toBase: 0.3048 },
      { id: 'in', label: 'Inches (in)', toBase: 0.0254 },
      { id: 'nmi', label: 'Nautical miles (nmi)', toBase: 1852 },
    ],
  },
  weight: {
    kind: 'linear',
    label: 'Weight / Mass',
    units: [
      { id: 't', label: 'Tonnes (t)', toBase: 1000 },
      { id: 'kg', label: 'Kilograms (kg)', toBase: 1 },
      { id: 'g', label: 'Grams (g)', toBase: 0.001 },
      { id: 'mg', label: 'Milligrams (mg)', toBase: 1e-6 },
      { id: 'lb', label: 'Pounds (lb)', toBase: 0.45359237 },
      { id: 'oz', label: 'Ounces (oz)', toBase: 0.028349523125 },
      { id: 'st', label: 'Stones (st)', toBase: 6.35029318 },
    ],
  },
  temp: {
    kind: 'temp',
    label: 'Temperature',
    units: [
      { id: 'C', label: 'Celsius (°C)' },
      { id: 'F', label: 'Fahrenheit (°F)' },
      { id: 'K', label: 'Kelvin (K)' },
    ],
  },
  data: {
    kind: 'linear',
    label: 'Data storage',
    units: [
      { id: 'bit', label: 'Bits (bit)', toBase: 0.125 },
      { id: 'B', label: 'Bytes (B)', toBase: 1 },
      { id: 'KB', label: 'Kilobytes (KB)', toBase: 1000 },
      { id: 'MB', label: 'Megabytes (MB)', toBase: 1e6 },
      { id: 'GB', label: 'Gigabytes (GB)', toBase: 1e9 },
      { id: 'TB', label: 'Terabytes (TB)', toBase: 1e12 },
      { id: 'KiB', label: 'Kibibytes (KiB)', toBase: 1024 },
      { id: 'MiB', label: 'Mebibytes (MiB)', toBase: 1024 ** 2 },
      { id: 'GiB', label: 'Gibibytes (GiB)', toBase: 1024 ** 3 },
    ],
  },
  speed: {
    kind: 'linear',
    label: 'Speed',
    units: [
      { id: 'ms', label: 'Meters/sec (m/s)', toBase: 1 },
      { id: 'kmh', label: 'Kilometers/hour (km/h)', toBase: 1 / 3.6 },
      { id: 'mph', label: 'Miles/hour (mph)', toBase: 0.44704 },
      { id: 'fts', label: 'Feet/sec (ft/s)', toBase: 0.3048 },
      { id: 'kn', label: 'Knots (kn)', toBase: 0.514444 },
    ],
  },
}

const toCelsius = (v: number, from: string) =>
  from === 'C' ? v : from === 'F' ? ((v - 32) * 5) / 9 : v - 273.15
const fromCelsius = (v: number, to: string) =>
  to === 'C' ? v : to === 'F' ? (v * 9) / 5 + 32 : v + 273.15

function fmt(n: number): string {
  if (!Number.isFinite(n)) return '—'
  if (n !== 0 && (Math.abs(n) >= 1e12 || Math.abs(n) < 1e-9)) return n.toExponential(6)
  return String(Number(n.toPrecision(10)))
}

const DEFAULTS: Record<string, [string, string]> = {
  length: ['km', 'm'],
  weight: ['kg', 'lb'],
  temp: ['C', 'F'],
  data: ['MB', 'MiB'],
  speed: ['kmh', 'ms'],
}

export function UnitConverter() {
  const [cat, setCat] = useState('length')
  const [amount, setAmount] = useState('1')
  const [from, setFrom] = useState('km')
  const [to, setTo] = useState('m')

  const switchCat = (c: string) => {
    setCat(c)
    const [f, t] = DEFAULTS[c]
    setFrom(f)
    setTo(t)
  }

  const result = useMemo(() => {
    const v = Number(amount)
    if (amount.trim() === '' || !Number.isFinite(v)) return null
    const c = CATEGORIES[cat]
    if (c.kind === 'temp') return fromCelsius(toCelsius(v, from), to)
    const f = c.units.find((u) => u.id === from)
    const t = c.units.find((u) => u.id === to)
    if (!f || !t) return null
    return (v * f.toBase) / t.toBase
  }, [amount, from, to, cat])

  const units = CATEGORIES[cat].units
  const swap = () => { setFrom(to); setTo(from) }

  const selectCls =
    'h-9 rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none'

  return (
    <Card>
      <CardHeader><CardTitle>Unit Converter</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-1">
          {Object.entries(CATEGORIES).map(([id, c]) => (
            <Button key={id} size="sm" variant={cat === id ? 'default' : 'outline'} onClick={() => switchCat(id)}>
              {c.label}
            </Button>
          ))}
        </div>

        <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <div className="space-y-1">
            <Label>From</Label>
            <select value={from} onChange={(e) => setFrom(e.target.value)} className={selectCls + ' w-full'}>
              {units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
            </select>
          </div>
          <Button variant="outline" size="icon" onClick={swap} title="Swap units" className="mx-auto">
            <ArrowLeftRight />
          </Button>
          <div className="space-y-1">
            <Label>To</Label>
            <select value={to} onChange={(e) => setTo(e.target.value)} className={selectCls + ' w-full'}>
              {units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <Label>Amount ({from})</Label>
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" className="font-mono" placeholder="1" />
        </div>

        <div className="rounded-md bg-muted p-4">
          {result === null ? (
            <p className="text-sm text-muted-foreground">Enter a valid number.</p>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-mono text-xl font-bold">{fmt(result)} <span className="text-sm font-normal text-muted-foreground">{to}</span></p>
              <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(fmt(result))}>
                <Copy /> Copy
              </Button>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Factors: 1 mi = 1.609344 km · 1 lb = 0.45359237 kg · data uses decimal SI (KB) + binary IEC (KiB).</p>
      </CardContent>
    </Card>
  )
}
