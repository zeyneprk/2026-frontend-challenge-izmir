/**
 * @typedef {'all' | 'checkin' | 'message' | 'sighting' | 'note' | 'tip'} EvidenceFilter
 */

/** @type { { value: EvidenceFilter, label: string }[] } */
export const EVIDENCE_FILTER_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'checkin', label: 'Check-ins' },
  { value: 'message', label: 'Messages' },
  { value: 'sighting', label: 'Sightings' },
  { value: 'note', label: 'Personal notes' },
  { value: 'tip', label: 'Anonymous tips' },
]
