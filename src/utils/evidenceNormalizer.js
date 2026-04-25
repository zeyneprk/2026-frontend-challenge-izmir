import { flattenJotformAnswers } from './jotformAnswers.js'
import { formatNamePair, normalizeName } from './stringHelpers.js'

/** @typedef {import('../constants/api.js').EvidenceType} EvidenceType */

/**
 * @typedef {Object} Evidence
 * @property {string} id
 * @property {EvidenceType} type
 * @property {string} person
 * @property {string | null} timestamp
 * @property {string | null} location
 * @property {string | null} coordinates
 * @property {string} content
 * @property {string} confidence
 * @property {Record<string, unknown>} raw
 */

const DEFAULT_CONFIDENCE = 'high'

/**
 * @param {string | null | undefined} v
 * @returns {string | null}
 */
function orNullString(v) {
  if (v == null) return null
  const s = String(v).trim()
  return s === '' ? null : s
}

/**
 * @param {any} submission Jotform submission object
 * @param {{ id: string, type: EvidenceType, label: string }} formMeta
 * @returns {Evidence}
 */
export function normalizeSubmissionToEvidence(submission, formMeta) {
  const flat = flattenJotformAnswers(submission.answers)
  const { type } = formMeta
  const id = `${type}-${submission.id}`
  const created = submission.created_at != null ? String(submission.created_at) : null

  let person = ''
  let content = ''
  /** @type {string | null} */
  let location = null
  /** @type {string | null} */
  let coordinates = null
  /** @type {string | null} */
  let timestamp
  let confidence = DEFAULT_CONFIDENCE

  switch (type) {
    case 'checkin': {
      person = normalizeName(flat.fullname)
      content = flat.note ?? ''
      location = orNullString(flat.location)
      coordinates = orNullString(flat.coordinates)
      timestamp = orNullString(flat.timestamp) ?? created
      break
    }
    case 'message': {
      person = formatNamePair(flat.from, flat.to)
      content = flat.message ?? ''
      timestamp = orNullString(flat.timestamp) ?? created
      break
    }
    case 'sighting': {
      person = normalizeName(flat.personName ?? flat.personname)
      const withRaw = flat.seenWith ?? flat.seenwith
      const withPart = withRaw
        ? ` (seen with: ${normalizeName(withRaw)})`
        : ''
      content = [flat.note, withPart].filter(Boolean).join('').trim()
      location = orNullString(flat.location)
      coordinates = orNullString(flat.coordinates)
      timestamp = orNullString(flat.timestamp) ?? created
      break
    }
    case 'note': {
      person = normalizeName(flat.fullName ?? flat.fullname)
      content = flat.note ?? ''
      timestamp = orNullString(flat.timestamp) ?? created
      break
    }
    case 'tip': {
      person = normalizeName(flat.suspectName ?? flat.suspectname)
      content = flat.tip ?? ''
      location = orNullString(flat.location)
      coordinates = orNullString(flat.coordinates)
      timestamp = orNullString(flat.timestamp) ?? created
      const c = (flat.confidence || '').toLowerCase().trim()
      if (c === 'high' || c === 'medium' || c === 'low') {
        confidence = c
      } else {
        confidence = DEFAULT_CONFIDENCE
      }
      break
    }
    default: {
      timestamp = created
      break
    }
  }

  return {
    id,
    type,
    person,
    timestamp,
    location,
    coordinates,
    content,
    confidence,
    raw: { submission, flat, formLabel: formMeta.label },
  }
}

/**
 * @param {Evidence[]} list
 * @returns {Evidence[]}
 */
export function sortEvidenceByTimestampDesc(list) {
  return [...list].sort((a, b) => {
    const ta = Date.parse(a.timestamp || '') || 0
    const tb = Date.parse(b.timestamp || '') || 0
    return tb - ta
  })
}

export { DEFAULT_CONFIDENCE }
