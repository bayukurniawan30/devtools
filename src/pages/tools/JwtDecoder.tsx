import { useMemo, useState } from 'react'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

function b64urlDecode(segment: string): string {
  let s = segment.replace(/-/g, '+').replace(/_/g, '/')
  const pad = s.length % 4
  if (pad) s += '='.repeat(4 - pad)
  const bin = atob(s)
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function b64urlEncodeBytes(bytes: Uint8Array): string {
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fmtTime(num: number | undefined): string {
  if (typeof num !== 'number' || !Number.isFinite(num)) return '—'
  const d = new Date(num * 1000)
  return isNaN(d.getTime()) ? '—' : `${d.toISOString()}  (${d.toString()})`
}

async function verifyHs(token: string, secret: string, alg: string): Promise<boolean | null> {
  const hashMap: Record<string, string> = { HS256: 'SHA-256', HS384: 'SHA-384', HS512: 'SHA-512' }
  const hash = hashMap[alg]
  if (!hash) return null // unsupported alg for local verify
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash },
      false,
      ['sign'],
    )
    const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, data))
    return b64urlEncodeBytes(sig) === parts[2]
  } catch {
    return null
  }
}

const SAMPLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjQ3MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

export function JwtDecoder() {
  const [token, setToken] = useState(SAMPLE)
  const [secret, setSecret] = useState('')
  const [verifyResult, setVerifyResult] = useState<boolean | null | 'idle'>('idle')
  const [verifying, setVerifying] = useState(false)

  const parsed = useMemo(() => {
    const t = token.trim()
    if (!t) return { error: 'Paste a JWT.' }
    const parts = t.split('.')
    if (parts.length !== 3) return { error: 'Invalid JWT — expected 3 parts separated by dots.' }
    try {
      const header = JSON.parse(b64urlDecode(parts[0]))
      const payload = JSON.parse(b64urlDecode(parts[1]))
      return { header, payload, signature: parts[2], error: null as string | null }
    } catch {
      return { error: 'Invalid JWT — header/payload are not valid base64url JSON.' }
    }
  }, [token])

  const exp = (parsed as { payload?: Record<string, unknown> }).payload?.exp as number | undefined
  const expState = useMemo(() => {
    if (typeof exp !== 'number') return null
    const now = Math.floor(Date.now() / 1000)
    if (exp < now) return { label: 'expired', ok: false }
    return { label: 'valid', ok: true }
  }, [exp])

  const runVerify = async () => {
    if (!('header' in parsed) || !parsed.header) return
    const alg = (parsed.header as Record<string, unknown>).alg as string
    if (!secret) {
      setVerifyResult(null)
      return
    }
    setVerifying(true)
    const r = await verifyHs(token.trim(), secret, alg)
    setVerifyResult(r)
    setVerifying(false)
  }

  const pretty = (o: unknown) => JSON.stringify(o, null, 2)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>JWT Decoder</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={token}
            onChange={(e) => { setToken(e.target.value); setVerifyResult('idle') }}
            className="min-h-[96px] break-all"
            placeholder="eyJhbGciOi…"
          />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setToken(SAMPLE)}>Load sample</Button>
            <Button variant="ghost" size="sm" onClick={() => { setToken(''); setVerifyResult('idle') }}>Clear</Button>
            <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(token)}><Copy /> Copy token</Button>
          </div>
          {parsed.error && <p className="text-sm text-red-600">{parsed.error}</p>}
        </CardContent>
      </Card>

      {!parsed.error && 'payload' in parsed && (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Header</CardTitle></CardHeader>
              <CardContent>
                <pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-xs">{pretty(parsed.header)}</pre>
                <Button variant="ghost" size="sm" className="mt-1" onClick={() => navigator.clipboard.writeText(pretty(parsed.header))}><Copy /> Copy</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  Payload
                  {expState && (
                    <Badge variant={expState.ok ? 'default' : 'secondary'}>{expState.label}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-xs">{pretty(parsed.payload)}</pre>
                <Button variant="ghost" size="sm" className="mt-1" onClick={() => navigator.clipboard.writeText(pretty(parsed.payload))}><Copy /> Copy</Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Claims</CardTitle></CardHeader>
            <CardContent className="grid gap-2 font-mono text-xs sm:grid-cols-3">
              <div className="rounded-md bg-muted p-2"><p className="font-sans font-semibold">exp</p>{fmtTime((parsed.payload as Record<string, number>).exp)}</div>
              <div className="rounded-md bg-muted p-2"><p className="font-sans font-semibold">iat</p>{fmtTime((parsed.payload as Record<string, number>).iat)}</div>
              <div className="rounded-md bg-muted p-2"><p className="font-sans font-semibold">nbf</p>{fmtTime((parsed.payload as Record<string, number>).nbf)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Signature</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="break-all font-mono text-xs text-muted-foreground">{parsed.signature}</p>
              <p className="text-xs text-muted-foreground">
                alg = <b className="font-mono">{String((parsed.header as Record<string, unknown>).alg ?? '—')}</b>.
                Decoding never verifies. To verify HS256/384/512 locally, enter the secret:
              </p>
              <div className="flex flex-wrap gap-2">
                <div className="min-w-48 flex-1 space-y-1">
                  <Label>HMAC secret (never leaves browser)</Label>
                  <Input
                    type="password"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="your-256-bit-secret"
                    className="font-mono"
                  />
                </div>
                <Button onClick={runVerify} disabled={verifying} className="self-end">
                  {verifying ? 'Verifying…' : 'Verify signature'}
                </Button>
              </div>
              {verifyResult === true && <p className="text-sm font-semibold text-green-600">✓ Signature valid for this secret.</p>}
              {verifyResult === false && <p className="text-sm font-semibold text-red-600">✗ Signature does NOT match this secret.</p>}
              {verifyResult === null && <p className="text-sm text-muted-foreground">No result — RS/ES/EdDSA algs need a public key (not supported offline here); HS* needs a secret.</p>}
            </CardContent>
          </Card>
        </>
      )}
      <p className="text-xs text-muted-foreground">100% client-side. Tokens are decoded locally — never paste production secrets into any online tool.</p>
    </div>
  )
}
