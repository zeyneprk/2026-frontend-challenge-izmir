import { DetectiveProvider } from './context/DetectiveProvider.jsx'
import { DetectiveShell } from './components/layout/DetectiveShell.jsx'

function App() {
  return (
    <DetectiveProvider>
      <DetectiveShell />
    </DetectiveProvider>
  )
}

export default App
