import Image from 'next/image'
import Link from 'next/link'
import { CATALOGUE_PREVIEW } from '@/lib/catalogue'
import { Reveal, Eyebrow } from '@/components/ui'
import { BLUR_PLACEHOLDER } from '@/components/ui/OptimizedImage'

export default function CataloguePreview() {
  return (
    <section className="px-12 max-lg:px-6 py-16 lg:py-20" style={{ background: '#0d0a08' }}>
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <div className="text-center mb-12">
            <Eyebrow white>Preview</Eyebrow>
            <h2
              className="font-medium leading-[1.06]"
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 'clamp(28px, 3.2vw, 40px)',
                color: '#fff',
              }}
            >
              A Glimpse of
              <em style={{ fontStyle: 'italic', color: 'var(--gp)' }}> What Awaits</em>
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {CATALOGUE_PREVIEW.map((item, i) => (
            <Reveal key={item.src} delay={i * 60}>
              <div
                className="relative aspect-[3/4] rounded-lg overflow-hidden group"
                style={{ border: '1px solid rgba(192,155,74,0.12)' }}
              >
                <Image
                  src={item.src}
                  alt={item.label}
                  fill
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL={BLUR_PLACEHOLDER}
                  quality={75}
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover scale-105"
                  style={{ filter: 'blur(6px) brightness(0.55) saturate(0.8)' }}
                />
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center"
                  style={{ background: 'rgba(10,8,6,0.45)' }}
                >
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center mb-3 text-[16px]"
                    style={{ background: 'rgba(192,155,74,0.2)', color: 'var(--gp)' }}
                  >
                    🔒
                  </span>
                  <p className="text-[15px] tracking-[0.16em] uppercase" style={{ color: 'rgba(248,244,238,0.5)' }}>
                    {item.label}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="text-center text-[16px] font-light mb-6" style={{ color: 'rgba(248,244,238,0.42)' }}>
            Full high-resolution catalogue pages available after request.
          </p>
          <div className="text-center">
            <Link
              href="#catalogue-form"
              className="inline-block px-10 py-3.5 text-[15px] tracking-[0.2em] uppercase font-medium border rounded-sm transition-all duration-300 hover:border-[var(--g)] hover:text-[var(--gp)]"
              style={{ borderColor: 'rgba(192,155,74,0.35)', color: 'rgba(248,244,238,0.55)' }}
            >
              Unlock Full Catalogue
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
