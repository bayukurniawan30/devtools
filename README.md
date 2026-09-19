# DevToolbox — Free Online Dev Tools That Run 100% in Your Browser

Vite + React + TypeScript + **TanStack Router** + **shadcn-style UI** (Tailwind).
All 19 tools run 100% client-side. No backend, no login, no tracking.

## Stack
- PNPM, Vite 5 (static `dist/`), React 18
- TanStack Router (code-based routes, no codegen needed)
- Tailwind v3 + shadcn-style `src/components/ui/*`, `cn()` util
- Client-side libs: `spark-md5` (MD5), `diff` (diff checker), `marked` + `dompurify` (markdown), `react-colorful` (pickers), `yaml` (JSON⇄YAML)

## Dev
```bash
pnpm install
pnpm dev      # http://localhost:5173
pnpm build    # tsc + vite build -> dist/
pnpm preview
```

## Tools (19, all ready)
- **Generators:** password, UUID, hash (MD5 via spark-md5, SHA-* via WebCrypto)
- **Encode / Decode:** Base64, URL encoder, JWT decoder (HS* verify via WebCrypto)
- **Formatters:** JSON formatter, regex tester, diff checker
- **Converters:** timestamp, unit (length/weight/temp/data/speed), JSON⇄YAML, number base, color (HEX/RGB/HSL + WCAG contrast), markdown preview
- **CSS:** box-shadow, gradient, easing/cubic-bezier visualizer
- **Network:** subnet/CIDR calculator

## Add a new tool (static only)
1. Add entry in `src/tools/registry.ts` with `status: 'stub'`
2. Create `src/pages/tools/MyTool.tsx` (only WebCrypto / local JS — no fetch to private APIs)
3. Wire it in `src/pages/ToolPage.tsx` + flip to `status: 'ready'`

Conventions: copy buttons use `<Copy />` icon on the left; pickers use `react-colorful`.
