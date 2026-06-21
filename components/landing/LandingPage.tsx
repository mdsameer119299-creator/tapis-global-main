import Link from 'next/link'
import Image from 'next/image'
import type { SeoLanding } from '@/lib/seo-landing'
import { getRelatedIndustries, getRelatedSolutions } from '@/lib/seo-landing'
import { getProductCategory } from '@/lib/products'
import { SITE } from '@/lib/data'
import { Reveal, Eyebrow } from '@/components/ui'
import { BLUR_PLACEHOLDER } from '@/components/ui/OptimizedImage'
import OptimizedImage from '@/components/ui/OptimizedImage'
import CategoryTrustSignals from '@/components/products/CategoryTrustSignals'

const BASE_PATH: Record<SeoLanding['kind'], string> = {
  industry: '/industries',
  solution: '/solutions',
}

const BASE_LABEL: Record<SeoLanding['kind'], string> = {
  industry: 'Industries',
  solution: 'Solutions',
}

export default function LandingPage({ page }: { page: SeoLanding }) {
  const basePath = BASE_PATH[page.kind]
  const baseLabel = BASE_LABEL[page.kind]

  const relatedProducts = page.relatedProducts
    .map((slug) => getProductCategory(slug))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
  // Cross-link to the *other* cluster: industries link to solutions and vice-versa,
  // plus same-cluster siblings — guaranteeing 3+ related landing links, no orphans.
  const relatedLandings =
    page.kind === 'industry'
      ? [...getRelatedSolutions(page.relatedSolutions ?? []), ...getRelatedIndustries(page.relatedIndustries)]
      : [...getRelatedIndustries(page.relatedIndustries), ...getRelatedSolutions(page.relatedSolutions ?? [])]
  const relatedLandingsTop = relatedLandings.slice(0, 3)

  const waHref = `${SITE.whatsapp}?text=${encodeURIComponent(
    `Hello Tapis Global, I'd like to enquire about ${page.label} (manufacturing / supply).`,
  )}`

  return (
    <article>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden min-h-[58vh] max-lg:min-h-[50vh] flex items-end">
        <div className="absolute inset-0">
          <div className="relative w-full h-full fill-frame">
            <OptimizedImage
              src={page.heroImage}
              alt={`${page.h1} — Tapis Global International, Bhadohi`}
              fill
              priority
              tone="hero"
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(10,8,6,0.95) 0%, rgba(10,8,6,0.5) 55%, rgba(10,8,6,0.3) 100%)' }}
        />
        <div className="relative z-[2] footer-container pb-14 pt-32 max-w-4xl">
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-2 text-[13px] tracking-[0.14em] uppercase" style={{ color: 'rgba(248,244,238,0.55)' }}>
              <li><Link href="/" className="hover:text-[var(--gl)] transition-colors">Home</Link></li>
              <li aria-hidden>›</li>
              <li><Link href={basePath} className="hover:text-[var(--gl)] transition-colors">{baseLabel}</Link></li>
              <li aria-hidden>›</li>
              <li aria-current="page" style={{ color: 'var(--gl)' }}>{page.label}</li>
            </ol>
          </nav>
          <p className="text-[15px] tracking-[0.32em] uppercase mb-3" style={{ color: 'var(--gl)' }}>
            Manufacturer · Supplier · Exporter
          </p>
          <h1
            className="font-display font-light leading-[1.05] mb-4"
            style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(32px, 4vw, 56px)', color: '#fff' }}
          >
            {page.h1}
          </h1>
          <p className="text-[17px] font-light leading-[1.85] mb-7 max-w-2xl" style={{ color: 'rgba(248,244,238,0.62)' }}>
            {page.tagline}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/catalogue" className="px-7 py-3.5 text-[14px] tracking-[0.18em] uppercase font-semibold transition-all duration-300 hover:brightness-110" style={{ background: 'var(--g)', color: 'var(--ink)' }}>
              Request Catalogue
            </Link>
            <Link href="/contact" className="px-7 py-3.5 text-[14px] tracking-[0.18em] uppercase font-medium border transition-all duration-300 hover:bg-white/10" style={{ borderColor: 'rgba(255,255,255,0.35)', color: '#fff' }}>
              Get Quote
            </Link>
          </div>
        </div>
      </section>

      {/* ── Overview ── */}
      <section className="py-14 lg:py-20 footer-container" style={{ background: 'var(--iv)' }}>
        <Reveal>
          <Eyebrow>{page.eyebrow}</Eyebrow>
          <p className="text-[19px] font-light leading-[1.9] max-w-3xl mb-6" style={{ color: 'var(--inkm)' }}>
            {page.intro}
          </p>
          <p className="text-[17px] font-light leading-[1.9] max-w-3xl mb-12" style={{ color: 'var(--inkm)' }}>
            {page.overview}
          </p>
        </Reveal>

        <div className="flex flex-col gap-10 max-w-3xl">
          {page.sections.map((s) => (
            <Reveal key={s.h2}>
              <h2 className="font-medium leading-[1.15] mb-3" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(24px, 2.6vw, 34px)', color: 'var(--ink)' }}>
                {s.h2}
              </h2>
              <p className="text-[17px] font-light leading-[1.88]" style={{ color: 'var(--inkm)' }}>{s.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Trust signals ── */}
      <CategoryTrustSignals />

      {/* ── Applications ── */}
      <section className="py-14 lg:py-20 footer-container" style={{ background: '#fff' }}>
        <Reveal>
          <Eyebrow>Applications</Eyebrow>
          <h2 className="font-medium leading-[1.1] mb-10" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(26px, 2.8vw, 38px)', color: 'var(--ink)' }}>
            Where We <em style={{ fontStyle: 'italic', color: 'var(--c)' }}>Deliver</em>
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {page.applications.map((a, i) => (
            <Reveal key={a.title} delay={i * 40}>
              <div className="h-full rounded-lg p-7" style={{ background: 'var(--iv)', border: '1px solid var(--bd)' }}>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 mt-1 w-2 h-2 rotate-45" style={{ background: 'var(--g)' }} aria-hidden />
                  <div>
                    <h3 className="text-[18px] font-medium mb-2" style={{ color: 'var(--inks)' }}>{a.title}</h3>
                    <p className="text-[15px] font-light leading-[1.78]" style={{ color: 'var(--inkm)' }}>{a.desc}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Why choose ── */}
      <section className="py-14 lg:py-20 footer-container" style={{ background: 'var(--iv)' }}>
        <Reveal>
          <Eyebrow>Why Tapis Global</Eyebrow>
          <h2 className="font-medium leading-[1.1] mb-10" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(26px, 2.8vw, 38px)', color: 'var(--ink)' }}>
            Why Choose <em style={{ fontStyle: 'italic', color: 'var(--c)' }}>Us</em>
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {page.whyPoints.map((w, i) => (
            <Reveal key={w.title} delay={i * 40}>
              <div className="h-full rounded-lg p-6" style={{ background: '#fff', border: '1px solid var(--bd)' }}>
                <h3 className="text-[16px] font-medium mb-2" style={{ color: 'var(--inks)' }}>{w.title}</h3>
                <p className="text-[15px] font-light leading-[1.72]" style={{ color: 'var(--inkm)' }}>{w.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-14 lg:py-20 footer-container" style={{ background: '#fff' }}>
        <Reveal>
          <Eyebrow>Frequently Asked Questions</Eyebrow>
          <h2 className="font-medium leading-[1.1] mb-8" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(26px, 2.8vw, 38px)', color: 'var(--ink)' }}>
            {page.label} — <em style={{ fontStyle: 'italic', color: 'var(--c)' }}>FAQs</em>
          </h2>
        </Reveal>
        <div className="max-w-3xl flex flex-col gap-3">
          {page.faqs.map((faq, i) => (
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

      {/* ── CTA band ── */}
      <section className="py-14 lg:py-16 footer-container">
        <div
          className="rounded-xl p-9 lg:p-12 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(107,31,31,0.16) 0%, rgba(192,155,74,0.10) 100%)', border: '1px solid rgba(192,155,74,0.22)' }}
        >
          <Reveal>
            <p className="text-[15px] tracking-[0.28em] uppercase mb-3 font-medium" style={{ color: 'var(--gd)' }}>
              Manufacturer · Supplier · Exporter
            </p>
            <h2 className="font-medium leading-[1.08] mb-4 max-w-2xl" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(26px, 2.8vw, 38px)', color: 'var(--ink)' }}>
              Discuss Your {page.label} Requirement
            </h2>
            <p className="text-[16px] font-light leading-[1.82] max-w-2xl mb-8" style={{ color: 'var(--inkm)' }}>
              Manufactured in Bhadohi and supplied across India and international markets. Request our catalogue, get a quote, or message us on WhatsApp.
            </p>
            <div className="flex flex-wrap gap-3.5">
              <Link href="/catalogue" className="px-9 py-3.5 text-[15px] tracking-[0.18em] uppercase font-semibold rounded-sm transition-all duration-300 hover:brightness-110" style={{ background: 'var(--g)', color: 'var(--ink)' }}>
                Request Catalogue
              </Link>
              <Link href="/contact" className="px-9 py-3.5 text-[15px] tracking-[0.18em] uppercase font-medium rounded-sm border transition-colors duration-300 hover:border-[var(--c)] hover:text-[var(--c)]" style={{ borderColor: 'var(--bd)', color: 'var(--inks)' }}>
                Get Quote
              </Link>
              <a href={waHref} target="_blank" rel="noopener noreferrer" className="px-9 py-3.5 text-[15px] tracking-[0.18em] uppercase font-semibold rounded-sm transition-all duration-300 hover:brightness-105" style={{ background: '#25D366', color: '#fff' }}>
                WhatsApp
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Related products ── */}
      <section className="py-14 lg:py-16 footer-container" style={{ background: '#fff' }}>
        <Reveal>
          <Eyebrow>Related Products</Eyebrow>
          <h2 className="font-medium leading-[1.1] mb-10" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(26px, 2.8vw, 38px)', color: 'var(--ink)' }}>
            Recommended <em style={{ fontStyle: 'italic', color: 'var(--c)' }}>Collections</em>
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {relatedProducts.map((cat, i) => (
            <Reveal key={cat.slug} delay={i * 50}>
              <Link href={`/products/${cat.slug}`} className="group block relative overflow-hidden rounded-xl aspect-[4/5]" style={{ boxShadow: '0 8px 32px rgba(26,19,16,0.08)', border: '1px solid rgba(192,155,74,0.12)' }}>
                <Image src={cat.cardImage} alt={`${cat.name} manufacturer India`} fill loading="lazy" placeholder="blur" blurDataURL={BLUR_PLACEHOLDER} quality={80} sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.08]" style={{ filter: 'brightness(0.86) saturate(0.92) sepia(0.04)' }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,8,6,0.92) 0%, rgba(10,8,6,0.2) 55%, transparent 100%)' }} />
                <div className="absolute bottom-0 left-0 right-0 p-6 z-[2]">
                  <h3 className="font-medium leading-[1.1] mb-2" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(20px, 2vw, 26px)', color: '#fff' }}>{cat.name}</h3>
                  <span className="inline-flex items-center gap-2 text-[14px] tracking-[0.18em] uppercase font-medium" style={{ color: 'var(--gl)' }}>View Details <span aria-hidden>→</span></span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* Related industries / solutions — internal linking */}
        {relatedLandingsTop.length > 0 && (
          <div className="mt-12">
            <Reveal>
              <p className="text-[14px] tracking-[0.28em] uppercase font-medium mb-5" style={{ color: 'var(--gd)' }}>
                Related Solutions &amp; Industries
              </p>
            </Reveal>
            <div className="flex flex-wrap gap-3">
              {relatedLandingsTop.map((l) => (
                <Link
                  key={`${l.kind}-${l.slug}`}
                  href={`${BASE_PATH[l.kind]}/${l.slug}`}
                  className="px-5 py-2.5 text-[15px] tracking-[0.06em] border rounded-sm transition-colors duration-200 hover:border-[var(--c)] hover:text-[var(--c)]"
                  style={{ borderColor: 'var(--bd)', color: 'var(--inks)' }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        <Reveal>
          <div className="mt-10 flex flex-wrap gap-6">
            <Link href="/products" className="inline-flex items-center gap-3 text-[15px] tracking-[0.16em] uppercase transition-colors duration-200 hover:text-[var(--c)] group" style={{ color: 'var(--inks)' }}>
              All Products <span className="block h-px w-8 bg-current transition-all duration-300 group-hover:w-12" />
            </Link>
            <Link href={basePath} className="inline-flex items-center gap-3 text-[15px] tracking-[0.16em] uppercase transition-colors duration-200 hover:text-[var(--c)] group" style={{ color: 'var(--inks)' }}>
              All {baseLabel} <span className="block h-px w-8 bg-current transition-all duration-300 group-hover:w-12" />
            </Link>
          </div>
        </Reveal>
      </section>
    </article>
  )
}
