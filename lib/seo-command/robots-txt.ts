// Minimal, standards-following robots.txt parser (RFC 9309 semantics):
// most specific user-agent group wins, longest matching rule wins, Allow beats Disallow on ties.

export interface RobotsRule {
  allow: boolean
  pattern: string
}
export interface RobotsGroup {
  agents: string[]
  rules: RobotsRule[]
}
export interface ParsedRobots {
  groups: RobotsGroup[]
  sitemaps: string[]
}

export function parseRobots(text: string): ParsedRobots {
  const groups: RobotsGroup[] = []
  const sitemaps: string[] = []
  let current: RobotsGroup | null = null
  let lastWasAgent = false

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim()
    if (!line) continue
    const idx = line.indexOf(':')
    if (idx < 0) continue
    const key = line.slice(0, idx).trim().toLowerCase()
    const value = line.slice(idx + 1).trim()

    if (key === 'sitemap') {
      if (value) sitemaps.push(value)
      continue
    }
    if (key === 'user-agent') {
      if (!current || !lastWasAgent) {
        current = { agents: [], rules: [] }
        groups.push(current)
      }
      current.agents.push(value.toLowerCase())
      lastWasAgent = true
      continue
    }
    lastWasAgent = false
    if ((key === 'allow' || key === 'disallow') && current) {
      // An empty Disallow means "allow everything"; an empty Allow is ignored.
      if (value === '') continue
      current.rules.push({ allow: key === 'allow', pattern: value })
    }
  }
  return { groups, sitemaps }
}

function patternToRegex(pattern: string): RegExp {
  const anchored = pattern.endsWith('$')
  const body = anchored ? pattern.slice(0, -1) : pattern
  const escaped = body.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')
  return new RegExp('^' + escaped + (anchored ? '$' : ''))
}

export function selectGroup(parsed: ParsedRobots, userAgent: string): RobotsGroup | null {
  const ua = userAgent.toLowerCase()
  let best: RobotsGroup | null = null
  let bestLen = -1
  for (const g of parsed.groups) {
    for (const a of g.agents) {
      if (a === '*') {
        if (bestLen < 0) {
          best = g
          bestLen = 0
        }
      } else if (ua.includes(a) && a.length > bestLen) {
        best = g
        bestLen = a.length
      }
    }
  }
  return best
}

export function isPathAllowed(parsed: ParsedRobots, userAgent: string, pathWithQuery: string): boolean {
  const group = selectGroup(parsed, userAgent)
  if (!group) return true
  let verdict = true
  let matchLen = -1
  for (const r of group.rules) {
    if (!patternToRegex(r.pattern).test(pathWithQuery)) continue
    const len = r.pattern.length
    if (len > matchLen || (len === matchLen && r.allow)) {
      matchLen = len
      verdict = r.allow
    }
  }
  return verdict
}

export interface RobotsFinding {
  code: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
  message: string
  detail?: Record<string, unknown>
}

/** Validates a fetched robots.txt. `status` is the HTTP status, null if the fetch failed. */
export function validateRobots(status: number | null, text: string | null, siteOrigin: string): RobotsFinding[] {
  const out: RobotsFinding[] = []
  if (status === null) {
    out.push({ code: 'ROBOTS_UNREACHABLE', severity: 'HIGH', message: 'robots.txt could not be fetched.' })
    return out
  }
  if (status >= 500) {
    // Per RFC 9309 a 5xx makes crawlers assume the whole site is disallowed.
    out.push({ code: 'ROBOTS_SERVER_ERROR', severity: 'CRITICAL', message: `robots.txt returned HTTP ${status}; crawlers may treat the whole site as disallowed.`, detail: { status } })
    return out
  }
  if (status === 404) {
    out.push({ code: 'ROBOTS_MISSING', severity: 'MEDIUM', message: 'No robots.txt (HTTP 404). Crawling is allowed but no sitemap is declared.' })
    return out
  }
  if (status !== 200 || text === null) {
    out.push({ code: 'ROBOTS_UNEXPECTED_STATUS', severity: 'MEDIUM', message: `robots.txt returned HTTP ${status}.`, detail: { status } })
    return out
  }
  const parsed = parseRobots(text)
  const all = selectGroup(parsed, '*')
  if (all && all.rules.some((r) => !r.allow && r.pattern === '/')) {
    const allowsRoot = all.rules.some((r) => r.allow && r.pattern.length > 1)
    out.push({
      code: 'ROBOTS_DISALLOWS_ALL',
      severity: allowsRoot ? 'MEDIUM' : 'CRITICAL',
      message: 'robots.txt contains "Disallow: /" for all crawlers.',
    })
  }
  if (parsed.sitemaps.length === 0) {
    out.push({ code: 'ROBOTS_NO_SITEMAP', severity: 'MEDIUM', message: 'robots.txt does not declare a Sitemap: directive.' })
  } else {
    const host = (u: string) => {
      try {
        return new URL(u).host.replace(/^www\./, '')
      } catch {
        return null
      }
    }
    const siteHost = host(siteOrigin)
    for (const s of parsed.sitemaps) {
      if (host(s) !== siteHost) {
        out.push({ code: 'ROBOTS_SITEMAP_OFFSITE', severity: 'MEDIUM', message: 'A Sitemap: directive points to another host.', detail: { sitemap: s } })
      }
    }
  }
  return out
}
