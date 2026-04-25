import { motion } from 'framer-motion'
import { useDetective } from '../../hooks/useDetective.js'
import { AnonymousTipsPanel } from './AnonymousTipsPanel.jsx'
import { CommandCenterView } from './CommandCenterView.jsx'
import { EvidenceBoardPanel } from './EvidenceBoardPanel.jsx'
import { MessageCenter } from './MessageCenter.jsx'
import { RecordsTableView } from './RecordsTableView.jsx'

/**
 * Routes the main workspace by `evidenceTypeFilter` without unmounting the outer shell.
 */
export function CategoryMainView() {
  const { evidenceTypeFilter } = useDetective()

  const inner =
    evidenceTypeFilter === 'message' ? (
      <MessageCenter />
    ) : evidenceTypeFilter === 'note' ? (
      <EvidenceBoardPanel />
    ) : evidenceTypeFilter === 'tip' ? (
      <AnonymousTipsPanel />
    ) : evidenceTypeFilter === 'all' ? (
      <CommandCenterView />
    ) : (
      <RecordsTableView />
    )

  return (
    <motion.div
      layout
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
    >
      {inner}
    </motion.div>
  )
}
