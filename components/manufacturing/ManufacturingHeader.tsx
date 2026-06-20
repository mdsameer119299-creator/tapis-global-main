import Image from 'next/image'
import Link from 'next/link'
import { MFG_HEADER } from '@/lib/home'
import { Reveal, Eyebrow } from '@/components/ui'
import { BLUR_PLACEHOLDER } from '@/components/ui/OptimizedImage'

export default function ManufacturingHeader() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16 px-12 max-lg:px-6">
      <Reveal direction="left">
        <Eyebrow white>Manufacturing</Eyebrow>
        <h2
          className="font-medium leading-[1.06] mb-7"
          style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(36px,3.8vw,56px)', color: '#fff' }}
        >
          Integrated
          <br />
          <em style={{ fontStyle: 'italic', color: 'var(--gl)' }}>Manufacturing.</em>
        </h2>
        <p
          className="text-[20px] font-light leading-[1.85] max-w-[58ch] mb-7"
          style={{ color: 'rgba(255,255,255,0.68)' }}
        >
          {MFG_HEADER.lead}
        </p>
        <Link
          href="#manufacturing"
          className="inline-flex items-center gap-3 text-[14px] tracking-[0.14em] uppercase transition-colors duration-200 hover:text-white group"
          style={{ color: 'var(--gl)' }}
        >
          Explore Production Capability
          <span className="block h-px w-9 bg-current transition-all duration-300 group-hover:w-14" />
        </Link>
      </Reveal>

      <Reveal direction="right" delay={120}>
        <div className="relative overflow-hidden aspect-[16/10] group fill-frame">
          <Image
            src={MFG_HEADER.image}
            alt="Traditional loom weaving — handmade carpet artisan at work Bhadohi Uttar Pradesh India"
            fill
            loading="lazy"
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
            quality={85}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center transition-transform duration-[800ms] group-hover:scale-[1.03]"
            style={{ filter: 'brightness(0.96)', opacity: 0.95 }}
          />
        </div>
      </Reveal>
    </div>
  )
}
