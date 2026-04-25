import { normalizeName } from './stringHelpers.js'

/**
 * @typedef {import('./evidenceNormalizer.js').Evidence} Evidence
 * @typedef {import('../constants/api.js').EvidenceType} EvidenceType
 */

/**
 * @typedef {Object} SuspectRow
 * @property {string} key
 * @property {string} displayName
 * @property {boolean} isPodo
 * @property {string | null} statusBadge
 * @property {number} score
 * @property {number} tipCount
 * @property {number} sightingCount
 * @property {number} checkinCount
 * @property {EvidenceType | 'note'} lastActivityType
 * @property {string | null} lastTimestamp
 * @property {number} barPercent
 * @property {'low' | 'med' | 'high'} threat
 */

/** Normalized key for the primary case subject. */
export const PODO_PERSON_KEY = 'podo'

const PERSON_SPLIT = /\s*→\s*|\s*➡\s*|\s*->\s*/u

/**
 * Splits a `person` field (single name or "from → to") into normalized name keys.
 * @param {string | null | undefined} personField
 * @returns {string[]}
 */
export function personFieldToNormalizedKeys(personField) {
  if (personField == null) return []
  const s = String(personField).trim()
  if (s.length === 0) return []
  if (PERSON_SPLIT.test(s)) {
    return s
      .split(PERSON_SPLIT)
      .map((p) => normalizeName(p.trim()))
      .filter(Boolean)
  }
  const one = normalizeName(s)
  return one ? [one] : []
}

/**
 * @param {string} key
 * @returns {string}
 */
export function toDisplayName(key) {
  if (!key) return ''
  return key.charAt(0).toUpperCase() + key.slice(1)
}

/**
 * Heuristic score. Base 10 + tips×25 + sightings×15 + checkins×10
 * (Messages/notes are not part of the formula.)
 * @param { { tipCount: number, sightingCount: number, checkinCount: number } } counts
 * @returns {number}
 */
export function computeSuspectScore({ tipCount, sightingCount, checkinCount }) {
  return (
    10 +
    tipCount * 25 +
    sightingCount * 15 +
    checkinCount * 10
  )
}

/**
 * @param {number} score
 * @param {number} [maxForBar=1]
 * @returns {number} 0–100
 */
export function scoreToBarPercent(score, maxForBar = 1) {
  const m = maxForBar > 0 ? maxForBar : 1
  return Math.min(100, Math.round((score / m) * 100))
}

/**
 * @param {string | null | undefined} a
 * @param {string | null | undefined} b
 * @returns {number}
 */
function compareEvidenceTime(a, b) {
  const ta = toTimeNumber(a)
  const tb = toTimeNumber(b)
  return ta - tb
}

/**
 * @param {string | null | undefined} t
 * @returns {number}
 */
export function toTimeNumber(t) {
  if (t == null) return 0
  const s = String(t).trim()
  if (!s) return 0
  const isoTry =
    s.includes('T') || /^\d{4}-\d{2}-\d{2}/.test(s)
      ? s
      : s.replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1')
  const d = Date.parse(isoTry)
  if (!Number.isNaN(d)) return d
  return 0
}

/**
 * Picks the evidence with the latest timestamp.
 * @param {Evidence} current
 * @param {Evidence} candidate
 * @returns {Evidence}
 */
function pickNewer(current, candidate) {
  if (compareEvidenceTime(current.timestamp, candidate.timestamp) < 0) {
    return candidate
  }
  return current
}

/**
 * Podo pinned on top w/ MISSING; all others by descending `suspectScore`.
 * @param {Evidence[]} evidences
 * @returns {SuspectRow[]}
 */
export function buildOrderedSuspectList(evidences) {
  /** @type {Map<string, { tip: number, sighting: number, checkin: number, last: Evidence | null }>} */
  const agg = new Map()

  const ensure = (key) => {
    if (!key) return
    if (!agg.has(key)) {
      agg.set(key, { tip: 0, sighting: 0, checkin: 0, last: null })
    }
  }

  ensure(PODO_PERSON_KEY)

  for (const ev of evidences) {
    const keys = personFieldToNormalizedKeys(ev.person)
    for (const k of keys) {
      ensure(k)
      const row = agg.get(k)
      if (!row) continue
      if (ev.type === 'tip') row.tip += 1
      else if (ev.type === 'sighting') row.sighting += 1
      else if (ev.type === 'checkin') row.checkin += 1
      if (!row.last) row.last = ev
      else row.last = pickNewer(row.last, ev)
    }
  }

  const maxScore = (() => {
    let m = 1
    for (const [key, v] of agg) {
      if (key === PODO_PERSON_KEY) continue
      const s = computeSuspectScore({
        tipCount: v.tip,
        sightingCount: v.sighting,
        checkinCount: v.checkin,
      })
      if (s > m) m = s
    }
    return m
  })()

  /** @type {SuspectRow[]} */
  const out = []
  const podo = agg.get(PODO_PERSON_KEY)
  if (podo) {
    out.push({
      key: PODO_PERSON_KEY,
      displayName: toDisplayName(PODO_PERSON_KEY),
      isPodo: true,
      statusBadge: 'MISSING',
      score: 0,
      tipCount: podo.tip,
      sightingCount: podo.sighting,
      checkinCount: podo.checkin,
      lastActivityType: (podo.last?.type ?? 'note'),
      lastTimestamp: podo.last?.timestamp ?? null,
      barPercent: 0,
      threat: 'low',
    })
  }

  const rest = [...agg.entries()]
    .filter(([k]) => k !== PODO_PERSON_KEY)
    .map(([key, v]) => {
      const score = computeSuspectScore({
        tipCount: v.tip,
        sightingCount: v.sighting,
        checkinCount: v.checkin,
      })
      return { key, v, score }
    })
    .sort((a, b) => b.score - a.score)

  for (const { key, v, score } of rest) {
    out.push({
      key,
      displayName: toDisplayName(key),
      isPodo: false,
      statusBadge: null,
      score,
      tipCount: v.tip,
      sightingCount: v.sighting,
      checkinCount: v.checkin,
      lastActivityType: (v.last?.type ?? 'note'),
      lastTimestamp: v.last?.timestamp ?? null,
      barPercent: scoreToBarPercent(score, maxScore),
      threat: threatLevelFromScore(score),
    })
  }

  return out
}

/**
 * @param {number} score
 * @returns {'low' | 'med' | 'high'}
 */
function threatLevelFromScore(score) {
  if (score < 50) return 'low'
  if (score < 100) return 'med'
  return 'high'
}

const DEFAULT_CONTRADICTION_WINDOW_MS = 6 * 60 * 60 * 1000

/**
 * @param {string} content
 * @returns {boolean}
 */
export function messageContentImpliesHome(content) {
  if (content == null) return false
  const c = String(content).toLowerCase()
  if (c.includes('evdeyim')) return true
  if (c.includes('evde')) return true
  if (/\bhome\b/.test(c)) return true
  if (c.includes('at home')) return true
  return false
}

/**
 * "Away" from home: a concrete place (street, square, public area) — not a generic home string.
 * @param {string | null} location
 * @returns {boolean}
 */
export function locationLooksAwayFromHome(location) {
  if (location == null) return false
  const s = String(location).trim()
  if (s.length < 2) return false
  const l = s.toLowerCase()
  if (/\b(ev|at home|yurt|mahallemizde|evim)\b/i.test(s)) return false
  if (/kordon|alsancak|konak|meydan|bornova|buca|sokak|cadde|bulvar|fuar|göztepe|kıyı|sahil|çeşme|karantina|pasaport|izmir/i.test(l)) {
    return true
  }
  return s.length > 2
}

/**
 * If a "home" message overlaps in time with a check-in / sighting that places the subject away from home, flag the message id.
 * @param {Evidence[]} evidences
 * @returns {Set<string>} message evidence id set
 */
export function checkForContradictions(evidences) {
  const out = new Set()
  const messages = evidences.filter((e) => e.type === 'message')
  const withLoc = evidences.filter(
    (e) => (e.type === 'checkin' || e.type === 'sighting') && e.location,
  )
  for (const m of messages) {
    if (!messageContentImpliesHome(m.content)) continue
    const tm = toTimeNumber(m.timestamp)
    for (const le of withLoc) {
      const tl = toTimeNumber(le.timestamp)
      if (tm === 0 || tl === 0) continue
      if (Math.abs(tm - tl) > DEFAULT_CONTRADICTION_WINDOW_MS) continue
      if (locationLooksAwayFromHome(String(le.location))) {
        out.add(m.id)
        break
      }
    }
  }
  return out
}

/**
 * @param {Evidence} ev
 * @returns {string}
 */
function buildEvidenceSearchBlob(ev) {
  return [
    ev.person,
    ev.location ?? '',
    ev.content,
    ev.type,
    ev.coordinates ?? '',
  ]
    .join(' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Subsequence (missing chars) fuzzy match, case-insensitive.
 * @param {string} hay
 * @param {string} needle
 * @returns {boolean}
 */
function isSubsequenceInsensitive(hay, needle) {
  if (needle.length === 0) return true
  const h = hay.toLowerCase()
  const n = needle.toLowerCase()
  let j = 0
  for (let i = 0; i < h.length && j < n.length; i += 1) {
    if (h[i] === n[j]) j += 1
  }
  return j === n.length
}

/**
 * Light typo tolerance: entire needle vs any token-sized window (cheap).
 * @param {string} blob
 * @param {string} needle
 * @returns {boolean}
 */
function fuzzyWordMatch(blob, needle) {
  const b = blob.toLowerCase()
  const n = needle.toLowerCase()
  if (n.length === 0) return true
  if (n.length < 2) return b.includes(n)
  if (b.includes(n)) return true
  if (n.length > 1 && n.length < 8 && b.length < 400) {
    for (let i = 0; i <= b.length - n.length; i += 1) {
      let diff = 0
      for (let k = 0; k < n.length; k += 1) {
        if (b[i + k] !== n[k]) diff += 1
        if (diff > 1) break
      }
      if (diff <= 1) return true
    }
  }
  return isSubsequenceInsensitive(b, n)
}

/**
 * Global fuzzy case search across name, place, and message text.
 * @param {Evidence[]} evidences
 * @param {string} query
 * @returns {Evidence[]}
 */
export function filterEvidencesByFuzzySearch(evidences, query) {
  const q = String(query).trim()
  if (q.length === 0) return [...evidences]
  const terms = q.split(/\s+/).filter((t) => t.length > 0)
  return evidences.filter((ev) => {
    const blob = buildEvidenceSearchBlob(ev)
    if (fuzzyWordMatch(blob, q)) return true
    return terms.every((t) => {
      const tl = t.toLowerCase()
      if (t.length < 2) return blob.includes(tl)
      return blob.includes(tl) || fuzzyWordMatch(blob, t)
    })
  })
}

/**
 * Evidence entries tied to a normalized suspect key (incl. "a → b" messages).
 * @param {Evidence[]} evidences
 * @param {string} personKey
 * @returns {Evidence[]}
 */
export function filterEvidencesByPersonKey(evidences, personKey) {
  const k = String(personKey).trim().toLowerCase()
  if (k.length === 0) return []
  return evidences.filter((ev) => {
    return personFieldToNormalizedKeys(ev.person).includes(k)
  })
}

/**
 * API confidence to a 0–100 reliability for tips.
 * @param {string} confidence
 * @returns {number}
 */
export function confidenceToReliabilityPercent(confidence) {
  const c = String(confidence || '')
    .toLowerCase()
    .trim()
  if (c === 'high') return 95
  if (c === 'medium' || c === 'med') return 65
  if (c === 'low') return 35
  return 50
}

/**
 * Parses "lat,lng" or "lat, lng" from Jotform / evidence strings.
 * @param {string | null | undefined} value
 * @returns {{ lat: number, lng: number } | null}
 */
export function parseCoordinatesString(value) {
  if (value == null) return null
  const s = String(value).trim()
  if (s.length === 0) return null
  const parts = s.split(/[,;]\s*/)
  if (parts.length < 2) return null
  const lat = parseFloat(parts[0])
  const lng = parseFloat(parts[1])
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
  return { lat, lng }
}

/**
 * @param {import('./evidenceNormalizer.js').Evidence} ev
 * @returns {{ lat: number, lng: number } | null}
 */
export function getEvidenceLatLng(ev) {
  return parseCoordinatesString(ev.coordinates)
}
