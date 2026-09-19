import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

export function JsonFormatter() {
  const [input, setInput] = useState('{"hello":"devtools","items":[1,2,3]}')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const format = (spaces: number | null) => {
    try {
      const obj = JSON.parse(input)
      setOutput(spaces === null ? JSON.stringify(obj) : JSON.stringify(obj, null, spaces))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
      setOutput('')
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>JSON Formatter</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[160px]" />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => format(2)}>Format</Button>
            <Button variant="secondary" onClick={() => format(null)}>Minify</Button>
            <Button variant="outline" onClick={() => { setInput(''); setOutput(''); setError('') }}>Clear</Button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {output && <Textarea value={output} readOnly className="min-h-[160px]" />}
        </CardContent>
      </Card>
    </div>
  )
}
