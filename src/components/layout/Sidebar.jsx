import { useMemo } from 'react'
import { useDetective } from '../../hooks/useDetective.js'
import { buildOrderedSuspectList } from '../../utils/detectiveLogic.js'
import { ActivityTypeIcon } from './ActivityTypeIcon.jsx'

function threatBarClasses(threat) {
  if (threat === 'low') return 'from-emerald-500/90 to-emerald-400/70'
  if (threat === 'med') return 'from-amber-500/90 to-amber-400/70'
  return 'from-rose-600/95 to-red-500/80'
}

/**
 * Dark “case file” sidebar: ranked suspects, Podo pinned with MISSING.
 */
export function Sidebar() {
  const { evidences, loading, error, selectedPerson, setSelectedPerson } =
    useDetective()

  const suspects = useMemo(
    () => buildOrderedSuspectList(evidences),
    [evidences],
  )

  const selectedKey = selectedPerson.trim().toLowerCase()

  if (loading) {
    return (
      <aside
        className="flex h-full min-h-0 w-72 shrink-0 flex-col border-r border-zinc-800/90 bg-zinc-950/95"
        aria-label="Suspect list"
        aria-busy="true"
      >
        <div className="border-b border-zinc-800 bg-zinc-900/80 px-3 py-2.5">
          <div className="h-3 w-28 animate-pulse rounded bg-zinc-800" />
          <div className="mt-1.5 h-2 w-40 animate-pulse rounded bg-zinc-800/80" />
        </div>
        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
          {Array.from({ length: 6 }, (_, i) => (
            <li
              key={i}
              className="rounded-lg border border-zinc-800/80 bg-zinc-900/60 p-2.5"
            >
              <div className="h-3 w-32 animate-pulse rounded bg-zinc-800" />
              <div className="mt-2 h-1.5 w-full animate-pulse rounded-full bg-zinc-800" />
            </li>
          ))}
        </ul>
      </aside>
    )
  }

  if (error) {
    return (
      <aside
        className="flex w-72 shrink-0 border-r border-zinc-800 bg-zinc-950/95 p-3 text-left text-sm text-rose-300/90"
        role="status"
        aria-label="Suspect list error"
      >
        Could not load case data.
      </aside>
    )
  }

  return (
    <aside
      className="flex h-full min-h-0 w-72 shrink-0 flex-col border-r border-zinc-800/90 bg-zinc-950/95"
      aria-label="Suspect list"
    >
      <div className="shrink-0 border-b border-zinc-800/90 bg-zinc-900/70 px-3 py-2.5">
        <h2 className="font-serif text-sm font-semibold tracking-wide text-amber-100/95">
          Suspects
        </h2>
        <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          case file 04 · Podo
        </p>
      </div>
      <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-2">
        {suspects.length === 0 && (
          <li className="px-1 py-2 text-sm text-zinc-500">No names extracted.</li>
        )}
        {suspects.map((row) => {
          const isActive = selectedKey === row.key
          return (
            <li key={row.key}>
              <button
                type="button"
                onClick={() => setSelectedPerson(row.key)}
                className={[
                  'w-full rounded-lg border px-2.5 py-2.5 text-left transition',
                  isActive
                    ? 'border-amber-500/50 bg-amber-950/40 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.2)]'
                    : 'border-zinc-800/80 bg-zinc-900/70 hover:border-zinc-600 hover:bg-zinc-900/90',
                ].join(' ')}
                aria-pressed={isActive}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="min-w-0">
                    <p className="truncate font-serif text-sm font-medium text-zinc-100">
                      {row.displayName}
                    </p>
                    {row.isPodo && row.statusBadge && (
                      <span className="mt-0.5 inline-block rounded border border-amber-600/50 bg-amber-950/50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-amber-200/90">
                        {row.statusBadge}
                      </span>
                    )}
                  </div>
                  <div
                    className="mt-0.5 shrink-0 text-zinc-500"
                    title={`Last: ${row.lastActivityType}`}
                  >
                    <ActivityTypeIcon type={row.lastActivityType} />
                  </div>
                </div>
                {!row.isPodo && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                      <span className="uppercase tracking-wide">Threat</span>
                      <span className="text-zinc-400">{row.score} pts</span>
                    </div>
                    <div
                      className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/90"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={row.barPercent}
                    >
                      <div
                        className={[
                          'h-full rounded-full bg-gradient-to-r',
                          threatBarClasses(row.threat),
                        ].join(' ')}
                        style={{ width: `${row.barPercent}%` }}
                      />
                    </div>
                  </div>
                )}
                {row.isPodo && (
                  <p className="mt-1.5 text-[10px] text-zinc-500">
                    No score · person of interest
                  </p>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
