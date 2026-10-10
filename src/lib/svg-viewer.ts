export function prepareSvg(source: string) {
  if (!source.trim()) throw new Error('Paste SVG markup or open an SVG file.')
  const document = new DOMParser().parseFromString(source, 'image/svg+xml')
  if (document.querySelector('parsererror')) throw new Error('Invalid SVG XML. Check for unclosed tags, missing quotes, or unescaped characters.')
  const root = document.documentElement
  if (root.localName !== 'svg' || (root.namespaceURI && root.namespaceURI !== 'http://www.w3.org/2000/svg')) {
    throw new Error('The markup must have an <svg> root element.')
  }
  if (!root.hasAttribute('xmlns')) root.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const svg = new XMLSerializer().serializeToString(root)
  return {
    svg,
    imageUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    width: root.getAttribute('width') || 'auto',
    height: root.getAttribute('height') || 'auto',
    viewBox: root.getAttribute('viewBox') || 'not set',
  }
}
