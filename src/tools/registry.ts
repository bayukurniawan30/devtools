export type ToolCategory = 'Generators' | 'Encode / Decode' | 'Formatters' | 'Converters' | 'CSS' | 'Network'

export interface ToolDef {
  id: string
  name: string
  description: string
  category: ToolCategory
  // 'ready' = fully implemented, 'stub' = placeholder page (still static, no BE)
  status: 'ready' | 'stub'
}

export const categories: ToolCategory[] = ['Generators', 'Encode / Decode', 'Formatters', 'Converters', 'CSS', 'Network']

export const tools: ToolDef[] = [
  { id: 'password-generator', name: 'Password Generator', description: 'Random passwords, crypto.getRandomValues only.', category: 'Generators', status: 'ready' },
  { id: 'uuid-generator', name: 'UUID Generator', description: 'UUID v4 bulk generate.', category: 'Generators', status: 'ready' },
  { id: 'qr-generator', name: 'QR Generator', description: 'Text/URL → QR, SVG/PNG download.', category: 'Generators', status: 'ready' },
  { id: 'hash-generator', name: 'Hash Generator', description: 'MD5*, SHA-1/256/384/512 via WebCrypto.', category: 'Generators', status: 'ready' },
  { id: 'base64', name: 'Base64 Encode / Decode', description: 'Text ⇄ Base64, unicode-safe.', category: 'Encode / Decode', status: 'ready' },
  { id: 'url-encoder', name: 'URL Encoder', description: 'encodeURIComponent / decode.', category: 'Encode / Decode', status: 'ready' },
  { id: 'jwt-decoder', name: 'JWT Decoder', description: 'Decode header + payload, verify HS* locally.', category: 'Encode / Decode', status: 'ready' },
  { id: 'json-formatter', name: 'JSON Formatter', description: 'Format, minify, validate, tree view.', category: 'Formatters', status: 'ready' },
  { id: 'regex-tester', name: 'Regex Tester', description: 'JS regex playground + cheatsheet.', category: 'Formatters', status: 'ready' },
  { id: 'timestamp-converter', name: 'Timestamp Converter', description: 'Unix ⇄ ISO ⇄ local date.', category: 'Converters', status: 'ready' },
  { id: 'unit-converter', name: 'Unit Converter', description: 'Length, weight, temp, data, speed.', category: 'Converters', status: 'ready' },
  { id: 'yaml-converter', name: 'JSON ⇄ YAML', description: 'Convert both ways, errors shown.', category: 'Converters', status: 'ready' },
  { id: 'number-base-converter', name: 'Number Base', description: 'Dec/hex/oct/bin + text⇄hex.', category: 'Converters', status: 'ready' },
  { id: 'subnet-calculator', name: 'Subnet Calculator', description: 'CIDR → network, mask, hosts.', category: 'Network', status: 'ready' },
  { id: 'color-converter', name: 'Color Converter', description: 'HEX ⇄ RGB ⇄ HSL + contrast.', category: 'Converters', status: 'ready' },
  { id: 'markdown-preview', name: 'Markdown Preview', description: 'GFM preview, sanitized, copy HTML.', category: 'Converters', status: 'ready' },
  { id: 'diff-checker', name: 'Diff Checker', description: 'Line-based text diff.', category: 'Formatters', status: 'ready' },
  { id: 'box-shadow-generator', name: 'Box-shadow Generator', description: 'Sliders + picker, live preview, copy CSS.', category: 'CSS', status: 'ready' },
  { id: 'gradient-generator', name: 'Gradient Generator', description: 'Linear/radial/conic, stops, copy CSS.', category: 'CSS', status: 'ready' },
  { id: 'easing-visualizer', name: 'Easing Visualizer', description: 'Cubic-bezier curve + live animation.', category: 'CSS', status: 'ready' },
]
