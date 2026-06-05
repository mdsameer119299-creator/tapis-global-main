import Image from 'next/image'
import Link from 'next/link'
import { BLOG_POSTS } from '@/lib/blogs'
import { Reveal, Eyebrow } from '@/components/ui'
import { BLUR_PLACEHOLDER } from '@/components/ui/OptimizedImage'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day:   'numeric',
    month: 'long',
    year:  'numeric',
  })
}

export default function BlogGrid() {
  return (
    <section className="px-12 max-lg:px-6 py-16 lg:py-24" style={{ background: 'var(--iv)' }}>
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <Eyebrow>Latest Articles</Eyebrow>
          <h2
            className="font-medium leading-[1.08] mb-4"
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: 'clamp(32px, 3.5vw, 48px)',
              color: 'var(--ink)',
            }}
          >
            Insights from the
            <em style={{ fontStyle: 'italic', color: 'var(--c)' }}> Floor Fashion World</em>
          </h2>
          <p className="text-[17px] font-light leading-[1.85] max-w-2xl mb-12" style={{ color: 'var(--inkm)' }}>
            Manufacturing expertise, design inspiration and project guidance from Tapis Global International — your premium carpet partner in Bhadohi.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post, i) => (
            <Reveal key={post.slug} delay={i * 60}>
              <article
                className="group flex flex-col h-full border overflow-hidden transition-all duration-300 hover:border-[var(--g)]"
                style={{ background: '#fff', borderColor: 'var(--bd)' }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.imageAlt}
                    fill
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL={BLUR_PLACEHOLDER}
                    quality={80}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  />
                  <span
                    className="absolute top-4 left-4 px-3 py-1 text-[14px] tracking-[0.22em] uppercase font-medium"
                    style={{ background: 'rgba(13,10,8,0.72)', color: 'var(--gp)' }}
                  >
                    {post.category}
                  </span>
                </div>

                <div className="flex flex-col flex-1 p-6">
                  <p className="text-[15px] tracking-[0.12em] uppercase mb-3" style={{ color: 'var(--inkl)' }}>
                    {formatDate(post.date)} · {post.readTime}
                  </p>
                  <h3
                    className="font-medium leading-[1.2] mb-3 transition-colors duration-300 group-hover:text-[var(--c)]"
                    style={{
                      fontFamily: '"Cormorant Garamond", serif',
                      fontSize: '22px',
                      color: 'var(--ink)',
                    }}
                  >
                    {post.title}
                  </h3>
                  <p className="text-[16px] font-light leading-[1.75] mb-5 flex-1" style={{ color: 'var(--inkm)' }}>
                    {post.excerpt}
                  </p>
                  <Link
                    href={`/blogs#${post.slug}`}
                    className="inline-flex items-center gap-2 text-[15px] tracking-[0.18em] uppercase font-medium transition-colors duration-300 group-hover:text-[var(--c)]"
                    style={{ color: 'var(--gd)' }}
                  >
                    Read Article
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
