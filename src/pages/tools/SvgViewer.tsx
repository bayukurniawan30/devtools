import { useMemo, useRef, useState } from 'react'
import { Copy, Download, Upload } from 'lucide-react'
import { prepareSvg } from '@/lib/svg-viewer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const SAMPLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <defs>
    <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#8b5cf6" />
    </linearGradient>
  </defs>
  <rect x="20" y="20" width="200" height="200" rx="48" fill="url(#gradient)" />
  <path d="M96 88 64 120 96 152 M144 88 176 120 144 152" fill="none" stroke="white" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
</svg>`

const backgrounds = {
  checker: {
    backgroundColor: '#ffffff',
    backgroundImage: 'linear-gradient(45deg, #e4e4e7 25%, transparent 25%), linear-gradient(-45deg, #e4e4e7 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e4e4e7 75%), linear-gradient(-45deg, transparent 75%, #e4e4e7 75%)',
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
  },
  light: { backgroundColor: '#ffffff' },
  dark: { backgroundColor: '#18181b' },
}

export function SvgViewer() {
  const [input, setInput] = useState(SAMPLE)
  const [filename, setFilename] = useState('image.svg')
  const [zoom, setZoom] = useState(100)
  const [background, setBackground] = useState<keyof typeof backgrounds>('checker')
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const revision = useRef(0)
  const result = useMemo(() => {
    if (!input.trim()) return { data: null, error: '' }
    try { return { data: prepareSvg(input), error: '' } }
    catch (e) { return { data: null, error: e instanceof Error ? e.message : 'Could not read SVG.' } }
  }, [input])

  const updateInput = (value: string, name = 'image.svg') => {
    revision.current++
    setInput(value)
    setFilename(name)
    setMessage('')
    setCopied(false)
  }
  const openFile = async (file: File) => {
    const current = ++revision.current
    try {
      const text = await file.text()
      if (current === revision.current) updateInput(text, file.name.replace(/\.[^.]+$/, '') + '.svg')
    } catch {
      if (current === revision.current) setMessage('Could not read the file. Try opening it again.')
    }
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(input)
      setCopied(true)
      setMessage('')
    } catch { setMessage('Could not copy. Select and copy the source manually.') }
  }
  const download = () => {
    if (!result.data) return
    const url = URL.createObjectURL(new Blob([result.data.svg], { type: 'image/svg+xml' }))
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <Card>
      <CardHeader><CardTitle>SVG Viewer</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <input ref={fileInput} type="file" accept=".svg,image/svg+xml" className="hidden" aria-label="Open SVG file" onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (file) void openFile(file)
          }} />
          <Button variant="outline" onClick={() => fileInput.current?.click()}><Upload /> Open SVG file</Button>
          <Button variant="secondary" onClick={() => { updateInput(SAMPLE); setZoom(100) }}>Load example</Button>
          <Button variant="outline" onClick={() => updateInput('')}>Clear</Button>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="svg-source">SVG source</Label>
            <Textarea id="svg-source" value={input} onChange={(e) => updateInput(e.target.value)} className="min-h-[380px] font-mono text-sm" spellCheck={false} placeholder={'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">…</svg>'} />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" disabled={!input.trim()} onClick={copy}><Copy /> {copied ? 'Copied!' : 'Copy SVG'}</Button>
              <Button variant="outline" size="sm" disabled={!result.data} onClick={download}><Download /> Download SVG</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Preview background">
              {(['checker', 'light', 'dark'] as const).map((value) => <Button key={value} size="sm" variant={background === value ? 'default' : 'outline'} aria-pressed={background === value} onClick={() => setBackground(value)}>{value === 'checker' ? 'Checkerboard' : value === 'light' ? 'Light' : 'Dark'}</Button>)}
            </div>
            <div className="h-[320px] overflow-auto rounded-md border" style={backgrounds[background]}>
              {result.data ? <div className="flex min-h-full min-w-full items-center justify-center p-4" style={{ width: `${zoom}%`, minHeight: zoom > 100 ? `${320 * zoom / 100}px` : undefined }}>
                <img key={result.data.imageUrl} src={result.data.imageUrl} alt="SVG preview" className="block" style={{ width: `${280 * zoom / 100}px`, height: `${280 * zoom / 100}px`, maxWidth: 'none', flexShrink: 0, objectFit: 'contain' }} onError={() => setMessage('The browser could not render this SVG. Check its dimensions and content.')} />
              </div> : <div className="flex h-full items-center justify-center p-4 text-center text-sm text-zinc-500">{result.error ? 'Fix the SVG markup to see a preview.' : 'Paste SVG markup or open a file to preview it.'}</div>}
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="svg-zoom" className="whitespace-nowrap">Zoom: {zoom}%</Label>
              <input id="svg-zoom" type="range" min="25" max="400" step="25" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="min-w-0 flex-1" />
              <Button size="sm" variant="ghost" onClick={() => setZoom(100)}>Reset</Button>
            </div>
            {result.data && <p className="break-all text-xs text-muted-foreground">Width: {result.data.width} · Height: {result.data.height} · viewBox: {result.data.viewBox}</p>}
          </div>
        </div>
        {(result.error || message) && <p role="alert" className="text-sm text-red-600">{result.error || message}</p>}
        <p className="text-xs text-muted-foreground">Everything stays in your browser. The preview uses SVG image mode, which disables scripts and external resources.</p>
      </CardContent>
    </Card>
  )
}
