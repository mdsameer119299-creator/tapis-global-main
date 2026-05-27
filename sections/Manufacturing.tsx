import Image from 'next/image'
import { MFG_STEPS, WHY_ITEMS } from '@/lib/data'
import { Reveal, Eyebrow } from '@/components/ui'
import { BLUR_PLACEHOLDER } from '@/components/ui/OptimizedImage'
import ManufacturingHeader from '@/components/manufacturing/ManufacturingHeader'
import WhyIcon from '@/components/manufacturing/WhyIcon'

export default function Manufacturing() {
  return (
    <>
      <section
        id="manufacturing"
        className="py-24 px-0 relative overflow-hidden"
        style={{ background: 'var(--ink)' }}
      >
        <span
          className="absolute -bottom-8 -left-2.5 pointer-events-none select-none leading-none whitespace-nowrap"
          style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 220, fontWeight: 600, color: 'rgba(255,255,255,0.018)', letterSpacing: '-0.04em' }}
        >
          BHADOHI
        </span>

        <ManufacturingHeader />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {MFG_STEPS.map((step, i) => (
            <Reveal key={step.num} delay={i * 80}>
              <div
                className="group px-[22px] py-8 cursor-default border-t-2 border-transparent transition-all duration-300 hover:border-[var(--g)]"
                style={{ background: 'var(--ink)' }}
              >
                <div className="relative w-full fill-frame aspect-[4/3] overflow-hidden mb-3.5">
                  <Image
                    src={step.img}
                    alt={step.title}
                    fill
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL={BLUR_PLACEHOLDER}
                    quality={80}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                    className="object-cover transition-all duration-500 group-hover:scale-[1.04]"
                    style={{
                      filter:  'brightness(0.58) saturate(0.78) sepia(0.14)',
                      opacity: 0.6,
                    }}
                  />
                </div>

                <p className="leading-none mb-3.5" style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 46, fontWeight: 300, color: 'rgba(192,155,74,0.22)' }}>
                  {step.num}
                </p>
                <p className="text-[14px] font-medium mb-2" style={{ color: 'rgba(255,255,255,0.82)' }}>{step.title}</p>
                <p className="text-[12.5px] font-light leading-[1.72]" style={{ color: 'rgba(255,255,255,0.37)' }}>{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="why" className="py-24 px-12 max-lg:px-6" style={{ background: 'var(--ivd)' }}>
        <div className="text-center max-w-[520px] mx-auto mb-[60px]">
          <Reveal>
            <Eyebrow className="justify-center">Why Tapis Global</Eyebrow>
            <h2
              className="font-medium leading-[1.06]"
              style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(36px,3.8vw,56px)', color: 'var(--ink)' }}
            >
              The Tapis
              <br />
              <em style={{ fontStyle: 'italic', color: 'var(--c)' }}>Difference</em>
            </h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border" style={{ borderColor: 'var(--bd)' }}>
          {WHY_ITEMS.map((item, i) => (
            <Reveal key={item.title} delay={i * 80}>
              <div
                className="px-8 py-10 border-r border-b transition-colors duration-300 hover:bg-white max-lg:border-r-0 lg:[&:nth-child(3n)]:border-r-0"
                style={{ borderColor: 'var(--bd)' }}
              >
                <div
                  className="w-[46px] h-[46px] flex items-center justify-center mb-5 border"
                  style={{ borderColor: 'var(--bg)', color: 'var(--g)' }}
                >
                  <WhyIcon type={item.icon} />
                </div>
                <h3
                  className="mb-3 text-[17px] font-medium leading-snug"
                  style={{ fontFamily: '"Cormorant Garamond",serif', color: 'var(--ink)' }}
                >
                  {item.title}
                </h3>
                <p className="text-[13.5px] font-light leading-[1.78]" style={{ color: 'var(--inkm)' }}>
                  {item.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}
