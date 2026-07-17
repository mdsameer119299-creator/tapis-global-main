// ─────────────────────────────────────────────────────────────────────────────
// lib/guides.ts — Authority content cluster (/guides/[slug])
// Editorial, informational long-form guides that build topical authority and
// funnel to product / industry / dhurrie money pages. Each guide is unique and
// substantive (intro + multiple H2 sections + takeaways + FAQs). Article schema.
// ─────────────────────────────────────────────────────────────────────────────

export type GuideCategory = 'manufacturing' | 'comparison' | 'buying' | 'export'

export type GuideSection = { h2: string; body: string }
export type GuideFaq = { q: string; a: string }

export type Guide = {
  slug:        string
  category:    GuideCategory
  title:       string
  heroImage:   string
  seoTitle:    string
  seoDescription: string
  seoKeywords: string[]
  h1:          string
  intro:       string
  sections:    GuideSection[]
  takeaways:   string[]
  faqs:        GuideFaq[]
  relatedGuides:   string[]
  relatedProducts: string[]
}

export const GUIDE_CATEGORY_META: Record<GuideCategory, { label: string; blurb: string }> = {
  manufacturing: { label: 'Manufacturing Guides', blurb: 'How carpets and rugs are actually made — process by process.' },
  comparison:    { label: 'Comparison Guides',    blurb: 'Clear, honest comparisons to help you specify the right product.' },
  buying:        { label: 'Buying Guides',        blurb: 'Practical buying guidance for hotels, projects, institutions and tenders.' },
  export:        { label: 'Export & Sourcing Guides', blurb: 'How to source and import carpets from India with confidence.' },
}

export const GUIDES: Guide[] = [
  // ───────────────────────────────────── MANUFACTURING GUIDES
  {
    slug: 'how-carpets-are-manufactured', category: 'manufacturing',
    title: 'How Carpets Are Manufactured', heroImage: '/images/tufting-carpet.webp',
    seoTitle: 'How Carpets Are Manufactured | Step-by-Step Process — Tapis Global',
    seoDescription: 'A complete guide to how carpets are manufactured — from yarn dyeing and weaving or tufting to washing, finishing and quality control. Written by a Bhadohi carpet manufacturer.',
    seoKeywords: ['how carpets are manufactured', 'carpet manufacturing process', 'how carpets are made', 'carpet production steps'],
    h1: 'How Carpets Are Manufactured: A Complete Guide',
    intro: 'Carpet manufacturing blends craft and engineering. Whether a carpet is hand knotted over months or tufted in days, the journey from raw fibre to finished floor covering follows a clear sequence of stages — each affecting quality, durability and price. As a Bhadohi manufacturer, here is how we make carpets, explained end to end.',
    sections: [
      { h2: '1. Yarn Selection & Dyeing', body: 'Every carpet starts with fibre — wool, silk, viscose, cotton, jute or synthetic. Quality fibre is spun into yarn, then dyed to the required shades. Reputable manufacturers lab-dip yarn against Pantone references and approve the colour before bulk production, using AZO-free dyes for safety. Dye consistency at this stage determines whether large orders match across rolls and rooms.' },
      { h2: '2. Design Mapping', body: 'The design is translated into a production map — a knot-by-knot graph for hand knotting, or a tufting guide for tufted carpets. This blueprint tells artisans exactly where each colour and texture goes, and is what allows a manufacturer to reproduce a designer\'s artwork faithfully at scale.' },
      { h2: '3. Construction: Weaving, Knotting or Tufting', body: 'This is where the carpet is built. Hand knotted carpets are tied knot by knot on a loom; hand tufted carpets are made by punching yarn through a backing with a tufting tool; flatweaves are interlaced without pile; broadloom is produced on wide-width machines. The construction defines durability, detail and cost.' },
      { h2: '4. Washing, Finishing & Carving', body: 'After construction, carpets are washed to bring out lustre and set the pile, then sheared to an even height. Carved or embossed effects are hand-cut at this stage. Edges are bound or finished, and backing is applied to tufted carpets for stability.' },
      { h2: '5. Quality Control & Packing', body: 'Finished carpets pass multi-stage inspection — checking colour, dimensions, density and finish — culminating in a pre-dispatch review against the order specification. Approved carpets are rolled, wrapped and packed for safe transit, domestic or export.' },
    ],
    takeaways: [
      'Carpet quality is largely decided at the dyeing and construction stages.',
      'Hand knotted, hand tufted, flatweave and broadloom are different constructions with different durability and cost.',
      'Lab-dip colour approval before bulk is the mark of a serious manufacturer.',
      'Multi-stage QC and pre-dispatch inspection protect consistency on large orders.',
    ],
    faqs: [
      { q: 'How long does it take to manufacture a carpet?', a: 'It varies hugely by construction: a hand tufted carpet may take days to a few weeks, while a fine hand knotted carpet can take months. Lead times also depend on size, quantity and finishing.' },
      { q: 'What is the most important stage in carpet manufacturing?', a: 'Yarn dyeing and construction are the most decisive — they set colour accuracy, durability and the overall quality of the finished carpet.' },
      { q: 'Are handmade carpets better than machine-made?', a: 'Handmade carpets generally offer superior character, durability and value retention, while machine-made carpets are faster and cheaper. The right choice depends on use and budget.' },
    ],
    relatedGuides: ['hand-tufted-carpet-manufacturing-process', 'hand-knotted-carpet-manufacturing-process', 'handmade-vs-machine-made-carpets'],
    relatedProducts: ['hand-tufted-carpet', 'hand-knotted-carpet', 'wall-to-wall-carpets'],
  },
  {
    slug: 'how-rugs-are-manufactured', category: 'manufacturing',
    title: 'How Rugs Are Manufactured', heroImage: '/images/jute-rugs-manufacturing.webp',
    seoTitle: 'How Rugs Are Manufactured | Rug Making Process — Tapis Global',
    seoDescription: 'How rugs are manufactured — from natural and synthetic fibres through knotting, tufting and flatweaving to finishing. A practical guide from a Bhadohi rug manufacturer.',
    seoKeywords: ['how rugs are manufactured', 'rug manufacturing process', 'how rugs are made', 'rug making process'],
    h1: 'How Rugs Are Manufactured: A Practical Guide',
    intro: 'Rugs span an enormous range — from heirloom hand knotted silk to natural jute flatweaves and plush shaggy pieces. Each construction has its own making process, and understanding them helps buyers choose the right rug for a space and budget. Here is how rugs are manufactured, from fibre to finished piece.',
    sections: [
      { h2: 'Choosing the Fibre', body: 'Rug fibre defines feel, durability and price. Wool offers warmth and resilience; silk gives fine detail and sheen; jute and sisal bring natural texture and sustainability; cotton suits flatweaves and dhurries; synthetics offer value and easy care. The fibre is chosen for the rug\'s intended use.' },
      { h2: 'Construction Methods', body: 'Rugs are made by hand knotting (pile tied on a loom), hand tufting (yarn punched through a backing), flatweaving (warp and weft interlaced without pile, as in kilims and dhurries), or braiding and weaving for natural fibres. Each method produces a distinct look and durability.' },
      { h2: 'Dyeing & Pattern', body: 'Yarns are dyed — ideally with AZO-free dyes and lab-dip approval — then patterned according to the design map. Natural fibre rugs may be left undyed for an organic look, or dyed for colour collections.' },
      { h2: 'Finishing & Binding', body: 'Rugs are washed, sheared and finished. Edges are bound, serged or fringed depending on the style; flatweaves get reinforced selvedges; natural fibre rugs receive anti-shed treatment and optional latex backing for stability.' },
    ],
    takeaways: [
      'Fibre choice is the single biggest factor in a rug\'s feel, durability and price.',
      'Hand knotting, tufting, flatweaving and braiding each create a distinct rug.',
      'Edge finishing (binding, serging, fringing) affects both looks and longevity.',
      'Natural fibre rugs balance sustainability with hard-wearing texture.',
    ],
    faqs: [
      { q: 'What is the most durable type of rug?', a: 'Hand knotted wool rugs are among the most durable and can last generations. Sisal and tightly woven flatweaves are also very hard-wearing for high-traffic areas.' },
      { q: 'Which rug is best for high-traffic areas?', a: 'Flatweaves, sisal and dense wool constructions handle high traffic well. We advise on fibre and construction for each location.' },
      { q: 'Can rugs be made in custom sizes?', a: 'Yes. As a manufacturer we make rugs in any custom size and shape, across all constructions.' },
    ],
    relatedGuides: ['how-carpets-are-manufactured', 'jute-vs-sisal-rugs', 'kilim-vs-dhurrie'],
    relatedProducts: ['hand-knotted-carpet', 'jute-sisal-rugs', 'shaggy-rugs'],
  },
  {
    slug: 'carpet-manufacturing-process-explained', category: 'manufacturing',
    title: 'Carpet Manufacturing Process Explained', heroImage: '/images/manufacturing-rug-img.webp',
    seoTitle: 'Carpet Manufacturing Process Explained | In-Depth Guide — Tapis Global',
    seoDescription: 'The carpet manufacturing process explained in depth — dyeing, design mapping, construction, washing, finishing and quality control, with the factors that affect quality and cost.',
    seoKeywords: ['carpet manufacturing process explained', 'carpet production process', 'carpet factory process', 'carpet making stages'],
    h1: 'The Carpet Manufacturing Process, Explained',
    intro: 'For architects, procurement teams and buyers specifying carpet at scale, understanding the manufacturing process is essential — it explains lead times, cost drivers and why quality varies between suppliers. This in-depth guide walks through each stage and what to look for.',
    sections: [
      { h2: 'Raw Materials & Their Impact', body: 'Wool grade, silk content, fibre blend and backing materials directly affect durability, appearance and price. A transparent manufacturer batch-tests raw materials before production and will tell you exactly what goes into your carpet.' },
      { h2: 'Colour Development & Dye-Lots', body: 'Colour is developed via lab-dips approved against references before bulk. Crucially, manufacturers hold "dye-lots" so that a large or phased order stays colour-consistent across rolls — vital for hotels and multi-room projects.' },
      { h2: 'Construction & Specification', body: 'Pile height, density (GSM or KPSI), construction type and backing are specified to suit the application. Higher density generally means greater durability and cost. The specification is where performance is engineered.' },
      { h2: 'Finishing, QC & Documentation', body: 'Washing, shearing, carving and binding finish the carpet. Quality control runs throughout, ending in pre-dispatch inspection. For projects, manufacturers provide documentation — fire-rating, OEKO-TEX, test certificates — supporting specification and compliance.' },
    ],
    takeaways: [
      'Cost and durability are engineered at the material and specification stages.',
      'Dye-lot control is what keeps large and phased orders colour-consistent.',
      'Density (GSM / KPSI) is a key durability indicator to specify.',
      'Reputable manufacturers supply compliance documentation for projects.',
    ],
    faqs: [
      { q: 'What affects the cost of a carpet most?', a: 'Fibre quality, construction type, density and size are the biggest cost drivers, followed by design complexity and finishing.' },
      { q: 'What is a dye-lot and why does it matter?', a: 'A dye-lot is a batch of yarn dyed together. Holding dye-lots ensures colour consistency across a large or phased order — essential for hotels and multi-room projects.' },
      { q: 'What documentation should I ask a carpet manufacturer for?', a: 'Ask for specification sheets, fire-rating certificates where relevant, OEKO-TEX/AZO-free compliance and, for exports, the commercial and compliance paperwork.' },
    ],
    relatedGuides: ['how-carpets-are-manufactured', 'wool-vs-viscose-carpets', 'hotel-carpet-buying-guide'],
    relatedProducts: ['wall-to-wall-carpets', 'hand-tufted-carpet', 'carpet-tiles'],
  },
  {
    slug: 'rug-manufacturing-process-explained', category: 'manufacturing',
    title: 'Rug Manufacturing Process Explained', heroImage: '/images/rug2.webp',
    seoTitle: 'Rug Manufacturing Process Explained | Complete Guide — Tapis Global',
    seoDescription: 'The rug manufacturing process explained — fibre, dyeing, knotting/tufting/weaving, washing and finishing — with what determines quality, durability and value in a rug.',
    seoKeywords: ['rug manufacturing process explained', 'rug production process', 'how rugs are made step by step', 'rug making stages'],
    h1: 'The Rug Manufacturing Process, Explained',
    intro: 'A rug can be a quick tufted accent or a generational hand knotted heirloom — and the manufacturing process is what separates them. This guide explains how rugs are made stage by stage, and what determines a rug\'s quality and value.',
    sections: [
      { h2: 'Fibre & Yarn Preparation', body: 'Raw fibre is cleaned, carded and spun into yarn. The quality of this yarn — staple length, consistency, fibre grade — underpins everything that follows. Premium rugs start with premium, batch-tested yarn.' },
      { h2: 'Dyeing & Colour', body: 'Yarn is dyed to the design palette, ideally with AZO-free dyes and approved lab-dips. Vegetable dyes give traditional depth; modern reactive dyes give vivid consistency. Colourfastness is tested before bulk.' },
      { h2: 'Hand Construction', body: 'Knotting, tufting or flatweaving builds the rug. Knot density (KPSI) in hand knotted rugs, or pile weight (GSM) in tufted rugs, indicates detail and durability — and is a key quality marker buyers should ask about.' },
      { h2: 'Washing & Finishing', body: 'The rug is washed (sometimes multiple times) to develop lustre and softness, sheared level, carved if required, and finished at the edges. This stage gives a rug its final hand-feel and appearance.' },
    ],
    takeaways: [
      'Yarn quality at the start dictates the ceiling for rug quality.',
      'KPSI (knotted) and GSM (tufted) are the key density indicators to ask about.',
      'Washing and finishing give a rug its final lustre and hand-feel.',
      'Colourfastness testing protects against fading and bleeding.',
    ],
    faqs: [
      { q: 'What does KPSI mean in rugs?', a: 'KPSI is knots per square inch — a measure of knot density in hand knotted rugs. Higher KPSI allows finer detail and typically indicates a more valuable rug.' },
      { q: 'Why are some rugs washed multiple times?', a: 'Washing develops lustre, softens the pile and can create an antique or distressed finish. Multiple washes are a finishing technique, not a defect.' },
      { q: 'How can I tell if a rug is good quality?', a: 'Check fibre quality, knot density or pile weight, evenness of the weave, colour consistency and edge finishing. A reputable manufacturer will share all specifications.' },
    ],
    relatedGuides: ['how-rugs-are-manufactured', 'hand-knotted-carpet-manufacturing-process', 'wool-vs-viscose-carpets'],
    relatedProducts: ['hand-knotted-carpet', 'hand-tufted-carpet', 'area-rugs'],
  },
  {
    slug: 'hand-tufted-carpet-manufacturing-process', category: 'manufacturing',
    title: 'Hand Tufted Carpet Manufacturing Process', heroImage: '/images/handtufted-img-2.webp',
    seoTitle: 'Hand Tufted Carpet Manufacturing Process | Step by Step — Tapis Global',
    seoDescription: 'The hand tufted carpet manufacturing process step by step — frame setup, tufting, latexing, backing, carving and finishing. From a Bhadohi hand tufted carpet manufacturer.',
    seoKeywords: ['hand tufted carpet manufacturing process', 'how hand tufted carpets are made', 'tufting process', 'hand tufted carpet production'],
    h1: 'Hand Tufted Carpet Manufacturing Process',
    intro: 'Hand tufted carpets offer the design freedom and rich pile of handmade production at a more accessible price point than hand knotting. Here is exactly how a hand tufted carpet is made, stage by stage.',
    sections: [
      { h2: '1. Design & Frame Setup', body: 'The design is traced onto a primary backing cloth stretched tightly on a frame. Yarn colours are dyed and lab-dipped to match the design before tufting begins.' },
      { h2: '2. Hand Tufting', body: 'Using a hand-held tufting tool, artisans punch yarn through the stretched backing following the traced design, building cut-pile, loop-pile or cut-and-loop textures. This is skilled, hand-guided work — the "hand" in hand tufted.' },
      { h2: '3. Latexing & Secondary Backing', body: 'A coat of latex is applied to the back to lock every tuft in place, then a secondary backing (often cotton scrim) is bonded on for dimensional stability and durability.' },
      { h2: '4. Carving, Shearing & Finishing', body: 'The pile is sheared to an even height and hand-carved to define patterns and add relief. The carpet is washed, dried, edge-finished and inspected before dispatch.' },
    ],
    takeaways: [
      'Hand tufting offers handmade richness and bold design at better value than knotting.',
      'The latex and secondary backing are essential to durability — quality matters here.',
      'Carving and shearing create the carved, multi-level textures tufting is known for.',
      'Typical lead time is around 45–60 days depending on size and quantity.',
    ],
    faqs: [
      { q: 'Is a hand tufted carpet really handmade?', a: 'Yes. Each tuft is placed by an artisan using a hand-guided tufting tool following the design — it is genuinely hand-crafted, distinct from fully machine-made carpet.' },
      { q: 'How durable are hand tufted carpets?', a: 'Very durable when well made — the latex and secondary backing lock the pile firmly. They suit homes, hotels and commercial interiors. Density (GSM) influences longevity.' },
      { q: 'Can hand tufted carpets be fully custom?', a: 'Yes — any size, colour, pattern, pile height and carved texture, developed from your artwork with lab-dip approval.' },
    ],
    relatedGuides: ['hand-knotted-carpet-manufacturing-process', 'hand-tufted-vs-hand-knotted-carpet', 'how-carpets-are-manufactured'],
    relatedProducts: ['hand-tufted-carpet', 'wall-to-wall-carpets', 'area-rugs'],
  },
  {
    slug: 'hand-knotted-carpet-manufacturing-process', category: 'manufacturing',
    title: 'Hand Knotted Carpet Manufacturing Process', heroImage: '/images/tgi-banner-2.webp',
    seoTitle: 'Hand Knotted Carpet Manufacturing Process | Step by Step — Tapis Global',
    seoDescription: 'The hand knotted carpet manufacturing process — graphing, loom warping, knotting, shearing, washing and finishing. How heirloom hand knotted carpets are made in Bhadohi.',
    seoKeywords: ['hand knotted carpet manufacturing process', 'how hand knotted carpets are made', 'knotting process', 'hand knotted rug production'],
    h1: 'Hand Knotted Carpet Manufacturing Process',
    intro: 'Hand knotting is the oldest and most revered carpet construction — a single rug can contain hundreds of thousands of individually tied knots and take months to complete. Here is how heirloom hand knotted carpets are made.',
    sections: [
      { h2: '1. Design Graph (Naqsha)', body: 'The design is charted onto a knot-by-knot graph called a naqsha, which guides weavers on the colour of every single knot. Yarns — wool, silk or blends — are dyed to match.' },
      { h2: '2. Loom Warping', body: 'Vertical cotton or silk warp threads are strung tightly on a loom. These form the foundation onto which knots are tied. The fineness of the warp influences achievable knot density.' },
      { h2: '3. Hand Knotting', body: 'Master weavers tie each knot by hand around the warp threads, row by row, following the naqsha. Knot density (KPSI) — from 40 to 300+ — determines detail and value. This is the most time-intensive stage, often spanning months.' },
      { h2: '4. Shearing, Washing & Finishing', body: 'Once knotting is complete, the pile is clipped level, the rug is hand-washed to bring out lustre, stretched flat, and the edges and fringes are finished. Final inspection confirms it matches the design.' },
    ],
    takeaways: [
      'Each knot is tied by hand — a fine rug can take months and contain 100,000s of knots.',
      'Knot density (KPSI) is the key indicator of detail and value.',
      'Silk and wool-silk constructions enable the finest, most valuable pieces.',
      'A well-made hand knotted carpet can last generations and appreciate in value.',
    ],
    faqs: [
      { q: 'How long does a hand knotted carpet take to make?', a: 'From several weeks to many months depending on size and knot density. A fine silk rug at 200+ KPSI represents thousands of hours of skilled work.' },
      { q: 'Why are hand knotted carpets expensive?', a: 'Because each knot is tied individually by skilled weavers over a long period, using premium natural fibres. The labour and materials make them an investment that often appreciates.' },
      { q: 'What knot density should I choose?', a: '40–80 KPSI for durable wool pieces; 100–150 for refined wool/wool-silk; 200–300+ for fine silk. We help balance detail, budget and use.' },
    ],
    relatedGuides: ['hand-tufted-carpet-manufacturing-process', 'hand-tufted-vs-hand-knotted-carpet', 'how-rugs-are-manufactured'],
    relatedProducts: ['hand-knotted-carpet', 'hand-tufted-carpet', 'area-rugs'],
  },

  // ───────────────────────────────────── COMPARISON GUIDES
  {
    slug: 'hand-tufted-vs-hand-knotted-carpet', category: 'comparison',
    title: 'Hand Tufted vs Hand Knotted Carpet', heroImage: '/images/handtufted-img-2.webp',
    seoTitle: 'Hand Tufted vs Hand Knotted Carpet | Differences Explained — Tapis Global',
    seoDescription: 'Hand tufted vs hand knotted carpet — differences in construction, durability, price, lead time and best uses, explained by a Bhadohi carpet manufacturer to help you choose.',
    seoKeywords: ['hand tufted vs hand knotted', 'difference hand tufted hand knotted carpet', 'hand tufted or hand knotted', 'tufted vs knotted rug'],
    h1: 'Hand Tufted vs Hand Knotted Carpet: Which to Choose',
    intro: 'Hand tufted and hand knotted are the two pillars of handmade carpet-making, often confused but very different in construction, durability, price and ideal use. This guide compares them clearly so you can specify the right one.',
    sections: [
      { h2: 'How They Are Made', body: 'Hand knotted carpets are tied knot by knot on a loom — slow, intricate and long-lasting. Hand tufted carpets are made by punching yarn through a backing with a tufting tool and securing it with latex and a secondary backing — much faster, with great design freedom.' },
      { h2: 'Durability & Lifespan', body: 'Hand knotted carpets are the more durable and can last generations, often becoming heirlooms. Hand tufted carpets are durable too — well suited to homes, hotels and commercial use — but generally have a shorter lifespan than fine knotted pieces.' },
      { h2: 'Price & Lead Time', body: 'Hand knotted carpets cost significantly more and take longer (often months) due to intensive hand labour. Hand tufted carpets are more affordable and faster (typically 45–60 days), making them ideal for larger projects on a budget.' },
      { h2: 'Which Should You Choose?', body: 'Choose hand knotted for heirloom quality, investment value and the finest detail — formal rooms, luxury residences, collectors. Choose hand tufted for bold custom design, larger areas and better value — hospitality, commercial and contemporary interiors.' },
    ],
    takeaways: [
      'Hand knotted = tied by hand on a loom; hand tufted = punched through a backing.',
      'Hand knotted lasts longer and can appreciate; hand tufted is faster and better value.',
      'Hand tufted suits large projects and bold designs; hand knotted suits heirloom pieces.',
      'Both are genuinely handmade — the difference is construction, not authenticity.',
    ],
    faqs: [
      { q: 'Is hand knotted better than hand tufted?', a: 'Hand knotted is more durable and valuable, but hand tufted offers excellent design freedom and value. "Better" depends on your use, budget and timeline.' },
      { q: 'How can I tell hand tufted from hand knotted?', a: 'Look at the back: hand knotted shows the design clearly with visible knots and no secondary backing; hand tufted has a fabric secondary backing covering the latex.' },
      { q: 'Which is better for a hotel?', a: 'Hand tufted is usually preferred for hotels — it offers custom design at scale and better value, with strong durability when specified correctly.' },
    ],
    relatedGuides: ['hand-tufted-carpet-manufacturing-process', 'hand-knotted-carpet-manufacturing-process', 'handmade-vs-machine-made-carpets'],
    relatedProducts: ['hand-tufted-carpet', 'hand-knotted-carpet', 'wall-to-wall-carpets'],
  },
  {
    slug: 'kilim-vs-dhurrie', category: 'comparison',
    title: 'Kilim vs Dhurrie', heroImage: '/images/kilim/kilim-jute-wool-medallion-room.webp',
    seoTitle: 'Kilim vs Dhurrie | Differences Explained — Tapis Global International',
    seoDescription: 'Kilim vs dhurrie — both are flatweaves, but they differ in origin, material, weave and look. A clear comparison from a Bhadohi flatweave manufacturer to help you choose.',
    seoKeywords: ['kilim vs dhurrie', 'difference between kilim and dhurrie', 'dhurrie or kilim', 'flatweave comparison'],
    h1: 'Kilim vs Dhurrie: What\'s the Difference?',
    intro: 'Kilims and dhurries are both flatwoven, pile-free rugs — and are often confused. But they differ in origin, traditional materials, weave technique and typical look. Here is how to tell them apart and choose the right one.',
    sections: [
      { h2: 'Origin & Tradition', body: 'Kilims trace to the wider Persian, Anatolian and Central Asian tradition, while dhurries are distinctly Indian, woven across regions for everyday and ceremonial use. Both are deeply rooted in flatweave heritage.' },
      { h2: 'Materials', body: 'Kilims are traditionally wool (sometimes wool-cotton), giving them richness and warmth. Dhurries are most often cotton — lighter and more washable — though wool and jute dhurries are also made. Material affects feel, durability and care.' },
      { h2: 'Weave & Pattern', body: 'Both are flatwoven and reversible, but kilims often feature tighter slit-weave tribal and geometric motifs, while dhurries tend toward clean stripes, simple geometrics and lighter, more casual patterns.' },
      { h2: 'Which to Choose?', body: 'Choose a kilim for richer, warmer, tribal character — great as a statement or layered piece. Choose a dhurrie for lighter, washable, casual versatility — ideal for homes, children\'s spaces, institutions and floor seating.' },
    ],
    takeaways: [
      'Both are flatwoven, pile-free and reversible.',
      'Kilims are traditionally wool with tribal motifs; dhurries are typically cotton with stripes/geometrics.',
      'Dhurries are lighter and more washable; kilims are warmer and richer.',
      'Dhurries excel for institutional, school and floor-seating use.',
    ],
    faqs: [
      { q: 'Are kilim and dhurrie the same thing?', a: 'No. Both are flatweaves, but kilims are from the Persian/Anatolian tradition (usually wool) while dhurries are Indian (usually cotton), with different typical patterns and feel.' },
      { q: 'Which is more durable, kilim or dhurrie?', a: 'Wool kilims are warm and hard-wearing; cotton dhurries are lighter and very washable. For heavy institutional use, tightly woven wool offers the most durability.' },
      { q: 'Is a dhurrie good for high traffic?', a: 'Yes — flatwoven dhurries are hard-wearing and reversible, making them well suited to hallways, dining areas and institutional floor seating.' },
    ],
    relatedGuides: ['jute-vs-sisal-rugs', 'how-rugs-are-manufactured', 'government-tender-dhurrie-buying-guide'],
    relatedProducts: ['kilim-rugs', 'dhurrie-rugs', 'flat-weaves'],
  },
  {
    slug: 'jute-vs-sisal-rugs', category: 'comparison',
    title: 'Jute vs Sisal Rugs', heroImage: '/images/jute/jute-navy-border-living-room.webp',
    seoTitle: 'Jute vs Sisal Rugs | Differences & Which to Choose — Tapis Global',
    seoDescription: 'Jute vs sisal rugs — differences in texture, durability, softness and best uses. A natural-fibre rug manufacturer explains which to choose for your space.',
    seoKeywords: ['jute vs sisal rugs', 'difference jute sisal', 'jute or sisal rug', 'natural fibre rug comparison'],
    h1: 'Jute vs Sisal Rugs: Which Natural Fibre Is Right?',
    intro: 'Jute and sisal are the two most popular natural-fibre rugs — both sustainable and on-trend, but quite different in softness, durability and ideal use. This guide compares them so you can choose with confidence.',
    sections: [
      { h2: 'Texture & Softness', body: 'Jute is softer underfoot with a warmer, slightly golden tone — pleasant for living spaces. Sisal is firmer and coarser with a crisp, uniform look. If softness matters, jute wins; if you want a sleek, structured texture, sisal does.' },
      { h2: 'Durability', body: 'Sisal is one of the most durable natural fibres — extremely hard-wearing and ideal for high-traffic areas and stairs. Jute is durable but better suited to moderate-traffic spaces like bedrooms and living rooms.' },
      { h2: 'Moisture & Maintenance', body: 'Both dislike heavy moisture, but sisal can show water marks while jute is more forgiving in tone. Neither suits very wet areas. For commercial or high-traffic use, sisal with a backing is the more resilient choice.' },
      { h2: 'Which to Choose?', body: 'Choose jute for softer comfort in living rooms and bedrooms and a warm, organic look. Choose sisal for durability in hallways, stairs and high-traffic or commercial spaces where a crisp, hard-wearing surface is needed.' },
    ],
    takeaways: [
      'Jute is softer and warmer-toned; sisal is firmer and more durable.',
      'Sisal excels in high-traffic areas and stairs; jute suits living rooms and bedrooms.',
      'Neither is ideal for very wet areas; both are sustainable and biodegradable.',
      'For commercial use, sisal with a latex backing is the more resilient option.',
    ],
    faqs: [
      { q: 'Is jute or sisal more durable?', a: 'Sisal is more durable and better for high-traffic areas and stairs. Jute is softer but best suited to moderate-traffic rooms.' },
      { q: 'Which is softer, jute or sisal?', a: 'Jute is noticeably softer underfoot, making it more comfortable for living rooms and bedrooms.' },
      { q: 'Are jute and sisal rugs sustainable?', a: 'Yes. Both are renewable, biodegradable natural fibres. We source certified fibre and use AZO-free finishes.' },
    ],
    relatedGuides: ['kilim-vs-dhurrie', 'how-rugs-are-manufactured', 'handmade-vs-machine-made-carpets'],
    relatedProducts: ['jute-sisal-rugs', 'flat-weaves', 'coco-coir'],
  },
  {
    slug: 'wool-vs-viscose-carpets', category: 'comparison',
    title: 'Wool vs Viscose Carpets', heroImage: '/images/vibrant-wool-dying.webp',
    seoTitle: 'Wool vs Viscose Carpets | Pros, Cons & Which to Choose — Tapis Global',
    seoDescription: 'Wool vs viscose carpets and rugs — compare durability, sheen, softness, maintenance and cost to choose the right fibre for your project.',
    seoKeywords: ['wool vs viscose carpet', 'wool or viscose rug', 'viscose vs wool difference', 'carpet fibre comparison'],
    h1: 'Wool vs Viscose Carpets: Which Fibre Is Better?',
    intro: 'Wool and viscose are two of the most common carpet fibres — and they behave very differently. Wool is the durable natural workhorse; viscose adds silk-like sheen but needs care. Here is how they compare.',
    sections: [
      { h2: 'Durability & Resilience', body: 'Wool is naturally resilient, springs back from compression, resists soiling and lasts for years — ideal for high-traffic and contract use. Viscose is far less durable, prone to crushing and wear, and is best reserved for low-traffic or accent areas.' },
      { h2: 'Appearance & Feel', body: 'Viscose has a lustrous, silk-like sheen and a soft hand that elevates a rug\'s look. Wool has a warmer, matte richness. Many premium carpets blend wool with viscose highlights to combine durability with sheen.' },
      { h2: 'Maintenance', body: 'Wool is naturally stain-resistant and easy to maintain. Viscose is moisture-sensitive — it can mark and discolour with water and needs careful, specialist cleaning. This is the biggest practical difference for buyers.' },
      { h2: 'Cost & Best Use', body: 'Wool commands a premium for its performance; viscose is cheaper per kilo but costs more in care and replacement. Use wool for durability and contract projects; use viscose (or wool-viscose blends) for sheen in low-traffic, decorative settings.' },
    ],
    takeaways: [
      'Wool is durable, resilient and low-maintenance; viscose is lustrous but delicate.',
      'Viscose is moisture-sensitive and best for low-traffic, decorative areas.',
      'Wool-viscose blends combine durability with silk-like sheen.',
      'For hotels and high-traffic projects, wool or wool blends are the safer specification.',
    ],
    faqs: [
      { q: 'Is wool or viscose better for a carpet?', a: 'Wool is better for durability and easy care; viscose offers sheen but is delicate and moisture-sensitive. Wool or wool-viscose blends are best for most projects.' },
      { q: 'Why does viscose mark with water?', a: 'Viscose is a regenerated cellulose fibre that weakens and discolours when wet, so water spills can leave marks. It needs careful, specialist cleaning.' },
      { q: 'Can you blend wool and viscose?', a: 'Yes. Wool-viscose blends are popular — wool provides durability while viscose adds sheen and softness. We manufacture custom blends.' },
    ],
    relatedGuides: ['handmade-vs-machine-made-carpets', 'carpet-manufacturing-process-explained', 'hotel-carpet-buying-guide'],
    relatedProducts: ['hand-tufted-carpet', 'hand-knotted-carpet', 'shaggy-rugs'],
  },
  {
    slug: 'handmade-vs-machine-made-carpets', category: 'comparison',
    title: 'Handmade vs Machine Made Carpets', heroImage: '/images/tgi-banner-5.webp',
    seoTitle: 'Handmade vs Machine Made Carpets | Differences Explained — Tapis Global',
    seoDescription: 'Handmade vs machine made carpets — compare quality, durability, value, customisation and price to understand which is right for your home or project.',
    seoKeywords: ['handmade vs machine made carpet', 'handmade or machine made rug', 'difference handmade machine carpet', 'are handmade carpets better'],
    h1: 'Handmade vs Machine Made Carpets',
    intro: 'The single biggest quality divide in carpets is handmade versus machine made. Each has a place — but they differ profoundly in quality, value, customisation and price. This guide explains the difference so you buy with clarity.',
    sections: [
      { h2: 'How They Are Made', body: 'Handmade carpets are knotted, tufted or woven by skilled artisans — a slow, skilled process. Machine-made carpets are produced rapidly on power looms or tufting machines. The human craft in handmade carpets is what gives them their character and longevity.' },
      { h2: 'Quality & Durability', body: 'Handmade carpets — especially hand knotted — are far more durable and can last generations, often appreciating in value. Machine-made carpets are consistent but typically wear faster and rarely become heirlooms.' },
      { h2: 'Customisation', body: 'Handmade manufacturing offers near-total customisation — any size, colour, pattern, density and construction. Machine-made carpets are limited to set designs and standard widths. For bespoke projects, handmade is the clear choice.' },
      { h2: 'Price & Value', body: 'Machine-made carpets are cheaper upfront. Handmade carpets cost more but offer superior durability, character and value retention. Over a long lifespan, a quality handmade carpet can be the better investment.' },
    ],
    takeaways: [
      'Handmade = artisan-crafted, durable, customisable, character-rich.',
      'Machine-made = fast, cheaper, consistent, but shorter-lived and limited in design.',
      'Handmade carpets can last generations and retain value.',
      'For bespoke projects and longevity, handmade wins; for tight budgets, machine-made has a place.',
    ],
    faqs: [
      { q: 'Are handmade carpets worth the extra cost?', a: 'For durability, character and value retention, yes — a quality handmade carpet can last generations. For short-term or tight-budget needs, machine-made may suffice.' },
      { q: 'How can I tell handmade from machine made?', a: 'Check the back and fringes: handmade carpets show slight natural irregularities and fringes that are part of the weave; machine-made carpets are perfectly uniform with sewn-on fringes.' },
      { q: 'Do you make handmade carpets?', a: 'Yes. We are a handmade carpet manufacturer in Bhadohi — hand knotted, hand tufted and handwoven flatweaves, fully customisable.' },
    ],
    relatedGuides: ['hand-tufted-vs-hand-knotted-carpet', 'how-carpets-are-manufactured', 'why-bhadohi-carpet-capital'],
    relatedProducts: ['hand-knotted-carpet', 'hand-tufted-carpet', 'flat-weaves'],
  },
  {
    slug: 'area-rugs-vs-wall-to-wall-carpets', category: 'comparison',
    title: 'Area Rugs vs Wall To Wall Carpets', heroImage: '/images/rug1.webp',
    seoTitle: 'Area Rugs vs Wall-to-Wall Carpets | Which to Choose — Tapis Global',
    seoDescription: 'Area rugs vs wall-to-wall carpets — compare flexibility, cost, installation, acoustics and best uses for homes, hotels and commercial spaces.',
    seoKeywords: ['area rugs vs wall to wall carpet', 'rug or wall to wall carpet', 'broadloom vs area rug', 'wall to wall vs rug'],
    h1: 'Area Rugs vs Wall-to-Wall Carpets',
    intro: 'Should you specify area rugs or wall-to-wall carpet? Both define and warm a space, but they differ in flexibility, cost, installation and performance. This guide helps you choose for homes, hotels and commercial interiors.',
    sections: [
      { h2: 'Flexibility & Design', body: 'Area rugs are movable, layerable and easy to change — ideal for defining zones and refreshing a scheme. Wall-to-wall carpet covers the entire floor for a seamless, expansive look and continuous comfort underfoot.' },
      { h2: 'Installation & Cost', body: 'Area rugs need no installation and can be relocated. Wall-to-wall requires professional fitting and underlay, and is harder to replace, but can be cost-effective per square metre over large areas, especially in broadloom or tiles.' },
      { h2: 'Acoustics & Comfort', body: 'Wall-to-wall carpet delivers maximum acoustic absorption and wall-to-wall warmth, valuable in hotels, offices and bedrooms. Area rugs provide targeted comfort and acoustic softening where placed.' },
      { h2: 'Which to Choose?', body: 'Choose area rugs for flexibility, layering and statement design over hard floors. Choose wall-to-wall for seamless comfort, acoustics and large-area coverage — common in hotel rooms, offices and corridors. Many projects combine both.' },
    ],
    takeaways: [
      'Area rugs are flexible, movable and great for zoning; wall-to-wall is seamless and immersive.',
      'Wall-to-wall offers maximum acoustics and warmth but needs installation.',
      'Area rugs refresh a scheme easily; wall-to-wall suits whole-room coverage.',
      'Hotels and offices often use wall-to-wall in rooms and rugs in feature areas.',
    ],
    faqs: [
      { q: 'Are area rugs or wall-to-wall carpets cheaper?', a: 'It depends on area and quality. Area rugs avoid installation costs; wall-to-wall can be cost-effective per square metre over large spaces. We quote both for comparison.' },
      { q: 'Which is better for acoustics?', a: 'Wall-to-wall carpet provides the most acoustic absorption across a whole room; area rugs soften sound where placed.' },
      { q: 'Can you supply both for one project?', a: 'Yes. We manufacture wall-to-wall carpets, carpet tiles and area rugs, and can coordinate colours across a project.' },
    ],
    relatedGuides: ['carpet-manufacturing-process-explained', 'hotel-carpet-buying-guide', 'office-carpet-buying-guide'],
    relatedProducts: ['wall-to-wall-carpets', 'area-rugs', 'carpet-tiles'],
  },

  // ───────────────────────────────────── BUYING GUIDES
  {
    slug: 'hotel-carpet-buying-guide', category: 'buying',
    title: 'Hotel Carpet Buying Guide', heroImage: '/images/tgi-banner-4.webp',
    seoTitle: 'Hotel Carpet Buying Guide | Specifying Hospitality Carpets — Tapis Global',
    seoDescription: 'A hotel carpet buying guide for procurement and design teams — how to specify durability, fire-rating, design, dye-lots and phased delivery for hospitality projects.',
    seoKeywords: ['hotel carpet buying guide', 'how to choose hotel carpet', 'hospitality carpet specification', 'hotel carpet procurement'],
    h1: 'Hotel Carpet Buying Guide',
    intro: 'Specifying carpet for a hotel is a balance of design impact, durability, safety and supply reliability across many areas and rooms. This guide helps hospitality procurement and design teams buy hotel carpet the right way.',
    sections: [
      { h2: 'Specify by Zone', body: 'Different hotel areas need different carpets: dense, statement constructions for lobbies; durable patterned broadloom or tiles for corridors that hide traffic; comfortable, acoustic carpet for guest rooms; bold custom medallions for ballrooms. Specify each zone for its performance and look.' },
      { h2: 'Durability & Fire-Rating', body: 'Hotel carpet must meet contract durability and fire-safety standards. Ask for the traffic classification, fire-rating certification and suitable fibre (solution-dyed nylon and wool blends are common). Compliance documentation is essential for hospitality audits.' },
      { h2: 'Colour Consistency & Phasing', body: 'Across hundreds of rooms or a phased refurbishment, colour must match. Insist on a manufacturer that holds dye-lots and can phase production and delivery to your installation programme so later phases match earlier ones.' },
      { h2: 'Custom Design & Lead Time', body: 'Hotels usually want bespoke designs aligned to brand standards. Allow time for lab-dips, sampling and approval, and confirm lead times (typically 45–75 days for contract carpet) against your opening or refurbishment date.' },
    ],
    takeaways: [
      'Specify carpet zone by zone — lobby, corridor, guest room, ballroom.',
      'Confirm fire-rating, traffic class and compliance documentation.',
      'Insist on dye-lot control and phased delivery for consistency.',
      'Allow time for custom lab-dips, sampling and approval.',
    ],
    faqs: [
      { q: 'What carpet is best for hotel corridors?', a: 'Patterned broadloom or carpet tiles in durable solution-dyed nylon or wool-nylon hide traffic and carry high durability ratings — ideal for corridors.' },
      { q: 'Do hotel carpets need to be fire-rated?', a: 'Yes. Hotel carpets must meet fire-safety standards for public buildings. Always request fire-rating certification and documentation.' },
      { q: 'How do you keep colour consistent across a hotel?', a: 'By holding dye-lots and phasing production and delivery to the installation programme, so every area and phase matches.' },
    ],
    relatedGuides: ['auditorium-carpet-buying-guide', 'office-carpet-buying-guide', 'wool-vs-viscose-carpets'],
    relatedProducts: ['wall-to-wall-carpets', 'hand-tufted-carpet', 'carpet-tiles'],
  },
  {
    slug: 'auditorium-carpet-buying-guide', category: 'buying',
    title: 'Auditorium Carpet Buying Guide', heroImage: '/images/tgi-banner-6.webp',
    seoTitle: 'Auditorium Carpet Buying Guide | Acoustic & Durable Carpets — Tapis Global',
    seoDescription: 'An auditorium carpet buying guide — how to specify acoustic performance, durability for raked seating, fire-rating and bold design for cinemas, theatres and halls.',
    seoKeywords: ['auditorium carpet buying guide', 'how to choose auditorium carpet', 'cinema carpet specification', 'theatre carpet selection'],
    h1: 'Auditorium Carpet Buying Guide',
    intro: 'Auditorium carpet works harder than almost any other — absorbing sound, withstanding heavy footfall on raked aisles and steps, hiding soiling under low light, and often carrying bold signature designs. Here is how to specify it well.',
    sections: [
      { h2: 'Acoustic Performance', body: 'Carpet is a key acoustic surface in auditoria. Specify pile weight and backing that contribute to sound absorption and reduce reverberation, supporting the controlled acoustics theatres, cinemas and concert halls require.' },
      { h2: 'Durability for Aisles & Steps', body: 'Aisles, steps and raked seating concentrate wear. Choose dense, high-durability constructions and pattern/colour strategies that mask traffic, extending the refurbishment cycle in these high-use zones.' },
      { h2: 'Design at Scale', body: 'Auditorium carpets are often bold, brand-defining and visible from balconies. Work with a manufacturer that can develop large bespoke repeats and reproduce them accurately across thousands of square metres.' },
      { h2: 'Fire-Rating & Compliance', body: 'As public assembly buildings, auditoria require fire-rated carpet with documentation. Confirm the fire classification and request test certificates as part of your specification.' },
    ],
    takeaways: [
      'Prioritise acoustic pile weight and backing for sound control.',
      'Use dense constructions and soil-masking patterns on aisles and steps.',
      'Choose a manufacturer capable of large bespoke repeats at scale.',
      'Insist on fire-rating certification for public assembly compliance.',
    ],
    faqs: [
      { q: 'Why is acoustic carpet important in auditoriums?', a: 'Carpet absorbs sound and reduces reverberation, contributing to the clear, controlled acoustics that performance and presentation spaces require.' },
      { q: 'What carpet hides wear in cinema aisles?', a: 'Dense constructions with busy, bold patterns mask soiling and traffic between deep cleans — ideal for high-use cinema aisles.' },
      { q: 'Are auditorium carpets fire-rated?', a: 'They must be. Auditoria are public assembly buildings, so fire-rated carpet with documentation is required.' },
    ],
    relatedGuides: ['hotel-carpet-buying-guide', 'mosque-carpet-buying-guide', 'carpet-manufacturing-process-explained'],
    relatedProducts: ['wall-to-wall-carpets', 'hand-tufted-carpet', 'flat-weaves'],
  },
  {
    slug: 'mosque-carpet-buying-guide', category: 'buying',
    title: 'Mosque Carpet Buying Guide', heroImage: '/images/tgi-banner-2.webp',
    seoTitle: 'Mosque Carpet Buying Guide | Prayer (Saff) Carpets — Tapis Global',
    seoDescription: 'A mosque carpet buying guide — how to specify prayer-row (saff) layout, comfort, durability, colour and bulk supply for mosques and prayer halls.',
    seoKeywords: ['mosque carpet buying guide', 'how to choose mosque carpet', 'prayer carpet specification', 'saff carpet selection'],
    h1: 'Mosque Carpet Buying Guide',
    intro: 'A mosque carpet must organise worshippers through accurate prayer rows, feel comfortable for prostration, withstand intensive daily use, and reflect the dignity of the space. This guide explains how to specify mosque carpet correctly.',
    sections: [
      { h2: 'Prayer Rows (Saff) & Orientation', body: 'The defining feature of a mosque carpet is the saff — prayer rows that align worshippers toward the mihrab. Rows must be designed to your exact hall dimensions and orientation, with appropriate spacing. Custom saff design is essential.' },
      { h2: 'Comfort & Durability', body: 'Prayer carpets endure intensive daily use and prostration. Specify a resilient, comfortable pile that resists matting and soiling, in a construction chosen for easy maintenance in high-footfall prayer halls.' },
      { h2: 'Colour, Motif & Dignity', body: 'Colours and borders should complement the architecture and convey dignity. Develop custom colourways with lab-dip approval, and consider traditional motifs that suit the space.' },
      { h2: 'Bulk Supply & Budget', body: 'Large prayer halls need significant quantities. Work with a direct manufacturer for competitive pricing, bulk capacity, consistent dye-lots and the ability to deliver to schedule — including for international mosque projects.' },
    ],
    takeaways: [
      'Custom saff (prayer row) design to exact hall dimensions is essential.',
      'Specify resilient, comfortable pile for prostration and daily use.',
      'Develop dignified custom colours with lab-dip approval.',
      'Buy from a direct manufacturer for bulk pricing and dye-lot consistency.',
    ],
    faqs: [
      { q: 'What is a saff in a mosque carpet?', a: 'The saff is the prayer-row design that aligns worshippers in straight rows toward the mihrab. It must be designed to the exact dimensions and orientation of the prayer hall.' },
      { q: 'What pile is best for a prayer carpet?', a: 'A resilient, comfortable pile that supports prostration while resisting matting and soiling under intensive daily use.' },
      { q: 'Can mosque carpets be made in custom colours?', a: 'Yes. We develop custom colourways and motifs with lab-dip approval to suit each mosque\'s interior, and supply in bulk including for export.' },
    ],
    relatedGuides: ['auditorium-carpet-buying-guide', 'school-carpet-buying-guide', 'how-carpets-are-manufactured'],
    relatedProducts: ['wall-to-wall-carpets', 'hand-tufted-carpet', 'hand-knotted-carpet'],
  },
  {
    slug: 'office-carpet-buying-guide', category: 'buying',
    title: 'Office Carpet Buying Guide', heroImage: '/images/tufting-carpet.webp',
    seoTitle: 'Office Carpet Buying Guide | Carpet Tiles & Broadloom — Tapis Global',
    seoDescription: 'An office carpet buying guide — choosing carpet tiles vs broadloom, acoustics, durability, cable access, branding and bulk supply for corporate workplaces.',
    seoKeywords: ['office carpet buying guide', 'how to choose office carpet', 'office carpet tiles selection', 'corporate carpet specification'],
    h1: 'Office Carpet Buying Guide',
    intro: 'Office carpet must dampen noise, survive chairs and constant footfall, allow cable access, reinforce brand identity and be easy to maintain — across whole floors. This guide helps you specify workplace carpet effectively.',
    sections: [
      { h2: 'Carpet Tiles vs Broadloom', body: 'Carpet tiles let you replace worn tiles, access under-floor cabling and reconfigure layouts — ideal for open-plan and tech-heavy offices. Broadloom suits boardrooms and feature areas for a seamless premium look. Many offices combine both.' },
      { h2: 'Acoustics & Comfort', body: 'Open-plan offices depend on acoustics. Specify constructions that absorb sound to improve speech privacy and reduce distraction across workstations, meeting rooms and breakout zones.' },
      { h2: 'Durability & Maintenance', body: 'Choose contract-grade, soil-resistant constructions rated for castor chairs and heavy footfall. Solution-dyed fibres resist fading and clean easily — important for long-term appearance retention.' },
      { h2: 'Branding & Consistency', body: 'Custom colours and logo medallions reinforce brand identity in reception and feature areas. For multi-floor headquarters, insist on dye-lot consistency so every floor matches.' },
    ],
    takeaways: [
      'Carpet tiles for flexible, cabled open-plan; broadloom for boardrooms and feature areas.',
      'Specify acoustic constructions for open-plan speech privacy.',
      'Choose contract-grade, soil-resistant, castor-suitable fibres.',
      'Use custom colours/logos and insist on dye-lot consistency across floors.',
    ],
    faqs: [
      { q: 'Are carpet tiles or broadloom better for offices?', a: 'Tiles suit high-wear, cabled open-plan areas (easy replacement and access); broadloom suits boardrooms and premium feature spaces. Many offices use both.' },
      { q: 'Do office carpets improve acoustics?', a: 'Yes — carpet absorbs sound, improving speech privacy and reducing distraction in open-plan workplaces.' },
      { q: 'Can you match our corporate brand colours?', a: 'Yes. We develop custom colours and logo medallions with dye-lot consistency across multi-floor projects.' },
    ],
    relatedGuides: ['hotel-carpet-buying-guide', 'area-rugs-vs-wall-to-wall-carpets', 'carpet-manufacturing-process-explained'],
    relatedProducts: ['carpet-tiles', 'wall-to-wall-carpets', 'hand-tufted-carpet'],
  },
  {
    slug: 'school-carpet-buying-guide', category: 'buying',
    title: 'School Carpet Buying Guide', heroImage: '/images/tgi-banner-3.webp',
    seoTitle: 'School Carpet & Dhurrie Buying Guide | Education Flooring — Tapis Global',
    seoDescription: 'A school carpet and dhurrie buying guide — choosing safe, durable, economical floor seating and carpet for classrooms, halls and institutions, including tender supply.',
    seoKeywords: ['school carpet buying guide', 'school dhurrie selection', 'classroom flooring guide', 'school floor seating guide'],
    h1: 'School Carpet & Floor-Seating Buying Guide',
    intro: 'Schools need floor coverings that are safe for children, durable under constant use, easy to clean and economical in bulk — whether carpet for halls or dhurries and Tat Patti for classroom floor seating. This guide helps education buyers choose well.',
    sections: [
      { h2: 'Safety & Comfort for Children', body: 'Specify soft yet durable materials with non-toxic, AZO-free dyes, comfortable for floor seating and safe for children. Low-profile, even surfaces reduce trip hazards in circulation areas.' },
      { h2: 'Durability & Washability', body: 'School floor coverings face intensive daily use and frequent cleaning. Cotton dhurries are washable and practical for classrooms; carpet for halls should be contract-grade and soil-resistant. Tat Patti offers economical, hard-wearing floor seating.' },
      { h2: 'Floor Seating: Dhurries & Tat Patti', body: 'For classroom and assembly floor seating, cotton dhurries and Tat Patti are the standard — comfortable, durable and affordable in bulk. Specify sizes to your classroom and hall dimensions.' },
      { h2: 'Bulk & Tender Supply', body: 'Education buyers, especially government schools, procure in large recurring volumes. Buy from a direct manufacturer for competitive pricing, spec-compliance, samples and documentation, and reliable bulk delivery to tender deadlines.' },
    ],
    takeaways: [
      'Choose child-safe, AZO-free, comfortable and durable materials.',
      'Cotton dhurries and Tat Patti are ideal, economical floor-seating options.',
      'Specify washable, soil-resistant constructions for daily use.',
      'For government schools, buy direct for tender pricing, compliance and bulk delivery.',
    ],
    faqs: [
      { q: 'What floor covering is best for classroom floor seating?', a: 'Cotton dhurries and Tat Patti are the standard — comfortable, washable, durable and economical in bulk, sized to your classroom.' },
      { q: 'Are your school floor coverings safe for children?', a: 'Yes. We use soft, durable materials with non-toxic, AZO-free dyes, suitable and safe for children\'s floor seating.' },
      { q: 'Can you supply government school tenders?', a: 'Yes. We manufacture school dhurries and Tat Patti to tender specification in bulk, with samples, competitive pricing and documentation.' },
    ],
    relatedGuides: ['government-tender-dhurrie-buying-guide', 'kilim-vs-dhurrie', 'mosque-carpet-buying-guide'],
    relatedProducts: ['dhurrie-rugs', 'tat-patti', 'wall-to-wall-carpets'],
  },
  {
    slug: 'government-tender-dhurrie-buying-guide', category: 'buying',
    title: 'Government Tender Dhurrie Buying Guide', heroImage: '/images/manufacturing-rug-img.webp',
    seoTitle: 'Government Tender Dhurrie Buying Guide | Tender Supply — Tapis Global',
    seoDescription: 'A government tender dhurrie and Tat Patti buying guide — how to specify, evaluate and source bulk dhurries for government, school, tribal welfare and NGO tenders.',
    seoKeywords: ['government tender dhurrie buying guide', 'tender dhurrie specification', 'how to buy dhurries for tender', 'government dhurrie procurement'],
    h1: 'Government Tender Dhurrie & Tat Patti Buying Guide',
    intro: 'Procuring dhurries or Tat Patti through a government tender means meeting an exact specification, achieving competitive pricing and ensuring reliable bulk delivery to deadline. This guide helps procurement teams and suppliers get tender sourcing right.',
    sections: [
      { h2: 'Writing & Reading the Specification', body: 'Tender specs define material (cotton, wool, jute), weight, size, weave and sometimes colour (e.g. red-black stripe). Clarity here is critical — both for buyers writing the spec and suppliers meeting it. Always require an approved sample against the written spec.' },
      { h2: 'Evaluating Suppliers', body: 'Prefer direct manufacturers over traders — they offer better pricing, control quality and can guarantee bulk capacity. Verify manufacturing capability, sample quality, documentation and the ability to meet the tender quantity and deadline.' },
      { h2: 'Pricing & Documentation', body: 'Direct manufacturing removes middleman margins for competitive tender pricing. Ensure the supplier provides specification sheets, samples, quotations and the commercial documentation public procurement requires.' },
      { h2: 'Delivery & Compliance', body: 'Tenders run to fixed dates and large quantities. Confirm the supplier can hold consistency across the batch and deliver in phases if needed. For school, anganwadi, tribal welfare and NGO supply, reliability to deadline is as important as price.' },
    ],
    takeaways: [
      'Require an approved sample against the exact written specification.',
      'Prefer direct manufacturers for pricing, quality and bulk capacity.',
      'Ensure full documentation for public procurement.',
      'Confirm batch consistency and on-time delivery to tender deadlines.',
    ],
    faqs: [
      { q: 'How do I specify dhurries for a government tender?', a: 'Define material, weight, size, weave and colour clearly, and require an approved sample against that spec. We help interpret and meet specifications exactly.' },
      { q: 'Why buy tender dhurries from a manufacturer?', a: 'Direct manufacturers offer competitive pricing, controlled quality, bulk capacity and accountability — reducing tender risk versus traders.' },
      { q: 'Can you supply school, anganwadi and NGO tenders?', a: 'Yes. We manufacture dhurries and Tat Patti to tender specification in bulk for government schools, anganwadis, tribal welfare and NGOs, with documentation and on-time delivery.' },
    ],
    relatedGuides: ['school-carpet-buying-guide', 'kilim-vs-dhurrie', 'how-rugs-are-manufactured'],
    relatedProducts: ['dhurrie-rugs', 'tat-patti', 'jute-sisal-rugs'],
  },

  // ───────────────────────────────────── EXPORT & SOURCING GUIDES
  {
    slug: 'how-to-import-carpets-from-india', category: 'export',
    title: 'How To Import Carpets From India', heroImage: '/images/tgi-banner-7.webp',
    seoTitle: 'How to Import Carpets from India | Step-by-Step Guide — Tapis Global',
    seoDescription: 'How to import carpets from India — finding a manufacturer, samples, terms, documentation, quality control, payment and shipping. A practical guide for international buyers.',
    seoKeywords: ['how to import carpets from India', 'importing rugs from India', 'buy carpets from India wholesale', 'Indian carpet import process'],
    h1: 'How to Import Carpets from India: A Buyer\'s Guide',
    intro: 'India is the world\'s leading source of handmade carpets, and importing directly from a manufacturer offers quality and value — if you manage the process well. This guide walks international buyers through importing carpets from India step by step.',
    sections: [
      { h2: '1. Find a Direct Manufacturer', body: 'Buy from a manufacturer rather than a trader for better pricing, quality control and customisation. Verify they actually manufacture (ask about the facility, process and capacity), and review samples before committing.' },
      { h2: '2. Samples, Specification & Terms', body: 'Agree exact specifications, request samples and lab-dips for approval, and confirm commercial terms — price, MOQ, lead time and Incoterms (FOB, CIF, etc.). Getting this right upfront prevents disputes later.' },
      { h2: '3. Quality Control & Documentation', body: 'Insist on multi-stage QC and pre-dispatch inspection. Ensure the manufacturer provides the commercial and compliance documentation your country requires — including fire-rating, OEKO-TEX and certificates of origin where applicable.' },
      { h2: '4. Payment & Shipping', body: 'Common terms include TT (bank transfer), LC (letter of credit), DA and DP. Agree packing and freight — sea freight is standard for carpets. A good manufacturer-exporter coordinates packing and shipping to your port and terms.' },
    ],
    takeaways: [
      'Buy direct from a verified manufacturer for value and quality control.',
      'Lock specifications, samples, MOQ, lead time and Incoterms upfront.',
      'Require multi-stage QC, pre-dispatch inspection and full documentation.',
      'Use secure payment terms (TT/LC) and confirm packing and freight.',
    ],
    faqs: [
      { q: 'Is it cheaper to import carpets directly from India?', a: 'Yes — buying direct from an Indian manufacturer removes intermediary margins, typically offering better pricing and full customisation versus buying through traders or local distributors.' },
      { q: 'What payment terms are used when importing from India?', a: 'Common terms are TT (bank transfer), Letters of Credit (LC), DA and DP. Terms are often negotiable for established buyers.' },
      { q: 'How are carpets shipped from India?', a: 'Usually by sea freight. A manufacturer-exporter packs carpets for international transit and coordinates freight to your preferred port and Incoterms.' },
    ],
    relatedGuides: ['why-buy-carpets-from-india', 'why-bhadohi-carpet-capital', 'how-custom-rug-manufacturing-works'],
    relatedProducts: ['hand-knotted-carpet', 'hand-tufted-carpet', 'jute-sisal-rugs'],
  },
  {
    slug: 'why-buy-carpets-from-india', category: 'export',
    title: 'Why Buy Carpets From India', heroImage: '/images/tgi-banner-1.webp',
    seoTitle: 'Why Buy Carpets from India | Quality, Value & Heritage — Tapis Global',
    seoDescription: 'Why buy carpets from India — unmatched handmade heritage, skilled artisans, value, customisation and export experience. A guide for international carpet buyers.',
    seoKeywords: ['why buy carpets from India', 'Indian carpets quality', 'India carpet manufacturing', 'best country to buy carpets'],
    h1: 'Why Buy Carpets from India',
    intro: 'India has been at the centre of handmade carpet-making for centuries and remains the world\'s leading exporter of hand knotted and handmade carpets. Here is why international buyers source carpets from India.',
    sections: [
      { h2: 'Unmatched Handmade Heritage', body: 'India\'s carpet belt — centred on Bhadohi — holds centuries of concentrated weaving skill passed through generations of artisan families. This depth of craft is difficult to match anywhere else in the world.' },
      { h2: 'Quality & Customisation', body: 'Indian manufacturers offer the full range of constructions — hand knotted, hand tufted, flatweave, natural fibre — with near-total customisation of size, colour, design and density. This makes India ideal for bespoke and project work.' },
      { h2: 'Value for Money', body: 'India combines skilled craftsmanship with competitive pricing, especially when buying direct from manufacturers. For the quality of handmade carpet you receive, the value is exceptional.' },
      { h2: 'Export Infrastructure', body: 'Indian carpet manufacturers have decades of export experience, with the documentation, compliance and logistics capability international buyers need. Sourcing is well-established and reliable.' },
    ],
    takeaways: [
      'India offers centuries of concentrated handmade carpet heritage.',
      'Full construction range with near-total customisation.',
      'Exceptional value, especially buying direct from manufacturers.',
      'Mature export infrastructure for documentation and logistics.',
    ],
    faqs: [
      { q: 'Why is India known for carpets?', a: 'India has centuries of handmade carpet heritage, especially around Bhadohi, with unmatched concentrations of weaving skill and a full range of constructions.' },
      { q: 'Are Indian carpets good quality?', a: 'Indian handmade carpets are among the finest in the world. Quality varies by manufacturer, so buy from a verified, reputable maker with proper QC.' },
      { q: 'Is buying carpets from India good value?', a: 'Yes — India combines skilled craftsmanship with competitive pricing, offering exceptional value, particularly when buying direct from manufacturers.' },
    ],
    relatedGuides: ['how-to-import-carpets-from-india', 'why-bhadohi-carpet-capital', 'handmade-vs-machine-made-carpets'],
    relatedProducts: ['hand-knotted-carpet', 'hand-tufted-carpet', 'kilim-rugs'],
  },
  {
    slug: 'why-bhadohi-carpet-capital', category: 'export',
    title: 'Why Bhadohi Is The Carpet Capital Of India', heroImage: '/images/tgi-banner-5.webp',
    seoTitle: 'Why Bhadohi Is the Carpet Capital of India | Guide — Tapis Global',
    seoDescription: 'Why Bhadohi is the carpet capital of India — its weaving heritage, GI recognition, artisan community, supply chains and why buying at source matters.',
    seoKeywords: ['why Bhadohi carpet capital', 'Bhadohi carpet city', 'Bhadohi carpet industry', 'carpet capital of India'],
    h1: 'Why Bhadohi Is the Carpet Capital of India',
    intro: 'Bhadohi, in Uttar Pradesh, is the heart of India\'s carpet industry — the largest handwoven carpet cluster in South Asia. For buyers, understanding Bhadohi explains the craft, quality and value of the carpets sourced from here.',
    sections: [
      { h2: 'Centuries of Weaving Heritage', body: 'Bhadohi and its surrounding belt have woven carpets for generations, building an unmatched concentration of skilled artisans. This heritage — passed through weaving families — is the foundation of authentic handmade quality.' },
      { h2: 'GI Recognition', body: 'Bhadohi handmade carpets hold Geographical Indication (GI) status, protecting the name and signifying authentic origin and craftsmanship from the region — a mark of provenance for buyers.' },
      { h2: 'Complete Supply Chains', body: 'The region offers deep, integrated supply chains for yarn, dyeing, weaving and finishing, plus a large skilled workforce. This ecosystem lets Bhadohi manufacturers handle everything from bespoke pieces to large export orders.' },
      { h2: 'Buying at Source', body: 'Sourcing from Bhadohi means buying at the source — removing intermediaries for better pricing, direct quality control and authentic construction, with access to the artisan community that defines the craft.' },
    ],
    takeaways: [
      'Bhadohi is India\'s largest handwoven carpet cluster.',
      'Bhadohi carpets carry GI recognition for authentic origin.',
      'Deep local supply chains support bespoke to bulk production.',
      'Buying at source means better pricing, control and authenticity.',
    ],
    faqs: [
      { q: 'Why is Bhadohi called the carpet capital of India?', a: 'It is India\'s largest handwoven carpet-manufacturing and export cluster, with centuries of weaving heritage and GI recognition for its handmade carpets.' },
      { q: 'What is GI recognition for Bhadohi carpets?', a: 'Geographical Indication recognition protects "Bhadohi handmade carpet" as originating from the region, signifying authentic local craftsmanship.' },
      { q: 'Is it better to buy carpets from Bhadohi?', a: 'Buying from Bhadohi means buying at source — authentic construction, source-direct pricing and access to the region\'s skilled artisan community.' },
    ],
    relatedGuides: ['why-buy-carpets-from-india', 'how-to-import-carpets-from-india', 'handmade-vs-machine-made-carpets'],
    relatedProducts: ['hand-knotted-carpet', 'hand-tufted-carpet', 'dhurrie-rugs'],
  },
  {
    slug: 'how-custom-rug-manufacturing-works', category: 'export',
    title: 'How Custom Rug Manufacturing Works', heroImage: '/images/handtufted-img-2.webp',
    seoTitle: 'How Custom Rug Manufacturing Works | Bespoke Process — Tapis Global',
    seoDescription: 'How custom rug manufacturing works — from brief and artwork to lab-dips, sampling, production and delivery. A guide for designers and buyers commissioning bespoke rugs.',
    seoKeywords: ['how custom rug manufacturing works', 'custom rug process', 'bespoke rug manufacturing', 'made to order rug process'],
    h1: 'How Custom Rug Manufacturing Works',
    intro: 'Commissioning a custom rug — to an exact size, colour and design — is more straightforward than many buyers expect, but it follows a clear process. This guide explains how custom rug manufacturing works, from brief to delivery.',
    sections: [
      { h2: '1. Brief & Design', body: 'It starts with your brief: size, shape, intended space, style and any artwork, mood board or Pantone references. The manufacturer translates this into a production-ready design and recommends the best construction (tufted, knotted, flatweave) for the result and budget.' },
      { h2: '2. Lab-Dips & Sampling', body: 'Yarn colours are lab-dipped to match your references and sent for approval. For larger commissions, a physical sample (or strike-off) is produced so you can approve colour, texture and quality before bulk production begins.' },
      { h2: '3. Production', body: 'On approval, the rug is manufactured to the agreed specification, with quality control through each stage. Lead times typically range from 30 to 90 days depending on construction, size and quantity.' },
      { h2: '4. Finishing, QC & Delivery', body: 'The rug is washed, finished and inspected against your approved sample, then packed and dispatched — domestically or for export with full documentation. The result should match what you approved, exactly.' },
    ],
    takeaways: [
      'Custom rugs are made to your exact size, colour, design and construction.',
      'Lab-dips and a sample are approved before bulk — no surprises.',
      'Lead times are typically 30–90 days; samples around 2–3 weeks.',
      'A good manufacturer matches the delivered rug to your approved sample.',
    ],
    faqs: [
      { q: 'Can I get a rug made to my own design?', a: 'Yes. Share artwork, a mood board or references and we develop a production-ready design, lab-dips and a sample for approval before manufacturing.' },
      { q: 'How long does a custom rug take?', a: 'Typically 30–90 days depending on construction, size and quantity, with samples usually ready in 2–3 weeks.' },
      { q: 'Is there a minimum order for custom rugs?', a: 'We make single bespoke pieces for designers and homes as well as large custom programmes. MOQ varies by construction — share your requirement.' },
    ],
    relatedGuides: ['how-to-import-carpets-from-india', 'hand-tufted-carpet-manufacturing-process', 'why-bhadohi-carpet-capital'],
    relatedProducts: ['hand-tufted-carpet', 'hand-knotted-carpet', 'area-rugs'],
  },
]

// ─── HELPERS ───────────────────────────────────────────────────────────────
export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug)
}

export function getAllGuideSlugs(): string[] {
  return GUIDES.map((g) => g.slug)
}

export function getGuidesByCategory(category: GuideCategory): Guide[] {
  return GUIDES.filter((g) => g.category === category)
}

export function getRelatedGuides(slugs: string[] = []): Guide[] {
  return slugs
    .map((s) => GUIDES.find((g) => g.slug === s))
    .filter((x): x is Guide => Boolean(x))
}

// Picks 3 contextually-relevant guides for a landing page (industry/solution/
// country/dhurrie/company). Slug-specific overrides first, then per-kind defaults.
// Returns varied links per page (no duplicate link sets) for internal-link depth.
const GUIDE_DEFAULTS_BY_KIND: Record<string, string[]> = {
  industry: ['hotel-carpet-buying-guide', 'hand-tufted-vs-hand-knotted-carpet', 'how-carpets-are-manufactured'],
  solution: ['handmade-vs-machine-made-carpets', 'how-custom-rug-manufacturing-works', 'how-carpets-are-manufactured'],
  country:  ['how-to-import-carpets-from-india', 'why-buy-carpets-from-india', 'why-bhadohi-carpet-capital'],
  dhurrie:  ['government-tender-dhurrie-buying-guide', 'kilim-vs-dhurrie', 'school-carpet-buying-guide'],
  company:  ['how-carpets-are-manufactured', 'why-bhadohi-carpet-capital', 'handmade-vs-machine-made-carpets'],
  'usa-state': ['how-to-import-carpets-from-india', 'why-buy-carpets-from-india', 'why-bhadohi-carpet-capital'],
  'usa-city':  ['how-to-import-carpets-from-india', 'why-buy-carpets-from-india', 'why-bhadohi-carpet-capital'],
}
const GUIDE_SLUG_OVERRIDES: Record<string, string[]> = {
  'hotel-carpets': ['hotel-carpet-buying-guide', 'wool-vs-viscose-carpets', 'area-rugs-vs-wall-to-wall-carpets'],
  'hotel-lobby-carpets': ['hotel-carpet-buying-guide', 'hand-tufted-vs-hand-knotted-carpet', 'carpet-manufacturing-process-explained'],
  'hotel-room-carpets': ['hotel-carpet-buying-guide', 'area-rugs-vs-wall-to-wall-carpets', 'wool-vs-viscose-carpets'],
  'auditorium-carpets': ['auditorium-carpet-buying-guide', 'carpet-manufacturing-process-explained', 'wool-vs-viscose-carpets'],
  'mosque-carpets': ['mosque-carpet-buying-guide', 'how-carpets-are-manufactured', 'hand-tufted-vs-hand-knotted-carpet'],
  'office-carpets': ['office-carpet-buying-guide', 'area-rugs-vs-wall-to-wall-carpets', 'carpet-manufacturing-process-explained'],
  'school-carpets': ['school-carpet-buying-guide', 'government-tender-dhurrie-buying-guide', 'kilim-vs-dhurrie'],
  'conference-room-carpets': ['office-carpet-buying-guide', 'carpet-manufacturing-process-explained', 'wool-vs-viscose-carpets'],
  'banquet-hall-carpets': ['hotel-carpet-buying-guide', 'auditorium-carpet-buying-guide', 'how-carpets-are-manufactured'],
  // dhurrie material/intent overrides
  'cotton-dhurrie-manufacturer': ['kilim-vs-dhurrie', 'how-rugs-are-manufactured', 'government-tender-dhurrie-buying-guide'],
  'wool-dhurrie-manufacturer': ['kilim-vs-dhurrie', 'wool-vs-viscose-carpets', 'how-rugs-are-manufactured'],
  'jute-dhurrie-manufacturer': ['jute-vs-sisal-rugs', 'kilim-vs-dhurrie', 'how-rugs-are-manufactured'],
  'tat-patti-manufacturer': ['school-carpet-buying-guide', 'government-tender-dhurrie-buying-guide', 'kilim-vs-dhurrie'],
  'handloom-dhurrie-manufacturer': ['kilim-vs-dhurrie', 'handmade-vs-machine-made-carpets', 'how-rugs-are-manufactured'],
  // USA state/city overrides — swapped in only where a specific guide is a
  // genuinely better fit than the generic 3-guide default, based on each
  // page's already-established dominant buyer profile (corporate/office,
  // hospitality/resort, institutional/government, or heritage/luxury).
  'new-york': ['office-carpet-buying-guide', 'hotel-carpet-buying-guide', 'why-buy-carpets-from-india'],
  'pennsylvania': ['hand-tufted-vs-hand-knotted-carpet', 'government-tender-dhurrie-buying-guide', 'why-bhadohi-carpet-capital'],
  'massachusetts': ['school-carpet-buying-guide', 'hand-tufted-vs-hand-knotted-carpet', 'why-bhadohi-carpet-capital'],
  'rhode-island': ['hand-tufted-vs-hand-knotted-carpet', 'wool-vs-viscose-carpets', 'why-buy-carpets-from-india'],
  'vermont': ['jute-vs-sisal-rugs', 'handmade-vs-machine-made-carpets', 'why-bhadohi-carpet-capital'],
  'maine': ['jute-vs-sisal-rugs', 'why-buy-carpets-from-india', 'why-bhadohi-carpet-capital'],
  'illinois': ['office-carpet-buying-guide', 'auditorium-carpet-buying-guide', 'why-buy-carpets-from-india'],
  'ohio': ['school-carpet-buying-guide', 'office-carpet-buying-guide', 'why-bhadohi-carpet-capital'],
  'indiana': ['hotel-carpet-buying-guide', 'auditorium-carpet-buying-guide', 'why-buy-carpets-from-india'],
  'wisconsin': ['jute-vs-sisal-rugs', 'why-buy-carpets-from-india', 'why-bhadohi-carpet-capital'],
  'minnesota': ['office-carpet-buying-guide', 'school-carpet-buying-guide', 'why-buy-carpets-from-india'],
  'iowa': ['office-carpet-buying-guide', 'government-tender-dhurrie-buying-guide', 'why-bhadohi-carpet-capital'],
  'missouri': ['office-carpet-buying-guide', 'hotel-carpet-buying-guide', 'why-buy-carpets-from-india'],
  'florida': ['hotel-carpet-buying-guide', 'area-rugs-vs-wall-to-wall-carpets', 'why-buy-carpets-from-india'],
  'georgia': ['office-carpet-buying-guide', 'auditorium-carpet-buying-guide', 'why-bhadohi-carpet-capital'],
  'north-carolina': ['office-carpet-buying-guide', 'school-carpet-buying-guide', 'why-buy-carpets-from-india'],
  'south-carolina': ['hotel-carpet-buying-guide', 'hand-tufted-vs-hand-knotted-carpet', 'why-bhadohi-carpet-capital'],
  'virginia': ['government-tender-dhurrie-buying-guide', 'office-carpet-buying-guide', 'why-buy-carpets-from-india'],
  'washington-dc': ['government-tender-dhurrie-buying-guide', 'hand-tufted-vs-hand-knotted-carpet', 'why-bhadohi-carpet-capital'],
  'maryland': ['government-tender-dhurrie-buying-guide', 'school-carpet-buying-guide', 'why-buy-carpets-from-india'],
  'delaware': ['office-carpet-buying-guide', 'why-buy-carpets-from-india', 'why-bhadohi-carpet-capital'],
  'west-virginia': ['hotel-carpet-buying-guide', 'school-carpet-buying-guide', 'why-bhadohi-carpet-capital'],
  'tennessee': ['office-carpet-buying-guide', 'hotel-carpet-buying-guide', 'why-buy-carpets-from-india'],
  'alabama': ['office-carpet-buying-guide', 'government-tender-dhurrie-buying-guide', 'why-bhadohi-carpet-capital'],
  'mississippi': ['hotel-carpet-buying-guide', 'area-rugs-vs-wall-to-wall-carpets', 'why-buy-carpets-from-india'],
  'kentucky': ['hotel-carpet-buying-guide', 'hand-tufted-vs-hand-knotted-carpet', 'why-bhadohi-carpet-capital'],
  'texas': ['office-carpet-buying-guide', 'wool-vs-viscose-carpets', 'why-buy-carpets-from-india'],
  'oklahoma': ['government-tender-dhurrie-buying-guide', 'office-carpet-buying-guide', 'why-bhadohi-carpet-capital'],
  'arkansas': ['office-carpet-buying-guide', 'why-buy-carpets-from-india', 'why-bhadohi-carpet-capital'],
  'louisiana': ['hotel-carpet-buying-guide', 'hand-tufted-vs-hand-knotted-carpet', 'why-buy-carpets-from-india'],
  'colorado': ['office-carpet-buying-guide', 'hotel-carpet-buying-guide', 'why-bhadohi-carpet-capital'],
  'arizona': ['hotel-carpet-buying-guide', 'wool-vs-viscose-carpets', 'why-buy-carpets-from-india'],
  'nevada': ['hotel-carpet-buying-guide', 'auditorium-carpet-buying-guide', 'why-bhadohi-carpet-capital'],
  'utah': ['office-carpet-buying-guide', 'hotel-carpet-buying-guide', 'why-buy-carpets-from-india'],
  'new-mexico': ['government-tender-dhurrie-buying-guide', 'hand-tufted-vs-hand-knotted-carpet', 'why-bhadohi-carpet-capital'],
  'wyoming': ['hand-tufted-vs-hand-knotted-carpet', 'wool-vs-viscose-carpets', 'why-buy-carpets-from-india'],
  'montana': ['hand-tufted-vs-hand-knotted-carpet', 'jute-vs-sisal-rugs', 'why-bhadohi-carpet-capital'],
  'california': ['office-carpet-buying-guide', 'wool-vs-viscose-carpets', 'why-buy-carpets-from-india'],
  'washington': ['office-carpet-buying-guide', 'government-tender-dhurrie-buying-guide', 'why-bhadohi-carpet-capital'],
  'oregon': ['office-carpet-buying-guide', 'wool-vs-viscose-carpets', 'why-buy-carpets-from-india'],
  'alaska': ['hotel-carpet-buying-guide', 'how-to-import-carpets-from-india', 'why-bhadohi-carpet-capital'],
  'hawaii': ['hotel-carpet-buying-guide', 'area-rugs-vs-wall-to-wall-carpets', 'how-to-import-carpets-from-india'],
  'new-york-city': ['office-carpet-buying-guide', 'hotel-carpet-buying-guide', 'why-buy-carpets-from-india'],
  'boston': ['school-carpet-buying-guide', 'hand-tufted-vs-hand-knotted-carpet', 'why-bhadohi-carpet-capital'],
  'philadelphia': ['school-carpet-buying-guide', 'government-tender-dhurrie-buying-guide', 'why-buy-carpets-from-india'],
  'chicago': ['office-carpet-buying-guide', 'auditorium-carpet-buying-guide', 'why-bhadohi-carpet-capital'],
  'detroit': ['office-carpet-buying-guide', 'hotel-carpet-buying-guide', 'why-buy-carpets-from-india'],
  'miami': ['hotel-carpet-buying-guide', 'wool-vs-viscose-carpets', 'why-buy-carpets-from-india'],
  'atlanta': ['office-carpet-buying-guide', 'auditorium-carpet-buying-guide', 'why-bhadohi-carpet-capital'],
  'charlotte': ['office-carpet-buying-guide', 'why-buy-carpets-from-india', 'why-bhadohi-carpet-capital'],
  'nashville': ['office-carpet-buying-guide', 'hotel-carpet-buying-guide', 'why-buy-carpets-from-india'],
  'houston': ['office-carpet-buying-guide', 'government-tender-dhurrie-buying-guide', 'why-bhadohi-carpet-capital'],
  'dallas': ['office-carpet-buying-guide', 'wool-vs-viscose-carpets', 'why-buy-carpets-from-india'],
  'austin': ['office-carpet-buying-guide', 'government-tender-dhurrie-buying-guide', 'why-bhadohi-carpet-capital'],
  'denver': ['office-carpet-buying-guide', 'hotel-carpet-buying-guide', 'why-buy-carpets-from-india'],
  'phoenix': ['hotel-carpet-buying-guide', 'wool-vs-viscose-carpets', 'why-bhadohi-carpet-capital'],
  'las-vegas': ['hotel-carpet-buying-guide', 'auditorium-carpet-buying-guide', 'why-buy-carpets-from-india'],
  'los-angeles': ['hand-tufted-vs-hand-knotted-carpet', 'wool-vs-viscose-carpets', 'why-bhadohi-carpet-capital'],
  'san-francisco': ['office-carpet-buying-guide', 'hand-tufted-vs-hand-knotted-carpet', 'why-buy-carpets-from-india'],
  'san-diego': ['office-carpet-buying-guide', 'government-tender-dhurrie-buying-guide', 'why-bhadohi-carpet-capital'],
  'seattle': ['office-carpet-buying-guide', 'why-buy-carpets-from-india', 'why-bhadohi-carpet-capital'],
}
export function guidesForLanding(kind: string, slug: string): Guide[] {
  const slugs = GUIDE_SLUG_OVERRIDES[slug] ?? GUIDE_DEFAULTS_BY_KIND[kind] ?? GUIDE_DEFAULTS_BY_KIND.industry
  return getRelatedGuides(slugs)
}

// Picks up to 3 guides for a product page. Uses the product's own relatedGuides
// when provided, then tops up with any guide that lists this product — so every
// product page links into the guides cluster (product → guide internal links).
export function guidesForProduct(productSlug: string, preferred: string[] = []): Guide[] {
  const chosen = getRelatedGuides(preferred)
  if (chosen.length >= 3) return chosen.slice(0, 3)
  const seen = new Set(chosen.map((g) => g.slug))
  const extra = GUIDES.filter((g) => g.relatedProducts.includes(productSlug) && !seen.has(g.slug))
  return [...chosen, ...extra].slice(0, 3)
}
