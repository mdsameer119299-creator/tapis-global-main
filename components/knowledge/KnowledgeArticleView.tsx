import Link from 'next/link'
import type { KnowledgeArticle } from '@/lib/knowledge/types'
import type { ResolvedLinks } from '@/lib/knowledge/links'

/**
 * Reusable Knowledge Centre article template. Renders title, breadcrumb, body
 * sections, FAQ accordion, auto-resolved related links and conversion CTAs.
 * Every knowledge article uses this one template.
 */
export default function KnowledgeArticleView({ article, links, categoryTitle }: { article: KnowledgeArticle; links: ResolvedLinks; categoryTitle: string }) {
  return (
    <article className="footer-container py-14 lg:py-20" style={{ background: 'var(--iv)' }}>
      <div className="max-w-3xl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex flex-wrap items-center gap-2 text-[13px] tracking-[0.12em] uppercase" style={{ color: 'var(--inkm)' }}>
            <li><Link href="/" className="hover:text-[var(--c)]">Home</Link></li>
            <li aria-hidden>›</li>
            <li><Link href="/knowledge" className="hover:text-[var(--c)]">Knowledge Centre</Link></li>
            <li aria-hidden>›</li>
            <li aria-current="page" style={{ color: 'var(--c)' }}>{categoryTitle}</li>
          </ol>
        </nav>

        <p className="text-[13px] tracking-[0.28em] uppercase mb-3" style={{ color: 'var(--gd)' }}>{categoryTitle}</p>
        <h1 className="font-medium leading-[1.12] mb-4" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(30px, 4vw, 48px)', color: 'var(--ink)' }}>{article.title}</h1>
        <p className="text-[18px] font-light leading-[1.85] mb-10" style={{ color: 'var(--inkm)' }}>{article.summary}</p>

        {/* Body sections */}
        <div className="flex flex-col gap-8">
          {(article.body ?? []).map((s) => (
            <section key={s.h2}>
              <h2 className="font-medium leading-[1.2] mb-3" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(22px, 2.4vw, 30px)', color: 'var(--ink)' }}>{s.h2}</h2>
              <p className="text-[16.5px] font-light leading-[1.9]" style={{ color: 'var(--inkm)' }}>{s.body}</p>
            </section>
          ))}
        </div>

        {/* FAQ */}
        {article.faq && article.faq.length > 0 && (
          <div className="mt-12">
            <h2 className="font-medium leading-[1.1] mb-5" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(22px, 2.4vw, 30px)', color: 'var(--ink)' }}>Frequently Asked Questions</h2>
            <div className="flex flex-col gap-3">
              {article.faq.map((f) => (
                <details key={f.q} className="group rounded-lg overflow-hidden" style={{ background: '#fff', border: '1px solid var(--bd)' }}>
                  <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-5 py-4 text-[16px] font-medium select-none" style={{ color: 'var(--inks)' }}>
                    <span>{f.q}</span><span className="text-[20px] leading-none transition-transform group-open:rotate-45" style={{ color: 'var(--g)' }} aria-hidden>+</span>
                  </summary>
                  <div className="px-5 pb-4"><p className="text-[15.5px] font-light leading-[1.8]" style={{ color: 'var(--inkm)' }}>{f.a}</p></div>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 rounded-xl p-7" style={{ background: 'linear-gradient(135deg, rgba(107,31,31,0.14) 0%, rgba(192,155,74,0.10) 100%)', border: '1px solid rgba(192,155,74,0.22)' }}>
          <p className="text-[16px] font-light leading-[1.8] mb-5" style={{ color: 'var(--inkm)' }}>Manufactured to order in Bhadohi, India. Request our catalogue or share your project for a quotation.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/catalogue" className="px-7 py-3 text-[14px] tracking-[0.16em] uppercase font-semibold rounded-sm" style={{ background: 'var(--g)', color: 'var(--ink)' }}>Request Catalogue</Link>
            <Link href="/contact" className="px-7 py-3 text-[14px] tracking-[0.16em] uppercase font-medium rounded-sm border" style={{ borderColor: 'var(--bd)', color: 'var(--inks)' }}>Get a Quote</Link>
          </div>
        </div>

        {/* Auto internal linking */}
        <RelatedBlock title="Related Guides" links={links.articles} />
        <RelatedBlock title="Related Products" links={links.products} />
        <RelatedBlock title="Related Industries" links={links.industries} />
        <RelatedBlock title="Related Export Markets" links={links.countries} />
        <RelatedBlock title="Materials & Constructions" links={[...links.materials, ...links.constructions]} />
      </div>
    </article>
  )
}

function RelatedBlock({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  if (!links.length) return null
  return (
    <div className="mt-10">
      <p className="text-[13px] tracking-[0.24em] uppercase font-medium mb-3" style={{ color: 'var(--gd)' }}>{title}</p>
      <div className="flex flex-wrap gap-2.5">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="px-4 py-2 text-[14px] border rounded-sm transition-colors hover:border-[var(--c)] hover:text-[var(--c)]" style={{ borderColor: 'var(--bd)', color: 'var(--inks)' }}>{l.label}</Link>
        ))}
      </div>
    </div>
  )
}
