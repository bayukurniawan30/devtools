import { useMemo, useState } from 'react'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const toInt = (ip: string): number | null => {
  const parts = ip.trim().split('.')
  if (parts.length !== 4) return null
  let n = 0
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null
    const o = Number(p)
    if (o > 255) return null
    n = n * 256 + o
  }
  return n >>> 0
}

const toIp = (n: number) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.')
const toBin = (n: number) => n.toString(2).padStart(32, '0').replace(/(.{8})/g, '$1 ').trim()

const isPrivate = (n: number) => {
  const b0 = (n >>> 24) & 255
  const b1 = (n >>> 16) & 255
  return b0 === 10 || (b0 === 172 && b1 >= 16 && b1 <= 31) || (b0 === 192 && b1 === 168)
}

export function SubnetCalculator() {
  const [input, setInput] = useState('192.168.1.10/24')

  const out = useMemo(() => {
    const m = input.trim().match(/^(.+?)\s*\/\s*(\d{1,2})$/)
    if (!m) return { error: 'Use CIDR form, e.g. 192.168.1.10/24' }
    const ip = toInt(m[1])
    const prefix = Number(m[2])
    if (ip === null) return { error: 'Invalid IPv4 address.' }
    if (prefix < 0 || prefix > 32) return { error: 'Prefix must be 0–32.' }

    const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0
    const network = (ip & mask) >>> 0
    const broadcast = (network | (~mask >>> 0)) >>> 0
    const total = 2 ** (32 - prefix)
    const usable = prefix >= 31 ? total : total - 2
    const first = prefix >= 31 ? network : network + 1
    const last = prefix >= 31 ? broadcast : broadcast - 1

    return {
      error: null as string | null,
      rows: [
        ['IP address', `${toIp(ip)} /${prefix}`],
        ['Network', `${toIp(network)} /${prefix}`],
        ['Broadcast', toIp(broadcast)],
        ['Subnet mask', toIp(mask)],
        ['Wildcard', toIp((~mask >>> 0))],
        ['Mask (binary)', toBin(mask)],
        ['Usable range', prefix === 32 ? toIp(network) : `${toIp(first)} – ${toIp(last)}`],
        ['Usable hosts', usable.toLocaleString()],
        ['Total addresses', total.toLocaleString()],
        ['IP class', (() => { const f = (ip >>> 24) & 255; return f < 128 ? 'A' : f < 192 ? 'B' : f < 224 ? 'C' : f < 240 ? 'D (multicast)' : 'E (reserved)' })()],
        ['Private?', isPrivate(ip) ? 'Yes (RFC 1918)' : 'No (public)'],
      ] as [string, string][],
    }
  }, [input])

  return (
    <Card>
      <CardHeader><CardTitle>Subnet / CIDR Calculator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-52 flex-1 space-y-1">
            <Label>IPv4 in CIDR notation</Label>
            <Input value={input} onChange={(e) => setInput(e.target.value)} className="font-mono" placeholder="10.0.0.1/16" />
          </div>
          <div className="flex gap-1">
            {[8, 16, 24].map((p) => (
              <Button
                key={p}
                size="sm"
                variant="outline"
                onClick={() => setInput((prev) => `${prev.split('/')[0].trim() || '192.168.1.10'}/${p}`)}
              >
                /{p}
              </Button>
            ))}
          </div>
        </div>
        {out.error ? (
          <p className="text-sm text-red-600">{out.error}</p>
        ) : (
          <>
            <div className="overflow-hidden rounded-md border font-mono text-xs">
              {out.rows!.map(([k, v], i) => (
                <div key={k} className={`flex cursor-pointer justify-between gap-4 px-3 py-1.5 hover:bg-muted ${i % 2 ? 'bg-muted/40' : ''}`} onClick={() => navigator.clipboard.writeText(v)} title="Click to copy">
                  <span className="font-sans text-muted-foreground">{k}</span>
                  <span className="break-all text-right">{v}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(out.rows!.map(([k, v]) => `${k}: ${v}`).join('\n'))}>
              <Copy /> Copy all
            </Button>
          </>
        )}
        <p className="text-xs text-muted-foreground">Pure 32-bit math, runs locally. Click any row to copy its value.</p>
      </CardContent>
    </Card>
  )
}
