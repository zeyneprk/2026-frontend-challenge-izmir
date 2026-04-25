import { EVIDENCE_FILTER_OPTIONS } from '../../constants/evidenceTypes.js'
import { useDetective } from '../../hooks/useDetective.js'

/**
 * Global case search + evidence-type filter (drives the main table / message view).
 */
export function Header() {
  const {
    searchQuery,
    setSearchQuery,
    evidenceTypeFilter,
    setEvidenceTypeFilter,
    refetchEvidences,
    loading,
    error,
    fetchErrors,
    selectedPerson,
    setSelectedPerson,
  } = useDetective()

  const hasPerson = selectedPerson.trim().length > 0

  return (
    <header className="shrink-0 border-b border-amber-900/30 bg-zinc-900/90 px-3 py-2.5 text-sm text-zinc-300 sm:px-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="font-serif text-base font-semibold tracking-tight text-amber-100/95">
            The Podo Case
          </div>
          {!hasPerson && (
            <span className="rounded border border-emerald-700/50 bg-emerald-950/40 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-emerald-300/90">
              All suspects
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:max-w-3xl sm:flex-row sm:items-stretch sm:justify-end">
          <div className="flex min-w-0 flex-1 flex-wrap items-stretch gap-1.5 sm:gap-2">
            {loading && (
              <span className="self-center text-xs text-zinc-500" aria-live="polite">
                Loading…
              </span>
            )}
            {error && (
              <span
                className="self-center text-xs text-rose-300"
                title={error}
              >
                {error}
              </span>
            )}
            {fetchErrors.length > 0 && !error && (
              <span
                className="self-center text-xs text-amber-200/80"
                title={fetchErrors.map((e) => e.error).join('\n')}
              >
                Partial load
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
              className="min-w-0 flex-1 rounded-md border border-zinc-600/80 bg-zinc-950/90 px-2.5 py-1.5 text-xs text-zinc-100 shadow-inner placeholder:text-zinc-500 focus:border-amber-600/50 focus:outline focus:ring-1 focus:ring-amber-500/30"
            />
            <div className="relative min-w-0 sm:w-44">
              <label className="sr-only" htmlFor="evidence-type-filter">
                Evidence type
              </label>
              <select
                id="evidence-type-filter"
                value={evidenceTypeFilter}
                onChange={(e) =>
                  setEvidenceTypeFilter(
                    /** @type {import('../../constants/evidenceTypes.js').EvidenceFilter} */ (
                      e.target.value
                    ),
                  )
                }
                className="w-full cursor-pointer appearance-none rounded-md border border-zinc-600/80 bg-zinc-950/90 py-1.5 pl-2.5 pr-7 text-xs text-amber-100/95 focus:border-amber-600/50 focus:outline focus:ring-1 focus:ring-amber-500/30"
              >
                {EVIDENCE_FILTER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <span
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500"
                aria-hidden
              >
                ▾
              </span>
            </div>
            {hasPerson && (
              <button
                type="button"
                onClick={() => setSelectedPerson('')}
                className="shrink-0 rounded-md border border-emerald-600/50 bg-emerald-950/50 px-3 py-1.5 text-xs font-semibold text-emerald-100 shadow-[0_0_0_1px_rgba(16,185,129,0.15)] hover:bg-emerald-900/60"
                title="Return to global overview (all suspects)"
              >
                Global overview
              </button>
            )}
            <button
              type="button"
              onClick={() => void refetchEvidences()}
              className="shrink-0 rounded-md border border-amber-800/50 bg-amber-950/40 px-3 py-1.5 text-xs font-medium text-amber-200/95 hover:bg-amber-900/50"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
