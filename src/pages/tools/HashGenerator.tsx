import { useState } from 'react'
import SparkMD5 from 'spark-md5'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

async function digest(algo: string, text: string) {
  const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function HashGenerator() {
  const [input, setInput] = useState('hello')
  const [out, setOut] = useState<Record<string, string>>({})

  const run = async () => {
    // MD5 is not in WebCrypto (insecure) so pure-JS lib — still 100% static.
    const md5 = SparkMD5.hash(input)
    const [sha1, sha256, sha384, sha512] = await Promise.all([
      digest('SHA-1', input),
      digest('SHA-256', input),
      digest('SHA-384', input),
      digest('SHA-512', input),
    ])
    setOut({ MD5: md5, 'SHA-1': sha1, 'SHA-256': sha256, 'SHA-384': sha384, 'SHA-512': sha512 })
  }

  return (
    <Card>
      <CardHeader><CardTitle>Hash Generator</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} />
        <Button onClick={run}>Generate hashes</Button>
        {Object.entries(out).map(([k, v]) => (
          <div key={k} className="space-y-1">
            <p className="text-xs font-semibold">{k}</p>
            <p className="break-all rounded-md bg-muted p-2 font-mono text-xs">{v}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
