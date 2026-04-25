import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef } from 'react'
import { useDetective } from '../../hooks/useDetective.js'
import {
  getEvidenceLatLng,
  toTimeNumber,
} from '../../utils/detectiveLogic.js'
import { AnonymousTipsPanel } from './AnonymousTipsPanel.jsx'
import { EvidenceBoardPanel } from './EvidenceBoardPanel.jsx'
import { MessageCenter } from './MessageCenter.jsx'

/**
 * Horizontal scroller linking map pins to check-in / sighting records (All Types only).
 */
function GeoFieldLog() {
  const {
    viewEvidences,
    highlightedGeoEvidenceId,
    setHighlightedGeoEvidenceId,
    setMapPing,
  } = useDetective()
  const btnRefs = useRef(/** @type {Map<string, HTMLButtonElement>} */ (new Map()))

  const items = useMemo(() => {
    return [...viewEvidences]
      .filter(
        (e) =>
          (e.type === 'checkin' || e.type === 'sighting') &&
          getEvidenceLatLng(e),
      )
      .sort(
        (a, b) => toTimeNumber(b.timestamp) - toTimeNumber(a.timestamp),
      )
  }, [viewEvidences])

  useEffect(() => {
    if (!highlightedGeoEvidenceId) return
    const el = btnRefs.current.get(highlightedGeoEvidenceId)
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [highlightedGeoEvidenceId])

  if (items.length === 0) return null

  return (
    <motion.div
      layout
      className="shrink-0 rounded-lg border border-emerald-900/30 bg-zinc-900/50 px-2 py-2"
    >
      <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-500/80">
        Field log · tap to sync map
      </p>
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {items.map((ev) => {
          const id = String(ev.id)
          const pos = getEvidenceLatLng(ev)
          const active = id === highlightedGeoEvidenceId
          return (
            <button
              key={id}
              type="button"
              ref={(el) => {
                if (el) btnRefs.current.set(id, el)
                else btnRefs.current.delete(id)
              }}
              onClick={() => {
                if (!pos) return
                setHighlightedGeoEvidenceId(id)
                setMapPing({ lat: pos.lat, lng: pos.lng, evidenceId: id })
              }}
              className={[
                'shrink-0 rounded-md border px-2 py-1.5 text-left text-[10px] transition',
                active
                  ? 'border-amber-500/60 bg-amber-950/50 text-amber-100'
                  : 'border-zinc-700/60 bg-zinc-950/60 text-zinc-300 hover:border-zinc-500',
              ].join(' ')}
            >
              <span
                className={[
                  'block font-mono text-[8px] uppercase',
                  ev.type === 'sighting' ? 'text-violet-400' : 'text-emerald-400',
                ].join(' ')}
              >
                {ev.type}
              </span>
              <span className="line-clamp-1 font-medium text-zinc-200">
                {ev.location || ev.content?.slice(0, 32) || id.slice(-6)}
              </span>
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

/**
 * “All Types” command center: tri-column intel below spatial log (map lives in shell).
 */
export function CommandCenterView() {
  return (
    <motion.div
      layout
      className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden p-1.5 sm:p-2"
    >
      <GeoFieldLog />
      <motion.div
        layout
        className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-hidden md:grid-cols-3"
      >
        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-zinc-800/80 bg-zinc-950/40">
          <h3 className="shrink-0 border-b border-amber-900/20 bg-zinc-900/50 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-amber-500/90">
            Messages
          </h3>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <MessageCenter variant="command" />
          </div>
        </section>
        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-zinc-800/80 bg-zinc-950/40">
          <h3 className="shrink-0 border-b border-emerald-900/20 bg-zinc-900/50 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-500/80">
            Personal notes
          </h3>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <EvidenceBoardPanel variant="command" />
          </div>
        </section>
        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-rose-900/30 bg-zinc-950/40">
          <h3 className="shrink-0 border-b border-rose-900/30 bg-rose-950/20 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-rose-400/90">
            Anonymous tips
          </h3>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <AnonymousTipsPanel variant="command" />
          </div>
        </section>
      </motion.div>
    </motion.div>
  )
}
