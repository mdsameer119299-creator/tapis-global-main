import type { CountryDesignGuide } from '@/lib/seo-landing'
import { Reveal, Eyebrow } from '@/components/ui'

export default function CountryDesignGuideSection({ guide, country }: { guide: CountryDesignGuide; country: string }) {
  return (
    <section className="py-16 lg:py-24" style={{ background: 'var(--iv)' }}>
      <div className="footer-container">
        <Reveal>
          <Eyebrow>Interior Design &amp; Specification Guide</Eyebrow>
          <h2 className="font-medium leading-[1.08] max-w-4xl mb-6" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(30px, 3.4vw, 46px)', color: 'var(--ink)' }}>
            Designing Rugs &amp; Carpets for <em style={{ color: 'var(--c)' }}>{country}</em> Interiors
          </h2>
          <p className="text-[17px] lg:text-[19px] font-light leading-[1.9] max-w-4xl mb-12" style={{ color: 'var(--inkm)' }}>{guide.intro}</p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-14">
          {guide.trends.map((item, index) => (
            <Reveal key={item.title} delay={index * 45}>
              <article className="h-full rounded-lg p-7 lg:p-8" style={{ background: '#fff', border: '1px solid var(--bd)' }}>
                <p className="text-[12px] tracking-[0.24em] uppercase mb-3" style={{ color: 'var(--gd)' }}>Design direction {String(index + 1).padStart(2, '0')}</p>
                <h3 className="font-medium text-[25px] lg:text-[28px] leading-tight mb-3" style={{ fontFamily: '"Cormorant Garamond", serif', color: 'var(--ink)' }}>{item.title}</h3>
                <p className="text-[15.5px] font-light leading-[1.85]" style={{ color: 'var(--inkm)' }}>{item.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-16 mb-14">
          <div>
            <Reveal>
              <h3 className="font-medium text-[28px] lg:text-[34px] leading-tight mb-7" style={{ fontFamily: '"Cormorant Garamond", serif', color: 'var(--ink)' }}>Architect &amp; Interior Designer Specification Notes</h3>
            </Reveal>
            <div className="space-y-6">
              {guide.architectConsiderations.map((item) => (
                <Reveal key={item.title}>
                  <div className="border-l-2 pl-5" style={{ borderColor: 'var(--g)' }}>
                    <h4 className="font-medium text-[17px] mb-1.5" style={{ color: 'var(--inks)' }}>{item.title}</h4>
                    <p className="text-[15px] font-light leading-[1.85]" style={{ color: 'var(--inkm)' }}>{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          <div>
            <Reveal>
              <div className="rounded-lg p-7 lg:p-8 mb-6" style={{ background: '#fff', border: '1px solid var(--bd)' }}>
                <h3 className="font-medium text-[27px] leading-tight mb-5" style={{ fontFamily: '"Cormorant Garamond", serif', color: 'var(--ink)' }}>Palette &amp; Material Direction</h3>
                <div className="flex flex-wrap gap-2.5">
                  {guide.palette.map((tone) => <span key={tone} className="px-3.5 py-2 rounded-sm text-[13px]" style={{ background: 'var(--iv)', border: '1px solid var(--bd)', color: 'var(--inks)' }}>{tone}</span>)}
                </div>
              </div>
            </Reveal>
            <Reveal>
              <div className="rounded-lg p-7 lg:p-8" style={{ background: '#fff', border: '1px solid var(--bd)' }}>
                <h3 className="font-medium text-[27px] leading-tight mb-5" style={{ fontFamily: '"Cormorant Garamond", serif', color: 'var(--ink)' }}>Where These Directions Can Work</h3>
                <div className="space-y-5">
                  {guide.productFit.map((item) => (
                    <div key={item.title}>
                      <h4 className="font-medium text-[15px] mb-1" style={{ color: 'var(--inks)' }}>{item.title}</h4>
                      <p className="text-[14px] font-light leading-[1.8]" style={{ color: 'var(--inkm)' }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal>
          <div className="pt-6 border-t" style={{ borderColor: 'var(--bd)' }}>
            <p className="text-[12px] tracking-[0.22em] uppercase mb-3" style={{ color: 'var(--gd)' }}>Research &amp; Further Reading</p>
            <ul className="flex flex-col gap-2">
              {guide.sources.map((source) => (
                <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="text-[13px] underline underline-offset-4 hover:text-[var(--c)]" style={{ color: 'var(--inkm)' }}>{source.label}</a></li>
              ))}
            </ul>
            <p className="text-[12px] mt-4" style={{ color: 'var(--inkm)' }}>Trend references are editorial context, not guarantees of buyer preference or product performance. Confirm every project specification, test requirement and certification against the actual brief.</p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
