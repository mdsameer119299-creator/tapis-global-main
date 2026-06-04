import { DESIGN_STUDIO_PROCESS } from '@/lib/design-studio'

export default function DesignStudioHowItWorks() {
  return (
    <section className="py-16 sm:py-20" style={{ background: 'rgba(248,244,238,1)' }}>
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="text-center mb-12">
          <p className="text-[10px] tracking-[0.32em] uppercase mb-3" style={{ color: 'var(--gd)' }}>
            Process
          </p>
          <h2
            className="font-display font-normal"
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: 'clamp(28px, 4vw, 42px)',
              color: 'var(--ink)',
            }}
          >
            How It Works
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4">
          {DESIGN_STUDIO_PROCESS.map((step, i) => (
            <div key={step.step} className="relative text-center lg:text-left">
              {i < DESIGN_STUDIO_PROCESS.length - 1 && (
                <span
                  className="hidden lg:block absolute top-6 left-[calc(100%+8px)] w-[calc(100%-16px)] h-px"
                  style={{ background: 'rgba(192,155,74,0.35)' }}
                  aria-hidden
                />
              )}
              <div
                className="w-12 h-12 mx-auto lg:mx-0 mb-4 flex items-center justify-center rounded-full text-[11px] font-semibold tracking-wider"
                style={{ background: 'var(--cd)', color: 'var(--gp)', border: '1px solid rgba(192,155,74,0.3)' }}
              >
                {step.step}
              </div>
              <h3 className="text-[12px] tracking-[0.12em] uppercase font-semibold mb-2" style={{ color: 'var(--ink)' }}>
                {step.title}
              </h3>
              <p className="text-[13px] font-light leading-relaxed" style={{ color: 'var(--inkm)' }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
