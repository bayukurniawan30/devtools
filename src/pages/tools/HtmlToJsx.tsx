import { useState } from 'react'
import { Copy } from 'lucide-react'
import { htmlToJsx } from '@/lib/html-to-jsx'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const SAMPLE = `<section class="welcome" style="padding: 24px; background-color: #f4f4f5;">
  <!-- Your first component -->
  <h1>Hello, DevToolbox!</h1>
  <label for="name">Name</label>
  <input id="name" type="text" placeholder="Your name" />
</section>`

export function HtmlToJsx() {
  const [input, setInput] = useState(SAMPLE)
  const [wrap, setWrap] = useState(true)
  const [name, setName] = useState('MyComponent')
  const [output, setOutput] = useState('')
  const [warnings, setWarnings] = useState<string[]>([])
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const resetOutput = () => { setOutput(''); setWarnings([]); setError(''); setCopied(false) }
  const convert = () => {
    resetOutput()
    try {
      const result = htmlToJsx(input, wrap ? name.trim() : undefined)
      setOutput(result.code)
      setWarnings(result.warnings)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Conversion failed.')
    }
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setError('')
    } catch {
      setError('Could not copy. Select and copy the output manually.')
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>HTML → JSX Component</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Label className="flex items-center gap-2" htmlFor="jsx-wrap">
            <input id="jsx-wrap" type="checkbox" checked={wrap} onChange={(e) => { setWrap(e.target.checked); resetOutput() }} />
            Wrap in React component
          </Label>
          {wrap && <div className="flex items-center gap-2">
            <Label htmlFor="jsx-name">Component name</Label>
            <Input id="jsx-name" value={name} onChange={(e) => { setName(e.target.value); resetOutput() }} className="w-44" placeholder="MyComponent" />
          </div>}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="html-input">HTML input</Label>
            <Textarea id="html-input" value={input} onChange={(e) => { setInput(e.target.value); resetOutput() }} className="min-h-[320px] font-mono text-sm" spellCheck={false} placeholder="Paste HTML here…" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="jsx-output">{wrap ? 'React component' : 'JSX output'}</Label>
            <Textarea id="jsx-output" value={output} readOnly className="min-h-[320px] font-mono text-sm" spellCheck={false} placeholder="Converted JSX…" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={convert}>Convert →</Button>
          <Button variant="outline" onClick={() => { setInput(''); resetOutput() }}>Clear</Button>
          <Button variant="secondary" onClick={() => { setInput(SAMPLE); resetOutput() }}>Load example</Button>
          {output && <Button variant="outline" onClick={copy}><Copy /> {copied ? 'Copied!' : 'Copy output'}</Button>}
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {warnings.length > 0 && <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>}
        <p className="text-xs text-muted-foreground">Converts HTML fragments locally, including SVG and inline styles. Multiple roots use a fragment. HTML parsing may repair incomplete markup.</p>
      </CardContent>
    </Card>
  )
}
