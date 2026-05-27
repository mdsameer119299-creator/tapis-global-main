import type { WhyIcon as WhyIconType } from '@/lib/data'

export default function WhyIcon({ type }: { type: WhyIconType }) {
  const paths: Record<WhyIconType, React.ReactNode> = {
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    check:  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
    globe:  (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 010 20" />
      </>
    ),
    flag: (
      <>
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" />
      </>
    ),
    layers: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
    users:  (
      <>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </>
    ),
  }

  return (
    <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  )
}
