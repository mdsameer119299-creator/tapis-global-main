import { CUSTOM_PROCESS } from '@/lib/custom'
import { Reveal, Eyebrow } from '@/components/ui'

export default function CustomProcess() {
  return (
    <section
      className="px-12 max-lg:px-6 py-20 lg:py-28 relative overflow-hidden"
      style={{ background: '#0d0a08' }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(107,31,31,0.2) 0%, transparent 60%)' }}
      />

      <div className="max-w-6xl mx-auto relative">
        <Reveal>
          <div className="text-center mb-16">
            <Eyebrow white>Our Process</Eyebrow>
            <h2
              className="font-medium leading-[1.06]"
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 'clamp(32px, 3.5vw, 48px)',
                color: '#fff',
              }}
            >
              From Brief
              <em style={{ fontStyle: 'italic', color: 'var(--gp)' }}> to Delivery</em>
            </h2>
          </div>
        </Reveal>

        {/* Desktop horizontal timeline */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-0 relative">
          <div
            className="absolute top-[28px] left-[10%] right-[10%] h-px"
            style={{ background: 'linear-gradient(to right, transparent, rgba(192,155,74,0.35), transparent)' }}
          />
          {CUSTOM_PROCESS.map((step, i) => (
            <Reveal key={step.step} delay={i * 80}>
              <div className="flex flex-col items-center text-center px-3">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-5 relative z-[1]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(192,155,74,0.2) 0%, rgba(107,31,31,0.15) 100%)',
                    border: '1px solid rgba(192,155,74,0.35)',
                  }}
                >
                  <span
                    className="font-display text-[20px]"
                    style={{ fontFamily: '"Cormorant Garamond", serif', color: 'var(--gp)' }}
                  >
                    {step.step}
                  </span>
                </div>
                <h3 className="text-[15px] font-medium mb-2 tracking-wide" style={{ color: '#fff' }}>
                  {step.title}
                </h3>
                <p className="text-[17px] font-light leading-[1.7]" style={{ color: 'rgba(248,244,238,0.42)' }}>
                  {step.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Mobile vertical timeline */}
        <div className="lg:hidden flex flex-col gap-8 relative pl-8">
          <div
            className="absolute left-[15px] top-2 bottom-2 w-px"
            style={{ background: 'linear-gradient(to bottom, rgba(192,155,74,0.4), rgba(192,155,74,0.1))' }}
          />
          {CUSTOM_PROCESS.map((step, i) => (
            <Reveal key={step.step} delay={i * 60}>
              <div className="relative">
                <div
                  className="absolute -left-8 top-1 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: '#0d0a08', border: '1px solid rgba(192,155,74,0.4)' }}
                >
                  <span className="text-[15px]" style={{ color: 'var(--gp)' }}>{step.step}</span>
                </div>
                <h3 className="text-[16px] font-medium mb-1.5" style={{ color: '#fff' }}>{step.title}</h3>
                <p className="text-[15px] font-light leading-[1.72]" style={{ color: 'rgba(248,244,238,0.42)' }}>
                  {step.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
