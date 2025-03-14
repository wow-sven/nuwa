import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Theme } from '@radix-ui/themes'
import { Toaster } from 'react-hot-toast'
import { Sidebar } from './components/Sidebar'
import { Home } from './pages/Home'
import { AgentChat } from './pages/AgentChat'
import { AgentProfile } from './pages/AgentProfile'
import { UserProfile } from './pages/UserProfile'
import { AIStudio } from './pages/AIStudio'
import { CreateAI } from './pages/CreateAI'
import { useState, useEffect } from 'react'

const queryClient = new QueryClient()

function AppContent() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const location = useLocation()

  // 当路由变化时检查是否需要折叠侧边栏
  useEffect(() => {
    const shouldCollapse = location.pathname.startsWith('/agent/')
    setIsSidebarCollapsed(shouldCollapse)
  }, [location.pathname])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar onCollapse={setIsSidebarCollapsed} isCollapsed={isSidebarCollapsed} />
      <div className={`flex-1 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
        <Routes>
          <Route path="/" element={<div className="p-8 h-screen overflow-auto"><Home /></div>} />
          <Route path="/studio" element={<div className="p-8 h-screen overflow-auto"><AIStudio /></div>} />
          <Route path="/create" element={<div className="p-8 h-screen overflow-auto"><CreateAI /></div>} />
          <Route path="/agent/:id" element={<AgentChat />} />
          <Route path="/agent/:id/profile" element={<div className="h-screen overflow-auto"><AgentProfile /></div>} />
          <Route path="/user/:address" element={<UserProfile />} />
          <Route path="/about" element={<div className="p-8 h-screen overflow-auto">About Page</div>} />
          <Route path="/docs" element={<div className="p-8 h-screen overflow-auto">Docs Page</div>} />
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
