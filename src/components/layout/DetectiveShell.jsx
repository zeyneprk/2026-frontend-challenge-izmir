import { useDetective } from '../../hooks/useDetective.js'
import { EvidenceBoardPanel } from '../detective/EvidenceBoardPanel.jsx'

/**
 * 3-column shell: navigation | map + timeline | evidence. Map/timeline are placeholders.
 */
export function DetectiveShell() {
  const {
    loading,
    error,
    fetchErrors,
    refetchEvidences,
    selectedPerson,
    setSelectedPerson,
  } = useDetective()

  return (
    <div className="flex h-svh w-full min-h-0 flex-col text-left text-slate-900">
      <header className="shrink-0 border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-slate-800">The Podo Case</span>
          <div className="flex items-center gap-2">
            {loading && <span aria-live="polite">Loading data…</span>}
            {error && (
              <span className="text-red-600" title={error}>
                {error}
              </span>
            )}
            {fetchErrors.length > 0 && !error && (
              <span
                className="text-amber-700"
                title={fetchErrors.map((e) => e.error).join('\n')}
              >
                Partial load ({fetchErrors.length} form
                {fetchErrors.length > 1 ? 's' : ''})
              </span>
            )}
            <label className="sr-only" htmlFor="filter-person">
              Filter by person
            </label>
            <input
              id="filter-person"
              type="search"
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              placeholder="Person filter"
              className="w-40 max-w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
            />
            <button
              type="button"
              onClick={() => void refetchEvidences()}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 hover:bg-slate-100"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside
          className="hidden w-56 shrink-0 border-r border-slate-200 bg-slate-100/60 md:block"
          aria-label="Sidebar"
        >
          <p className="p-3 text-xs text-slate-500">Sidebar (reserved)</p>
        </aside>
        <div className="grid min-w-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[1fr_minmax(18rem,22rem)]">
          <div className="flex min-h-0 flex-col border-b border-slate-200 lg:border-b-0 lg:border-r">
            <div className="min-h-0 flex-1 bg-slate-200/50 p-3">
              <div
                className="flex h-full min-h-40 items-center justify-center rounded border border-dashed border-slate-300 bg-slate-100/80 text-slate-500"
                role="status"
                aria-label="Map container placeholder"
              >
                Map (placeholder)
              </div>
            </div>
            <div className="h-40 shrink-0 border-t border-slate-200 bg-slate-50 p-2">
              <p className="text-xs text-slate-500">Timeline (empty)</p>
            </div>
          </div>
          <div className="min-h-0 min-w-0 overflow-hidden bg-slate-50/80 p-0">
            <EvidenceBoardPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
