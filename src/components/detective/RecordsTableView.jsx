import { useCallback, useMemo } from 'react'
import { useDetective } from '../../hooks/useDetective.js'
import {
  getEvidenceLatLng,
  toTimeNumber,
} from '../../utils/detectiveLogic.js'

/**
 * Sleek data table for check-ins, sightings, and combined “all” view.
 * Locate on Map — emerald action; map is visible only for check-in / sighting filters in the shell.
 */
export function RecordsTableView() {
  const {
    viewEvidences,
    evidenceTypeFilter,
    loading,
    setMapPing,
    highlightedGeoEvidenceId,
    setHighlightedGeoEvidenceId,
  } = useDetective()

  const rows = useMemo(() => {
    return [...viewEvidences].sort(
      (a, b) => toTimeNumber(b.timestamp) - toTimeNumber(a.timestamp),
    )
  }, [viewEvidences])

  const showLocateColumn = useMemo(() => {
    return (
      evidenceTypeFilter === 'checkin' || evidenceTypeFilter === 'sighting'
    )
  }, [evidenceTypeFilter])

  const onLocate = useCallback(
    (ev) => {
      const pos = getEvidenceLatLng(ev)
      if (pos) {
        setHighlightedGeoEvidenceId(String(ev.id))
        setMapPing({ lat: pos.lat, lng: pos.lng, evidenceId: String(ev.id) })
      }
    },
    [setMapPing, setHighlightedGeoEvidenceId],
  )

  const onRowActivate = useCallback(
    (ev) => {
      if (ev.type !== 'checkin' && ev.type !== 'sighting') return
      const pos = getEvidenceLatLng(ev)
      if (!pos) return
      setHighlightedGeoEvidenceId(String(ev.id))
      setMapPing({ lat: pos.lat, lng: pos.lng, evidenceId: String(ev.id) })
    },
    [setHighlightedGeoEvidenceId, setMapPing],
  )

  const rowCanLocate = useCallback((ev) => {
    if (!getEvidenceLatLng(ev)) return false
    return true
  }, [])

  if (loading) {
    return (
      <div className="min-h-0 flex-1 space-y-1 p-3" aria-busy="true">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="h-8 animate-pulse rounded bg-zinc-800/80"
          />
        ))}
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-6 text-sm text-zinc-500">
        No records for this view. Adjust search, filter, or suspect.
      </div>
    )
  }

  return (
    <div className="min-h-0 flex-1 overflow-auto p-2 sm:p-3">
      <h2 className="mb-2 font-serif text-xs font-semibold uppercase tracking-[0.2em] text-amber-500/90">
        Case records
        <span className="ml-2 font-normal text-emerald-500/70">
          · {evidenceTypeFilter}
        </span>
      </h2>
      <div className="overflow-x-auto rounded-lg border border-emerald-900/30 bg-zinc-900/40 shadow-[inset_0_1px_0_rgba(16,185,129,0.08)]">
        <table className="w-full min-w-[36rem] border-collapse text-left text-xs text-zinc-200">
          <thead>
            <tr className="border-b border-emerald-800/40 bg-zinc-900/90 text-[10px] font-semibold uppercase tracking-wide text-emerald-300/90">
              <th className="px-3 py-2.5">Person / Pair</th>
              <th className="px-3 py-2.5">Time</th>
              <th className="px-3 py-2.5">Location</th>
              <th className="px-3 py-2.5">Coordinates</th>
              <th className="min-w-48 px-3 py-2.5">Content / Note</th>
              {showLocateColumn && (
                <th className="px-3 py-2.5 text-center">Map</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((ev) => {
              const canLocate = rowCanLocate(ev)
              const isHi = String(ev.id) === highlightedGeoEvidenceId
              const rowActivatable =
                (ev.type === 'checkin' || ev.type === 'sighting') &&
                Boolean(getEvidenceLatLng(ev))
              return (
                <tr
                  key={ev.id}
                  tabIndex={rowActivatable ? 0 : undefined}
                  onClick={() => rowActivatable && onRowActivate(ev)}
                  onKeyDown={(e) => {
                    if (!rowActivatable) return
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onRowActivate(ev)
                    }
                  }}
                  className={[
                    'border-b border-zinc-800/50 transition-colors hover:bg-emerald-950/15',
                    rowActivatable ? 'cursor-pointer' : '',
                    isHi
                      ? 'bg-amber-950/30 ring-1 ring-inset ring-amber-500/40'
                      : '',
                  ].join(' ')}
                >
                  <td className="px-3 py-2 text-zinc-100">{ev.person || '—'}</td>
                  <td className="px-3 py-2 font-mono text-zinc-400">
                    {ev.timestamp || '—'}
                  </td>
                  <td className="px-3 py-2 text-zinc-300">
                    {ev.location || '—'}
                  </td>
                  <td className="px-3 py-2 font-mono text-emerald-400/90">
                    {ev.coordinates || '—'}
                  </td>
                  <td className="max-w-prose px-3 py-2 line-clamp-2 text-zinc-400">
                    {ev.content || '—'}
                  </td>
                  {showLocateColumn && (
                    <td className="px-3 py-2 text-center">
                      {canLocate ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onLocate(ev)
                          }}
                          className="rounded-md border border-emerald-600/50 bg-emerald-950/50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-300 transition hover:border-emerald-400/60 hover:bg-emerald-900/60"
                        >
                          Locate
                        </button>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
