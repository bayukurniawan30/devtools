import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

const FLAGS = ['g', 'i', 'm', 's', 'u', 'y'] as const

interface MatchInfo {
  full: string
  index: number
  groups: string[]
}

function getMatches(pattern: string, flags: string, text: string): { matches: MatchInfo[]; error: string | null } {
  if (!pattern) return { matches: [], error: null }
  let re: RegExp
  try {
    re = new RegExp(pattern, flags)
  } catch (e) {
    return { matches: [], error: e instanceof Error ? e.message : 'Invalid regex' }
  }
  // Avoid infinite loop on zero-length global matches
  const out: MatchInfo[] = []
  if (re.global || re.sticky) {
    re.lastIndex = 0
    let m: RegExpExecArray | null
    let guard = 0
    while ((m = re.exec(text)) !== null && guard++ < 1000) {
      out.push({ full: m[0], index: m.index, groups: m.slice(1) })
      if (m[0] === '') re.lastIndex += 1
      if (!re.global && !re.sticky) break
    }
  } else {
    const m = re.exec(text)
    if (m) out.push({ full: m[0], index: m.index, groups: m.slice(1) })
  }
  return { matches: out, error: null }
}

function Highlighted({ text, matches }: { text: string; matches: MatchInfo[] }) {
  if (!matches.length) return <span className="whitespace-pre-wrap">{text || '(no text)'}</span>
  const sorted = [...matches].sort((a, b) => a.index - b.index)
  const parts: React.ReactNode[] = []
  let cursor = 0
  sorted.forEach((m, i) => {
    if (m.index > cursor) parts.push(<span key={`t${i}`}>{text.slice(cursor, m.index)}</span>)
    parts.push(
      <mark key={`m${i}`} className="rounded bg-yellow-300 px-0.5 dark:bg-yellow-600" title={`Match ${i + 1} @ ${m.index}`}>
        {m.full === '' ? '∅' : m.full}
      </mark>,
    )
    cursor = m.index + m.full.length
  })
  if (cursor < text.length) parts.push(<span key="tail">{text.slice(cursor)}</span>)
  return <span className="whitespace-pre-wrap break-words">{parts}</span>
}

const CHEATS = [
  ['.', 'any char'], ['\\d', 'digit'], ['\\w', 'word char'], ['\\s', 'whitespace'],
  ['*', '0+'], ['+', '1+'], ['?', '0/1'], ['{n,m}', 'repeat'],
  ['^…$', 'anchors'], ['(a|b)', 'alt'], ['(…) / (?:…)', 'group'], ['[abc] [^a]', 'class'],
  ['\\b', 'boundary'], ['(?=…) (?!…)', 'lookahead'],
]

export function RegexTester() {
  const [pattern, setPattern] = useState('(\\w+)@(\\w+\\.\\w+)')
  const [flags, setFlags] = useState('gi')
  const [text, setText] = useState('Contact john@example.com or jane@test.org for info.')

  const toggleFlag = (f: string) =>
    setFlags((prev) => (prev.includes(f) ? prev.replace(f, '') : [...prev, f].sort().join('')))

  const { matches, error } = useMemo(() => getMatches(pattern, flags, text), [pattern, flags, text])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Regex Tester</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-48 flex-1 space-y-1">
              <Label>Pattern (JS RegExp)</Label>
              <Input value={pattern} onChange={(e) => setPattern(e.target.value)} className="font-mono" placeholder="(\w+)@(\w+\.\w+)" />
            </div>
            <div className="flex gap-1">
              {FLAGS.map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={flags.includes(f) ? 'default' : 'outline'}
                  onClick={() => toggleFlag(f)}
                  title={{ g: 'global', i: 'ignore case', m: 'multiline', s: 'dotAll', u: 'unicode', y: 'sticky' }[f]}
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : (
            <p className="text-sm">
              {matches.length === 0 ? (
                <Badge variant="secondary">no match</Badge>
              ) : (
                <Badge>{matches.length} match{matches.length > 1 ? 'es' : ''}</Badge>
              )}
            </p>
          )}
          <div className="space-y-1">
            <Label>Test text</Label>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[100px]" />
          </div>
          <div className="space-y-1">
            <Label>Highlighted</Label>
            <div className="min-h-16 rounded-md border bg-muted/50 p-3 font-mono text-sm">
              <Highlighted text={text} matches={error ? [] : matches} />
            </div>
          </div>
        </CardContent>
      </Card>

      {matches.length > 0 && !error && (
        <Card>
          <CardHeader><CardTitle className="text-base">Matches</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {matches.slice(0, 100).map((m, i) => (
              <div key={i} className="rounded-md bg-muted p-2 font-mono text-xs">
                <p><b>#{i + 1}</b> @{m.index}: <b>{JSON.stringify(m.full)}</b></p>
                {m.groups.length > 0 && (
                  <p className="text-muted-foreground">
                    groups: {m.groups.map((g, j) => `$${j + 1}=${JSON.stringify(g)}`).join('  ')}
                  </p>
                )}
              </div>
            ))}
            {matches.length > 100 && <p className="text-xs text-muted-foreground">…showing first 100 of {matches.length}</p>}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Cheatsheet</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-1 font-mono text-xs sm:grid-cols-3">
          {CHEATS.map(([k, v]) => (
            <button key={k} className="rounded bg-muted px-2 py-1 text-left hover:bg-muted/70" onClick={() => navigator.clipboard.writeText(k)} title="Click to copy">
              <b>{k}</b> <span className="text-muted-foreground">{v}</span>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
