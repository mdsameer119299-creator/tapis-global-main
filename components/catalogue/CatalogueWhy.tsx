import { CATALOGUE_WHY } from '@/lib/catalogue'
import { Reveal, Eyebrow } from '@/components/ui'

export default function CatalogueWhy() {
  return (
    <section className="px-12 max-lg:px-6 py-16 lg:py-20" style={{ background: 'var(--iv)' }}>
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <Eyebrow>Inside the Lookbook</Eyebrow>
          <h2
            className="font-medium leading-[1.06] mb-12"
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: 'clamp(28px, 3.2vw, 42px)',
              color: 'var(--ink)',
            }}
          >
            Why Request
            <em style={{ fontStyle: 'italic', color: 'var(--c)' }}> Our Catalogue</em>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATALOGUE_WHY.map((item, i) => (
            <Reveal key={item.title} delay={i * 50}>
              <div
                className="h-full rounded-lg p-6 transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: '#fff',
                  border: '1px solid var(--bd)',
                  boxShadow: '0 4px 24px rgba(26,19,16,0.04)',
                }}
              >
                <span className="text-[15px] tracking-[0.2em] uppercase mb-3 block" style={{ color: 'var(--gd)' }}>
                  0{i + 1}
                </span>
                <h3 className="text-[17px] font-medium mb-2" style={{ color: 'var(--inks)' }}>{item.title}</h3>
                <p className="text-[18px] font-light leading-[1.72]" style={{ color: 'var(--inkm)' }}>{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
