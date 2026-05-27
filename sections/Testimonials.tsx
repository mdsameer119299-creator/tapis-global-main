import { TESTIMONIALS } from '@/lib/data'
import { Reveal, Eyebrow } from '@/components/ui'

export default function Testimonials() {
  const [featured, ...rest] = TESTIMONIALS

  return (
    <section
      id="testimonials"
      className="py-24 px-12 max-lg:px-6"
      style={{ background: 'var(--iv)' }}
    >
      <div className="text-center max-w-[460px] mx-auto mb-16">
        <Reveal>
          <Eyebrow className="justify-center">Client Testimonials</Eyebrow>
          <h2
            className="font-medium leading-[1.06] tracking-tight"
            style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(36px,3.8vw,56px)', color: 'var(--ink)' }}
          >
            Our Partners
            <br />
            <em style={{ fontStyle: 'italic', color: 'var(--c)' }}>Speak</em>
          </h2>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 items-start">
        <Reveal direction="left">
          <div
            className="relative overflow-hidden p-12 max-lg:p-8 h-full"
            style={{ background: 'var(--c)' }}
          >
            <span
              className="absolute top-6 left-3 leading-[0.5] pointer-events-none opacity-[0.07]"
              style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 200, color: '#fff' }}
            >
              &ldquo;
            </span>

            <div className="flex gap-1 mb-5">
              {Array.from({ length: featured.stars }).map((_, i) => (
                <span key={i} className="text-[14px]" style={{ color: 'var(--gp)' }}>★</span>
              ))}
            </div>

            <blockquote
              className="font-serif font-normal italic leading-[1.72] mb-8 relative z-[1]"
              style={{ fontFamily: '"EB Garamond",serif', fontSize: 19.5, color: 'rgba(255,255,255,0.88)' }}
            >
              &ldquo;{featured.quote}&rdquo;
            </blockquote>

            <footer>
              <p className="text-[14px] font-medium tracking-[0.03em]" style={{ color: 'var(--gp)' }}>
                {featured.name}
              </p>
              <p className="text-[12px] mt-1" style={{ color: 'rgba(255,255,255,0.42)' }}>
                {featured.role}
              </p>
            </footer>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3.5">
          {rest.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <div
                className="p-8 h-full border-b-[3px] border-transparent hover:border-b-[var(--g)] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(26,19,16,0.06)]"
                style={{ background: '#fff' }}
              >
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <span key={j} className="text-[13px]" style={{ color: 'var(--g)' }}>★</span>
                  ))}
                </div>
                <blockquote
                  className="font-serif italic leading-[1.75] mb-5 font-normal"
                  style={{ fontFamily: '"EB Garamond",serif', fontSize: 16, color: 'var(--inks)' }}
                >
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <footer
                  className="flex items-center gap-3 pt-3.5"
                  style={{ borderTop: '1px solid var(--bd)' }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-semibold tracking-wide border"
                    style={{
                      fontFamily: '"Outfit",sans-serif',
                      background: 'var(--ivd)',
                      color: 'var(--c)',
                      borderColor: 'var(--bg)',
                    }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-[13.5px] font-medium" style={{ color: 'var(--ink)' }}>{t.name}</p>
                    <p className="text-[12px] mt-0.5 leading-snug" style={{ color: 'var(--inkl)' }}>{t.role}</p>
                  </div>
                </footer>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
