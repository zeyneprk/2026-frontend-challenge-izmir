import { useCallback, useEffect, useMemo, useState } from 'react'
import { DetectiveContext } from './detectiveContext.js'
import { fetchAllEvidences } from '../services/jotformService.js'

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

  const filteredEvidences = useMemo(() => {
    const key = selectedPerson.trim().toLowerCase()
    if (key === '') return evidences
    return evidences.filter((e) => e.person.toLowerCase().includes(key))
  }, [evidences, selectedPerson])

  const value = useMemo(
    () => ({
      evidences,
      fetchErrors,
      loading,
      error,
      selectedPerson,
      setSelectedPerson,
      refetchEvidences,
      filteredEvidences,
    }),
    [
      evidences,
      fetchErrors,
      loading,
      error,
      selectedPerson,
      refetchEvidences,
      filteredEvidences,
    ],
  )

  return (
    <DetectiveContext.Provider value={value}>
      {children}
    </DetectiveContext.Provider>
  )
}
