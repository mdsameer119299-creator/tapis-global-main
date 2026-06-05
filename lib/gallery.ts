export type GalleryCategory =
  | 'all'
  | 'Hand Knotted'
  | 'Hand Tufted'
  | 'Jute & Sisal'
  | 'Hospitality'
  | 'Wall-to-Wall'
  | 'Custom OEM'

export type GalleryItem = {
  id:       string
  image:    string
  category: Exclude<GalleryCategory, 'all'>
  title:    string
  location: string
}

export const GALLERY_FILTERS: { id: GalleryCategory; label: string }[] = [
  { id: 'all',           label: 'All'           },
  { id: 'Hand Knotted',  label: 'Hand Knotted'  },
  { id: 'Hand Tufted',   label: 'Hand Tufted'   },
  { id: 'Jute & Sisal',  label: 'Jute & Sisal'  },
  { id: 'Hospitality',   label: 'Hospitality'   },
  { id: 'Wall-to-Wall',  label: 'Wall-to-Wall'  },
  { id: 'Custom OEM',    label: 'Custom OEM'    },
]

export const GALLERY_ITEMS: GalleryItem[] = [
  { id: 'knotted-1',  image: '/images/rug2.webp',                  category: 'Hand Knotted', title: 'Amber Wool Pile',        location: 'Bhadohi Collection'    },
  { id: 'knotted-2',  image: '/images/rug3.webp',                  category: 'Hand Knotted', title: 'Geometric Pattern',      location: 'Persian Heritage'      },
  { id: 'knotted-3',  image: '/images/rug4.webp',                  category: 'Hand Knotted', title: 'Silk-Wool Medallion',    location: 'Luxury Series'         },
  { id: 'knotted-4',  image: '/images/tgi-banner-2.webp',          category: 'Hand Knotted', title: 'Hand Knotted Texture',   location: 'Artisan Collection'    },
  { id: 'tufted-1',   image: '/images/handtufted-img-2.webp',      category: 'Hand Tufted',  title: 'Tufted Cut Pile',        location: 'Contemporary Series'   },
  { id: 'tufted-2',   image: '/images/rug1.webp',                  category: 'Hand Tufted',  title: 'Warm Earth Tones',       location: 'Natural Collection'    },
  { id: 'tufted-3',   image: '/images/tufting-carpet.webp',        category: 'Hand Tufted',  title: 'Tufting Production',     location: 'Factory Floor'         },
  { id: 'tufted-4',   image: '/images/tgi-banner-1.webp',          category: 'Hand Tufted',  title: 'Artisan Loom Weaving',   location: 'Bhadohi Workshop'      },
  { id: 'tufted-5',   image: '/images/tgi-banner-6.webp',          category: 'Hand Tufted',  title: 'Finished Collection',    location: 'Export Ready'          },
  { id: 'jute-1',     image: '/images/jute-rugs-manufacturing.webp', category: 'Jute & Sisal', title: 'Jute Flat Weave',      location: 'Eco Collection'        },
  { id: 'jute-2',     image: '/images/rug5.webp',                  category: 'Jute & Sisal', title: 'Natural Fibre Rug',      location: 'Sustainable Line'      },
  { id: 'jute-3',     image: '/images/manufacturing-rug-img.webp', category: 'Jute & Sisal', title: 'Woven Textile Detail',   location: 'Craft Studio'          },
  { id: 'hosp-1',     image: '/images/tgi-banner-4.webp',          category: 'Hospitality',  title: 'Luxury Hotel Install',   location: 'Hotel Project'         },
  { id: 'hosp-2',     image: '/images/tgi-banner-5.webp',          category: 'Hospitality',  title: 'Master Artisan Piece',   location: 'Resort Collection'     },
  { id: 'hosp-3',     image: '/images/videoframe_15503.webp',      category: 'Hospitality',  title: 'Lobby Installation',     location: 'Commercial Interior'   },
  { id: 'w2w-1',      image: '/images/tgi-banner-3.webp',          category: 'Wall-to-Wall', title: 'Dyeing & Colour Lab',  location: 'Contract Grade'        },
  { id: 'w2w-2',      image: '/images/tgi-banner-7.webp',          category: 'Wall-to-Wall', title: 'Broadloom Roll',         location: 'Roll Goods'            },
  { id: 'oem-1',      image: '/images/vibrant-wool-dying.webp',    category: 'Custom OEM',   title: 'Vibrant Wool Dyeing',   location: 'Private Label'         },
  { id: 'oem-2',      image: '/images/wool-drying-pic.webp',       category: 'Custom OEM',   title: 'Wool Drying Process',    location: 'Custom Programme'      },
]

export function filterGalleryItems(
  items: GalleryItem[],
  filter: GalleryCategory,
): GalleryItem[] {
  if (filter === 'all') return items
  return items.filter((item) => item.category === filter)
}
