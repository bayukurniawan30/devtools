import { useState } from 'react'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

// Unicode-safe base64
const enc = (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s)))
const dec = (s: string) => new TextDecoder().decode(Uint8Array.from(atob(s.trim()), (c) => c.charCodeAt(0)))

export function Base64Tool() {
  const [input, setInput] = useState('hello devtools')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const run = (mode: 'encode' | 'decode') => {
    setError('')
    try {
      setOutput(mode === 'encode' ? enc(input) : dec(input))
    } catch {
      setError('Invalid input for ' + mode)
      setOutput('')
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Base64 Encode / Decode</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Input text or base64…" />
          <div className="flex gap-2">
            <Button onClick={() => run('encode')}>Encode →</Button>
            <Button variant="secondary" onClick={() => run('decode')}>← Decode</Button>
            <Button variant="outline" onClick={() => { setInput(''); setOutput('') }}>Clear</Button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Textarea value={output} readOnly placeholder="Output…" />
          {output && <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(output)}><Copy /> Copy output</Button>}
        </CardContent>
      </Card>
    </div>
  )
}
