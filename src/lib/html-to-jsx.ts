import { find, hastToReact, html, svg } from 'property-information'

const VOID_TAGS = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '))
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

export function htmlToJsx(input: string, componentName?: string) {
  if (!input.trim()) throw new Error('Paste some HTML to convert.')
  if (componentName !== undefined && !/^[A-Z][\w$]*$/.test(componentName)) {
    throw new Error('Use a component name starting with a capital letter, such as MyComponent.')
  }

  // Template contents stay inert: pasted markup is never mounted or executed.
  const template = document.createElement('template')
  template.innerHTML = input
  const warnings = new Set<string>()
  const expression = (value: string) => `{${JSON.stringify(value)}}`

  const serialize = (node: Node, depth: number): string => {
    const indent = '  '.repeat(depth)
    if (node.nodeType === 3) return indent + expression(node.textContent || '')
    if (node.nodeType === 8) {
      return `${indent}{/* ${(node.textContent || '').replace(/\*\//g, '* /')} */}`
    }
    if (node.nodeType !== 1) return ''

    const element = node as Element
    const tag = element.localName
    if (tag === 'script') {
      warnings.add('Script tags were omitted. Move script logic into your React component manually.')
      return ''
    }
    const customElement = tag.includes('-')
    const schema = element.namespaceURI === SVG_NAMESPACE ? svg : html
    const attributes: string[] = []
    const add = (name: string, value: string) => attributes.push(`${name}=${expression(value)}`)

    for (const attribute of Array.from(element.attributes)) {
      const { name, value } = attribute
      if (/^on/i.test(name)) {
        warnings.add('Inline event handlers were omitted. Add React event handlers such as onClick manually.')
        continue
      }
      if (name === 'style') {
        const style = (element as HTMLElement | SVGElement).style
        const entries = Array.from(style).map((property) => {
          const key = property.startsWith('--') ? property : property.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase()).replace(/^Ms/, 'ms')
          if (style.getPropertyPriority(property)) {
            warnings.add('CSS !important was omitted because React style objects do not support it.')
          }
          return `${JSON.stringify(key)}: ${JSON.stringify(style.getPropertyValue(property))}`
        })
        if (entries.length) attributes.push(`style={{ ${entries.join(', ')} }}`)
        continue
      }
      if (tag === 'option' && name === 'selected') continue
      const info = find(schema, name)
      let property = customElement || name.startsWith('data-') || name.startsWith('aria-')
        ? name
        : hastToReact[info.property] || info.property
      if (tag === 'input' && name === 'checked') property = 'defaultChecked'
      if (['input', 'textarea', 'select'].includes(tag) && name === 'value') property = 'defaultValue'
      if (!customElement && (info.boolean || (info.overloadedBoolean && value === ''))) {
        attributes.push(property)
      } else if (!/^[A-Za-z_$][\w$-]*$/.test(property)) {
        // Namespaced and unusual HTML attributes need a prop spread in JSX.
        attributes.push(`{...{${JSON.stringify(property)}: ${JSON.stringify(value)}}}`)
      } else {
        add(property, value)
      }
    }

    if (tag === 'textarea' && !element.hasAttribute('value')) add('defaultValue', element.textContent || '')
    if (tag === 'select' && !element.hasAttribute('value')) {
      const selected = Array.from(element.querySelectorAll('option[selected]'))
      if (selected.length) {
        const values = selected.map((option) => option.getAttribute('value') ?? (option as HTMLOptionElement).value)
        attributes.push(`defaultValue={${JSON.stringify(element.hasAttribute('multiple') ? values : values[values.length - 1])}}`)
      }
    }
    const opening = `<${tag}${attributes.length ? ' ' + attributes.join(' ') : ''}`
    if (VOID_TAGS.has(tag) && schema === html) return `${indent}${opening} />`
    const children = tag === 'textarea' ? [] : Array.from(tag === 'template' ? (element as HTMLTemplateElement).content.childNodes : element.childNodes)
    if (!children.length) return `${indent}${opening} />`
    const content = children.map((child) => serialize(child, depth + 1)).filter(Boolean).join('\n')
    return `${indent}${opening}>\n${content}\n${indent}</${tag}>`
  }

  const nodes = Array.from(template.content.childNodes)
  const isBlank = (node: Node) => node.nodeType === 3 && !node.textContent?.trim()
  while (nodes.length && isBlank(nodes[0])) nodes.shift()
  while (nodes.length && isBlank(nodes[nodes.length - 1])) nodes.pop()
  const singleElement = nodes.length === 1 && nodes[0].nodeType === 1
  const depth = componentName ? 2 : 0
  const parts = nodes.map((node) => serialize(node, depth + (singleElement ? 0 : 1))).filter(Boolean)
  if (!parts.length) throw new Error('No convertible HTML remains. Paste an HTML element or text.')
  const indent = '  '.repeat(depth)
  const jsx = singleElement ? parts.join('\n') : `${indent}<>\n${parts.join('\n')}\n${indent}</>`
  const code = componentName ? `export default function ${componentName}() {\n  return (\n${jsx}\n  );\n}\n` : jsx
  return { code, warnings: Array.from(warnings) }
}
