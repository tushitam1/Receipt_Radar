import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import Body from './Body'
import ScanReceipt from './ScanReceipt'

function Dashboard({ onLogout }) {
  const [activeView, setActiveView] = useState('dashboard')
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100">
      <header className="flex-shrink-0 h-14 border-b border-slate-200 bg-slate-800 px-4 flex items-center">
        <Header onLogout={onLogout} />
      </header>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar activeView={activeView} onNavigate={setActiveView} />
        <main className="flex-1 overflow-auto p-4 bg-slate-100">
          {activeView === 'dashboard' ? (
            <Body refreshKey={refreshKey} />
          ) : (
            <ScanReceipt onScanComplete={() => setRefreshKey((key) => key + 1)} />
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard