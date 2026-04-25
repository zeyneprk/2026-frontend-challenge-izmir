import { useMemo, useState } from 'react'
import { useDetective } from '../../hooks/useDetective.js'
import {
  checkForContradictions,
  groupMessagesByContacts,
  isMessageBubbleOnRight,
} from '../../utils/detectiveLogic.js'

function RedFlagIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label="Warning"
      role="img"
    >
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  )
}

/**
 * WhatsApp-style message forensics: thread list + chat bubbles.
 * @param { { variant?: 'default' | 'command' } } [props]
 */
export function MessageCenter({ variant = 'default' } = {}) {
  const isCommand = variant === 'command'
  const { viewEvidences, evidences, loading } = useDetective()
  const [activeThreadId, setActiveThreadId] = useState(/** @type {string | null} */ (null))

  const messageList = useMemo(
    () => viewEvidences.filter((e) => e.type === 'message'),
    [viewEvidences],
  )

  const threads = useMemo(
    () => groupMessagesByContacts(messageList),
    [messageList],
  )

  const redFlagIds = useMemo(
    () => checkForContradictions(evidences),
    [evidences],
  )

  const activeThread = useMemo(() => {
    if (threads.length === 0) return null
    const id = activeThreadId ?? threads[0].threadId
    return threads.find((t) => t.threadId === id) ?? threads[0]
  }, [activeThreadId, threads])

  if (loading) {
    return (
      <div
        className={[
          'flex min-h-0 flex-1 gap-2 p-2',
          isCommand ? 'min-h-[10rem]' : '',
        ].join(' ')}
        aria-busy="true"
      >
        <div
          className={[
            'h-full shrink-0 animate-pulse rounded-lg bg-zinc-800/80',
            isCommand ? 'w-36' : 'w-56',
          ].join(' ')}
        />
        <div className="min-h-48 flex-1 animate-pulse rounded-lg bg-zinc-800/60" />
      </div>
    )
  }

  if (threads.length === 0) {
    return (
      <div
        className={[
          'flex min-h-0 flex-1 items-center justify-center text-zinc-500',
          isCommand ? 'p-3 text-[11px]' : 'p-6 text-sm',
        ].join(' ')}
      >
        No messages in this view. Adjust filters or search.
      </div>
    )
  }

  return (
    <div
      className={[
        'flex min-h-0 min-w-0 flex-1 overflow-hidden rounded-lg border border-zinc-800/80 bg-[#0b141a]',
        isCommand ? 'min-h-0' : '',
      ].join(' ')}
    >
      <aside
        className={[
          'flex w-full shrink-0 flex-col border-r border-zinc-800/90 bg-[#111b21]',
          isCommand ? 'max-w-[11.5rem]' : 'max-w-[17rem]',
        ].join(' ')}
        aria-label="Message threads"
      >
        <div
          className={[
            'border-b border-zinc-800/80 font-semibold uppercase tracking-widest text-amber-500/90',
            isCommand ? 'px-2 py-1.5 text-[9px]' : 'px-3 py-2 text-[10px]',
          ].join(' ')}
        >
          Chats
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {threads.map((t) => {
            const on = activeThread?.threadId === t.threadId
            return (
              <li key={t.threadId}>
                <button
                  type="button"
                  onClick={() => setActiveThreadId(t.threadId)}
                  className={[
                    'w-full border-l-4 text-left transition-colors',
                    isCommand
                      ? 'px-2 py-2 text-xs'
                      : 'px-3 py-2.5 text-sm',
                    on
                      ? 'border-amber-500 bg-zinc-800/50 text-amber-50'
                      : 'border-transparent text-zinc-300 hover:bg-zinc-800/40',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'line-clamp-2 font-medium',
                      isCommand ? 'text-[11px] leading-tight' : '',
                    ].join(' ')}
                  >
                    {t.displayLabel}
                  </span>
                  <span
                    className={[
                      'mt-0.5 block text-zinc-500',
                      isCommand ? 'text-[9px]' : 'text-[10px]',
                    ].join(' ')}
                  >
                    {t.messages.length} msg
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </aside>
      {activeThread && (
        <section
          className="flex min-h-0 min-w-0 flex-1 flex-col bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMzNjQwNGYiLz48L3N2Zz4=')]"
          style={{ backgroundColor: '#0b141a' }}
          aria-label="Chat"
        >
          <header
            className={[
              'shrink-0 border-b border-zinc-800/80 bg-[#202c33] text-amber-100/95',
              isCommand ? 'px-2 py-2 text-xs' : 'px-4 py-2.5 text-sm',
            ].join(' ')}
          >
            {activeThread.displayLabel}
          </header>
          <div
            className={[
              'min-h-0 flex-1 space-y-1 overflow-y-auto',
              isCommand ? 'px-2 py-2' : 'px-3 py-3',
            ].join(' ')}
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(255,255,255,0.02) 4px, rgba(255,255,255,0.02) 5px)',
            }}
          >
            {activeThread.messages.map((m) => {
              const right = isMessageBubbleOnRight(m, activeThread)
              const isRed = redFlagIds.has(m.id)
              return (
                <div
                  key={m.id}
                  className={[
                    'flex w-full',
                    right ? 'justify-end' : 'justify-start',
                  ].join(' ')}
                >
                  <div
                    className={[
                      'max-w-[min(85%,24rem)] rounded-lg leading-snug shadow-sm',
                      isCommand
                        ? 'max-w-[min(95%,20rem)] px-2 py-1 text-[11px]'
                        : 'px-2.5 py-1.5 text-sm',
                      right
                        ? 'rounded-br-sm bg-[#005c4b] text-left text-amber-50/95'
                        : 'rounded-bl-sm bg-[#202c33] text-zinc-100',
                    ].join(' ')}
                  >
                    {isRed && (
                      <div className="mb-0.5 flex items-center gap-1 text-amber-300/95">
                        <RedFlagIcon className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-200/90">
                          Red flag
                        </span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap break-words text-zinc-100/95">
                      {m.content}
                    </p>
                    {m.timestamp && (
                      <p
                        className={[
                          'mt-0.5 text-right text-[9px] tabular-nums',
                          right ? 'text-emerald-200/50' : 'text-zinc-500',
                        ].join(' ')}
                      >
                        {m.timestamp}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
