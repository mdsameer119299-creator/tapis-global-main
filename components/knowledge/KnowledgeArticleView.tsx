import Link from 'next/link'
import type { KnowledgeArticle, CaseStudyDetails, KnowledgeDefinition, KnowledgeComparisonTable } from '@/lib/knowledge/types'
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

        {/* Key terms — short, self-contained definitions readable by people and easy for AI answer engines to extract */}
        {article.definitions && article.definitions.length > 0 && <DefinitionsPanel definitions={article.definitions} />}

        {/* Case study — structured project facts, only present when article.caseStudy is set */}
        {article.caseStudy && <CaseStudyPanel caseStudy={article.caseStudy} />}

        {/* Body sections */}
        <div className="flex flex-col gap-8">
          {(article.body ?? []).map((s) => (
            <section key={s.h2}>
              <h2 className="font-medium leading-[1.2] mb-3" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(22px, 2.4vw, 30px)', color: 'var(--ink)' }}>{s.h2}</h2>
              <p className="text-[16.5px] font-light leading-[1.9]" style={{ color: 'var(--inkm)' }}>{s.body}</p>
            </section>
          ))}
        </div>

        {/* Comparison table */}
        {article.comparisonTable && <ComparisonTablePanel table={article.comparisonTable} />}

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

function DefinitionsPanel({ definitions }: { definitions: KnowledgeDefinition[] }) {
  return (
    <div className="mb-10 rounded-xl p-6 lg:p-7" style={{ background: '#fff', border: '1px solid var(--bd)' }}>
      <p className="text-[13px] tracking-[0.24em] uppercase font-medium mb-4" style={{ color: 'var(--gd)' }}>Key Terms</p>
      <dl className="flex flex-col gap-3.5">
        {definitions.map((d) => (
          <div key={d.term}>
            <dt className="text-[15.5px] font-medium inline" style={{ color: 'var(--inks)' }}>{d.term}</dt>
            <dd className="text-[15.5px] font-light inline leading-[1.8]" style={{ color: 'var(--inkm)' }}> — {d.definition}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function ComparisonTablePanel({ table }: { table: KnowledgeComparisonTable }) {
  return (
    <div className="mt-12">
      <p className="text-[13px] tracking-[0.24em] uppercase font-medium mb-4" style={{ color: 'var(--gd)' }}>{table.caption}</p>
      <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid var(--bd)' }}>
        <table className="w-full text-left border-collapse min-w-[480px]" style={{ background: '#fff' }}>
          <thead>
            <tr>
              {table.columns.map((c) => (
                <th key={c} className="text-[12px] tracking-[0.12em] uppercase px-4 py-3" style={{ color: 'var(--gd)', borderBottom: '1px solid var(--bd)' }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, i) => (
              <tr key={i} style={{ borderTop: i > 0 ? '1px solid var(--bd)' : undefined }}>
                {table.columns.map((c) => (
                  <td key={c} className="text-[15px] font-light px-4 py-3" style={{ color: 'var(--inkm)' }}>{row[c] ?? ''}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CaseStudyPanel({ caseStudy }: { caseStudy: CaseStudyDetails }) {
  const specs = [
    { label: 'Sector', value: caseStudy.clientSector },
    { label: 'Size', value: caseStudy.size },
    { label: 'Timeline', value: caseStudy.timeline },
  ]
  return (
    <div className="mb-12 rounded-xl overflow-hidden" style={{ border: '1px solid var(--bd)' }}>
      <div className="p-6 lg:p-7" style={{ background: '#fff' }}>
        <p className="text-[13px] tracking-[0.24em] uppercase font-medium mb-4" style={{ color: 'var(--gd)' }}>Project at a Glance</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {specs.map((s) => (
            <div key={s.label}>
              <p className="text-[12px] tracking-[0.16em] uppercase mb-1" style={{ color: 'var(--inkm)' }}>{s.label}</p>
              <p className="text-[15.5px] font-medium" style={{ color: 'var(--inks)' }}>{s.value}</p>
            </div>
          ))}
        </div>
        <p className="text-[16.5px] font-light leading-[1.9]" style={{ color: 'var(--inkm)' }}>{caseStudy.overview}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 lg:p-7" style={{ background: 'var(--iv)', borderTop: '1px solid var(--bd)' }}>
        <div>
          <h2 className="font-medium leading-[1.2] mb-3" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(20px, 2.2vw, 26px)', color: 'var(--ink)' }}>The Challenge</h2>
          <p className="text-[15.5px] font-light leading-[1.85]" style={{ color: 'var(--inkm)' }}>{caseStudy.challenges}</p>
        </div>
        <div>
          <h2 className="font-medium leading-[1.2] mb-3" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(20px, 2.2vw, 26px)', color: 'var(--ink)' }}>The Solution</h2>
          <p className="text-[15.5px] font-light leading-[1.85]" style={{ color: 'var(--inkm)' }}>{caseStudy.solution}</p>
        </div>
      </div>

      {caseStudy.manufacturingProcess.length > 0 && (
        <div className="p-6 lg:p-7" style={{ background: '#fff', borderTop: '1px solid var(--bd)' }}>
          <p className="text-[13px] tracking-[0.24em] uppercase font-medium mb-4" style={{ color: 'var(--gd)' }}>How It Was Made</p>
          <ol className="flex flex-col gap-2.5">
            {caseStudy.manufacturingProcess.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-[15.5px] font-light leading-[1.7]" style={{ color: 'var(--inkm)' }}>
                <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-medium" style={{ background: 'var(--iv)', border: '1px solid var(--bd)', color: 'var(--gd)' }}>{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {caseStudy.testimonial && (
        <blockquote className="p-6 lg:p-7" style={{ background: 'var(--iv)', borderTop: '1px solid var(--bd)' }}>
          <p className="text-[19px] font-light italic leading-[1.7] mb-3" style={{ fontFamily: '"Cormorant Garamond", serif', color: 'var(--ink)' }}>&ldquo;{caseStudy.testimonial.quote}&rdquo;</p>
          <cite className="text-[14px] not-italic" style={{ color: 'var(--inkm)' }}>{caseStudy.testimonial.attribution}</cite>
        </blockquote>
      )}
    </div>
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
