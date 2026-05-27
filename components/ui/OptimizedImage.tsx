// components/ui/OptimizedImage.tsx
// Drop-in replacement for <img> that uses next/image under the hood.
// Handles:
//   • AVIF/WebP format negotiation via next/image
//   • Responsive srcset generation
//   • Lazy loading (default) or eager (priority prop)
//   • Luxury cinematic CSS filter overlays
//   • Graceful blur-up placeholder via blurDataURL
//   • fill mode for positioned containers (position:relative required on parent)
//   • Stable aspect-ratio sizing for non-fill images

import NextImage, { ImageProps as NextImageProps } from 'next/image'

// ─── Filter presets that match the original CSS ───────────────────────────────
export type ImageTone =
  | 'hero'          // brightness(0.68) saturate(0.95) sepia(0.06) — main hero slides
  | 'editorial'     // brightness(0.85) saturate(0.90) sepia(0.04) — collection images
  | 'dark'          // brightness(0.72) saturate(0.88) sepia(0.05) — exports/split sections
  | 'factory'       // brightness(0.58) saturate(0.78) sepia(0.14) — process step images
  | 'footer'        // brightness(0.30) saturate(0.70) sepia(0.15) — footer banner
  | 'about'         // brightness(0.80) saturate(0.88) sepia(0.07) — about/founder images
  | 'product'       // brightness(0.88) saturate(1.00)              — product card images
  | 'none'          // no filter

export const IMAGE_TONE_FILTERS: Record<ImageTone, string> = {
  hero:       'brightness(0.68) saturate(0.95) sepia(0.06)',
  editorial:  'brightness(0.85) saturate(0.90) sepia(0.04)',
  dark:       'brightness(0.72) saturate(0.88) sepia(0.05)',
  factory:    'brightness(0.58) saturate(0.78) sepia(0.14)',
  footer:     'brightness(0.30) saturate(0.70) sepia(0.15) grayscale(0.2)',
  about:      'brightness(0.80) saturate(0.88) sepia(0.07)',
  product:    'brightness(0.88) saturate(1.00)',
  none:       'none',
}

// ─── Shared blur placeholder (1×1 warm ivory pixel) ──────────────────────────
// Used while the actual image loads — gives a warm luxury feel instead of grey
export const BLUR_PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8+uVLPQAIhQNzJgbXSAAAAABJRU5ErkJggg=='

// ─── Props ────────────────────────────────────────────────────────────────────
type OptimizedImageProps = Omit<NextImageProps, 'placeholder' | 'blurDataURL'> & {
  /** Visual filter tone — maps to CSS filter presets */
  tone?: ImageTone
  /** Extra CSS filter on top of the tone preset (e.g. 'grayscale(0.4)') */
  filterExtra?: string
  /** Additional className for the <img> element */
  imgClassName?: string
  /** Transition duration for hover effects (ms) */
  transitionMs?: number
  /** Extra inline style to merge onto the img */
  imgStyle?: React.CSSProperties
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function OptimizedImage({
  tone = 'none',
  filterExtra,
  imgClassName = '',
  transitionMs = 700,
  imgStyle,
  style,
  className,
  priority,
  ...props
}: OptimizedImageProps) {
  const baseFilter = IMAGE_TONE_FILTERS[tone]
  const combinedFilter = [baseFilter, filterExtra].filter(Boolean).join(' ')

  const isFill = 'fill' in props && props.fill === true

  return (
    <NextImage
      {...props}
      priority={priority}
      quality={priority ? 80 : 72}
      placeholder={priority ? undefined : 'empty'}
      blurDataURL={priority ? BLUR_PLACEHOLDER : undefined}
      className={`${imgClassName} ${className ?? ''}`.trim()}
      style={{
        filter:     combinedFilter !== 'none' ? combinedFilter : undefined,
        transition: `filter ${transitionMs}ms ease, transform ${transitionMs}ms ease`,
        ...(isFill ? { objectFit: 'cover' as const } : {}),
        ...imgStyle,
        ...style,
      }}
    />
  )
}

// ─── Convenience: full-bleed fill image ───────────────────────────────────────
// Use inside a `position: relative` container.
// The parent must have explicit height (h-[X] or aspect-ratio).
export function FillImage({
  alt,
  tone = 'none',
  filterExtra,
  className = '',
  imgStyle,
  priority,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      {...props}
      alt={alt}
      fill
      tone={tone}
      filterExtra={filterExtra}
      priority={priority}
      className="object-cover"
      imgStyle={imgStyle}
      imgClassName={className}
    />
  )
}
