import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import test from 'node:test'
import { JSDOM } from 'jsdom'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const dom = new JSDOM('')
globalThis.document = dom.window.document
const source = await readFile(new URL('../src/lib/html-to-jsx.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } }).outputText
const moduleCode = compiled.replace(/from ['"]property-information['"]/, `from ${JSON.stringify(pathToFileURL(require.resolve('property-information')).href)}`)
const { htmlToJsx } = await import(`data:text/javascript;base64,${Buffer.from(moduleCode).toString('base64')}`)

function render(input) {
  const { code, warnings } = htmlToJsx(input, 'Example')
  const result = ts.transpileModule(code, {
    fileName: 'Example.tsx', reportDiagnostics: true,
    compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
  })
  assert.deepEqual(result.diagnostics, [], code)
  const exports = {}
  new Function('React', 'exports', result.outputText)(React, exports)
  return { markup: renderToStaticMarkup(React.createElement(exports.default)), code, warnings }
}

test('converts attribute names, booleans, entities and JSX-sensitive text', () => {
  const { markup, code } = render('<label class="a" for="field" data-kind="x" aria-hidden="false">{name} &amp; &lt;tag&gt;<input id="field" readonly disabled="false" tabindex="2"></label>')
  assert.match(code, /className=/)
  assert.match(code, /htmlFor=/)
  assert.match(code, /readOnly/)
  assert.match(code, /tabIndex=/)
  const label = new JSDOM(markup).window.document.querySelector('label')
  assert.equal(label.textContent, '{name} & <tag>')
  assert.equal(label.htmlFor, 'field')
  assert.equal(label.getAttribute('aria-hidden'), 'false')
  assert.equal(label.querySelector('input').disabled, true)
})

test('converts SVG and namespaced attributes', () => {
  const { markup, code } = render('<svg viewBox="0 0 10 10"><path stroke-width="2" fill-rule="evenodd"/><use xlink:href="#icon"/></svg>')
  assert.match(code, /viewBox=/)
  assert.match(code, /strokeWidth=/)
  assert.match(code, /fillRule=/)
  assert.match(code, /xlinkHref=/)
  assert.match(markup, /stroke-width="2"/)
})

test('converts styles including vendor prefixes and CSS custom properties', () => {
  const { markup, code, warnings } = render('<div style="color: red !important; padding: 12px; --accent: blue; -webkit-transform: scale(1)">Styled</div>')
  assert.match(code, /"padding": "12px"/)
  assert.match(code, /"--accent": "blue"/)
  assert.match(code, /"WebkitTransform": "scale\(1\)"/)
  assert.match(markup, /padding:12px/)
  assert.equal(warnings.length, 1)
})

test('preserves whitespace, quotes and braces in text, pre and raw style content', () => {
  const input = '<pre>  a\n b {x} &quot;hi&quot;</pre><style>.a { color: red; }</style>'
  const { markup } = render(input)
  const document = new JSDOM(markup).window.document
  assert.equal(document.querySelector('pre').textContent, '  a\n b {x} "hi"')
  assert.equal(document.querySelector('style').textContent, '.a { color: red; }')
  assert.equal(new JSDOM(render('<span> hello </span> <span> world </span>').markup).window.document.body.textContent, ' hello   world ')
})

test('preserves initial form values without creating controlled fields', () => {
  const { markup, code } = render('<input value="hi" checked type="checkbox"><textarea>hello &amp; {world}</textarea><select multiple><option value="a" selected>A</option><option selected>B</option></select>')
  assert.match(code, /defaultChecked/)
  assert.match(code, /defaultValue=\{\["a","B"\]\}/)
  const document = new JSDOM(markup).window.document
  assert.equal(document.querySelector('input').value, 'hi')
  assert.equal(document.querySelector('input').checked, true)
  assert.equal(document.querySelector('textarea').value, 'hello & {world}')
  assert.deepEqual(Array.from(document.querySelector('select').selectedOptions, (option) => option.value), ['a', 'B'])
})

test('supports comments, multiple roots, custom elements and JSX-only output', () => {
  const { markup, code } = render('<!-- comment */ {ok} --><my-card class="x" data-id="1"></my-card><br>')
  assert.match(code, /<>/)
  assert.match(markup, /<my-card class="x" data-id="1"><\/my-card><br\/>/)
  assert.match(htmlToJsx('<div>Hello</div>').code, /^<div>/)
})

test('omits scripts and HTML event handlers with explicit conversion notes', () => {
  const { code, warnings } = htmlToJsx('<button onclick="alert(1)">Go</button><script>alert(1)</script>')
  assert.doesNotMatch(code, /alert|onclick|<script/)
  assert.equal(warnings.length, 2)
})

test('emits valid JSX for unusual attribute names', () => {
  const { code } = render('<div foo.bar="x" custom:name="y"></div>')
  assert.match(code, /\.\.\.\{"foo\.bar": "x"\}/)
  assert.match(code, /\.\.\.\{"custom:name": "y"\}/)
})

test('validates empty input and component names, and accepts HTML parser repairs', () => {
  assert.throws(() => htmlToJsx('  '), /Paste some HTML/)
  assert.throws(() => htmlToJsx('<div/>', 'bad-name'), /capital letter/)
  assert.throws(() => htmlToJsx('<script>alert(1)</script>'), /No convertible HTML/)
  assert.match(render('<p>Unclosed').markup, /<p>Unclosed<\/p>/)
})
