import { useMemo } from 'react'
import { useDetective } from '../../hooks/useDetective.js'
import {
  confidenceToReliabilityPercent,
  filterEvidencesByPersonKey,
  toTimeNumber,
} from '../../utils/detectiveLogic.js'

/**
 * Personal notes and anonymous tips as polaroid / post-it style cards.
 */
export function EvidenceBoardPanel() {
  const { searchFilteredEvidences, selectedPerson, loading } = useDetective()

  const personKey = selectedPerson.trim().toLowerCase()

  const personEvidences = useMemo(
    () => filterEvidencesByPersonKey(searchFilteredEvidences, personKey),
    [searchFilteredEvidences, personKey],
  )

  const cards = useMemo(() => {
    return personEvidences
      .filter((e) => e.type === 'note' || e.type === 'tip')
      .sort((a, b) => toTimeNumber(b.timestamp) - toTimeNumber(a.timestamp))
  }, [personEvidences])

  if (loading) {
    return (
      <div
        className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2"
        aria-busy="true"
      >
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded border border-zinc-700/50 bg-amber-950/20"
          />
        ))}
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-3 text-center text-sm text-zinc-500">
        No personal notes or tips for this suspect.
      </div>
    )
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-2 transition-all duration-300 ease-out">
      <h3 className="mb-2 px-1 font-serif text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
        Intel board
      </h3>
      <ul className="space-y-3">
        {cards.map((ev, index) => {
          const isTip = ev.type === 'tip'
          const rel = isTip ? confidenceToReliabilityPercent(ev.confidence) : null
          const tilt = index % 2 === 0 ? '-rotate-[0.35deg]' : 'rotate-[0.35deg]'
          return (
            <li
              key={ev.id}
              className={[
                isTip
                  ? 'bg-gradient-to-b from-slate-100 to-slate-200/95'
                  : 'bg-gradient-to-br from-amber-100 via-amber-50 to-amber-100/90',
                'rounded border border-black/10 p-2.5 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.45)]',
                isTip
                  ? 'font-sans text-slate-900 shadow-md ring-1 ring-white/20'
                  : "font-['Segoe_Print','Bradley_Hand',cursive] text-amber-950 shadow-lg ring-1 ring-amber-200/30",
                tilt,
              ].join(' ')}
            >
              <div
                className={[
                  'mb-1 flex items-center justify-between gap-1',
                  isTip
                    ? 'text-[9px] font-semibold uppercase text-slate-600'
                    : 'text-[9px] font-bold uppercase text-amber-900/80',
                ].join(' ')}
              >
                <span>
                  {isTip ? 'Anonymous tip' : 'Personal note'}
                </span>
                {ev.timestamp && (
                  <time
                    className="font-mono text-[9px] opacity-80"
                    dateTime={String(ev.timestamp)}
                  >
                    {ev.timestamp}
                  </time>
                )}
              </div>
              {isTip && ev.location && (
                <p className="text-[11px] font-medium text-slate-800">
                  {ev.location}
                </p>
              )}
              <p
                className={[
                  'mt-1 text-sm leading-snug',
                  isTip
                    ? 'text-slate-800'
                    : 'text-amber-950/95',
                ].join(' ')}
              >
                {ev.content}
              </p>
              {isTip && rel != null && (
                <div className="mt-2 border-t border-slate-300/80 pt-2">
                  <div className="mb-0.5 flex items-center justify-between text-[9px] font-medium uppercase text-slate-600">
                    <span>Reliability</span>
                    <span className="tabular-nums">{rel}%</span>
                  </div>
                  <div
                    className="h-1.5 w-full overflow-hidden rounded-full bg-slate-300/80"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={rel}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-500"
                      style={{ width: `${rel}%` }}
                    />
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
