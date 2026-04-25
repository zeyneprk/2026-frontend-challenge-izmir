import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'podo-detective-manual-leads'

/**
 * @typedef {{ id: string, lat: number, lng: number, note: string, createdAt: string }} ManualLead
 */

function readLeads() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return /** @type {ManualLead[]} */ ([])
    const p = JSON.parse(raw)
    if (!Array.isArray(p)) return []
    return p
      .filter(
        (x) =>
          x &&
          typeof x.id === 'string' &&
          typeof x.lat === 'number' &&
          typeof x.lng === 'number',
      )
      .map((x) => ({
        id: x.id,
        lat: x.lat,
        lng: x.lng,
        note: typeof x.note === 'string' ? x.note : '',
        createdAt: typeof x.createdAt === 'string' ? x.createdAt : '',
      }))
  } catch {
    return []
  }
}

/**
 * @returns {{ leads: ManualLead[], addLead: (lat: number, lng: number) => string, updateNote: (id: string, note: string) => void, removeLead: (id: string) => void }}
 */
export function useManualLeads() {
  const [leads, setLeads] = useState(() => readLeads())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads))
    } catch {
      /* ignore quota */
    }
  }, [leads])

  const addLead = useCallback((lat, lng) => {
    const id = crypto.randomUUID()
    setLeads((prev) => [
      ...prev,
      {
        id,
        lat,
        lng,
        note: '',
        createdAt: new Date().toISOString(),
      },
    ])
    return id
  }, [])

  const updateNote = useCallback((id, note) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, note } : l)),
    )
  }, [])

  const removeLead = useCallback((id) => {
    setLeads((prev) => prev.filter((l) => l.id !== id))
  }, [])

  return { leads, addLead, updateNote, removeLead }
}
