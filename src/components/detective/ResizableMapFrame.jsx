import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDetective } from '../../hooks/useDetective.js'
import { MapPanel } from './MapPanel.jsx'

const MIN_H = 120
const MAX_H = 520

/**
 * Resizable top map with drag handle; height persisted via DetectiveProvider.
 */
export function ResizableMapFrame() {
  const { mapPanelHeightPx, setMapPanelHeightPx } = useDetective()
  const [isDragging, setIsDragging] = useState(false)
  const startY = useRef(0)
  const startH = useRef(0)

  const clamp = useCallback((h) => {
    return Math.min(MAX_H, Math.max(MIN_H, h))
  }, [])

  useEffect(() => {
    if (!isDragging) return
    const onMove = (e) => {
      const delta = e.clientY - startY.current
      setMapPanelHeightPx(clamp(startH.current + delta))
    }
    const onUp = () => setIsDragging(false)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [isDragging, setMapPanelHeightPx, clamp])

  const onPointerDown = useCallback(
    (e) => {
      e.preventDefault()
      setIsDragging(true)
      startY.current = e.clientY
      startH.current = mapPanelHeightPx
    },
    [mapPanelHeightPx],
  )

  return (
    <div className="border-b border-zinc-800/80 bg-zinc-900/40">
      <div className="px-2 pt-1.5">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-zinc-500">
          Operations map
        </p>
        <p className="text-[9px] text-zinc-600">
          Spatial layer · drag the bar below to resize
        </p>
      </div>
      <motion.div
        className="mx-2 mt-1 overflow-hidden rounded-md border border-zinc-800/80"
        animate={{ height: mapPanelHeightPx }}
        transition={
          isDragging
            ? { duration: 0 }
            : { type: 'spring', stiffness: 420, damping: 38, mass: 0.4 }
        }
      >
        <MapPanel fillHeight />
      </motion.div>
      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize map height"
        onPointerDown={onPointerDown}
        className="group flex cursor-ns-resize items-center justify-center py-1.5"
      >
        <div className="flex h-2 w-16 items-center justify-center rounded-full border border-amber-800/30 bg-amber-950/20 transition group-hover:border-amber-600/50 group-hover:bg-amber-950/40 group-active:bg-amber-900/30">
          <div className="h-0.5 w-8 rounded-full bg-amber-500/50 group-hover:bg-amber-400/70" />
        </div>
      </div>
    </div>
  )
}
