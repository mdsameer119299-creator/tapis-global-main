# Tapis Global — Topical Authority Map

How every page maps into silos, and how authority + internal links flow. The goal
is **topical authority**: deep, interlinked coverage of carpet/rug manufacturing so
Google sees Tapis Global as an authority, with link equity funnelled to the
commercial "money" pages (products, industries, dhurrie tender silo).

**Total indexable URLs: 129** (as of this build).

```
Home (/)
│
├── Company / EEAT silo  (/company)                         [10 pages]
│    ├── Factory · Manufacturing Process · Quality Control
│    ├── Export Process · Certifications · Sustainability
│    ├── Custom Manufacturing · OEM & Private Label
│    └── Production Capacity · Why Bhadohi (carpet capital)
│
├── Products silo  (/products)                              [14 pages]
│    ├── Carpets: Hand Tufted · Hand Knotted · Wall-to-Wall · Carpet Tiles · Leather
│    ├── Rugs: Area · Shaggy · Jute & Sisal · Flat Weaves · Kilim · Dhurrie
│    ├── Lifestyle: Poufs
│    └── Natural Fibre: Coco Coir · Tat Patti
│
├── Industries silo  (/industries)                          [30 pages]
│    ├── Hospitality: Hotels · Hotel Lobby · Hotel Rooms · Banquet · Restaurants · Bars/Lounges
│    ├── Worship: Mosques · Temples · Churches
│    ├── Civic/Edu: Schools · Libraries · Museums · Government · Embassy
│    ├── Workplace: Offices · Conference Rooms · Co-working · Banks
│    ├── Leisure/Transit: Auditoriums · Casinos · Cruise/Yacht · Spa · Exhibition · Airports
│    └── Residential/Care: Villas · Apartments · Clubhouses · Hospitals · Senior Living
│
├── Solutions silo  (/solutions)                            [8 pages]
│    ├── Luxury · Designer · Custom · Modern
│    └── Commercial · Wholesale · Contract · Exporter
│
├── Dhurrie & Tat Patti silo  (/dhurries)                   [16 pages]
│    ├── Tat Patti Manufacturer · School Tat Patti · Govt Tender Tat Patti
│    ├── Tender: Government Tender Dhurrie · Bulk/Wholesale
│    ├── Buyers: School · Hostel · NGO · Relief Camp
│    ├── Material: Cotton · Wool · Jute · Handloom · Floor Seating
│    └── Geo: Dhurrie Exporter India · Dhurrie Manufacturer Bhadohi
│
├── Export Markets silo  (/countries)                       [12 pages]
│    ├── USA · UK · Germany · France · Italy · Spain
│    └── Netherlands · Belgium · Australia · UAE · Saudi Arabia · Qatar
│
└── Guides / Authority cluster  (/guides)                   [22 pages]
     ├── Manufacturing: How Carpets/Rugs Made · Process Explained (carpet/rug) ·
     │   Hand Tufted Process · Hand Knotted Process
     ├── Comparison: Tufted vs Knotted · Kilim vs Dhurrie · Jute vs Sisal ·
     │   Wool vs Viscose · Handmade vs Machine · Area Rug vs Wall-to-Wall
     ├── Buying: Hotel · Auditorium · Mosque · Office · School · Govt Tender Dhurrie
     └── Export: Import from India · Why Buy from India · Why Bhadohi · Custom Rug Mfg
```

## Internal-link flow (authority routing)

```
Guides (informational)  ──►  Products / Dhurries (commercial)  ──►  Contact / Catalogue (convert)
        ▲                          │
        └───── Industries ◄────────┘   (Industry ⇄ Solution ⇄ Country cross-links)
Company/EEAT  ──► supports trust on ALL money pages (linked from footer + related)
```

- **Every page** links to: Home, its hub, 3+ related products, 3+ related siblings, Contact, Catalogue (enforced in `LandingPage` / `GuideArticle` / product template).
- **Hubs** (`/products`, `/industries`, `/solutions`, `/dhurries`, `/countries`, `/company`, `/guides`) are linked from the **footer** and (products/dhurries) the **mega menu** — every silo ≤2 clicks from Home.
- **Guides** funnel readers to commercial pages via "Related Products" + contextual links; comparison/buying guides point directly at the matching product/dhurrie pages.
- **No orphans**: every URL is reachable from the footer hub links + sitemap + in-page related sections.

## Money pages (conversion priority)
1. Dhurrie tender silo (`/dhurries/*`) — highest lead-gen, lowest competition.
2. Industry pages (`/industries/*`) — high commercial intent.
3. Product pages (`/products/*`) — core catalogue.
4. Solutions (`/solutions/*`) — modifier intent.

## What still moves the needle most (off-page / assets — not code)
1. **Real EEAT media**: factory/weaving/tufting/finishing/packing/container photos + team & family-story photos on `/company/*` and `/about`. (Requires real assets from the business.)
2. **Backlinks**: architecture & interior-design directories, export/trade directories (IndiaMART, CEPC/FIEO), carpet-industry portals, design publications.
3. **Google Business Profile** for the Bhadohi facility + GSC sitemap submission post-deploy.
