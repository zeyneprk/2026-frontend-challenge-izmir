import { useDetective } from '../../hooks/useDetective.js'
import { CaseFilesPlaceholder } from '../detective/CaseFilesPlaceholder.jsx'
import { EvidenceBoardPanel } from '../detective/EvidenceBoardPanel.jsx'
import { MapPanel } from '../detective/MapPanel.jsx'
import { TimelinePanel } from '../detective/TimelinePanel.jsx'
import { Sidebar } from './Sidebar.jsx'

/**
 * 3-column shell: sidebar (suspects) | map + timeline | evidence, with global case search.
 */
export function DetectiveShell() {
  const {
    loading,
    error,
    fetchErrors,
    refetchEvidences,
    searchQuery,
    setSearchQuery,
    selectedPerson,
  } = useDetective()

  const hasSelection = selectedPerson.trim().length > 0
  const hasSearch = searchQuery.trim().length > 0
  const showWorkspace = hasSelection || hasSearch
  const workspaceKey = `${selectedPerson.trim().toLowerCase()}|${searchQuery}`

  return (
    <div className="flex h-svh w-full min-h-0 flex-col bg-zinc-950 text-left text-zinc-100">
      <header className="shrink-0 border-b border-zinc-800/90 bg-zinc-900/80 px-4 py-2 text-sm text-zinc-300">
        <div className="flex items-center justify-between gap-2">
          <span className="font-serif text-sm font-semibold text-zinc-100">
            The Podo Case
          </span>
          <div className="flex min-w-0 max-w-md flex-1 items-center justify-end gap-2 sm:max-w-lg">
            {loading && (
              <span className="shrink-0 text-xs text-zinc-500" aria-live="polite">
                Loading data…
              </span>
            )}
            {error && (
              <span className="shrink-0 text-xs text-rose-300" title={error}>
                {error}
              </span>
            )}
            {fetchErrors.length > 0 && !error && (
              <span
                className="shrink-0 text-xs text-amber-200/90"
                title={fetchErrors.map((e) => e.error).join('\n')}
              >
                Partial load ({fetchErrors.length} form
                {fetchErrors.length > 1 ? 's' : ''})
              </span>
            )}
            <label className="sr-only" htmlFor="global-case-search">
              Global case search
            </label>
            <input
              id="global-case-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search names, places, content…"
              className="min-w-0 flex-1 rounded border border-zinc-700/90 bg-zinc-950/80 px-2 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline focus:outline-1 focus:outline-amber-500/40"
            />
            <button
              type="button"
              onClick={() => void refetchEvidences()}
              className="shrink-0 rounded border border-zinc-600/80 bg-zinc-900/80 px-2 py-1 text-xs text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800/90"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        {!showWorkspace ? (
          <CaseFilesPlaceholder />
        ) : (
          <div
            key={workspaceKey}
            className="grid min-h-0 min-w-0 flex-1 grid-cols-1 overflow-hidden border-l border-zinc-800/50 transition-all duration-300 ease-out lg:grid-cols-[1fr_minmax(18rem,22rem)]"
          >
            <div className="flex min-h-0 min-w-0 flex-col border-b border-zinc-800/50 lg:border-b-0 lg:border-r lg:border-zinc-800/50">
              <div className="shrink-0 p-2 sm:p-2.5">
                <MapPanel />
              </div>
              <div className="flex min-h-0 flex-1 flex-col border-t border-zinc-800/50 bg-zinc-900/20">
                <TimelinePanel />
              </div>
            </div>
            <div className="min-h-0 min-w-0 overflow-hidden border-t border-zinc-800/50 bg-amber-950/5 p-0 lg:border-t-0">
              <EvidenceBoardPanel />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
