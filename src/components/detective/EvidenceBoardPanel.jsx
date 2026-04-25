import { useMemo } from 'react'
import { useDetective } from '../../hooks/useDetective.js'
import { postitPaletteClass, rotationFromId } from '../../utils/postitLayout.js'
import { toDisplayName, toTimeNumber } from '../../utils/detectiveLogic.js'

/**
 * Personal notes only: grid of colorful post-it notes (office board).
 * @param { { variant?: 'default' | 'command' } } [props]
 */
export function EvidenceBoardPanel({ variant = 'default' } = {}) {
  const isCommand = variant === 'command'
  const { viewEvidences, loading } = useDetective()

  const notes = useMemo(() => {
    return viewEvidences
      .filter((e) => e.type === 'note')
      .sort((a, b) => toTimeNumber(b.timestamp) - toTimeNumber(a.timestamp))
  }, [viewEvidences])

  if (loading) {
    return (
      <div
        className={['min-h-0 flex-1', isCommand ? 'p-2' : 'p-3 sm:p-4'].join(' ')}
        aria-busy="true"
      >
        <div
          className={[
            'grid gap-2',
            isCommand
              ? 'grid-cols-1 sm:grid-cols-2'
              : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
          ].join(' ')}
        >
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="aspect-[4/5] animate-pulse rounded border border-zinc-700/50 bg-amber-950/30"
            />
          ))}
        </div>
      </div>
    )
  }

  if (notes.length === 0) {
    return (
      <div
        className={[
          'flex min-h-0 flex-1 items-center justify-center text-zinc-500',
          isCommand ? 'p-3 text-[11px]' : 'p-6 text-sm',
        ].join(' ')}
      >
        No personal notes in this view. Try another filter or widen search.
      </div>
    )
  }

  return (
    <div
      className={['min-h-0 flex-1 overflow-y-auto', isCommand ? 'p-2' : 'p-3 sm:p-4'].join(
        ' ',
      )}
    >
      <div
        className={['mb-2 flex flex-wrap items-end justify-between gap-2', isCommand ? 'mb-2' : 'mb-3'].join(' ')}
      >
        <h2
          className={[
            'font-serif font-semibold tracking-wide text-amber-200/90',
            isCommand ? 'text-xs' : 'text-sm',
          ].join(' ')}
        >
          Field notes
        </h2>
        <span
          className={[
            'font-medium uppercase tracking-widest text-emerald-500/80',
            isCommand ? 'text-[8px]' : 'text-[10px]',
          ].join(' ')}
        >
          Pinboard
        </span>
      </div>
      <div
        className={[
          'grid',
          isCommand
            ? 'grid-cols-1 gap-2 sm:grid-cols-2'
            : 'grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
        ].join(' ')}
        style={{ perspective: '800px' }}
      >
        {notes.map((ev) => {
          const deg = rotationFromId(String(ev.id))
          const pal = postitPaletteClass(String(ev.id))
          const name = toDisplayName(
            (ev.person && String(ev.person).trim()) || 'unknown',
          )
          return (
            <article
              key={ev.id}
              className={[
                'flex flex-col rounded border border-black/10 shadow-lg transition-transform duration-200 hover:z-10 hover:scale-[1.02] hover:shadow-xl',
                isCommand
                  ? 'min-h-[6.5rem] p-2'
                  : 'min-h-[9rem] p-3',
                'bg-gradient-to-br',
                pal,
                'text-zinc-900',
                'font-postit',
              ].join(' ')}
              style={{ transform: `rotate(${deg}deg)` }}
            >
              <p
                className={[
                  'font-serif font-bold leading-tight text-zinc-900/95',
                  isCommand ? 'text-sm' : 'text-base',
                ].join(' ')}
              >
                {name}
              </p>
              {ev.timestamp && (
                <time
                  className="mt-1 font-mono text-zinc-600/90 [font-size:8.5px]"
                  dateTime={String(ev.timestamp)}
                >
                  {ev.timestamp}
                </time>
              )}
              <p
                className={[
                  'mt-1.5 flex-1 leading-snug text-zinc-800/95',
                  isCommand ? 'line-clamp-4 text-[11px]' : 'text-sm',
                ].join(' ')}
              >
                {ev.content}
              </p>
            </article>
          )
        })}
      </div>
    </div>
  )
}
