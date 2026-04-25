import { AnimatePresence, motion } from 'framer-motion'
import { useDetective } from '../../hooks/useDetective.js'
import { CategoryMainView } from '../detective/CategoryMainView.jsx'
import { ResizableMapFrame } from '../detective/ResizableMapFrame.jsx'
import { Header } from './Header.jsx'
import { Sidebar } from './Sidebar.jsx'

/**
 * Map strip for spatial filters: All Types, Check-ins, or Sightings — resizable from {@link ResizableMapFrame}.
 */
export function DetectiveShell() {
  const { evidenceTypeFilter, loading, evidences } = useDetective()

  const showMap =
    evidenceTypeFilter === 'all' ||
    evidenceTypeFilter === 'checkin' ||
    evidenceTypeFilter === 'sighting'

  return (
    <div className="flex h-svh w-full min-h-0 flex-col bg-zinc-950 text-left text-zinc-100">
      <Header />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col border-l border-zinc-800/50">
          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
            {loading && evidences.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-500">
                Loading case file…
              </div>
            ) : (
              <>
                <AnimatePresence initial={false} mode="sync">
                  {showMap && (
                    <motion.div
                      key="ops-map"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                      className="shrink-0"
                    >
                      <ResizableMapFrame />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                  <CategoryMainView />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
