import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { tools } from '@/tools/registry'
import { PasswordGenerator } from './tools/PasswordGenerator'
import { Base64Tool } from './tools/Base64Tool'
import { JsonFormatter } from './tools/JsonFormatter'
import { HashGenerator } from './tools/HashGenerator'
import { UuidGenerator } from './tools/UuidGenerator'
import { UrlEncoder } from './tools/UrlEncoder'
import { TimestampConverter } from './tools/TimestampConverter'
import { ColorConverter } from './tools/ColorConverter'
import { JwtDecoder } from './tools/JwtDecoder'
import { RegexTester } from './tools/RegexTester'
import { DiffChecker } from './tools/DiffChecker'
import { MarkdownPreview } from './tools/MarkdownPreview'
import { BoxShadowGenerator } from './tools/BoxShadowGenerator'
import { GradientGenerator } from './tools/GradientGenerator'
import { EasingVisualizer } from './tools/EasingVisualizer'
import { UnitConverter } from './tools/UnitConverter'
import { YamlConverter } from './tools/YamlConverter'
import { NumberBaseConverter } from './tools/NumberBaseConverter'
import { SubnetCalculator } from './tools/SubnetCalculator'

export function ToolPage({ toolId }: { toolId: string }) {
  const tool = tools.find((t) => t.id === toolId)

  if (!tool) {
    return (
      <Card>
        <CardHeader><CardTitle>Tool not found</CardTitle></CardHeader>
        <CardContent>
          <Link to="/"><Button variant="outline">← Back home</Button></Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <Link to="/" className="text-xs text-muted-foreground hover:underline">← All tools</Link>
        <h1 className="text-xl font-bold">{tool.name}</h1>
        <p className="text-sm text-muted-foreground">{tool.description}</p>
      </div>
      {tool.id === 'password-generator' && <PasswordGenerator />}
      {tool.id === 'base64' && <Base64Tool />}
      {tool.id === 'json-formatter' && <JsonFormatter />}
      {tool.id === 'hash-generator' && <HashGenerator />}
      {tool.id === 'uuid-generator' && <UuidGenerator />}
      {tool.id === 'url-encoder' && <UrlEncoder />}
      {tool.id === 'timestamp-converter' && <TimestampConverter />}
      {tool.id === 'color-converter' && <ColorConverter />}
      {tool.id === 'jwt-decoder' && <JwtDecoder />}
      {tool.id === 'regex-tester' && <RegexTester />}
      {tool.id === 'diff-checker' && <DiffChecker />}
      {tool.id === 'markdown-preview' && <MarkdownPreview />}
      {tool.id === 'box-shadow-generator' && <BoxShadowGenerator />}
      {tool.id === 'gradient-generator' && <GradientGenerator />}
      {tool.id === 'easing-visualizer' && <EasingVisualizer />}
      {tool.id === 'unit-converter' && <UnitConverter />}
      {tool.id === 'yaml-converter' && <YamlConverter />}
      {tool.id === 'number-base-converter' && <NumberBaseConverter />}
      {tool.id === 'subnet-calculator' && <SubnetCalculator />}
      {tool.status === 'stub' && (
        <Card>
          <CardHeader><CardTitle>Coming soon</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <b className="text-foreground">{tool.name}</b> is registered in the catalog but not implemented yet.
              It will be 100% client-side like the rest.
            </p>
            <p>
              To implement: add <code className="font-mono">src/pages/tools/MyTool.tsx</code> and wire it in{' '}
              <code className="font-mono">ToolPage.tsx</code>, then flip status to <code className="font-mono">ready</code> in{' '}
              <code className="font-mono">registry.ts</code>.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
