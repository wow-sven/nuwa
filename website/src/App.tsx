import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Theme } from '@radix-ui/themes'
import { Toaster } from 'react-hot-toast'
import { Sidebar } from './components/Sidebar'
import { Home } from './pages/Home'
import { AgentChat } from './pages/AgentChat'
import { AIStudio } from './pages/AIStudio'
import { CreateAgent } from './pages/CreateAgent'
import { AllAgents } from './pages/AllAgents'
import { ProfileRouter } from './components/ProfileRouter'
import { useState, useEffect } from 'react'
import { DocPage } from './pages/docs/DocPage'

const queryClient = new QueryClient()

function AppContent() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const location = useLocation()

  // Check if sidebar should be collapsed when route changes
  useEffect(() => {
    const shouldCollapse = location.pathname.startsWith('/agent/') || location.pathname.startsWith('/docs/')
    setIsSidebarCollapsed(shouldCollapse)
  }, [location.pathname])

  return (
    <div className="flex h-screen overflow-hidden dark:bg-gray-900">
      <Sidebar onCollapse={setIsSidebarCollapsed} isCollapsed={isSidebarCollapsed} />
      <div className={`flex-1 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
        <Routes>
          <Route path="/" element={<div className="p-8 h-screen overflow-auto"><Home /></div>} />
          <Route path="/studio" element={<div className="p-8 h-screen overflow-auto"><AIStudio /></div>} />
          <Route path="/studio/create" element={<div className="p-8 h-screen overflow-auto"><CreateAgent /></div>} />
          <Route path="/agent/:agentname" element={<AgentChat />} />
          <Route path="/profile/:username" element={<ProfileRouter />} />
          <Route path="/allagents" element={<div className="p-8 h-screen overflow-auto"><AllAgents /></div>} />
          <Route path="/about" element={<div className="p-8 h-screen overflow-auto">About Page</div>} />
          <Route path="/docs/:docId" element={<DocPage />} />
        </Routes>
      </div>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Theme>
        <Router>
          <AppContent />
          <Toaster position="bottom-right" />
        </Router>
      </Theme>
    </QueryClientProvider>
  )
}

export default App
