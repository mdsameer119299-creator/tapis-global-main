/**
 * lib/market-intelligence/content.ts — the content engine loader (SERVER-ONLY).
 *
 * Market Intelligence data is authored OUTSIDE application code as JSON files
 * in `content/market-intelligence/*.json` (drop a file → one country's page;
 * no code change). This module reads, validates and memoizes them, mirroring
 * lib/knowledge/content.ts. See docs/MARKET-INTELLIGENCE-ENGINE.md.
 *
 * Validation is shared with the STRICT build/CI gate
 * (`scripts/validate-market-intelligence.mjs`): at runtime invalid files are
 * skipped (defensive), but the build fails if any file is malformed/invalid.
 *
 * Unlike the Knowledge Centre, an EMPTY content directory is valid here — this
 * is Phase 1 (schema + components only, per the approved architecture); real
 * per-country data is authored later, country by country, as research is
 * verified. A missing/unreadable directory is still a hard error.
 */
import fs from 'fs'
import path from 'path'
import type { CountryMarketIntelligence } from './types'
import { getAllCountrySlugs } from '../seo-landing'
import { getStyleArchetype } from './style-library'

function contentDir(): string {
  return process.env.MARKET_INTELLIGENCE_DIR
    ? path.resolve(process.env.MARKET_INTELLIGENCE_DIR)
    : path.join(process.cwd(), 'content', 'market-intelligence')
}

const VALID_STATUS = new Set(['verified', 'general', 'pending-research'])

function validateSourcedClaim(v: unknown, field: string, at: string, opts: { strict?: boolean } = {}): string[] {
  const errs: string[] = []
  const c = v as Record<string, unknown> | null
  if (!c || typeof c !== 'object' || Array.isArray(c)) { errs.push(`${at}"${field}" must be an object`); return errs }
  if (typeof c.text !== 'string' || !c.text.trim()) errs.push(`${at}"${field}.text" is required`)
  if (typeof c.status !== 'string' || !VALID_STATUS.has(c.status)) errs.push(`${at}"${field}.status" must be one of verified|general|pending-research`)
  if (c.status === 'verified' && (typeof c.source !== 'string' || !c.source.trim())) errs.push(`${at}"${field}.source" is required when status is "verified" — cite what backs the claim`)
  if (opts.strict && c.status === 'verified' && typeof c.source === 'string' && c.source.trim().length < 8) errs.push(`${at}"${field}.source" must be a specific citation, not a placeholder (this field carries higher fabrication risk)`)
  return errs
}

/**
 * Strict, shared shape validator. Returns a list of human-readable errors
 * (empty = valid). Used by the loader and the build/CI gate.
 */
export function validateMarketIntelligence(data: unknown, file = ''): string[] {
  const errs: string[] = []
  const at = file ? `${file}: ` : ''
  const o = data as Record<string, unknown> | null
  if (!o || typeof o !== 'object' || Array.isArray(o)) return [`${at}not a JSON object`]

  if (typeof o.countrySlug !== 'string' || !getAllCountrySlugs().includes(o.countrySlug)) errs.push(`${at}"countrySlug" must match an existing /countries/[slug]`)
  if (typeof o.updatedAt !== 'string' || !o.updatedAt.trim()) errs.push(`${at}missing "updatedAt"`)
  if (o.status !== undefined && o.status !== 'draft' && o.status !== 'published') errs.push(`${at}invalid "status" (draft|published)`)
  const seo = o.seo as Record<string, unknown> | undefined
  if (!seo || typeof seo.title !== 'string' || typeof seo.description !== 'string') errs.push(`${at}missing "seo.title"/"seo.description"`)

  const bb = o.buyerBehaviour as Record<string, unknown> | undefined
  if (!bb || typeof bb !== 'object' || Array.isArray(bb)) errs.push(`${at}missing "buyerBehaviour"`)
  else {
    if (!Array.isArray(bb.decisionMakers) || !bb.decisionMakers.every((s) => typeof s === 'string')) errs.push(`${at}"buyerBehaviour.decisionMakers" must be a string array`)
    errs.push(...validateSourcedClaim(bb.procurementCycle, 'buyerBehaviour.procurementCycle', at))
    errs.push(...validateSourcedClaim(bb.sampleExpectations, 'buyerBehaviour.sampleExpectations', at))
    errs.push(...validateSourcedClaim(bb.negotiationNorms, 'buyerBehaviour.negotiationNorms', at))
  }

  const dp = o.designPreferences as Record<string, unknown> | undefined
  if (!dp || typeof dp !== 'object' || Array.isArray(dp)) errs.push(`${at}missing "designPreferences"`)
  else {
    if (typeof dp.styleArchetypeSlug !== 'string' || !getStyleArchetype(dp.styleArchetypeSlug)) errs.push(`${at}"designPreferences.styleArchetypeSlug" must match a known Style Library archetype`)
    if (!Array.isArray(dp.localNotes) || dp.localNotes.length === 0) errs.push(`${at}"designPreferences.localNotes" must be a non-empty array`)
    else (dp.localNotes as unknown[]).forEach((n, i) => errs.push(...validateSourcedClaim(n, `designPreferences.localNotes[${i}]`, at)))
  }

  const cm = o.climateMaterialFit as Record<string, unknown> | undefined
  if (!cm || typeof cm !== 'object' || Array.isArray(cm)) errs.push(`${at}missing "climateMaterialFit"`)
  else {
    errs.push(...validateSourcedClaim(cm.climateSummary, 'climateMaterialFit.climateSummary', at))
    if (!Array.isArray(cm.recommendedMaterialIds) || cm.recommendedMaterialIds.length === 0) errs.push(`${at}"climateMaterialFit.recommendedMaterialIds" must be a non-empty array`)
    errs.push(...validateSourcedClaim(cm.careNotes, 'climateMaterialFit.careNotes', at))
  }

  const ac = o.architecturalContext as Record<string, unknown> | undefined
  if (!ac || typeof ac !== 'object' || Array.isArray(ac)) errs.push(`${at}missing "architecturalContext"`)
  else {
    if (!Array.isArray(ac.buildingTypes) || !ac.buildingTypes.every((s) => typeof s === 'string')) errs.push(`${at}"architecturalContext.buildingTypes" must be a string array`)
    errs.push(...validateSourcedClaim(ac.narrative, 'architecturalContext.narrative', at))
  }

  // Sustainability & Regulations carry the highest fabrication risk — strict mode.
  const se = o.sustainabilityExpectations as Record<string, unknown> | undefined
  if (!se || typeof se !== 'object' || Array.isArray(se)) errs.push(`${at}missing "sustainabilityExpectations"`)
  else {
    errs.push(...validateSourcedClaim(se.summary, 'sustainabilityExpectations.summary', at, { strict: true }))
    if (se.regulatoryDrivers !== undefined && (!Array.isArray(se.regulatoryDrivers) || !se.regulatoryDrivers.every((s) => typeof s === 'string'))) errs.push(`${at}"sustainabilityExpectations.regulatoryDrivers" must be a string array`)
  }

  const rc = o.regulationsCompliance as Record<string, unknown> | undefined
  if (!rc || typeof rc !== 'object' || Array.isArray(rc)) errs.push(`${at}missing "regulationsCompliance"`)
  else {
    errs.push(...validateSourcedClaim(rc.snapshot, 'regulationsCompliance.snapshot', at, { strict: true }))
    if (rc.importGuideSlug !== undefined && typeof rc.importGuideSlug !== 'string') errs.push(`${at}"regulationsCompliance.importGuideSlug" must be a string`)
  }

  const pg = o.procurementGuidance as Record<string, unknown> | undefined
  if (!pg || typeof pg !== 'object' || Array.isArray(pg)) errs.push(`${at}missing "procurementGuidance"`)
  else {
    if (!Array.isArray(pg.steps) || pg.steps.length === 0) errs.push(`${at}"procurementGuidance.steps" must be a non-empty array`)
    errs.push(...validateSourcedClaim(pg.leadTimeNote, 'procurementGuidance.leadTimeNote', at))
    if (!Array.isArray(pg.relatedCompanyPages) || pg.relatedCompanyPages.length === 0) errs.push(`${at}"procurementGuidance.relatedCompanyPages" must be a non-empty array`)
  }

  const cc = o.commercial as Record<string, unknown> | undefined
  if (!cc || typeof cc !== 'object' || Array.isArray(cc)) {
    errs.push(`${at}missing "commercial" — every Market Intelligence page requires a closing commercial section`)
  } else {
    if (typeof cc.headline !== 'string' || !cc.headline.trim()) errs.push(`${at}"commercial.headline" is required`)
    if (typeof cc.supportingCopy !== 'string' || !cc.supportingCopy.trim()) errs.push(`${at}"commercial.supportingCopy" is required`)
    const pcta = cc.primaryCta as Record<string, unknown> | undefined
    if (!pcta || typeof pcta.label !== 'string' || typeof pcta.href !== 'string') errs.push(`${at}"commercial.primaryCta" must be { label, href }`)
    if (cc.secondaryCta !== undefined) {
      const scta = cc.secondaryCta as Record<string, unknown> | undefined
      if (!scta || typeof scta.label !== 'string' || typeof scta.href !== 'string') errs.push(`${at}"commercial.secondaryCta" must be { label, href }`)
    }
  }

  for (const k of ['relatedCountries', 'relatedIndustries', 'relatedGlossaryTerms']) if (o[k] !== undefined && !Array.isArray(o[k])) errs.push(`${at}"${k}" must be an array`)

  return errs
}

export interface MarketIntelligenceValidationResult {
  entries: CountryMarketIntelligence[]
  errors: string[]
}

/**
 * Read + validate every content file. STRICT (does not skip): returns all
 * entries that loaded plus a full list of errors (malformed JSON, invalid
 * shape, duplicate countrySlug). The build gate fails when `errors` is
 * non-empty. An empty (but existing) directory is valid — zero entries.
 */
export function readAndValidateMarketIntelligence(): MarketIntelligenceValidationResult {
  const dir = contentDir()
  let files: string[] = []
  try {
    files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'))
  } catch (e) {
    return { entries: [], errors: [`content directory not found or unreadable: ${dir} (${(e as NodeJS.ErrnoException).code ?? (e as Error).message})`] }
  }

  const entries: CountryMarketIntelligence[] = []
  const errors: string[] = []
  const slugCount = new Map<string, string[]>()

  for (const f of files.sort()) {
    let raw: unknown
    try { raw = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) } catch (e) { errors.push(`${f}: malformed JSON (${(e as Error).message})`); continue }
    const shapeErrors = validateMarketIntelligence(raw, f)
    if (shapeErrors.length) { errors.push(...shapeErrors); continue }
    const entry = raw as CountryMarketIntelligence
    slugCount.set(entry.countrySlug, [...(slugCount.get(entry.countrySlug) ?? []), f])
    entries.push(entry)
  }

  Array.from(slugCount.entries()).forEach(([slug, inFiles]) => { if (inFiles.length > 1) errors.push(`duplicate countrySlug "${slug}" in: ${inFiles.join(', ')}`) })

  return { entries, errors }
}

// ── Runtime loading (lenient: skips invalid; build gate already guarantees ok) ─
let cache: CountryMarketIntelligence[] | null = null
/** Test hook: clear the memoized cache (e.g. after changing MARKET_INTELLIGENCE_DIR). */
export function _resetMarketIntelligenceCache(): void { cache = null }

export function loadMarketIntelligence(): CountryMarketIntelligence[] {
  if (cache) return cache
  const { entries } = readAndValidateMarketIntelligence()
  const seen = new Set<string>()
  cache = entries.filter((e) => (seen.has(e.countrySlug) ? false : (seen.add(e.countrySlug), true)))
  return cache
}

export function getPublishedMarketIntelligenceEntries(): CountryMarketIntelligence[] {
  return loadMarketIntelligence().filter((e) => e.status !== 'draft')
}
/** Any entry by slug (incl. draft) — for internal/admin use. */
export function getMarketIntelligence(countrySlug: string): CountryMarketIntelligence | undefined {
  return loadMarketIntelligence().find((e) => e.countrySlug === countrySlug)
}
/** PUBLIC lookup — returns undefined for drafts (used by the public route). */
export function getPublishedMarketIntelligence(countrySlug: string): CountryMarketIntelligence | undefined {
  const e = getMarketIntelligence(countrySlug)
  return e && e.status !== 'draft' ? e : undefined
}
export function getPublishedMarketIntelligenceSlugs(): string[] {
  return getPublishedMarketIntelligenceEntries().map((e) => e.countrySlug)
}
