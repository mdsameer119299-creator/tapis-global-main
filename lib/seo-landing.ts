// ─────────────────────────────────────────────────────────────────────────────
// lib/seo-landing.ts
// Shared data model for the scalable SEO landing-page system that powers the
// /industries/[industry] and /solutions/[slug] dynamic routes.
//
// One rich, type-safe model → one template → many UNIQUE pages. Each entry must
// carry genuinely distinct prose, applications and FAQs (no templated filler) so
// every page is useful and non-duplicate. The model is intentionally large so a
// page cannot be "thin": intro + overview + body + 2-3 H2 sections + applications
// + why-points + 5+ FAQs comfortably clears 800-1500 unique words per page.
// ─────────────────────────────────────────────────────────────────────────────

export type LandingSection = {
  h2:   string
  body: string
}

export type LandingItem = {
  title: string
  desc:  string
}

export type LandingFaq = {
  q: string
  a: string
}

export type SeoLanding = {
  slug:        string
  kind:        'industry' | 'solution'
  /** Short label used in nav, breadcrumbs and related-link cards */
  label:       string
  heroImage:   string
  eyebrow:     string
  tagline:     string
  /** Per-page SEO */
  seoTitle:        string
  seoDescription:  string
  seoKeywords:     string[]
  h1:          string
  /** Unique prose — combined these provide the page's body content */
  intro:       string
  overview:    string
  sections:    LandingSection[]
  applications: LandingItem[]
  whyPoints:    LandingItem[]
  faqs:         LandingFaq[]
  /** Internal linking — product slugs and sibling landing slugs */
  relatedProducts:   string[]
  relatedIndustries: string[]
  relatedSolutions?: string[]
}

// ─── REGISTRY ────────────────────────────────────────────────────────────────
// Populated by importing the data modules. Kept as functions to avoid import
// cycles between this file and the data files.
import { INDUSTRIES } from './industries'
import { SOLUTIONS } from './solutions-seo'

export function getIndustry(slug: string): SeoLanding | undefined {
  return INDUSTRIES.find((i) => i.slug === slug)
}

export function getSolution(slug: string): SeoLanding | undefined {
  return SOLUTIONS.find((s) => s.slug === slug)
}

export function getAllIndustrySlugs(): string[] {
  return INDUSTRIES.map((i) => i.slug)
}

export function getAllSolutionSlugs(): string[] {
  return SOLUTIONS.map((s) => s.slug)
}

export function getRelatedIndustries(slugs: string[]): SeoLanding[] {
  return slugs
    .map((s) => INDUSTRIES.find((i) => i.slug === s))
    .filter((x): x is SeoLanding => Boolean(x))
}

export function getRelatedSolutions(slugs: string[]): SeoLanding[] {
  return slugs
    .map((s) => SOLUTIONS.find((i) => i.slug === s))
    .filter((x): x is SeoLanding => Boolean(x))
}

export { INDUSTRIES, SOLUTIONS }
