import OptimizedImage from '@/components/ui/OptimizedImage'
import type { Swatch } from '@/lib/swatches'

interface SwatchCardProps {
  swatch: Swatch
  priority?: boolean
}

export default function SwatchCard({ swatch, priority = false }: SwatchCardProps) {
  return (
    <article className="group text-center cursor-default">
      <div
        className="relative mx-auto mb-2.5 transition-transform duration-300 ease-out group-hover:scale-[1.09] group-hover:shadow-[0_8px_28px_rgba(0,0,0,0.22)]"
        style={{
          width:  'clamp(64px, 10vw, 96px)',
          height: 'clamp(64px, 10vw, 96px)',
        }}
      >
        <OptimizedImage
          src={swatch.image}
          alt={`${swatch.name} — ${swatch.code}`}
          width={96}
          height={96}
          priority={priority}
          tone="product"
          sizes="(max-width: 640px) 64px, (max-width: 1024px) 80px, 96px"
          className="rounded-full object-cover w-full h-full"
          imgStyle={{
            borderRadius: '50%',
            boxShadow:
              'inset -6px -8px 18px rgba(0,0,0,0.22), inset 6px 6px 14px rgba(255,255,255,0.28)',
          }}
        />
      </div>
      <div
        className="text-[15px] font-semibold tracking-[0.07em] uppercase leading-snug mb-0.5"
        style={{ color: 'var(--ink)' }}
      >
        {swatch.name}
      </div>
      <div
        className="text-[14px] tracking-[0.05em] font-normal"
        style={{ color: 'var(--inkl)' }}
      >
        {swatch.code}
      </div>
    </article>
  )
}
