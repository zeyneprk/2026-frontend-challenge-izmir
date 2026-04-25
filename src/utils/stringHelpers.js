/**
 * Case-insensitive canonical person keys used for fuzzy name normalization
 * (e.g. "Alicann" → "alican"). Extend as the case file grows.
 */
const CANONICAL_NAME_KEYS = ['alican']

/**
 * Damerau–Levenshtein distance, capped for performance on short names.
 * @param {string} a
 * @param {string} b
 * @param {number} [max=3]
 */
function editDistance(a, b, max = 3) {
  if (a === b) return 0
  const la = a.length
  const lb = b.length
  if (la === 0) return Math.min(lb, max + 1)
  if (lb === 0) return Math.min(la, max + 1)

  const row = new Array(lb + 1)
  for (let j = 0; j <= lb; j += 1) row[j] = j

  for (let i = 1; i <= la; i += 1) {
    let prev = row[0]
    row[0] = i
    let minRow = row[0]
    for (let j = 1; j <= lb; j += 1) {
      const temp = row[j]
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      const del = row[j] + 1
      const ins = row[j - 1] + 1
      const sub = prev + cost
      let dist = del < ins ? (del < sub ? del : sub) : ins < sub ? ins : sub
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        const trans = row[j - 2] + 1
        if (trans < dist) dist = trans
      }
      prev = temp
      row[j] = dist
      if (dist < minRow) minRow = dist
    }
    if (minRow > max) return max + 1
  }
  return row[lb] > max ? max + 1 : row[lb]
}

/**
 * Normalizes a display name: trim, internal spaces, lowercase, then optional fuzzy match
 * to known case persons so typos like "Alicann" map to the same key as "alican".
 * @param {string | null | undefined} value
 * @returns {string}
 */
export function normalizeName(value) {
  if (value == null) return ''
  const trimmed = String(value).trim().replace(/\s+/g, ' ')
  if (trimmed.length === 0) return ''
  const lower = trimmed.toLowerCase()

  let best = lower
  let bestDist = Infinity
  for (const key of CANONICAL_NAME_KEYS) {
    const d = editDistance(lower, key, 2)
    if (d < bestDist) {
      bestDist = d
      best = key
    }
  }
  if (bestDist <= 2) return best
  return lower
}

/**
 * Pairs "from → to" style message participants using normalized name keys.
 * @param {string | null | undefined} a
 * @param {string | null | undefined} b
 * @param {string} [sep=' \u2192 ']
 */
export function formatNamePair(a, b, sep = ' \u2192 ') {
  const hasA = a != null && String(a).trim() !== ''
  const hasB = b != null && String(b).trim() !== ''
  const left = hasA ? normalizeName(a) : ''
  const right = hasB ? normalizeName(b) : ''
  if (!left && !right) return ''
  if (!left) return right
  if (!right) return left
  return `${left}${sep}${right}`
}
