import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Sidebar } from './components/layout/Sidebar'
import { Home } from './pages/Home'
import { AgentChat } from './pages/AgentChat'
import { AIStudio } from './pages/AIStudio'
import { CreateAgent } from './pages/CreateAgent'
import { AllAgents } from './pages/AllAgents'
import { ProfileRouter } from './components/ProfileRouter'
import { useState, useEffect } from 'react'
import { DocPage } from './pages/docs/DocPage'
import { Header } from './components/layout/Header'
import { HelmetProvider } from 'react-helmet-async'
import { UserProfile } from './pages/UserProfile'
import { AgentProfile } from './pages/AgentProfile'
import { ThemeProvider, useTheme } from './providers/ThemeProvider'

function AppContent() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const { isDarkMode } = useTheme()
  const location = useLocation()

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  // Check if sidebar should be collapsed when route changes
  useEffect(() => {
    const shouldCollapse = location.pathname.startsWith('/agent/') || location.pathname.startsWith('/docs/')
    setIsSidebarCollapsed(shouldCollapse)
  }, [location.pathname])

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <Header isDarkMode={isDarkMode} />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden pt-16">
        <Sidebar onCollapse={setIsSidebarCollapsed} isCollapsed={isSidebarCollapsed} />
        <div className={`flex-1 overflow-auto ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/studio" element={<AIStudio />} />
            <Route path="/studio/create" element={<CreateAgent />} />
            <Route path="/agent/:id" element={<AgentChat />} />
            <Route path="/profile/:username" element={<ProfileRouter />} />
            <Route path="/allagents" element={<AllAgents />} />
            <Route path="/user/profile/:id" element={<UserProfile />} />
            <Route path="/agent/profile/:id" element={<AgentProfile />} />
            <Route path="/docs/:docId" element={<DocPage />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <Router>
          <AppContent />
          <Toaster position="bottom-right" />
        </Router>
      </ThemeProvider>
    </HelmetProvider>
  )
}

export default App
