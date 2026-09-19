import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, RefreshCw } from 'lucide-react'

function randomPassword(length: number, opts: { upper: boolean; lower: boolean; digits: boolean; symbols: boolean }) {
  const sets = [
    opts.upper ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : '',
    opts.lower ? 'abcdefghijkmnpqrstuvwxyz' : '',
    opts.digits ? '23456789' : '',
    opts.symbols ? '!@#$%^&*()-_=+[]{};:,.?' : '',
  ].join('')
  const pool = sets || 'abcdefghijklmnopqrstuvwxyz'
  const buf = new Uint32Array(length)
  crypto.getRandomValues(buf)
  return Array.from(buf, (n) => pool[n % pool.length]).join('')
}

export function PasswordGenerator() {
  const [length, setLength] = useState(20)
  const [upper, setUpper] = useState(true)
  const [lower, setLower] = useState(true)
  const [digits, setDigits] = useState(true)
  const [symbols, setSymbols] = useState(true)
  const [value, setValue] = useState(() => randomPassword(20, { upper: true, lower: true, digits: true, symbols: true }))

  const regen = () => setValue(randomPassword(length, { upper, lower, digits, symbols }))

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Password Generator</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={value} readOnly className="font-mono" />
            <Button size="icon" variant="outline" onClick={() => navigator.clipboard.writeText(value)} title="Copy">
              <Copy />
            </Button>
            <Button size="icon" onClick={regen} title="Regenerate"><RefreshCw /></Button>
          </div>
          <div className="flex items-center gap-4">
            <Label>Length: {length}</Label>
            <input type="range" min={8} max={64} value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-48" />
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            {([['upper', upper, setUpper, 'A-Z'], ['lower', lower, setLower, 'a-z'], ['digits', digits, setDigits, '0-9'], ['symbols', symbols, setSymbols, '#$!']] as const).map(([k, v, set, label]) => (
              <label key={k} className="flex items-center gap-2">
                <input type="checkbox" checked={v} onChange={(e) => set(e.target.checked)} /> {label}
              </label>
            ))}
          </div>
          <Button onClick={regen}>Generate</Button>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">100% client-side — uses crypto.getRandomValues, nothing leaves your browser.</p>
    </div>
  )
}
