import Link from 'next/link'
import Image from 'next/image'
import type { Guide } from '@/lib/guides'
import { getRelatedGuides, GUIDE_CATEGORY_META } from '@/lib/guides'
import { getProductCategory } from '@/lib/products'
import { SITE } from '@/lib/data'
import { Reveal, Eyebrow } from '@/components/ui'
import { BLUR_PLACEHOLDER } from '@/components/ui/OptimizedImage'
import OptimizedImage from '@/components/ui/OptimizedImage'

export default function GuideArticle({ guide }: { guide: Guide }) {
  const related = getRelatedGuides(guide.relatedGuides)
  const products = guide.relatedProducts
    .map((s) => getProductCategory(s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
  const waHref = `${SITE.whatsapp}?text=${encodeURIComponent('Hello Tapis Global, I have a question after reading your guide.')}`

  return (
    <article>
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[46vh] max-lg:min-h-[40vh] flex items-end">
        <div className="absolute inset-0">
          <div className="relative w-full h-full fill-frame">
            <OptimizedImage src={guide.heroImage} alt={guide.h1} fill priority tone="hero" sizes="100vw" className="object-cover" />
          </div>
        </div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,8,6,0.95) 0%, rgba(10,8,6,0.5) 55%, rgba(10,8,6,0.3) 100%)' }} />
        <div className="relative z-[2] footer-container pb-12 pt-32 max-w-3xl">
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-2 text-[13px] tracking-[0.14em] uppercase" style={{ color: 'rgba(248,244,238,0.55)' }}>
              <li><Link href="/" className="hover:text-[var(--gl)] transition-colors">Home</Link></li>
              <li aria-hidden>›</li>
              <li><Link href="/guides" className="hover:text-[var(--gl)] transition-colors">Guides</Link></li>
              <li aria-hidden>›</li>
              <li aria-current="page" style={{ color: 'var(--gl)' }}>{guide.title}</li>
            </ol>
          </nav>
          <p className="text-[14px] tracking-[0.28em] uppercase mb-3" style={{ color: 'var(--gl)' }}>
            {GUIDE_CATEGORY_META[guide.category].label}
          </p>
          <h1 className="font-display font-light leading-[1.08] mb-4" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(30px, 4vw, 54px)', color: '#fff' }}>
            {guide.h1}
          </h1>
        </div>
      </section>

      {/* Body */}
      <section className="py-14 lg:py-20 footer-container" style={{ background: 'var(--iv)' }}>
        <div className="max-w-3xl">
          <Reveal>
            <p className="text-[19px] font-light leading-[1.9] mb-10" style={{ color: 'var(--inks)' }}>{guide.intro}</p>
          </Reveal>
          <div className="flex flex-col gap-10">
            {guide.sections.map((s) => (
              <Reveal key={s.h2}>
                <h2 className="font-medium leading-[1.15] mb-3" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(23px, 2.5vw, 32px)', color: 'var(--ink)' }}>
                  {s.h2}
                </h2>
                <p className="text-[17px] font-light leading-[1.9]" style={{ color: 'var(--inkm)' }}>{s.body}</p>
              </Reveal>
            ))}
          </div>

          {/* Key takeaways */}
          <Reveal>
            <div className="mt-12 rounded-xl p-7" style={{ background: '#fff', border: '1px solid var(--bd)', boxShadow: '0 8px 32px rgba(26,19,16,0.04)' }}>
              <p className="text-[14px] tracking-[0.24em] uppercase font-medium mb-4" style={{ color: 'var(--gd)' }}>Key Takeaways</p>
              <ul className="flex flex-col gap-3">
                {guide.takeaways.map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[16px] font-light leading-[1.7]" style={{ color: 'var(--inkm)' }}>
                    <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rotate-45" style={{ background: 'var(--g)' }} aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 lg:py-16 footer-container" style={{ background: '#fff' }}>
        <Reveal>
          <Eyebrow>FAQs</Eyebrow>
          <h2 className="font-medium leading-[1.1] mb-8" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(24px, 2.6vw, 34px)', color: 'var(--ink)' }}>
            Frequently Asked Questions
          </h2>
        </Reveal>
        <div className="max-w-3xl flex flex-col gap-3">
          {guide.faqs.map((faq, i) => (
            <Reveal key={faq.q} delay={i * 25}>
              <details className="group rounded-lg overflow-hidden" style={{ background: 'var(--iv)', border: '1px solid var(--bd)' }}>
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-6 py-5 text-[16.5px] font-medium select-none" style={{ color: 'var(--inks)' }}>
                  <span>{faq.q}</span>
                  <span className="flex-shrink-0 text-[22px] leading-none transition-transform duration-300 group-open:rotate-45" style={{ color: 'var(--g)' }} aria-hidden>+</span>
                </summary>
                <div className="px-6 pb-5 -mt-1">
                  <p className="text-[15.5px] font-light leading-[1.8]" style={{ color: 'var(--inkm)' }}>{faq.a}</p>
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 lg:py-16 footer-container">
        <div className="rounded-xl p-9 lg:p-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(107,31,31,0.16) 0%, rgba(192,155,74,0.10) 100%)', border: '1px solid rgba(192,155,74,0.22)' }}>
          <Reveal>
            <p className="text-[15px] tracking-[0.28em] uppercase mb-3 font-medium" style={{ color: 'var(--gd)' }}>Manufacturer · Supplier · Exporter</p>
            <h2 className="font-medium leading-[1.08] mb-4 max-w-2xl" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(26px, 2.8vw, 38px)', color: 'var(--ink)' }}>
              Have a Project or Question?
            </h2>
            <p className="text-[16px] font-light leading-[1.82] max-w-2xl mb-8" style={{ color: 'var(--inkm)' }}>
              We are a third-generation, family-owned carpet and rug manufacturer in Bhadohi. Request our catalogue, get a quote, or message us on WhatsApp.
            </p>
            <div className="flex flex-wrap gap-3.5">
              <Link href="/catalogue" className="px-9 py-3.5 text-[15px] tracking-[0.18em] uppercase font-semibold rounded-sm transition-all duration-300 hover:brightness-110" style={{ background: 'var(--g)', color: 'var(--ink)' }}>Request Catalogue</Link>
              <Link href="/contact" className="px-9 py-3.5 text-[15px] tracking-[0.18em] uppercase font-medium rounded-sm border transition-colors duration-300 hover:border-[var(--c)] hover:text-[var(--c)]" style={{ borderColor: 'var(--bd)', color: 'var(--inks)' }}>Get Quote</Link>
              <a href={waHref} target="_blank" rel="noopener noreferrer" className="px-9 py-3.5 text-[15px] tracking-[0.18em] uppercase font-semibold rounded-sm transition-all duration-300 hover:brightness-105" style={{ background: '#25D366', color: '#fff' }}>WhatsApp</a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Related guides + products */}
      <section className="py-14 lg:py-16 footer-container" style={{ background: '#fff' }}>
        {related.length > 0 && (
          <>
            <Reveal>
              <Eyebrow>Related Guides</Eyebrow>
              <h2 className="font-medium leading-[1.1] mb-8" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(24px, 2.6vw, 34px)', color: 'var(--ink)' }}>
                Keep Reading
              </h2>
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
              {related.map((g, i) => (
                <Reveal key={g.slug} delay={i * 50}>
                  <Link href={`/guides/${g.slug}`} className="group block relative overflow-hidden rounded-xl aspect-[4/3]" style={{ boxShadow: '0 8px 32px rgba(26,19,16,0.08)', border: '1px solid rgba(192,155,74,0.12)' }}>
                    <Image src={g.heroImage} alt={g.title} fill loading="lazy" placeholder="blur" blurDataURL={BLUR_PLACEHOLDER} quality={78} sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.08]" style={{ filter: 'brightness(0.82) saturate(0.92)' }} />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,8,6,0.92) 0%, rgba(10,8,6,0.2) 60%, transparent 100%)' }} />
                    <div className="absolute bottom-0 left-0 right-0 p-5 z-[2]">
                      <h3 className="font-medium leading-[1.2]" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '19px', color: '#fff' }}>{g.title}</h3>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </>
        )}

        <Reveal>
          <p className="text-[14px] tracking-[0.28em] uppercase font-medium mb-5" style={{ color: 'var(--gd)' }}>Related Products</p>
        </Reveal>
        <div className="flex flex-wrap gap-3">
          {products.map((p) => (
            <Link key={p.slug} href={`/products/${p.slug}`} className="px-5 py-2.5 text-[15px] tracking-[0.04em] border rounded-sm transition-colors duration-200 hover:border-[var(--c)] hover:text-[var(--c)]" style={{ borderColor: 'var(--bd)', color: 'var(--inks)' }}>
              {p.name}
            </Link>
          ))}
        </div>

        <Reveal>
          <div className="mt-10">
            <Link href="/guides" className="inline-flex items-center gap-3 text-[15px] tracking-[0.16em] uppercase transition-colors duration-200 hover:text-[var(--c)] group" style={{ color: 'var(--inks)' }}>
              All Guides <span className="block h-px w-8 bg-current transition-all duration-300 group-hover:w-12" />
            </Link>
          </div>
        </Reveal>
      </section>
    </article>
  )
}
