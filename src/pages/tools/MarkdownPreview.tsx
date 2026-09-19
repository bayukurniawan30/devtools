import { useMemo, useState } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

marked.setOptions({ breaks: true, gfm: true })

const SAMPLE = `# Devtools Markdown Preview

Write **markdown** on the left, see HTML on the right. 100% client-side.

## Features (GFM)

- Tables, task lists, strikethrough ~~like this~~
- \`inline code\` and fenced blocks:

\`\`\`ts
const hello = "devtools";
\`\`\`

- [x] sanitized HTML output
- [ ] no backend involved

| Tool | Status |
| ---- | ------ |
| json | ready  |
| yaml | soon   |

> Tip: raw HTML is sanitized via DOMPurify before render.

[TanStack Router](https://tanstack.com/router) · *enjoy!*
`

export function MarkdownPreview() {
  const [input, setInput] = useState(SAMPLE)

  const html = useMemo(() => {
    try {
      const raw = marked.parse(input) as string
      return DOMPurify.sanitize(raw)
    } catch {
      return '<p><em>Failed to parse markdown.</em></p>'
    }
  }, [input])

  const words = (input.match(/\S+/g) || []).length

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2">
            Markdown Preview
            <span className="text-xs font-normal text-muted-foreground">
              {input.length} chars · {words} words
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setInput(SAMPLE)}>Load sample</Button>
            <Button variant="ghost" size="sm" onClick={() => setInput('')}>Clear</Button>
            <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(html)}>
              <Copy /> Copy HTML
            </Button>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="space-y-1">
              <Label>Markdown</Label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[320px]"
                placeholder="# hello…"
              />
            </div>
            <div className="space-y-1">
              <Label>Preview (sanitized)</Label>
              <div
                className="prose-sm min-h-[320px] max-w-none overflow-auto rounded-md border bg-muted/40 p-4 text-sm [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono [&_code]:text-xs [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:font-semibold [&_pre]:overflow-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3 [&_pre_code]:bg-transparent [&_table]:w-full [&_td]:border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:bg-muted [&_th]:px-2 [&_th]:py-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">
        Rendered with <code className="font-mono">marked</code> (GFM) + sanitized by DOMPurify — all in your browser.
      </p>
    </div>
  )
}
