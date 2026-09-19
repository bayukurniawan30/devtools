import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function TimestampConverter() {
  const [now, setNow] = useState(Date.now())
  const [unix, setUnix] = useState(String(Math.floor(Date.now() / 1000)))
  const [iso, setIso] = useState(new Date().toISOString())
  const [error, setError] = useState('')

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const fromUnix = () => {
    setError('')
    const n = Number(unix.trim())
    if (!Number.isFinite(n)) {
      setError('Unix timestamp must be a number (seconds or ms).')
      return
    }
    // Heuristic: >= 1e12 means millis, else seconds
    const ms = Math.abs(n) >= 1e12 ? n : n * 1000
    const d = new Date(ms)
    if (isNaN(d.getTime())) {
      setError('Invalid timestamp.')
      return
    }
    setIso(d.toISOString())
  }

  const fromIso = () => {
    setError('')
    const d = new Date(iso)
    if (isNaN(d.getTime())) {
      setError('Invalid date — try ISO like 2026-09-19T12:00:00Z or any Date-parseable string.')
      return
    }
    setUnix(String(Math.floor(d.getTime() / 1000)))
  }

  const parsed = (() => {
    const d = new Date(iso)
    return isNaN(d.getTime()) ? null : d
  })()

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Now</CardTitle></CardHeader>
        <CardContent className="space-y-1 font-mono text-sm">
          <p>ms: {now}</p>
          <p>s: {Math.floor(now / 1000)}</p>
          <p>ISO: {new Date(now).toISOString()}</p>
          <Button variant="outline" size="sm" onClick={() => {
            setUnix(String(Math.floor(Date.now() / 1000)))
            setIso(new Date().toISOString())
          }}>
            Use current time
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Unix ⇄ Date</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Unix timestamp (s or ms)</Label>
            <div className="flex gap-2">
              <Input value={unix} onChange={(e) => setUnix(e.target.value)} className="font-mono" />
              <Button onClick={fromUnix}>→ Date</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>ISO / date string</Label>
            <div className="flex gap-2">
              <Input value={iso} onChange={(e) => setIso(e.target.value)} className="font-mono" />
              <Button variant="secondary" onClick={fromIso}>→ Unix</Button>
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {parsed && (
            <div className="space-y-1 rounded-md bg-muted p-3 font-mono text-xs">
              <p>Local: {parsed.toString()}</p>
              <p>UTC: {parsed.toUTCString()}</p>
              <p>ISO: {parsed.toISOString()}</p>
              <p>Unix (s): {Math.floor(parsed.getTime() / 1000)}</p>
              <p>Unix (ms): {parsed.getTime()}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
