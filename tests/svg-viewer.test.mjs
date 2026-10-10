import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { JSDOM } from 'jsdom'
import ts from 'typescript'

const { window } = new JSDOM('')
globalThis.DOMParser = window.DOMParser
globalThis.XMLSerializer = window.XMLSerializer
const source = await readFile(new URL('../src/lib/svg-viewer.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } }).outputText
const { prepareSvg } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

test('prepares an SVG image URL and reads dimensions', () => {
  const result = prepareSvg('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="16" viewBox="0 0 32 16"><path d="M0 0h32v16H0z" fill="#ff00aa"/></svg>')
  assert.equal(result.width, '32')
  assert.equal(result.height, '16')
  assert.equal(result.viewBox, '0 0 32 16')
  assert.equal(decodeURIComponent(result.imageUrl.split(',')[1]), result.svg)
  assert.match(result.imageUrl, /%23ff00aa/)
})

test('adds a namespace for pasted SVG fragments and preserves Unicode and definitions', () => {
  const result = prepareSvg('<svg viewBox="0 0 100 100"><defs><linearGradient id="g"><stop stop-color="#fff"/></linearGradient></defs><text>こんにちは &amp; hello</text></svg>')
  const document = new DOMParser().parseFromString(result.svg, 'image/svg+xml')
  assert.equal(document.documentElement.namespaceURI, 'http://www.w3.org/2000/svg')
  assert.equal(document.querySelector('text').textContent, 'こんにちは & hello')
  assert.ok(document.querySelector('linearGradient'))
  assert.equal(result.width, 'auto')
  assert.equal(result.height, 'auto')
})

test('accepts XML declarations and comments in exported SVG files', () => {
  const result = prepareSvg('<?xml version="1.0" encoding="UTF-8"?><!-- exported --><svg xmlns="http://www.w3.org/2000/svg"><!-- shape --><circle r="10"/></svg>')
  assert.match(result.svg, /<!-- shape -->/)
  assert.match(result.svg, /<circle/)
})

test('rejects blank input, malformed XML, other roots and incorrect namespaces', () => {
  assert.throws(() => prepareSvg('  '), /Paste SVG/)
  assert.throws(() => prepareSvg('<svg><path></svg>'), /Invalid SVG XML/)
  assert.throws(() => prepareSvg('<svg><text>a & b</text></svg>'), /Invalid SVG XML/)
  assert.throws(() => prepareSvg('<div/>'), /<svg> root/)
  assert.throws(() => prepareSvg('<svg xmlns="http://www.w3.org/1999/xhtml"/>'), /<svg> root/)
})
