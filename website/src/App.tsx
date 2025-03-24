import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
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
import { NewPage } from './pages/NewPage'
import { Header } from './components/Header'
import { UserProfile } from './pages/UserProfile'
import { AgentProfile } from './pages/AgentProfile'

function AppContent() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const location = useLocation()

  // Check if sidebar should be collapsed when route changes
  useEffect(() => {
    const shouldCollapse = location.pathname.startsWith('/agent/') || location.pathname.startsWith('/docs/')
    setIsSidebarCollapsed(shouldCollapse)
  }, [location.pathname])

  // Check dark mode
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setIsDarkMode(isDark)
  }, [])

  // Listen for dark mode changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'))
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Header isDarkMode={isDarkMode} />

      {/* Main Content */}
      <div className="flex-1 pt-16">
        <Sidebar onCollapse={setIsSidebarCollapsed} isCollapsed={isSidebarCollapsed} />
        <div className={`flex-1 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
          <Routes>
            <Route path="/" element={<div className="p-8 h-screen overflow-auto"><Home /></div>} />
            <Route path="/new" element={<div className="p-8 h-screen overflow-auto"><NewPage /></div>} />
            <Route path="/studio" element={<div className="p-8 h-screen overflow-auto"><AIStudio /></div>} />
            <Route path="/studio/create" element={<div className="p-8 h-screen overflow-auto"><CreateAgent /></div>} />
            <Route path="/agent/:id" element={<AgentChat />} />
            <Route path="/user/profile/:id" element={<div className="h-screen overflow-auto"><UserProfile /></div>} />
            <Route path="/agent/profile/:id" element={<div className="h-screen overflow-auto"><AgentProfile /></div>} />
            <Route path="/allagents" element={<div className="p-8 h-screen overflow-auto"><AllAgents /></div>} />
            <Route path="/about" element={<div className="p-8 h-screen overflow-auto">About Page</div>} />
            <Route path="/docs/:docId" element={<DocPage />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
      <Toaster position="bottom-right" />
    </Router>
  )
}

export default App
