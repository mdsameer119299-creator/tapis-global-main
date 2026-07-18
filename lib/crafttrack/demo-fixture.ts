import type { PublishedJourneyViewProps } from '@/components/crafttrack/PublishedJourneyView'

// Stage copy is drawn verbatim/adapted from real, already-approved body
// text in lib/company.ts's manufacturing-process and quality-control
// entries — never invented process claims, per the original CraftTrack
// brief. "Luxury Villa Dubai" / "Premium Hand Tufted Carpet" is the
// approved sample order from docs/CRAFTTRACK-PRODUCT-DESIGN.md §3.
export const DEMO_JOURNEY: PublishedJourneyViewProps = {
  journey: {
    orderNumber: 'TGI-2026-0158',
    productName: 'Premium Hand Tufted Carpet',
    productSlug: null, // no real catalogue slug — this is a fictional sample order
    completedAt: null, // stays "in progress" — stage 3 is current
    coverMedia: { url: '/images/collection-knotted-luxury-room.webp', altText: 'Premium Hand Tufted Carpet — Luxury Villa Dubai' },
  },
  stages: [
    {
      id: 'demo-1',
      sequence: 1,
      publishedName: 'Order Confirmed',
      publishedMessage: 'Your Luxury Villa Dubai order has been confirmed and entered production scheduling.',
      publishedStatus: 'COMPLETE',
      publishedAt: new Date('2026-05-02'),
      media: [],
    },
    {
      id: 'demo-2',
      sequence: 2,
      publishedName: 'Preparation Underway',
      publishedMessage:
        'We translate artwork, mood boards and Pantone references into production maps, then lab-dip yarn colours for approval before any bulk production begins — so the finished carpet matches the intent exactly.',
      publishedStatus: 'COMPLETE',
      publishedAt: new Date('2026-05-10'),
      media: [{ id: 'demo-2-m1', url: '/images/vibrant-wool-dying.webp', caption: 'Lab-dipped yarn, approved against Pantone reference', isHero: true }],
    },
    {
      id: 'demo-3',
      sequence: 3,
      publishedName: 'Handcrafting in Progress',
      publishedMessage:
        'Depending on construction, artisans hand-knot on vertical looms, hand-guide tufting across stretched backing, or weave flatweaves and broadloom — each technique with its own craft and quality controls.',
      publishedStatus: 'IN_PROGRESS',
      publishedAt: new Date('2026-05-20'),
      media: [
        { id: 'demo-3-m1', url: '/images/tufting-carpet.webp', caption: 'Hand-tufting the border pattern, week two', isHero: true },
        { id: 'demo-3-m2', url: '/images/collection-tufted-factory.webp', caption: 'On the loom at our Bhadohi facility', isHero: false },
      ],
    },
    {
      id: 'demo-4',
      sequence: 4,
      publishedName: 'Finishing & Quality Inspection',
      publishedMessage: null,
      publishedStatus: null,
      publishedAt: null,
      media: [],
    },
    {
      id: 'demo-5',
      sequence: 5,
      publishedName: 'Ready for Dispatch',
      publishedMessage: null,
      publishedStatus: null,
      publishedAt: null,
      media: [],
    },
    {
      id: 'demo-6',
      sequence: 6,
      publishedName: 'Dispatched',
      publishedMessage: null,
      publishedStatus: null,
      publishedAt: null,
      media: [],
    },
  ],
  messages: [],
}
