import Image from 'next/image'
import { CUSTOM_GALLERY } from '@/lib/custom'
import { Reveal, Eyebrow } from '@/components/ui'
import { BLUR_PLACEHOLDER } from '@/components/ui/OptimizedImage'

const SPAN_CLASS = {
  tall:   'lg:row-span-2',
  wide:   'lg:col-span-2',
  square: '',
} as const

export default function CustomGallery() {
  return (
    <section
      className="px-12 max-lg:px-6 py-20 lg:py-28"
      style={{ background: '#0d0a08' }}
    >
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="text-center mb-14">
            <Eyebrow white>Portfolio</Eyebrow>
            <h2
              className="font-medium leading-[1.06]"
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 'clamp(34px, 3.8vw, 52px)',
                color: '#fff',
              }}
            >
              Custom Work,
              <em style={{ fontStyle: 'italic', color: 'var(--gp)' }}> Crafted to Perfection</em>
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[220px] lg:auto-rows-[200px] gap-4">
          {CUSTOM_GALLERY.map((item, i) => (
            <Reveal key={item.src} delay={i * 50}>
              <figure
                className={`group relative overflow-hidden rounded-lg h-full min-h-[220px] ${SPAN_CLASS[item.span]}`}
                style={{
                  boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
                  border: '1px solid rgba(192,155,74,0.12)',
                }}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL={BLUR_PLACEHOLDER}
                  quality={82}
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.08]"
                  style={{ filter: 'brightness(0.82) saturate(0.9) sepia(0.05)' }}
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'linear-gradient(to top, rgba(10,8,6,0.85) 0%, transparent 55%)' }}
                />
                <figcaption
                  className="absolute bottom-0 left-0 right-0 px-5 py-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500"
                >
                  <p className="text-[10px] tracking-[0.22em] uppercase" style={{ color: 'var(--gp)' }}>
                    {item.caption}
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
