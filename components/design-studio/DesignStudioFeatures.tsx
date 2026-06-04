import Image from 'next/image'
import Link from 'next/link'
import { BLUR_PLACEHOLDER } from '@/components/ui/OptimizedImage'
import { DESIGN_STUDIO_FEATURES } from '@/lib/design-studio'

export default function DesignStudioFeatures() {
  return (
    <div style={{ background: 'rgba(248,244,238,0.6)' }}>
      {DESIGN_STUDIO_FEATURES.map((card, index) => {
        const imageRight = index % 2 === 1
        return (
          <section
            key={card.id}
            id={card.id}
            className="scroll-mt-32 py-14 sm:py-16 border-t"
            style={{ borderColor: 'var(--bd)' }}
          >
            <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
              <div
                className={`grid lg:grid-cols-2 gap-10 lg:gap-14 items-center ${
                  imageRight ? '' : ''
                }`}
              >
                <div className={imageRight ? 'lg:order-2' : ''}>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={card.image}
                      alt={card.imageAlt}
                      fill
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL={BLUR_PLACEHOLDER}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                      style={{ filter: 'saturate(0.92)' }}
                    />
                  </div>
                </div>
                <div className={imageRight ? 'lg:order-1' : ''}>
                  <h3
                    className="font-display font-normal mb-5"
                    style={{
                      fontFamily: '"Cormorant Garamond", serif',
                      fontSize: 'clamp(26px, 3.5vw, 38px)',
                      color: 'var(--ink)',
                    }}
                  >
                    {card.title}
                  </h3>
                  <ul className="space-y-2.5 mb-8">
                    {card.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-3 text-[14px] font-light leading-relaxed"
                        style={{ color: 'var(--inks)' }}
                      >
                        <span
                          className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: 'var(--g)' }}
                        />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={card.cta.href}
                    className="inline-block px-8 py-3 text-[10px] tracking-[0.16em] uppercase font-semibold border transition-colors hover:bg-[var(--c)] hover:text-white hover:border-[var(--c)]"
                    style={{ borderColor: 'var(--c)', color: 'var(--c)' }}
                  >
                    {card.cta.label}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}
