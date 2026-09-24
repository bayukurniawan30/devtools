import { useRef, useState } from 'react'
import QRCode from 'react-qr-code'
import { HexColorPicker } from 'react-colorful'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function QrGenerator() {
  const [text, setText] = useState('https://devtools.baycore.dev')
  const [size, setSize] = useState(256)
  const [fg, setFg] = useState('#000000')
  const [bg, setBg] = useState('#ffffff')
  const svgWrap = useRef<HTMLDivElement>(null)

  const download = (fmt: 'svg' | 'png') => {
    const svg = svgWrap.current?.querySelector('svg')
    if (!svg) return
    const data = new XMLSerializer().serializeToString(svg)
    if (fmt === 'svg') {
      const url = URL.createObjectURL(new Blob([data], { type: 'image/svg+xml' }))
      const a = document.createElement('a')
      a.href = url
      a.download = 'qr-code.svg'
      a.click()
      URL.revokeObjectURL(url)
      return
    }
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, size, size)
      ctx.drawImage(img, 0, 0, size, size)
      URL.revokeObjectURL(url)
      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png')
      a.download = 'qr-code.png'
      a.click()
    }
    const url = URL.createObjectURL(new Blob([data], { type: 'image/svg+xml' }))
    img.src = url
  }

  return (
    <Card>
      <CardHeader><CardTitle>QR Code Generator</CardTitle></CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Text / URL ({text.length} chars)</Label>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[100px] font-mono" placeholder="https://…" />
          </div>
          <div className="space-y-1">
            <Label>Size: {size}px</Label>
            <input type="range" min={128} max={1024} step={32} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Foreground</Label>
              <HexColorPicker color={fg} onChange={setFg} style={{ width: '100%', height: 110 }} />
              <Input value={fg} onChange={(e) => setFg(e.target.value)} className="font-mono" />
            </div>
            <div className="space-y-1">
              <Label>Background</Label>
              <HexColorPicker color={bg} onChange={setBg} style={{ width: '100%', height: 110 }} />
              <Input value={bg} onChange={(e) => setBg(e.target.value)} className="font-mono" />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <Label>Preview</Label>
          <div className="flex min-h-64 items-center justify-center rounded-md border bg-muted/40 p-4">
            {text ? (
              <div ref={svgWrap} style={{ background: bg, padding: 12 }} className="rounded-md">
                <QRCode value={text} size={Math.min(size, 320)} fgColor={fg} bgColor={bg} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Type something to generate.</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => download('svg')} disabled={!text}>
              <Download /> SVG
            </Button>
            <Button variant="outline" size="sm" onClick={() => download('png')} disabled={!text}>
              <Download /> PNG
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">QR rendered as SVG locally via react-qr-code — downloads never touch a server.</p>
        </div>
      </CardContent>
    </Card>
  )
}
