import { EXPORT_DESTINATION_TAGS } from '@/lib/home'

export default function RegionTags() {
  return (
    <div className="mt-8">
      <p
        className="text-[9.5px] tracking-[0.22em] uppercase mb-3.5 font-medium"
        style={{ color: 'var(--gd)' }}
      >
        Key Export Destinations
      </p>
      <div className="flex flex-wrap gap-2">
        {EXPORT_DESTINATION_TAGS.map((tag) => (
          <span
            key={tag.label}
            className="text-[12.5px] px-3.5 py-1.5 border transition-colors duration-200 hover:border-[var(--c)] hover:text-[var(--c)] cursor-default"
            style={{ borderColor: 'var(--bd)', color: 'var(--inks)' }}
          >
            {tag.flag && `${tag.flag} `}{tag.label}
          </span>
        ))}
      </div>
    </div>
  )
}
