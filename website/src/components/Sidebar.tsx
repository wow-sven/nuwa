import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from './Logo'
import { MagnifyingGlassIcon, DocumentTextIcon, UserCircleIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'

interface SidebarProps {
  onCollapse: (isCollapsed: boolean) => void
}

interface User {
  name: string
  avatar: string
  rgasBalance: number
}

interface AICharacter {
  id: string
  name: string
  avatar: string
  description: string
}

export function Sidebar({ onCollapse }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Mock AI characters data
  const aiCharacters: AICharacter[] = [
    {
      id: '1',
      name: 'Claude',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Claude',
      description: 'Anthropic\'s helpful AI assistant'
    },
    {
      id: '2',
      name: 'GPT-4',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GPT4',
      description: 'OpenAI\'s most capable model'
    },
    {
      id: '3',
      name: 'DALL-E',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DALLE',
      description: 'AI image generation expert'
    }
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    // 添加事件监听器
    document.addEventListener('mousedown', handleClickOutside)

    // 清理函数
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, []) // 空依赖数组，只在组件挂载时添加事件监听器

  const handleCollapse = () => {
    const newCollapsedState = !isCollapsed
    setIsCollapsed(newCollapsedState)
    onCollapse(newCollapsedState)
    // 折叠侧边栏时关闭下拉菜单
    setIsDropdownOpen(false)
  }

  const handleConnectWallet = () => {
    // 模拟连接钱包并获取用户信息
    setUser({
      name: 'John Doe',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      rgasBalance: 1234.56
    })
  }

  const handleLogout = () => {
    setUser(null)
    setIsDropdownOpen(false)
  }

  const handleSettings = () => {
    // TODO: 实现设置功能
    setIsDropdownOpen(false)
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  return (
    <div
      className={`fixed left-0 top-0 h-full dark:bg-gray-900 border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64 bg-white'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-2">
          <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}`}>
            <Logo />
          </div>
          <button
            onClick={handleCollapse}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-0 focus:ring-offset-0 transition-colors duration-200"
          >
            <div className="relative w-5 h-5">
              <svg
                className={`absolute inset-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`absolute inset-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'opacity-0 rotate-180' : 'opacity-100 rotate-0'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            </div>
          </button>
        </div>

        {/* Create AI Button */}
        <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
          <div className="p-4">
            <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg px-4 py-2 font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-0 focus:ring-offset-0">
              Create AI
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Discover Section */}
          <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
            <div className="px-4">
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Discover..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              {/* AI Characters List */}
              <div className="space-y-3">
                {aiCharacters.map((ai) => (
                  <div
                    key={ai.id}
                    className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <img
                      src={ai.avatar}
                      alt={ai.name}
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {ai.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {ai.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          
        </div>

        {/* Bottom Section */}
          <div className="mt-auto">
          {/* Docs Link */}
            <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
              <div className="px-4 py-2">
                <Link
                  to="/docs"
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 focus:outline-none focus:ring-0 focus:ring-offset-0"
                >
                  <DocumentTextIcon className="w-5 h-5" />
                  <span>Docs</span>
                </Link>
              </div>
            </div>
          {/* Connect Wallet / User Profile */}
          <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className="w-full flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors focus:outline-none focus:ring-0 focus:ring-offset-0"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1 text-left">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                        {user.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {user.rgasBalance.toLocaleString()} RGAS
                      </span>
                    </div>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 transition-all duration-200 ease-in-out">
                      <button
                        onClick={handleSettings}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-0 focus:ring-offset-0"
                      >
                        <Cog6ToothIcon className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-0 focus:ring-offset-0"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleConnectWallet}
                  className="w-full border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-0 focus:ring-offset-0"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Collapsed User Avatar with Dropdown */}
        {isCollapsed && user && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center transition-all duration-300 ease-in-out" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="focus:outline-none focus:ring-0 focus:ring-offset-0 p-0"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            </button>
            
            {/* Collapsed Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute bottom-full left-[calc(160%)] transform -translate-x-1/2 mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 transition-all duration-200 ease-in-out">
                <button
                  onClick={handleSettings}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-0 focus:ring-offset-0"
                >
                  <Cog6ToothIcon className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-0 focus:ring-offset-0"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 