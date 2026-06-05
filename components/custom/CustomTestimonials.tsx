import { CUSTOM_TESTIMONIALS } from '@/lib/custom'
import { Reveal, Eyebrow } from '@/components/ui'

export default function CustomTestimonials() {
  return (
    <section
      className="px-12 max-lg:px-6 py-20 lg:py-24"
      style={{ background: 'linear-gradient(180deg, #f5f0e8 0%, var(--iv) 100%)' }}
    >
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="text-center mb-14">
            <Eyebrow>Client Voices</Eyebrow>
            <h2
              className="font-medium leading-[1.06]"
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 'clamp(32px, 3.5vw, 48px)',
                color: 'var(--ink)',
              }}
            >
              Trusted by
              <em style={{ fontStyle: 'italic', color: 'var(--c)' }}> Global Buyers</em>
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {CUSTOM_TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 70}>
              <blockquote
                className="h-full flex flex-col rounded-lg p-8 transition-all duration-400 hover:-translate-y-1"
                style={{
                  background: '#fff',
                  border: '1px solid var(--bd)',
                  boxShadow: '0 8px 32px rgba(26,19,16,0.05)',
                }}
              >
                <span
                  className="inline-block self-start px-3 py-1 text-[14px] tracking-[0.2em] uppercase mb-5 rounded-sm"
                  style={{ background: 'rgba(192,155,74,0.1)', color: 'var(--gd)' }}
                >
                  {t.type}
                </span>
                <p
                  className="text-[17px] font-light leading-[1.82] italic flex-1 mb-6"
                  style={{ fontFamily: '"EB Garamond", serif', color: 'var(--inkm)' }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer>
                  <p className="text-[16px] font-medium" style={{ color: 'var(--inks)' }}>{t.name}</p>
                  <p className="text-[14px] mt-0.5" style={{ color: 'var(--inkl)' }}>{t.role}</p>
                </footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
