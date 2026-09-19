import { useState } from 'react'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

function parseBig(v: string, radix: number): bigint | null {
  const s = v.trim().replace(/^(0[xX]|0[oO]|0[bB])/, '')
  if (s === '' || s === '-' || s === '+') return null
  const re = radix === 10 ? /^[+-]?\d+$/ : radix === 16 ? /^[+-]?[0-9a-fA-F]+$/ : radix === 8 ? /^[+-]?[0-7]+$/ : /^[+-]?[01]+$/
  if (!re.test(s)) return null
  try {
    const neg = s.startsWith('-')
    const digits = s.replace(/^[+-]/, '')
    const prefix = radix === 16 ? '0x' : radix === 8 ? '0o' : radix === 2 ? '0b' : ''
    const n = BigInt(prefix + digits)
    return neg ? -n : n
  } catch {
    return null
  }
}

export function NumberBaseConverter() {
  const [dec, setDec] = useState('255')
  const [hex, setHex] = useState('ff')
  const [oct, setOct] = useState('377')
  const [bin, setBin] = useState('11111111')
  const [error, setError] = useState('')
  const [text, setText] = useState('Hi!')

  const sync = (n: bigint) => {
    const neg = n < 0n
    const abs = neg ? -n : n
    const sign = neg ? '-' : ''
    setDec(n.toString())
    setHex(sign + abs.toString(16).toUpperCase())
    setOct(sign + abs.toString(8))
    setBin(sign + abs.toString(2))
    setError('')
  }

  const onEdit = (v: string, radix: number, set: (s: string) => void) => {
    set(v)
    if (v.trim() === '') {
      setError('')
      return
    }
    const n = parseBig(v, radix)
    if (n === null) {
      setError(`Invalid ${radix === 10 ? 'decimal' : radix === 16 ? 'hex' : radix === 8 ? 'octal' : 'binary'} number`)
      return
    }
    sync(n)
  }

  const field = (label: string, value: string, radix: number, set: (s: string) => void, mono = 'DEADBEEF') => (
    <div className="space-y-1">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input value={value} onChange={(e) => onEdit(e.target.value, radix, set)} className="font-mono" placeholder={mono} />
        <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(value)} title={`Copy ${label}`}>
          <Copy />
        </Button>
      </div>
    </div>
  )

  const textToHex = () => [...new TextEncoder().encode(text)].map((b) => b.toString(16).padStart(2, '0')).join(' ').toUpperCase()

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Number Base Converter</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {field('Decimal', dec, 10, setDec, '255')}
            {field('Hexadecimal', hex, 16, setHex, 'FF')}
            {field('Octal', oct, 8, setOct, '377')}
            {field('Binary', bin, 2, setBin, '11111111')}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <p className="text-xs text-muted-foreground">Arbitrary precision via BigInt — prefixes like 0x/0o/0b accepted, negatives allowed.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Text ⇄ Hex</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type text…" />
          <div className="rounded-md bg-muted p-3 font-mono text-xs break-all">{textToHex() || '—'}</div>
          <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(textToHex())}>
            <Copy /> Copy hex
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
