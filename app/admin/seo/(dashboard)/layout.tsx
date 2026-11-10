import { requireSeoPageSession } from '@/lib/seo-command/auth'
import { Nav } from '@/components/seo-command/ui'

export const metadata = { title: 'SEO Command Centre', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function SeoLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSeoPageSession()
  return (
    <div className="min-h-screen bg-ivory font-body">
      <Nav email={session.email} />
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">{children}</main>
    </div>
  )
}
