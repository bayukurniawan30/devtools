import { useState } from 'react'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

export function UrlEncoder() {
  const [input, setInput] = useState('https://example.com/?q=hello world&lang=id')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const run = (mode: 'encode' | 'decode' | 'component-encode') => {
    setError('')
    try {
      if (mode === 'encode') setOutput(encodeURI(input))
      else if (mode === 'component-encode') setOutput(encodeURIComponent(input))
      else setOutput(decodeURIComponent(input))
    } catch {
      setError('Invalid input for ' + mode)
      setOutput('')
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>URL Encoder / Decoder</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="https://… or encoded string" />
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => run('encode')}>encodeURI →</Button>
          <Button variant="secondary" onClick={() => run('component-encode')}>encodeURIComponent →</Button>
          <Button variant="outline" onClick={() => run('decode')}>← decode</Button>
          <Button variant="ghost" onClick={() => { setInput(''); setOutput('') }}>Clear</Button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Textarea value={output} readOnly placeholder="Output…" />
        {output && (
          <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(output)}>
            <Copy /> Copy output
          </Button>
        )}
        <p className="text-xs text-muted-foreground">
          encodeURI keeps :/?&amp;= intact (full URLs). encodeURIComponent escapes everything (query values).
        </p>
      </CardContent>
    </Card>
  )
}
