import { JOTFORM_API_BASE, JOTFORM_FORM_LIST } from '../constants/api.js'
import {
  normalizeSubmissionToEvidence,
  sortEvidenceByTimestampDesc,
} from '../utils/evidenceNormalizer.js'

/**
 * @typedef {import('../utils/evidenceNormalizer.js').Evidence} Evidence
 */

/**
 * @param {string | undefined} key
 * @returns {string}
 */
function getApiKey(key) {
  if (key && String(key).trim() !== '') return String(key).trim()
  return ''
}

/**
 * @param {string} formId
 * @param {string} apiKey
 * @param {number} [offset=0]
 * @returns {string}
 */
export function buildSubmissionsRequestUrl(formId, apiKey, offset = 0) {
  const params = new URLSearchParams({
    apiKey,
    limit: '1000',
    offset: String(offset),
  })
  return `${JOTFORM_API_BASE}/v1/form/${formId}/submissions?${params.toString()}`
}

/**
 * Fetches one page of Jotform submissions. Pagination continues while `resultSet` indicates more.
 * @param {string} formId
 * @param {string} apiKey
 * @returns {Promise<any[]>} submission objects
 */
export async function fetchFormSubmissionsAllPages(formId, apiKey) {
  const all = /** @type {any[]} */ ([])
  let offset = 0
  for (;;) {
    const url = buildSubmissionsRequestUrl(formId, apiKey, offset)
    const res = await fetch(url)
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Jotform ${res.status} ${res.statusText}: ${text.slice(0, 200)}`)
    }
    const data = await res.json()
    if (data.responseCode && data.responseCode !== 200) {
      throw new Error(data.message || 'Jotform error')
    }
    const page = data.content
    if (!Array.isArray(page) || page.length === 0) break
    all.push(...page)
    const rs = data.resultSet
    const count = typeof rs?.count === 'number' ? rs.count : page.length
    if (count < 1000) break
    offset += 1000
  }
  return all
}

/**
 * @param {import('../constants/api.js').EvidenceType} type
 * @param {string} [apiKey=import.meta.env.VITE_JOTFORM_API_KEY]
 * @returns {Promise<Evidence[]>}
 */
export async function fetchEvidencesForFormType(type, apiKey = import.meta.env.VITE_JOTFORM_API_KEY) {
  const key = getApiKey(apiKey)
  if (!key) {
    throw new Error('VITE_JOTFORM_API_KEY is missing. Add it to your .env file.')
  }

  const form = JOTFORM_FORM_LIST.find((f) => f.type === type)
  if (!form) throw new Error(`Unknown form type: ${type}`)

  const submissions = await fetchFormSubmissionsAllPages(form.id, key)
  return submissions.map((s) => normalizeSubmissionToEvidence(s, form))
}

/**
 * Fetches and merges all configured forms, sorted by timestamp (newest first).
 * @param {string} [apiKey=import.meta.env.VITE_JOTFORM_API_KEY]
 * @returns {Promise<{ evidences: Evidence[], errors: { type: string, label: string, error: string }[] }>}
 */
export async function fetchAllEvidences(apiKey = import.meta.env.VITE_JOTFORM_API_KEY) {
  const key = getApiKey(apiKey)
  if (!key) {
    throw new Error('VITE_JOTFORM_API_KEY is missing. Add it to your .env file.')
  }

  const results = await Promise.allSettled(
    JOTFORM_FORM_LIST.map(async (form) => {
      const submissions = await fetchFormSubmissionsAllPages(form.id, key)
      return submissions.map((s) => normalizeSubmissionToEvidence(s, form))
    }),
  )

  const evidences = /** @type {Evidence[]} */ ([])
  const errors = /** @type { { type: string, label: string, error: string }[] } */ ([])

  results.forEach((r, i) => {
    const form = JOTFORM_FORM_LIST[i]
    if (r.status === 'fulfilled') {
      evidences.push(...r.value)
    } else {
      const err = r.reason
      const message = err instanceof Error ? err.message : String(err)
      errors.push({ type: form.type, label: form.label, error: message })
    }
  })

  return { evidences: sortEvidenceByTimestampDesc(evidences), errors }
}
