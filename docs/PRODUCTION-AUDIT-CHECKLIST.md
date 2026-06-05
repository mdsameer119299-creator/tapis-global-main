
---

## Phase 13 — Image optimization & loading speed

| ID | Item | Status |
|----|------|--------|
| I13-1 | All `/public/images` converted to WebP | ✅ (~42MB → ~7.2MB) |
| I13-2 | Dead `tgi-banner-1..6.png` removed | ✅ |
| I13-3 | `npm run optimize:images` script | ✅ |
| I13-4 | Next.js Image / OptimizedImage site-wide | ✓ OK (email HTML excepted) |
| I13-5 | OptimizedImage blur placeholder fix | ✅ |
| I13-6 | Lazy loading default; priority heroes only | ✅ |
| I13-7 | ColorLibrary priority capped to 4 | ✅ |
| I13-8 | Lightbox images: no priority preload | ✅ |
| I13-9 | AVIF in production via next.config | ✓ OK |
| I13-10 | Footer banner sizes + WebP | ✅ |

---

## Phase 14 — Ultra smooth experience

| ID | Item | Status |
|----|------|--------|
| U14-1 | Loader: 280ms, CSS monogram, no priority image | ✅ |
| U14-2 | Loader skipped for `prefers-reduced-motion` | ✅ |
| U14-3 | Navbar scroll progress: `scaleX` + rAF | ✅ |
| U14-4 | StickyBar scroll: rAF throttled | ✅ |
| U14-5 | Hero progress: DOM ref (no per-frame React) | ✅ |
| U14-6 | Global `prefers-reduced-motion` rules | ✅ |
| U14-7 | Loader/StickyBar/FloatingWhatsApp dynamic | ✅ |
| U14-8 | FloatingWhatsApp → Server Component | ✅ |

---

## Phase 15 — Advanced Next.js performance

| ID | Item | Status |
|----|------|--------|
| P15-1 | Dynamic imports: custom, catalogue, design-studio | ✅ |
| P15-2 | Bundle analyzer (`npm run analyze`) | ✅ |
| P15-3 | Font preload via next/font | ✓ OK |
| P15-4 | Inline Cormorant strings → font-display class | ❌ Follow-up |
| P15-5 | Split ui barrel (Reveal vs server) | ❌ Follow-up |
| P15-6 | Unused deps | ✓ Lean stack |

---

## Phase 16 — PageSpeed / CWV targets

| Metric | Target | Status |
|--------|--------|--------|
| Mobile Performance | 95+ | ⚠️ Run Lighthouse on production URL |
| Desktop Performance | 98+ | ⚠️ Run Lighthouse on production URL |
| LCP | < 2.5s | ⚠️ Verify post-deploy |
| CLS | < 0.1 | ⚠️ Font wiring still main risk |
| INP | < 200ms | ⚠️ Verify post-deploy |

---

## Phase 17 — Premium UX / Lighthouse gate

| ID | Item | Status |
|----|------|--------|
| L17-1 | No horizontal scroll | ✓ OK |
| L17-2 | Luxury loader (non-blocking) | ✅ |
| L17-3 | Smooth scroll handlers | ✅ |
| L17-4 | Pre-deploy Lighthouse mobile + desktop | ⚠️ Mobile perf **79** (local); SEO **100**, A11y **92**, BP **100** |
| L17-5 | LCP local mobile | ⚠️ **5.2s** — expect improvement on CDN deploy |
| L17-6 | CLS local mobile | ✅ **0** |

### Pre-deploy Lighthouse command

```bash
npm run build && npm start &
npx lighthouse http://localhost:3000 --only-categories=performance,seo,accessibility,best-practices --preset=desktop --output=json --output-path=./lighthouse-desktop.json
npx lighthouse http://localhost:3000 --only-categories=performance,seo,accessibility,best-practices --form-factor=mobile --output=json --output-path=./lighthouse-mobile.json
```
