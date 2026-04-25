import { useCallback, useEffect, useMemo, useState } from 'react'
import { DetectiveContext } from './detectiveContext.js'
import { fetchAllEvidences } from '../services/jotformService.js'
import {
  filterEvidencesByFuzzySearch,
  filterEvidencesByPersonKey,
} from '../utils/detectiveLogic.js'

/**
 * @param { { children: import('react').ReactNode } } props
 */
export function DetectiveProvider({ children }) {
  const [evidences, setEvidences] = useState(/** @type {import('../utils/evidenceNormalizer.js').Evidence[]} */ ([]))
  const [fetchErrors, setFetchErrors] = useState(
    /** @type { { type: string, label: string, error: string } [] } */ ([]),
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(/** @type {string | null} */ (null))
  const [selectedPerson, setSelectedPerson] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [evidenceTypeFilter, setEvidenceTypeFilter] = useState(
    /** @type {import('../constants/evidenceTypes.js').EvidenceFilter} */ ('all'),
  )
  const [mapPing, setMapPing] = useState(
    /** @type {{ lat: number, lng: number, evidenceId?: string } | null} */ (null),
  )
  const [highlightedGeoEvidenceId, setHighlightedGeoEvidenceId] = useState(
    /** @type {string | null} */ (null),
  )
  const [mapPanelHeightPx, setMapPanelHeightPx] = useState(() => {
    try {
      const raw = sessionStorage.getItem('podo-map-h')
      if (raw) {
        const n = Number.parseInt(raw, 10)
        if (Number.isFinite(n) && n >= 120 && n <= 560) return n
      }
    } catch {
      // ignore
    }
    return 220
  })

  const refetchEvidences = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { evidences: next, errors } = await fetchAllEvidences()
      setEvidences(next)
      setFetchErrors(errors)
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      setError(message)
      setEvidences([])
      setFetchErrors([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      void refetchEvidences()
    })
    return () => cancelAnimationFrame(id)
  }, [refetchEvidences])

  const searchFilteredEvidences = useMemo(
    () => filterEvidencesByFuzzySearch(evidences, searchQuery),
    [evidences, searchQuery],
  )

  const viewEvidences = useMemo(() => {
    const pk = selectedPerson.trim().toLowerCase()
    let list = searchFilteredEvidences
    if (pk.length > 0) {
      list = filterEvidencesByPersonKey(list, pk)
    }
    if (evidenceTypeFilter !== 'all') {
      list = list.filter((e) => e.type === evidenceTypeFilter)
    }
    return list
  }, [searchFilteredEvidences, selectedPerson, evidenceTypeFilter])

  const persistMapHeight = useCallback((h) => {
    setMapPanelHeightPx(h)
    try {
      sessionStorage.setItem('podo-map-h', String(Math.round(h)))
    } catch {
      // ignore
    }
  }, [])

  const setSelectedPersonAndClearMapFocus = useCallback(
    (/** @type {string} */ v) => {
      setHighlightedGeoEvidenceId(null)
      setSelectedPerson(v)
    },
    [setSelectedPerson],
  )

  const setEvidenceTypeFilterAndClearMapFocus = useCallback(
    (/** @type {import('../constants/evidenceTypes.js').EvidenceFilter} */ f) => {
      setHighlightedGeoEvidenceId(null)
      setEvidenceTypeFilter(f)
    },
    [setEvidenceTypeFilter],
  )

  const value = useMemo(
    () => ({
      evidences,
      searchFilteredEvidences,
      viewEvidences,
      searchQuery,
      setSearchQuery,
      evidenceTypeFilter,
      setEvidenceTypeFilter: setEvidenceTypeFilterAndClearMapFocus,
      mapPing,
      setMapPing,
      highlightedGeoEvidenceId,
      setHighlightedGeoEvidenceId,
      mapPanelHeightPx,
      setMapPanelHeightPx: persistMapHeight,
      fetchErrors,
      loading,
      error,
      selectedPerson,
      setSelectedPerson: setSelectedPersonAndClearMapFocus,
      refetchEvidences,
    }),
    [
      evidences,
      searchFilteredEvidences,
      viewEvidences,
      searchQuery,
      setEvidenceTypeFilterAndClearMapFocus,
      evidenceTypeFilter,
      mapPing,
      highlightedGeoEvidenceId,
      mapPanelHeightPx,
      persistMapHeight,
      fetchErrors,
      loading,
      error,
      selectedPerson,
      setSelectedPersonAndClearMapFocus,
      refetchEvidences,
    ],
  )

  return (
    <DetectiveContext.Provider value={value}>
      {children}
    </DetectiveContext.Provider>
  )
}
