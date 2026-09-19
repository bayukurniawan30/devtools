import { useState } from 'react'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'
import { ArrowLeftRight, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const SAMPLE_JSON = `{
  "name": "devtoolbox",
  "private": true,
  "tags": ["dev", "static"],
  "limits": { "cpu": 2, "mem": "512Mi" }
}`

export function YamlConverter() {
  const [left, setLeft] = useState(SAMPLE_JSON)
  const [right, setRight] = useState('')
  const [dir, setDir] = useState<'j2y' | 'y2j'>('j2y')
  const [error, setError] = useState('')

  const convert = () => {
    setError('')
    try {
      if (dir === 'j2y') {
        setRight(stringifyYaml(JSON.parse(left)))
      } else {
        setRight(JSON.stringify(parseYaml(left), null, 2))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Conversion failed')
      setRight('')
    }
  }

  const flip = () => {
    setDir((d) => (d === 'j2y' ? 'y2j' : 'j2y'))
    setLeft(right || left)
    setRight('')
    setError('')
  }

  return (
    <Card>
      <CardHeader><CardTitle>JSON ⇄ YAML Converter</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Button size="sm" variant={dir === 'j2y' ? 'default' : 'outline'} onClick={() => setDir('j2y')}>JSON → YAML</Button>
          <Button size="icon" variant="ghost" onClick={flip} title="Swap direction"><ArrowLeftRight /></Button>
          <Button size="sm" variant={dir === 'y2j' ? 'default' : 'outline'} onClick={() => setDir('y2j')}>YAML → JSON</Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>{dir === 'j2y' ? 'JSON input' : 'YAML input'}</Label>
            <Textarea value={left} onChange={(e) => setLeft(e.target.value)} className="min-h-[240px]" />
          </div>
          <div className="space-y-1">
            <Label>{dir === 'j2y' ? 'YAML output' : 'JSON output'}</Label>
            <Textarea value={right} readOnly placeholder="Output…" className="min-h-[240px]" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={convert}>Convert →</Button>
          {right && (
            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(right)}>
              <Copy /> Copy output
            </Button>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </CardContent>
    </Card>
  )
}
