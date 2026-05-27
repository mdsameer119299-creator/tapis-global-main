# Tapis Global International — Next.js + React + Tailwind

Premium carpet manufacturer website rebuilt as a modular, scalable Next.js project.

---

## Quick Start

```bash
npm install
npm run dev
# → http://localhost:3000
```

---

## Project Structure

```
tapis-global/
│
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout: fonts, metadata, global providers
│   └── page.tsx                # Homepage — composes all sections
│
├── sections/                   # Page sections (one file per section)
│   ├── Hero.tsx                # Cinematic video/image slideshow hero
│   ├── Collections.tsx         # Product collection blocks with image carousel
│   ├── Manufacturing.tsx       # 5-step process + Why Choose Us
│   ├── Exports.tsx             # Global reach, stats, country ticker
│   ├── Testimonials.tsx        # Featured + grid testimonials
│   └── Contact.tsx             # Contact form with validation
│
├── components/
│   ├── ui/
│   │   └── index.tsx           # Reusable primitives:
│   │                           #   Eyebrow, DisplayHeading, GoldLine
│   │                           #   BtnPrimary, BtnOutline, BtnGold, BtnLink
│   │                           #   Reveal (scroll animation), Section
│   └── layout/
│       ├── Loader.tsx          # Page entry loader animation
│       ├── Navbar.tsx          # Topbar + sticky nav + mobile menu
│       ├── Footer.tsx          # Multi-column footer
│       └── StickyBar.tsx       # Sticky CTA bar + floating WhatsApp
│
├── lib/
│   └── data.ts                 # ALL site copy and data (single source of truth):
│                               #   SITE, NAV_LINKS, HERO_SLIDES, HERO_STATS
│                               #   COLLECTIONS, EXPORT_STATS, TESTIMONIALS
│                               #   MFG_STEPS, WHY_ITEMS, REGIONS
│
├── styles/
│   └── globals.css             # Tailwind base + CSS custom properties + component layer
│
├── public/
│   └── logos/
│       ├── TGI-Header Logo1.png   # Header logo (creamy bg)
│       └── TGI-Footer logo1.png   # Footer logo (dark bg)
│
├── tailwind.config.ts          # Extended theme: brand colors, fonts, animations
├── next.config.js              # Image domains, etc.
└── tsconfig.json
```

---

## Brand Tokens

All brand colours are in `tailwind.config.ts` (Tailwind classes) and `styles/globals.css` (CSS variables):

| Token       | Variable   | Hex       | Use                        |
|-------------|------------|-----------|----------------------------|
| `crimson`   | `--c`      | `#6B1F1F` | Primary CTAs, accents      |
| `crimson-d` | `--cd`     | `#4A1414` | Dark backgrounds, topbar   |
| `gold`      | `--g`      | `#C09B4A` | Lines, borders, highlights |
| `gold-p`    | `--gp`     | `#EDD99A` | Pale gold text on dark     |
| `ivory`     | `--iv`     | `#F8F4EE` | Page background            |
| `ink`       | `--ink`    | `#1A1310` | Body text                  |

---

## Key Patterns

### Adding a new section
1. Create `sections/YourSection.tsx`
2. Import and add to `app/page.tsx`

### Adding new data
- All copy lives in `lib/data.ts`
- Export a typed const array, import it in the section

### Using UI primitives
```tsx
import { Reveal, Eyebrow, DisplayHeading, BtnGold } from '@/components/ui'

<Reveal direction="left" delay={200}>
  <Eyebrow>Our Story</Eyebrow>
  <DisplayHeading>Premium <em>Quality</em></DisplayHeading>
  <BtnGold href="#contact">Get Quote</BtnGold>
</Reveal>
```

### Scroll reveal animation
The `Reveal` component uses `IntersectionObserver` — no library needed.
Add `direction="up" | "left" | "right"` and `delay={ms}` for staggering.

---

## Logos
Place logo files in `/public/logos/`:
- `TGI-Header Logo1.png` — shown in navbar (light creamy background)
- `TGI-Footer logo1.png` — shown in footer and loader (dark background)

Both have `onError` fallbacks to text if files are missing during development.

---

## Adding Pages (e.g. /products, /about)
```
app/
├── products/
│   └── page.tsx    # /products route
├── about/
│   └── page.tsx    # /about route
```

---

## Performance Notes
- Fonts loaded via `<link>` in layout (not next/font, to support Cormorant Garamond)
- Images use native `<img>` with `loading="lazy"` for external Unsplash images
- Scroll reveal uses `IntersectionObserver` — no GSAP/Framer dependency
- Carousel is pure React state (no Swiper/Embla)
- Animation: CSS keyframes via Tailwind config, no JS animation library

---

## Cursor AI Workflow Tips
- Each section file is self-contained and under ~200 lines
- `lib/data.ts` is the single file to edit for all copy changes
- CSS custom properties (`--c`, `--g`, etc.) are available everywhere — use in inline styles for dynamic theming
- Tailwind classes handle spacing/layout; CSS variables handle brand colours
