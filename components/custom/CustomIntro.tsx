import { CUSTOM_INTRO } from '@/lib/custom'
import { Reveal, Eyebrow } from '@/components/ui'

export default function CustomIntro() {
  return (
    <section
      className="relative px-12 max-lg:px-6 py-20 lg:py-28 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #f5f0e8 0%, var(--iv) 100%)' }}
    >
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, var(--g) 0%, transparent 50%), radial-gradient(circle at 80% 50%, var(--c) 0%, transparent 50%)',
        }}
      />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start relative">
        <Reveal direction="left">
          <Eyebrow>{CUSTOM_INTRO.eyebrow}</Eyebrow>
          <h2
            className="font-medium leading-[1.06] mb-6"
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: 'clamp(34px, 3.8vw, 54px)',
              color: 'var(--ink)',
            }}
          >
            {CUSTOM_INTRO.title}
            <br />
            <em style={{ fontStyle: 'italic', color: 'var(--c)' }}>{CUSTOM_INTRO.titleEm}</em>
          </h2>
          <p className="text-[18px] font-light leading-[1.9] mb-5" style={{ color: 'var(--inkm)' }}>
            {CUSTOM_INTRO.lead}
          </p>
          <p className="text-[17px] font-light leading-[1.88]" style={{ color: 'var(--inkm)' }}>
            {CUSTOM_INTRO.body}
          </p>

          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 pt-8"
            style={{ borderTop: '1px solid var(--bd)' }}
          >
            {CUSTOM_INTRO.highlights.map((h) => (
              <div key={h.label}>
                <p
                  className="font-display leading-none"
                  style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, color: 'var(--c)' }}
                >
                  {h.value}
                  <sup style={{ fontSize: 13, verticalAlign: 'super' }}>{h.suffix}</sup>
                </p>
                <p className="text-[14px] tracking-[0.14em] uppercase mt-2" style={{ color: 'var(--inkl)' }}>
                  {h.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal direction="right">
          <div
            className="rounded-lg p-8 lg:p-10"
            style={{
              background: 'rgba(255,255,255,0.72)',
              border: '1px solid rgba(192,155,74,0.18)',
              boxShadow: '0 24px 64px rgba(26,19,16,0.06)',
            }}
          >
            <p
              className="text-[15px] tracking-[0.28em] uppercase mb-6 font-medium"
              style={{ color: 'var(--gd)' }}
            >
              What We Customize
            </p>
            <ul className="flex flex-col gap-4">
              {CUSTOM_INTRO.capabilities.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-[16px] font-light leading-[1.75]"
                  style={{ color: 'var(--inkm)' }}
                >
                  <span
                    className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full mt-0.5 text-[15px]"
                    style={{ background: 'rgba(192,155,74,0.15)', color: 'var(--gd)' }}
                  >
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      <div
        className="max-w-6xl mx-auto mt-16 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(192,155,74,0.35), transparent)' }}
      />
    </section>
  )
}
