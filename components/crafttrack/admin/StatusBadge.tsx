type Status = 'PENDING' | 'IN_PROGRESS' | 'COMPLETE'

const STYLES: Record<Status, string> = {
  PENDING: 'bg-ivory-d text-ink-m',
  IN_PROGRESS: 'bg-gold text-ink',
  COMPLETE: 'bg-ink text-gold-p',
}

const LABELS: Record<Status, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In progress',
  COMPLETE: 'Complete',
}

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-2xs tracking-wide ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  )
}
