/**
 * Jotform public API. In development, Vite proxies {@link JOTFORM_API_BASE} to avoid CORS.
 * @see https://api.jotform.com/docs/
 */
const DEFAULT_ORIGIN = 'https://api.jotform.com'

export const JOTFORM_API_BASE =
  import.meta.env.VITE_JOTFORM_API_BASE?.replace(/\/$/, '') ||
  (import.meta.env.DEV ? '/jotform-api' : DEFAULT_ORIGIN)

/** @typedef {'checkin' | 'message' | 'sighting' | 'note' | 'tip'} EvidenceType */

/** @type {Record<string, { id: string, type: EvidenceType, label: string }>} */
export const JOTFORM_FORMS = {
  checkins: {
    id: '261134527667966',
    type: 'checkin',
    label: 'Checkins',
  },
  messages: {
    id: '261133651963962',
    type: 'message',
    label: 'Messages',
  },
  sightings: {
    id: '261133720555956',
    type: 'sighting',
    label: 'Sightings',
  },
  notes: {
    id: '261134449238963',
    type: 'note',
    label: 'Personal Notes',
  },
  tips: {
    id: '261134430330946',
    type: 'tip',
    label: 'Anonymous Tips',
  },
}

export const JOTFORM_FORM_LIST = Object.values(JOTFORM_FORMS)
