import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Theme } from '@radix-ui/themes'
import { Toaster } from 'react-hot-toast'
import { Sidebar } from './components/Sidebar'
import { useState } from 'react'

const queryClient = new QueryClient()

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <QueryClientProvider client={queryClient}>
      <Theme>
        <Router>
          <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar onCollapse={setIsSidebarCollapsed} />
            <main
              className={`flex-1 transition-all duration-300 p-8 ${
                isSidebarCollapsed ? 'ml-16' : 'ml-64'
              }`}
            >
              <Routes>
                <Route path="/" element={<div>Home Page</div>} />
                <Route path="/about" element={<div>About Page</div>} />
                <Route path="/docs" element={<div>Docs Page</div>} />
              </Routes>
            </main>
            <Toaster position="bottom-right" />
          </div>
        </Router>
      </Theme>
    </QueryClientProvider>
  )
}

export default App
