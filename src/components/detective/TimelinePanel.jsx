import { useMemo } from 'react'
import { useDetective } from '../../hooks/useDetective.js'
import {
  checkForContradictions,
  filterEvidencesByPersonKey,
  toTimeNumber,
} from '../../utils/detectiveLogic.js'
import { ActivityTypeIcon } from '../layout/ActivityTypeIcon.jsx'

const TIMELINE_TYPES = new Set(['checkin', 'message', 'sighting'])

/**
 * Vertical timeline: check-ins, messages, sightings for the active suspect (newest first).
 * Red border + CONTRADICTION when `checkForContradictions` flags a message.
 */
export function TimelinePanel() {
  const { searchFilteredEvidences, selectedPerson, loading } = useDetective()

  const personKey = selectedPerson.trim().toLowerCase()

  const personEvidences = useMemo(
    () => filterEvidencesByPersonKey(searchFilteredEvidences, personKey),
    [searchFilteredEvidences, personKey],
  )

  const timelineItems = useMemo(() => {
    return personEvidences
      .filter((e) => TIMELINE_TYPES.has(e.type))
      .sort((a, b) => toTimeNumber(b.timestamp) - toTimeNumber(a.timestamp))
  }, [personEvidences])

  const contradictionIds = useMemo(
    () => checkForContradictions(personEvidences),
    [personEvidences],
  )

  if (loading) {
    return (
      <div
        className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2 transition-opacity duration-200"
        aria-busy="true"
      >
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-lg border border-zinc-800/80 bg-zinc-900/50"
          />
        ))}
      </div>
    )
  }

  if (timelineItems.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-3 text-sm text-zinc-500 transition-opacity duration-200">
        No check-ins, messages, or sightings for this filter.
      </div>
    )
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-2 transition-all duration-300 ease-out">
      <h3 className="mb-2 px-1 font-serif text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
        Chronology
      </h3>
      <ol className="relative pl-1">
        <div
          className="absolute bottom-0 left-[11px] top-0 w-px bg-zinc-800"
          aria-hidden
        />
        {timelineItems.map((ev) => {
          const isContra = ev.type === 'message' && contradictionIds.has(ev.id)
          return (
            <li key={ev.id} className="relative pb-4 pl-6 last:pb-1">
              <div
                className="absolute left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-zinc-800 bg-amber-600/80"
                aria-hidden
              />
              <div
                className={[
                  'rounded-lg border p-2.5 shadow-sm transition-shadow duration-200',
                  isContra
                    ? 'border-2 border-rose-500/90 bg-rose-950/30 shadow-[0_0_0_1px_rgba(244,63,94,0.3)]'
                    : 'border-zinc-800/90 bg-zinc-900/60',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="min-w-0 text-xs text-zinc-500">
                    {ev.timestamp && (
                      <time dateTime={String(ev.timestamp)} className="font-mono">
                        {ev.timestamp}
                      </time>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1 text-zinc-500">
                    <span className="text-[9px] uppercase text-zinc-500">
                      {ev.type}
                    </span>
                    <ActivityTypeIcon type={ev.type} />
                  </div>
                </div>
                {isContra && (
                  <p
                    className="mt-1 text-[9px] font-bold tracking-widest text-rose-300"
                    role="status"
                  >
                    CONTRADICTION
                  </p>
                )}
                {ev.location && (
                  <p className="mt-0.5 text-sm text-amber-100/80">
                    {ev.location}
                    {ev.coordinates
                      ? ` · ${ev.coordinates}`
                      : null}
                  </p>
                )}
                {ev.content && (
                  <p className="mt-1 line-clamp-4 text-sm leading-snug text-zinc-200">
                    {ev.content}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
