import Image from 'next/image'
import Link from 'next/link'
import type { AboutSplitBlock } from '@/lib/about'
import { Reveal, Eyebrow } from '@/components/ui'
import { BLUR_PLACEHOLDER } from '@/components/ui/OptimizedImage'

const VARIANTS = {
  dark: {
    section:  { background: 'var(--cd)' },
    title:    '#fff',
    titleEm:  'var(--gl)',
    lead:     'rgba(255,255,255,0.58)',
    body:     'rgba(255,255,255,0.42)',
    bullet:   'rgba(255,255,255,0.52)',
    strong:   'rgba(255,255,255,0.85)',
    pillar:   'rgba(255,255,255,0.48)',
    stat:     'var(--gp)',
    product:  'rgba(255,255,255,0.55)',
    productBg:'rgba(255,255,255,0.04)',
    eyebrow:  true,
  },
  ink: {
    section:  { background: '#0d0a08' },
    title:    '#fff',
    titleEm:  'var(--gp)',
    lead:     'rgba(255,255,255,0.58)',
    body:     'rgba(255,255,255,0.4)',
    bullet:   'rgba(255,255,255,0.5)',
    strong:   'rgba(255,255,255,0.82)',
    pillar:   'rgba(255,255,255,0.45)',
    stat:     'var(--gp)',
    product:  'rgba(255,255,255,0.52)',
    productBg:'rgba(255,255,255,0.03)',
    eyebrow:  true,
  },
  ivory: {
    section:  { background: 'var(--iv)' },
    title:    'var(--ink)',
    titleEm:  'var(--c)',
    lead:     'var(--inkm)',
    body:     'var(--inkm)',
    bullet:   'var(--inkm)',
    strong:   'var(--inks)',
    pillar:   'var(--inkm)',
    stat:     'var(--c)',
    product:  'var(--inkm)',
    productBg:'rgba(255,255,255,0.7)',
    eyebrow:  false,
  },
} as const

type Props = {
  block: AboutSplitBlock
  index?: number
}

function ImagePanel({ block }: { block: AboutSplitBlock }) {
  return (
    <div className="relative min-h-[460px] sm:min-h-[520px] lg:min-h-[680px] overflow-hidden group">
      <div className="absolute inset-0 fill-frame">
        <Image
          src={block.image}
          alt={block.imageAlt}
          fill
          loading="lazy"
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
          quality={82}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-center transition-transform duration-[1000ms] ease-out group-hover:scale-[1.05]"
          style={{ filter: 'brightness(0.78) saturate(0.88) sepia(0.06)' }}
        />
      </div>

      {/* Cinematic vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(to top, rgba(8,6,5,0.72) 0%, transparent 45%),
            linear-gradient(to right, rgba(8,6,5,0.25) 0%, transparent 40%)
          `,
        }}
      />

      {/* Section number watermark */}
      <span
        className="absolute bottom-8 right-8 font-display font-light leading-none pointer-events-none select-none opacity-[0.07]"
        style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 'clamp(80px, 12vw, 140px)',
          color: '#fff',
        }}
      >
        {block.sectionNum}
      </span>

      {/* Gold frame corners */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t border-l opacity-30 pointer-events-none" style={{ borderColor: 'var(--g)' }} />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b border-l opacity-30 pointer-events-none" style={{ borderColor: 'var(--g)' }} />
    </div>
  )
}

function ContentPanel({
  block,
  v,
  revealDirection,
}: {
  block: AboutSplitBlock
  v: typeof VARIANTS[keyof typeof VARIANTS]
  revealDirection: 'left' | 'right'
}) {
  return (
    <div className="flex flex-col justify-center px-10 max-lg:px-6 py-16 lg:py-28 lg:px-16 xl:px-[4.5rem] relative">
      {/* Section index */}
      <span
        className="absolute top-8 right-8 max-lg:top-6 max-lg:right-6 text-[10px] tracking-[0.28em] uppercase font-medium opacity-40"
        style={{ color: v.eyebrow ? 'var(--gl)' : 'var(--gd)' }}
      >
        {block.sectionNum}
      </span>

      <Reveal direction={revealDirection}>
        <Eyebrow white={v.eyebrow}>{block.eyebrow}</Eyebrow>

        <h2
          className="font-medium leading-[1.05] tracking-tight mb-6"
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(34px, 3.8vw, 58px)',
            color: v.title,
          }}
        >
          {block.title}
          {block.titleEm && (
            <>
              <br />
              <em style={{ fontStyle: 'italic', color: v.titleEm }}>{block.titleEm}</em>
            </>
          )}
        </h2>

        <p className="text-[16px] font-light leading-[1.9] mb-5" style={{ color: v.lead }}>
          {block.lead}
        </p>

        {block.body && (
          <p className="text-[15px] font-light leading-[1.88] mb-8" style={{ color: v.body }}>
            {block.body}
          </p>
        )}

        {block.stats && block.stats.length > 0 && (
          <div
            className="grid grid-cols-3 gap-4 mb-8 pb-8"
            style={{ borderBottom: `1px solid ${v.eyebrow ? 'rgba(192,155,74,0.2)' : 'var(--bd)'}` }}
          >
            {block.stats.map((s) => (
              <div key={s.label}>
                <p
                  className="font-display leading-none"
                  style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 38, color: v.stat }}
                >
                  {s.value}
                  {s.suffix && <sup style={{ fontSize: 14, verticalAlign: 'super' }}>{s.suffix}</sup>}
                </p>
                <p className="text-[9px] tracking-[0.14em] uppercase mt-2" style={{ color: v.body }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {block.products && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {block.products.map((p) => (
              <div
                key={p.name}
                className="px-4 py-3.5 border transition-colors duration-300 hover:border-[var(--g)]"
                style={{
                  background: v.productBg,
                  borderColor: v.eyebrow ? 'rgba(192,155,74,0.15)' : 'var(--bd)',
                }}
              >
                <p className="text-[13px] font-medium mb-1" style={{ color: v.strong }}>{p.name}</p>
                <p className="text-[12.5px] font-light leading-[1.65]" style={{ color: v.product }}>{p.desc}</p>
              </div>
            ))}
          </div>
        )}

        {block.bullets && (
          <ul className="flex flex-col gap-4 mb-6">
            {block.bullets.map((b) => (
              <li
                key={b.label}
                className="flex items-start gap-3 text-[14px] font-light leading-[1.78]"
                style={{ color: v.bullet }}
              >
                <span className="w-1 h-1 rounded-full flex-shrink-0 mt-2.5" style={{ background: 'var(--g)' }} />
                <span>
                  <strong className="font-medium" style={{ color: v.strong }}>{b.label}:</strong>{' '}
                  {b.text}
                </span>
              </li>
            ))}
          </ul>
        )}

        {block.pillars && (
          <ul className="flex flex-col gap-3 mb-8">
            {block.pillars.map((p) => (
              <li
                key={p}
                className="flex items-start gap-3 text-[13.5px] font-light leading-[1.7]"
                style={{ color: v.pillar }}
              >
                <span className="text-[11px] mt-0.5 flex-shrink-0" style={{ color: 'var(--g)' }}>◆</span>
                {p}
              </li>
            ))}
          </ul>
        )}

        {block.cta && (
          <Link
            href={block.cta.href}
            className="inline-block mt-2 px-10 py-4 text-[11px] tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:brightness-110 hover:tracking-[0.24em]"
            style={{ background: 'var(--g)', color: 'var(--ink)' }}
          >
            {block.cta.label}
          </Link>
        )}
      </Reveal>
    </div>
  )
}

export default function AboutSplitSection({ block, index = 0 }: Props) {
  const v = VARIANTS[block.variant]
  const imageFirst = block.layout === 'image-left'

  return (
    <section id={block.id} className="relative" style={v.section}>
      {/* Gold transition line */}
      <div
        className="absolute top-0 left-0 right-0 h-px z-[1]"
        style={{ background: 'linear-gradient(to right, transparent, rgba(192,155,74,0.35), transparent)' }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[520px]">
        {imageFirst ? (
          <>
            <Reveal direction="left" delay={index * 30}>
              <ImagePanel block={block} />
            </Reveal>
            <ContentPanel block={block} v={v} revealDirection="right" />
          </>
        ) : (
          <>
            <ContentPanel block={block} v={v} revealDirection="left" />
            <Reveal direction="right" delay={index * 30}>
              <ImagePanel block={block} />
            </Reveal>
          </>
        )}
      </div>
    </section>
  )
}
