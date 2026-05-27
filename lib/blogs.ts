export type BlogPost = {
  slug:     string
  title:    string
  excerpt:  string
  category: string
  date:     string
  readTime: string
  image:    string
  imageAlt: string
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug:     'bhadohi-carpet-capital',
    title:    'Why Bhadohi Is the Carpet Capital of the World',
    excerpt:  'From Mughal-era weaving traditions to modern project infrastructure — discover what makes Bhadohi the hub for luxury handmade carpets across India and the world.',
    category: 'Heritage',
    date:     '2025-11-12',
    readTime: '5 min read',
    image:    '/images/tgi-banner-5.png',
    imageAlt: 'Artisan weaving carpets in Bhadohi — Tapis Global International',
  },
  {
    slug:     'hand-tufted-vs-hand-knotted',
    title:    'Hand Tufted vs Hand Knotted: Choosing the Right Construction',
    excerpt:  'A practical guide for architects and interior designers — pile types, lead times, specification tiers and where each construction performs best.',
    category: 'Product Guide',
    date:     '2025-10-28',
    readTime: '6 min read',
    image:    '/images/handtufted-img-2.png',
    imageAlt: 'Hand tufted luxury rug — Tapis Global International',
  },
  {
    slug:     'hospitality-carpet-sourcing',
    title:    'Specifying Carpets for Luxury Hospitality Projects',
    excerpt:  'Fire ratings, custom medallions, phased delivery and project documentation — what hotel, resort and commercial buyers should know before placing bulk orders.',
    category: 'Projects',
    date:     '2025-09-15',
    readTime: '7 min read',
    image:    '/images/tgi-banner-4.png',
    imageAlt: 'Luxury hospitality carpet installation — hotel project',
  },
  {
    slug:     'oeko-tex-certified-rugs',
    title:    'OEKO-TEX & Premium Quality: What Specifiers Should Verify',
    excerpt:  'How certification, lab-dip approval and pre-dispatch inspection protect your project — for hospitality audits, tender compliance and international markets.',
    category: 'Quality',
    date:     '2025-08-03',
    readTime: '4 min read',
    image:    '/images/vibrant-wool-dying.png',
    imageAlt: 'Wool dyeing and quality control — carpet manufacturing',
  },
  {
    slug:     'custom-rug-design-process',
    title:    'From Mood Board to Installation: The Custom Carpet Process',
    excerpt:  'How our design studio translates Pantone references, textures and sizes into production-ready carpets for architect-led and bespoke programmes.',
    category: 'Design',
    date:     '2025-07-20',
    readTime: '5 min read',
    image:    '/images/rug3.jpg',
    imageAlt: 'Custom luxury rug design — Tapis Global International',
  },
  {
    slug:     'sustainable-natural-fibre-rugs',
    title:    'Jute, Wool & Natural Fibres: Sustainable Floor Coverings',
    excerpt:  'Eco-conscious collections for retail, hospitality and luxury interiors — material choices, durability and the growing demand for natural fibre rugs.',
    category: 'Sustainability',
    date:     '2025-06-08',
    readTime: '4 min read',
    image:    '/images/jute-rugs-manufacturing.png',
    imageAlt: 'Jute and natural fibre rug manufacturing — Bhadohi India',
  },
]
