import { useMemo } from 'react'
import { useDetective } from '../../hooks/useDetective.js'
import {
  confidenceToReliabilityPercent,
  toTimeNumber,
} from '../../utils/detectiveLogic.js'

/**
 * “Top secret” dossier presentation for anonymous tips.
 * @param { { variant?: 'default' | 'command' } } [props]
 */
export function AnonymousTipsPanel({ variant = 'default' } = {}) {
  const isCommand = variant === 'command'
  const { viewEvidences, loading } = useDetective()

  const tips = useMemo(() => {
    return viewEvidences
      .filter((e) => e.type === 'tip')
      .sort((a, b) => toTimeNumber(b.timestamp) - toTimeNumber(a.timestamp))
  }, [viewEvidences])

  if (loading) {
    return (
      <div
        className={['min-h-0 flex-1', isCommand ? 'p-2' : 'p-4'].join(' ')}
        aria-busy="true"
      >
        <div
          className={[
            'animate-pulse rounded border border-rose-900/40 bg-zinc-900/80',
            isCommand ? 'mx-0 p-4' : 'mx-auto max-w-3xl p-8',
          ].join(' ')}
        />
      </div>
    )
  }

  if (tips.length === 0) {
    return (
      <div
        className={[
          'flex min-h-0 flex-1 items-center justify-center text-zinc-500',
          isCommand ? 'p-3 text-[11px]' : 'p-6 text-sm',
        ].join(' ')}
      >
        No anonymous tips in this view.
      </div>
    )
  }

  return (
    <div
      className={['min-h-0 flex-1 overflow-y-auto', isCommand ? 'p-2' : 'p-3 sm:p-4'].join(
        ' ',
      )}
    >
      <h2
        className={[
          'mb-2 font-serif font-semibold uppercase tracking-[0.25em] text-rose-400/90',
          isCommand ? 'text-[10px]' : 'mb-3 text-xs',
        ].join(' ')}
      >
        Classified tips
      </h2>
      <ul
        className={[
          'mx-auto flex flex-col',
          isCommand ? 'gap-2' : 'max-w-4xl gap-4',
        ].join(' ')}
      >
        {tips.map((ev) => {
          const rel = confidenceToReliabilityPercent(ev.confidence)
          return (
            <li
              key={ev.id}
              className="relative overflow-hidden rounded border border-rose-900/50 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 shadow-[0_4px_24px_rgba(127,29,29,0.25)]"
            >
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rotate-12 border border-rose-600/30 bg-rose-950/20"
                aria-hidden
              />
              <div
                className={[
                  'flex flex-wrap items-start justify-between gap-2 border-b border-rose-900/40 bg-rose-950/30',
                  isCommand ? 'px-2 py-1.5' : 'px-4 py-2',
                ].join(' ')}
              >
                <div className="flex min-w-0 items-center gap-1.5">
                  <span
                    className={[
                      'shrink-0 rounded border border-rose-500/60 bg-rose-950/60 font-mono font-bold uppercase tracking-[0.2em] text-rose-300',
                      isCommand ? 'px-1.5 py-0.5 text-[8px]' : 'px-2 py-0.5 text-[10px]',
                    ].join(' ')}
                  >
                    Top secret
                  </span>
                  <span className="truncate font-mono text-[8px] uppercase text-zinc-500">
                    Ref · {String(ev.id).slice(-6)}
                  </span>
                </div>
                <div className="min-w-0">
                  {isCommand ? (
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[8px] text-emerald-400/90">
                        <span>Rel.</span>
                        <span className="tabular-nums font-semibold">{rel}%</span>
                      </div>
                      <div
                        className="h-1.5 w-24 max-w-full overflow-hidden rounded-full bg-zinc-800/90"
                        role="progressbar"
                        aria-valuenow={rel}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-amber-500/90"
                          style={{ width: `${rel}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="rounded border border-emerald-700/40 bg-emerald-950/40 px-2 py-0.5 text-[10px] font-medium text-emerald-300/90">
                      Reliability {rel}%
                    </span>
                  )}
                </div>
              </div>
              <div
                className={[
                  isCommand
                    ? 'space-y-1.5 p-2'
                    : 'grid gap-3 p-4 sm:grid-cols-[1fr_minmax(0,1.2fr)]',
                ].join(' ')}
              >
                <div
                  className={[
                    'space-y-1 font-mono text-zinc-400',
                    isCommand ? 'text-[9px]' : 'space-y-2 text-[11px]',
                  ].join(' ')}
                >
                  <p>
                    <span className="text-rose-400/80">
                      {isCommand ? 'SUBJ:' : 'SUBJECT:'}
                    </span>{' '}
                    <span className="text-zinc-200">
                      {ev.person || (isCommand ? 'REDACTED' : '█ REDACTED')}
                    </span>
                  </p>
                  <p>
                    <span className="text-rose-400/80">LOC:</span>{' '}
                    <span className={isCommand ? 'line-clamp-1' : ''}>
                      {ev.location || '—'}
                    </span>
                  </p>
                  {!isCommand && (
                    <>
                      <p>
                        <span className="text-rose-400/80">COORD:</span>{' '}
                        <span className="text-emerald-400/80">
                          {ev.coordinates || '█ CLASSIFIED'}
                        </span>
                      </p>
                      <p>
                        <span className="text-rose-400/80">TIME:</span>{' '}
                        {ev.timestamp || '—'}
                      </p>
                    </>
                  )}
                </div>
                <div
                  className={[
                    'relative border border-dashed border-zinc-700/80 bg-black/20',
                    isCommand ? 'rounded p-1.5' : 'rounded p-3',
                  ].join(' ')}
                >
                  <p
                    className={[
                      'font-mono uppercase tracking-widest text-amber-600/80',
                      isCommand ? 'mb-1 text-[7px]' : 'mb-2 text-[9px]',
                    ].join(' ')}
                  >
                    {isCommand ? 'Report' : 'Report body'}
                  </p>
                  <p
                    className={[
                      'whitespace-pre-wrap font-mono leading-relaxed text-zinc-300 [text-shadow:0_0_1px_rgba(0,0,0,0.5)]',
                      isCommand ? 'line-clamp-4 text-[10px]' : 'text-sm',
                    ].join(' ')}
                  >
                    {ev.content}
                  </p>
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.07]"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(0deg, transparent, transparent 2px, #444 2px, #444 3px)',
                    }}
                    aria-hidden
                  />
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
